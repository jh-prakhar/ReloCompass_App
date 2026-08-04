"""
ReloCompass Backend - Users Router
Profile management.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import UserOut, MessageResponse

router = APIRouter(prefix="/users", tags=["users"])


class ProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    country: str | None = None
    city: str | None = None
    bio: str | None = None


@router.put("/me", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile."""
    if payload.name is not None:
        current_user.name = payload.name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip() or None
    if payload.country is not None:
        current_user.country = payload.country.strip() or None
    if payload.city is not None:
        current_user.city = payload.city.strip() or None
    if payload.bio is not None:
        current_user.bio = payload.bio.strip() or None
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user
