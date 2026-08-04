"""
ReloCompass Backend - Contact Router
Public contact form submission.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ContactMessage
from app.schemas import ContactCreate, ContactOut, MessageResponse

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/", response_model=ContactOut, status_code=201)
def submit_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    """Submit a contact form message."""
    message = ContactMessage(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        subject=payload.subject.strip(),
        message=payload.message.strip(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("/", response_model=list[ContactOut])
def list_messages(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List all contact messages (admin use)."""
    return (
        db.query(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
