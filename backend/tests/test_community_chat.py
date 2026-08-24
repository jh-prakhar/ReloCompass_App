"""Community chat tests — REST history + WebSocket flow."""
import secrets

import pytest
from fastapi.testclient import TestClient

_RUN = secrets.token_hex(4)


@pytest.fixture
def client():
    from app.main import app

    with TestClient(app) as c:
        yield c


def _register(client, base):
    email = f"{base}.{_RUN}@qacontract.dev"
    r = client.post(
        "/api/auth/register",
        json={"email": email, "password": "Secret123!", "name": f"Com{base}", "role": "student"},
    )
    assert r.status_code == 201, r.text
    return r.json()


def _next_of_type(ws, want: str, max_wait: int = 20):
    """Read frames until one of the wanted type arrives (presence events interleave)."""
    for _ in range(max_wait):
        frame = ws.receive_json()
        if frame.get("type") == want:
            return frame
    raise AssertionError(f"no '{want}' frame received")


class TestRooms:
    def test_rooms_catalogue(self, client):
        r = client.get("/api/community/rooms")
        assert r.status_code == 200
        ids = [room["id"] for room in r.json()["rooms"]]
        assert set(ids) == {"global", "housing", "visas", "jobs"}

    def test_history_unknown_room_404(self, client):
        r = client.get("/api/community/history/nope")
        assert r.status_code == 404

    def test_history_empty_ok(self, client):
        r = client.get("/api/community/history/housing")
        assert r.status_code == 200
        assert r.json()["messages"] == []


class TestWebSocket:
    def test_ws_requires_valid_token(self, client):
        with pytest.raises(Exception):
            with client.websocket_connect("/api/community/ws?token=bad&room=global"):
                pass

    def test_ws_unknown_room_rejected(self, client):
        user = _register(client, "wsroom")
        with pytest.raises(Exception):
            with client.websocket_connect(f"/api/community/ws?token={user['access_token']}&room=bogus"):
                pass

    def test_ws_history_and_message_roundtrip(self, client):
        alice = _register(client, "wsalice")
        bob = _register(client, "wsbob")

        with client.websocket_connect(
            f"/api/community/ws?token={alice['access_token']}&room=global"
        ) as ws_a:
            first = _next_of_type(ws_a, "history")
            assert isinstance(first["messages"], list)
            _next_of_type(ws_a, "presence")

            with client.websocket_connect(
                f"/api/community/ws?token={bob['access_token']}&room=global"
            ) as ws_b:
                b_hist = _next_of_type(ws_b, "history")
                assert b_hist["type"] == "history"

                ws_b.send_json({"type": "message", "room": "global", "content": "Hello from Bob!"})
                got_b = _next_of_type(ws_b, "message")
                assert got_b["content"] == "Hello from Bob!"
                assert got_b["user_name"] == "Comwsbob"

                got_a = _next_of_type(ws_a, "message")
                assert got_a["content"] == "Hello from Bob!"

        # history persists after disconnect
        hist = client.get("/api/community/history/global?limit=5")
        contents = [m["content"] for m in hist.json()["messages"]]
        assert "Hello from Bob!" in contents

    def test_ws_rejects_oversized_and_wrong_room(self, client):
        user = _register(client, "wsbad")
        with client.websocket_connect(
            f"/api/community/ws?token={user['access_token']}&room=visas"
        ) as ws:
            ws.receive_json()  # history
            ws.receive_json()  # presence
            ws.send_json({"type": "message", "room": "housing", "content": "wrong room"})
            err = _next_of_type(ws, "error")
            assert "Room mismatch" in err["detail"]

            ws.send_json({"type": "message", "room": "visas", "content": "x" * 2000})
            err2 = _next_of_type(ws, "error")
            assert "too long" in err2["detail"] or "string_too_long" in err2["detail"]


class TestNonJsonFrame:
    def test_ws_survives_non_json_frame(self, client):
        """Regression: a non-JSON text frame used to kill the socket abnormally.
        Now it yields an error event and the connection stays usable."""
        me = _register(client, "nonjson")
        token = me["access_token"]
        with client.websocket_connect(
            f"/api/community/ws?token={token}&room=global"
        ) as ws:
            _next_of_type(ws, "history")
            _next_of_type(ws, "presence")

            ws.send_text("this is not json")
            err = _next_of_type(ws, "error")
            assert "Invalid frame" in err["detail"]

            # socket must still deliver a normal message afterwards
            ws.send_json({"type": "message", "room": "global", "content": "still alive"})
            frame = _next_of_type(ws, "message")
            assert frame["content"] == "still alive"
