"""
ReloCompass Backend - Admin Dashboard Router
Server-side rendered admin panel for managing documents, users, and AI settings.
"""
import json
import logging

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_admin_user
from app.models import User, KnowledgeDocument, AIUsageLog, ContactMessage
from app.config import settings
from app.ai.llm_service import llm_service
from app.ai.vector_store import vector_store
from pathlib import Path

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])

templates = Jinja2Templates(directory=str(Path(__file__).resolve().parent.parent / "templates"))


@router.get("/", response_class=HTMLResponse)
def admin_dashboard(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Admin dashboard — overview with stats."""
    total_users = db.query(User).count()
    total_documents = db.query(KnowledgeDocument).count()
    total_ai_calls = db.query(AIUsageLog).count()
    unread_messages = db.query(ContactMessage).filter(ContactMessage.is_read == False).count()

    return templates.TemplateResponse("admin/dashboard.html", {
        "request": request,
        "admin": admin,
        "total_users": total_users,
        "total_documents": total_documents,
        "total_ai_calls": total_ai_calls,
        "unread_messages": unread_messages,
        "llm_configured": llm_service.is_configured(),
        "llm_model": settings.LLM_MODEL,
        "faiss_size": vector_store.size,
    })


@router.get("/documents", response_class=HTMLResponse)
def admin_documents(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Admin — manage knowledge base documents."""
    documents = db.query(KnowledgeDocument).order_by(
        KnowledgeDocument.created_at.desc()
    ).all()
    return templates.TemplateResponse("admin/documents.html", {
        "request": request,
        "admin": admin,
        "documents": documents,
        "supported_types": ", ".join(sorted(["pdf", "docx", "txt", "md", "csv", "json"])),
    })


@router.get("/users", response_class=HTMLResponse)
def admin_users(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Admin — view all users."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return templates.TemplateResponse("admin/users.html", {
        "request": request,
        "admin": admin,
        "users": users,
    })


@router.get("/ai-usage", response_class=HTMLResponse)
def admin_ai_usage(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Admin — AI usage monitoring."""
    logs = db.query(AIUsageLog).order_by(AIUsageLog.created_at.desc()).limit(100).all()
    return templates.TemplateResponse("admin/ai_usage.html", {
        "request": request,
        "admin": admin,
        "logs": logs,
    })
