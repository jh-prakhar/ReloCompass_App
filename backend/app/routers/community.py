"""ReloCompass Backend — Community Chat Router

Real-time chat between community members: one global room + topic rooms
(housing, visas, jobs). WebSocket for live delivery, REST for history.
"""
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import CommunityMessage, User
from app.services.auth import decode_access_token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/community", tags=["community-chat"])

ROOMS = {"global", "housing", "visas", "jobs"}
MAX_LEN = 1000
RATE_LIMIT_PER_MIN = 30


def _room_or_404(room: str) -> str:
    if room not in ROOMS:
        raise HTTPException(status_code=404, detail=f"Unknown room '{room}'. Available: {', '.join(sorted(ROOMS))}")
    return room


def _serialize(msg: CommunityMessage) -> dict:
    return {
        "id": msg.id,
        "room": msg.room,
        "user_id": msg.user_id,
        "user_name": msg.user_name,
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


@router.get("/rooms")
def list_rooms():
    """Room catalogue with descriptions (stable order for UI)."""
    return {
        "rooms": [
            {"id": "global", "name": "🌍 Global", "description": "Everything relocation — say hi!"},
            {"id": "housing", "name": "🏠 Housing", "description": "Rooms, flats, hostels, deposits"},
            {"id": "visas", "name": "🛂 Visas", "description": "Visas, permits, documents"},
            {"id": "jobs", "name": "💼 Jobs", "description": "Openings, interviews, employers"},
        ]
    }


@router.get("/history/{room}")
def room_history(
    room: str,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Public read — recent messages for a room (no auth needed to lurk)."""
    _room_or_404(room)
    msgs = (
        db.query(CommunityMessage)
        .filter(CommunityMessage.room == room)
        .order_by(CommunityMessage.created_at.desc(), CommunityMessage.id.desc())
        .limit(limit)
        .all()
    )
    return {"room": room, "messages": [_serialize(m) for m in reversed(msgs)]}


# ── WebSocket hub ────────────────────────────────────────────────────────────
class ConnectionManager:
    """Tracks live sockets per room and broadcasts messages."""

    def __init__(self):
        self._connections: dict[str, dict[int, WebSocket]] = {}  # room -> {user_id: ws}

    def join(self, room: str, user_id: int, ws: WebSocket):
        self._connections.setdefault(room, {})[user_id] = ws

    def leave(self, room: str, user_id: int):
        self._connections.get(room, {}).pop(user_id, None)

    def presence(self, room: str) -> int:
        return len(self._connections.get(room, {}))

    async def broadcast(self, room: str, payload: dict, exclude_user: Optional[int] = None):
        dead = []
        for uid, ws in list(self._connections.get(room, {}).items()):
            if exclude_user is not None and uid == exclude_user:
                continue
            try:
                await ws.send_json(payload)
            except Exception:  # noqa: BLE001 — dead sockets are dropped, not fatal
                dead.append(uid)
        for uid in dead:
            self.leave(room, uid)


manager = ConnectionManager()


class CommunityIncoming(BaseModel):
    type: str = Field(..., pattern="^(message)$")
    room: str
    content: str = Field(..., min_length=1, max_length=MAX_LEN)


@router.websocket("/ws")
async def community_ws(ws: WebSocket, token: str = Query(...), room: str = Query(default="global"), db: Session = Depends(get_db)):
    """Live room socket. Auth via JWT query param (browsers can't set WS headers).

    Server → client events:
      {type: "history", messages: [...]}
      {type: "presence", count: N}
      {type: "message", ...}
      {type: "error", detail: "..."}
    """
    if room not in ROOMS:
        await ws.close(code=4400)
        return

    payload = decode_access_token(token)
    if payload is None:
        await ws.close(code=4401)
        return
    user_id = int(payload.get("sub", 0))
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        await ws.close(code=4401)
        return

    await ws.accept()
    manager.join(room, user_id, ws)

    recent = (
        db.query(CommunityMessage)
        .filter(CommunityMessage.room == room)
        .order_by(CommunityMessage.created_at.desc(), CommunityMessage.id.desc())
        .limit(50)
        .all()
    )
    await ws.send_json({"type": "history", "messages": [_serialize(m) for m in reversed(recent)]})
    await ws.send_json({"type": "presence", "count": manager.presence(room)})
    await _broadcast_presence(room)

    # Simple in-memory rate limit per connection
    window_start = datetime.now(timezone.utc)
    sent = 0

    try:
        while True:
            # receive_json raises json.JSONDecodeError (not WebSocketDisconnect) on a
            # non-JSON text frame — catch it here so garbage never kills the socket.
            try:
                raw = await ws.receive_json()
            except WebSocketDisconnect:
                raise
            except Exception:
                await ws.send_json({"type": "error", "detail": "Invalid frame — messages must be JSON objects."})
                continue
            try:
                incoming = CommunityIncoming(**raw)
            except Exception as e:  # noqa: BLE001 — malformed frames get an error event
                await ws.send_json({"type": "error", "detail": f"Invalid message: {e}"})
                continue

            now = datetime.now(timezone.utc)
            if (now - window_start).total_seconds() > 60:
                window_start = now
                sent = 0
            sent += 1
            if sent > RATE_LIMIT_PER_MIN:
                await ws.send_json({"type": "error", "detail": "You're sending messages too quickly — slow down a little."})
                continue

            if incoming.room != room:
                await ws.send_json({"type": "error", "detail": "Room mismatch — reconnect to the room you want to post in."})
                continue

            msg = CommunityMessage(
                room=room,
                user_id=user_id,
                user_name=user.name,
                content=incoming.content.strip(),
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)

            await manager.broadcast(room, {"type": "message", **_serialize(msg)})
    except WebSocketDisconnect:
        pass
    finally:
        manager.leave(room, user_id)
        await _broadcast_presence(room)


async def _broadcast_presence(room: str):
    count = manager.presence(room)
    await manager.broadcast(room, {"type": "presence", "count": count})
