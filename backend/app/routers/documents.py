"""
ReloCompass Backend - AI Documents Router
Upload and manage knowledge base documents. Admin-only.
"""
import logging
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_admin_user
from app.models import User, KnowledgeDocument
from app.schemas import DocumentOut, MessageResponse
from app.config import settings
from app.ai.ingestion import (
    ingest_document,
    SUPPORTED_EXTENSIONS,
    rebuild_index,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["ai-documents"])


@router.get("/", response_model=list[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """List all knowledge base documents. Admin only."""
    return db.query(KnowledgeDocument).order_by(
        KnowledgeDocument.created_at.desc()
    ).all()


@router.post("/upload", response_model=list[DocumentOut], status_code=201)
async def upload_documents(
    files: list[UploadFile] = File(...),
    category: str = Form(default=None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """
    Upload one or more documents to the knowledge base.
    Documents are immediately processed: text extraction → chunking → embedding → indexing.
    Admin only.
    """
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    results = []

    for file in files:
        ext = Path(file.filename).suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {ext} for {file.filename}. "
                       f"Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}",
            )

        # Save file
        file_path = upload_dir / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Ingest into FAISS
        try:
            ingestion_result = ingest_document(file_path, file.filename, category)

            # Record in database
            doc = KnowledgeDocument(
                filename=file.filename,
                file_type=ext.lstrip("."),
                file_size=file_path.stat().st_size,
                category=ingestion_result["category"],
                num_chunks=ingestion_result["num_chunks"],
                is_indexed=ingestion_result["success"],
                uploaded_by=admin.id,
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)
            results.append(doc)

            logger.info(f"Uploaded and indexed {file.filename}: {ingestion_result['num_chunks']} chunks")

        except Exception as e:
            logger.error(f"Failed to ingest {file.filename}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process {file.filename}: {str(e)}",
            )

    return results


@router.delete("/{doc_id}", response_model=MessageResponse)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """
    Delete a document from the database.
    Note: This removes the database record and the uploaded file.
    To update the FAISS index, use POST /api/documents/rebuild-index.
    Admin only.
    """
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Remove file from disk
    file_path = Path(settings.UPLOAD_DIR) / doc.filename
    if file_path.exists():
        file_path.unlink()

    filename = doc.filename
    db.delete(doc)
    db.commit()

    return MessageResponse(
        message=f"Document '{filename}' deleted. Run rebuild-index to update the vector store.",
    )


@router.post("/rebuild-index", response_model=MessageResponse)
def rebuild(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """
    Rebuild the entire FAISS index from all knowledge base documents.
    This clears the current index and re-processes everything.
    Admin only.
    """
    try:
        result = rebuild_index()
        return MessageResponse(
            message=f"Index rebuilt successfully: {result['total_documents']} documents, "
                    f"{result['total_chunks']} chunks indexed.",
            detail=f"Results: {result['results']}",
        )
    except Exception as e:
        logger.error(f"Index rebuild failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Index rebuild failed: {str(e)}",
        )
