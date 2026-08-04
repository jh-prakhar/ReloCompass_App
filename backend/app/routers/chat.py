"""
ReloCompass Backend - AI Chat Router
Conversational AI endpoint with RAG-powered responses.
"""
import json
import logging
import time
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user_optional
from app.models import User, ChatSession, AIUsageLog
from app.schemas import ChatRequest, ChatResponse, ChatHistoryResponse, MessageResponse
from app.ai.rag_service import chat_with_rag
from app.ai.llm_service import llm_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["ai-chat"])


def _build_user_context(user: Optional[User]) -> Optional[str]:
    """Build a context string from the user's profile."""
    if not user:
        return None
    parts = [f"User role: {user.role.value}"]
    if user.name:
        parts.append(f"Name: {user.name}")
    if user.country:
        parts.append(f"Origin country: {user.country}")
    if user.city:
        parts.append(f"City: {user.city}")
    if user.bio:
        parts.append(f"Bio: {user.bio[:200]}")
    return "; ".join(parts)


def _get_or_create_session(
    db: Session,
    session_id: Optional[str],
    user: Optional[User],
) -> ChatSession:
    """Retrieve an existing chat session or create a new one."""
    if session_id:
        existing = db.query(ChatSession).filter(
            ChatSession.session_id == session_id
        ).first()
        if existing:
            return existing

    new_session = ChatSession(
        session_id=str(uuid.uuid4()),
        user_id=user.id if user else None,
        messages=json.dumps([]),
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.post("/", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    """
    Send a message to the AI assistant and receive a response.

    - Uses RAG (Retrieval-Augmented Generation) to ground answers in the knowledge base
    - Supports multi-turn conversations via session_id
    - Cites knowledge base sources when available
    - If the answer is unknown, the AI says so rather than inventing information
    """
    if not llm_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Please set OPENAI_API_KEY.",
        )

    start = time.time()

    # Get or create conversation session
    session = _get_or_create_session(db, payload.session_id, user)

    # Load conversation history
    history = json.loads(session.messages) if session.messages else []

    # Build user context from profile
    user_context = payload.user_context or _build_user_context(user)

    # Call the RAG pipeline
    result = chat_with_rag(
        user_message=payload.message,
        conversation_history=history,
        user_context=user_context,
    )

    latency_ms = int((time.time() - start) * 1000)

    # Save conversation to session
    history.append({"role": "user", "content": payload.message})
    history.append({"role": "assistant", "content": result["reply"]})
    session.messages = json.dumps(history)
    db.commit()

    # Log usage
    usage = result.get("usage")
    log_entry = AIUsageLog(
        user_id=user.id if user else None,
        endpoint="chat",
        model_used=result.get("model_used"),
        tokens_used=usage.get("total_tokens") if usage else None,
        latency_ms=latency_ms,
        success="error" not in result,
    )
    db.add(log_entry)
    db.commit()

    return ChatResponse(
        reply=result["reply"],
        session_id=session.session_id,
        sources=result["sources"],
        model_used=result.get("model_used"),
    )


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
def get_chat_history(
    session_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve the conversation history for a given session."""
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )
    messages = json.loads(session.messages) if session.messages else []
    return ChatHistoryResponse(
        session_id=session.session_id,
        messages=messages,
    )


@router.delete("/history/{session_id}", response_model=MessageResponse)
def clear_chat_history(
    session_id: str,
    db: Session = Depends(get_db),
):
    """Clear a chat session's history."""
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id
    ).first()
    if session:
        session.messages = json.dumps([])
        db.commit()
    return MessageResponse(message="Chat history cleared")
