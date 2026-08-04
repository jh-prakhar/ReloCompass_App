"""
ReloCompass Backend - Authentication Router
Register, Login, Profile, Password Reset (placeholder).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import User, UserRole
from app.schemas import (
    UserRegister, UserLogin, TokenResponse, UserOut, MessageResponse,
)
from app.services.auth import hash_password, verify_password, create_access_token

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
def password_reset_request(email: str, db: Session = Depends(get_db)):
    """Placeholder for password reset — email service not yet configured."""
    user = db.query(User).filter(User.email == email.lower()).first()
    # Don't reveal whether email exists (security best practice)
    return MessageResponse(
        message="If an account exists for this email, a reset link will be sent.",
        detail="Email service is not yet configured. This is a placeholder.",
    )
