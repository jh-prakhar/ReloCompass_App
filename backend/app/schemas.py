"""
ReloCompass Backend - Pydantic Schemas (Request/Response Models)
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ── Auth ──
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field("student", pattern="^(student|job_seeker|employer)$")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True


# Resolve forward ref
TokenResponse.model_rebuild()


# ── Jobs ──
class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    company: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    visa_sponsorship: bool = False
    experience_years: Optional[str] = None


class JobOut(BaseModel):
    id: int
    title: str
    company: str
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    visa_sponsorship: bool = False
    experience_years: Optional[str] = None
    is_sample: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Accommodation ──
class AccommodationOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    acc_type: Optional[str] = None
    price: Optional[float] = None
    currency: str = "CAD"
    city: Optional[str] = None
    country: Optional[str] = None
    safety_rating: float = 0.0
    is_sample: bool = False

    class Config:
        from_attributes = True


# ── Applications ──
class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    job_id: int
    user_id: int
    status: str
    cover_letter: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Contact ──
class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=3, max_length=300)
    message: str = Field(..., min_length=10, max_length=5000)


class ContactOut(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    is_read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Generic ──
class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
