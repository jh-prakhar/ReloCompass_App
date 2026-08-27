"""Account settings: preferred language + password change."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import UserOut
from app.services.auth import hash_password, verify_password

router = APIRouter(prefix="/settings", tags=["settings"])


class LanguageUpdate(BaseModel):
    preferred_language: str = Field(..., min_length=2, max_length=2)


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=6, max_length=128)
    new_password: str = Field(..., min_length=6, max_length=128)


@router.put("/language", response_model=UserOut)
def update_language(
    payload: LanguageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.preferred_language.lower() not in {"en", "hi", "ne", "es", "fr"}:
        raise HTTPException(status_code=422, detail="Unsupported language. Use en, hi, ne, es or fr.")
    current_user.preferred_language = payload.preferred_language.lower()
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/password", response_model=UserOut)
def change_password(
    payload: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=400, detail="New password must be different from the current password"
        )
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    db.refresh(current_user)
    return current_user
