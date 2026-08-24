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
    is_admin: bool = False
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
    is_active: bool = True
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


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|reviewed|shortlisted|rejected|accepted)$")


class ApplicationWithApplicantOut(ApplicationOut):
    """Application detail for employers — includes applicant profile."""
    applicant: "UserOut"


ApplicationWithApplicantOut.model_rebuild()


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


# ── AI / Chat ──
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None
    user_context: Optional[str] = None   # e.g. "I'm a student moving to Toronto"


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    sources: list[dict] = []              # citations from knowledge base
    model_used: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: list[ChatMessage] = []


# ── AI Document Management ──
class DocumentOut(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: Optional[int] = None
    category: Optional[str] = None
    num_chunks: int = 0
    is_indexed: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AIStatus(BaseModel):
    llm_configured: bool
    llm_model: str
    embedding_model: str
    faiss_index_size: int
    total_documents: int
    total_chunks: int
