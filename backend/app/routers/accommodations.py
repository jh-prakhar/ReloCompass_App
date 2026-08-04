"""
ReloCompass Backend - Accommodations Router
Public accommodation hub.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Accommodation
from app.schemas import AccommodationOut

router = APIRouter(prefix="/accommodations", tags=["accommodations"])


@router.get("/", response_model=list[AccommodationOut])
def list_accommodations(
    skip: int = 0,
    limit: int = 50,
    city: str | None = None,
    acc_type: str | None = None,
    db: Session = Depends(get_db),
):
    """Public endpoint — browse accommodation listings."""
    query = db.query(Accommodation).filter(Accommodation.is_active == True)
    if city:
        query = query.filter(Accommodation.city.ilike(f"%{city}%"))
    if acc_type:
        query = query.filter(Accommodation.acc_type == acc_type)
    return query.order_by(Accommodation.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{acc_id}", response_model=AccommodationOut)
def get_accommodation(acc_id: int, db: Session = Depends(get_db)):
    """Get a single accommodation by ID."""
    acc = db.query(Accommodation).filter(
        Accommodation.id == acc_id, Accommodation.is_active == True
    ).first()
    from fastapi import HTTPException
    if not acc:
        raise HTTPException(status_code=404, detail="Accommodation not found")
    return acc
