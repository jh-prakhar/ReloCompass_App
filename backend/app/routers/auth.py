"""
ReloCompass Backend - Authentication Router
Register, Login, Profile, Password Reset (placeholder).
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from app.database import get_db, SessionLocal
from app.deps import get_current_user
from app.models import User, UserRole, PasswordResetToken
from app.schemas import (
    UserRegister, UserLogin, TokenResponse, UserOut, MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
)
from app.services.auth import hash_password, verify_password, create_access_token
from app.services.email import send_password_reset_email


def _send_reset_email_async(*, to_email: str, reset_token: str, user_name: str) -> None:
    """Background task: fresh DB session so it survives request teardown."""
    db = SessionLocal()
    try:
        send_password_reset_email(
            db,
            to_email=to_email,
            reset_token=reset_token,
            user_name=user_name,
        )
    finally:
        db.close()


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        role=UserRole(payload.role),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    """Logout endpoint — JWT is stateless so the client just discards the token."""
    return MessageResponse(
        message="Logged out successfully",
        detail="Please discard the token on the client side",
    )


@router.get("/verify", response_model=UserOut)
def verify_token(current_user: User = Depends(get_current_user)):
    """Verify the current token is valid — returns the user."""
    return current_user


@router.post("/password-reset", response_model=MessageResponse)
def password_reset_request(payload: PasswordResetRequest, background: BackgroundTasks, db: Session = Depends(get_db)):
    """Request a password reset. Always returns 200 (no account enumeration)."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user and user.is_active:
        # Issue a single-use, 30-minute token (stored hashed).
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.add(
            PasswordResetToken(
                user_id=user.id, token_hash=token_hash, expires_at=expires
            )
        )
        db.commit()
        background.add_task(
            _send_reset_email_async,
            to_email=user.email,
            reset_token=raw_token,
            user_name=user.name,
        )
    # Don't reveal whether email exists (security best practice)
    return MessageResponse(
        message="If an account exists for this email, a reset link will be sent.",
    )


@router.post("/password-reset/confirm", response_model=MessageResponse)
def password_reset_confirm(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Set a new password using a reset token. Single-use; token is revoked on success."""
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    row = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == token_hash)
        .order_by(PasswordResetToken.created_at.desc())
        .first()
    )
    if row is None:
        raise HTTPException(status_code=400, detail="Invalid reset link")

    # Normalize: MySQL DATETIME comes back naive (UTC was stored).
    expires_at = row.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) >= expires_at:
        raise HTTPException(status_code=400, detail="This reset link has expired — request a new one")
    if row.used_at is not None:
        raise HTTPException(status_code=400, detail="This reset link has already been used")

    user = db.query(User).filter(User.id == row.user_id).first()
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid reset link")

    user.hashed_password = hash_password(payload.new_password)
    row.used_at = datetime.now(timezone.utc)
    db.commit()
    return MessageResponse(message="Password updated — you can now log in with your new password.")
