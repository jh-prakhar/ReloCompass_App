"""
ReloCompass Backend - AI Status Router
Health and status information for the AI subsystem.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import KnowledgeDocument
from app.schemas import AIStatus
from app.config import settings
from app.ai.llm_service import llm_service
from app.ai.vector_store import vector_store

router = APIRouter(prefix="/ai", tags=["ai-status"])


@router.get("/status", response_model=AIStatus)
def get_ai_status(db: Session = Depends(get_db)):
    """Get the current status of the AI subsystem."""
    total_docs = db.query(KnowledgeDocument).count()

    return AIStatus(
        llm_configured=llm_service.is_configured(),
        llm_model=settings.LLM_MODEL,
        embedding_model="BAAI/bge-small-en-v1.5 (local)",
        faiss_index_size=vector_store.size,
        total_documents=total_docs,
        total_chunks=vector_store.num_chunks,
    )
