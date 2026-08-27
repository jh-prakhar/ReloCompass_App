"""
ReloCompass Backend - SQLAlchemy ORM Models
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Enum, Float, ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    job_seeker = "job_seeker"
    employer = "employer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Profile fields (nullable — filled later)
    phone = Column(String(30), nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    preferred_language = Column(String(2), nullable=True)  # en | hi | ne | es | fr

    # Relations
    jobs = relationship("Job", back_populates="employer", cascade="all, delete-orphan")
    applications = relationship(
        "Application", back_populates="applicant", cascade="all, delete-orphan"
    )
    contact_messages = relationship(
        "ContactMessage", back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.admin


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(200), nullable=True)
    job_type = Column(String(50), nullable=True)       # full-time, part-time, contract
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    currency = Column(String(10), default="CAD")
    visa_sponsorship = Column(Boolean, default=False)
    experience_years = Column(String(50), nullable=True)
    is_sample = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    employer = relationship("User", back_populates="jobs")
    applications = relationship(
        "Application", back_populates="job", cascade="all, delete-orphan"
    )


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cover_letter = Column(Text, nullable=True)
    status = Column(String(30), default="pending")  # pending, reviewed, accepted, rejected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    job = relationship("Job", back_populates="applications")
    applicant = relationship("User", back_populates="applications")


class Accommodation(Base):
    __tablename__ = "accommodations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    acc_type = Column(String(50), nullable=True)   # dorm, shared, studio, homestay, hostel
    price = Column(Float, nullable=True)
    currency = Column(String(10), default="CAD")
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    address = Column(String(300), nullable=True)
    safety_rating = Column(Float, default=0.0)
    is_sample = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)  # sha256 hex
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

    @property
    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) >= self.expires_at.replace(tzinfo=timezone.utc)


class EmailOutbox(Base):
    __tablename__ = "email_outbox"

    id = Column(Integer, primary_key=True, index=True)
    to_email = Column(String(255), nullable=False, index=True)
    subject = Column(String(300), nullable=False)
    body_text = Column(Text, nullable=False)
    body_html = Column(Text, nullable=True)
    kind = Column(String(50), default="generic")  # password_reset | application_update | ...
    status = Column(String(20), default="pending")  # pending | sent | failed | dev_logged
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="contact_messages")


class KnowledgeDocument(Base):
    """Tracks uploaded knowledge base documents for the RAG system."""
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)     # pdf, docx, txt, md, csv, json
    file_size = Column(Integer, nullable=True)
    category = Column(String(100), nullable=True)       # student, transport, employment, employer
    num_chunks = Column(Integer, default=0)
    is_indexed = Column(Boolean, default=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ChatSession(Base):
    """AI chat conversation sessions for multi-turn context."""
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    messages = Column(Text, nullable=False)  # JSON: [{role, content, timestamp}, ...]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class AIUsageLog(Base):
    """Logs AI usage for monitoring and analytics."""
    __tablename__ = "ai_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    endpoint = Column(String(50), nullable=False)       # chat, upload, rebuild
    model_used = Column(String(100), nullable=True)
    tokens_used = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    success = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class CommunityMessage(Base):
    """Real-time community chat messages, persisted per room."""
    __tablename__ = "community_messages"

    id = Column(Integer, primary_key=True, index=True)
    room = Column(String(30), nullable=False, index=True)  # global | housing | visas | jobs
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name = Column(String(100), nullable=False)  # denormalized for cheap history reads
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User")

class SavedJob(Base):
    """User-bookmarked job listings."""
    __tablename__ = "saved_jobs"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_saved_job"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    job = relationship("Job")


class SavedAccommodation(Base):
    """User-bookmarked accommodation listings."""
    __tablename__ = "saved_accommodations"
    __table_args__ = (UniqueConstraint("user_id", "accommodation_id", name="uq_saved_acc"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    accommodation_id = Column(Integer, ForeignKey("accommodations.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    accommodation = relationship("Accommodation")


class RelocationPlan(Base):
    """One relocation plan per user (upserted from the planner UI)."""
    __tablename__ = "relocation_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    destination_country = Column(String(100), nullable=True)
    destination_city = Column(String(100), nullable=True)
    move_date = Column(String(20), nullable=True)  # ISO date string from the date input
    notes = Column(Text, nullable=True)
    checklist_json = Column(Text, nullable=True)   # [{id,label,done}]
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class Notification(Base):
    """In-app notifications (application status changes, system messages)."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String(30), nullable=False, default="generic")  # application_update | generic
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User")
