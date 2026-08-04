"""
ReloCompass Backend - Database Seed Script
Creates tables, seeds sample data, and creates the development admin account.

DEVELOPMENT ONLY — the admin account created here must be removed
or changed before any production deployment.

Run: python -m app.seed
"""
import logging

from app.database import SessionLocal, engine, Base
from app.models import User, UserRole, Job, Accommodation
from app.services.auth import hash_password
from app.config import settings

logger = logging.getLogger(__name__)


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


def seed_admin(db):
    """
    Seed a development administrator account.
    DEVELOPMENT ONLY — remove or replace before production deployment.
    """
    existing = db.query(User).filter(User.email == settings.DEV_ADMIN_EMAIL).first()
    if existing:
        logger.info(f"Admin account already exists: {settings.DEV_ADMIN_EMAIL}")
        return

    admin = User(
        name="Admin (Development)",
        email=settings.DEV_ADMIN_EMAIL,
        hashed_password=hash_password(settings.DEV_ADMIN_PASSWORD),
        role=UserRole.admin,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    logger.info(
        f"✅ Created development admin account: {settings.DEV_ADMIN_EMAIL} "
        f"(password: {settings.DEV_ADMIN_PASSWORD}) — "
        f"REMOVE BEFORE PRODUCTION DEPLOYMENT"
    )


def seed_sample_data(db):
    """Seed sample jobs and accommodations if none exist."""
    if db.query(Job).count() > 0:
        logger.info("Sample jobs already exist, skipping.")
        return

    jobs = [
        Job(
            title="Software Engineer",
            company="Example Tech Solutions (Sample)",
            description="This is a demonstration listing showing how employers can post job opportunities on ReloCompass. The role involves developing web applications, working with modern frameworks, and collaborating with cross-functional teams. Salary information available upon application.",
            location="Toronto, Canada",
            job_type="Full-Time",
            visa_sponsorship=True,
            experience_years="Entry Level",
            is_sample=True,
        ),
        Job(
            title="Data Analyst",
            company="Example Analytics Ltd. (Sample)",
            description="This is a demonstration listing. The role involves analyzing datasets, building dashboards, and providing actionable insights. Requires 1-2 years of experience. Salary information available upon application.",
            location="Melbourne, Australia",
            job_type="Full-Time",
            visa_sponsorship=True,
            experience_years="1-2 Years",
            is_sample=True,
        ),
    ]

    accommodations = [
        Accommodation(
            title="Student Dormitory Near U of T (Sample)",
            description="This is a demonstration listing showing how accommodation appears on ReloCompass. Single room with shared kitchen in a student residence.",
            acc_type="dorm",
            price=750.0,
            currency="CAD",
            city="Toronto",
            country="Canada",
            safety_rating=4.5,
            is_sample=True,
        ),
        Accommodation(
            title="Shared Apartment in Berlin Mitte (Sample)",
            description="This is a demonstration listing. Shared 2-bedroom apartment near public transit, furnished, utilities included.",
            acc_type="shared",
            price=550.0,
            currency="EUR",
            city="Berlin",
            country="Germany",
            safety_rating=4.2,
            is_sample=True,
        ),
        Accommodation(
            title="Studio Apartment Near Imperial College (Sample)",
            description="This is a demonstration listing. Self-contained studio with en-suite bathroom, 5-minute walk to campus.",
            acc_type="studio",
            price=1200.0,
            currency="GBP",
            city="London",
            country="United Kingdom",
            safety_rating=4.7,
            is_sample=True,
        ),
    ]

    db.add_all(jobs)
    db.add_all(accommodations)
    db.commit()
    logger.info(f"Seeded {len(jobs)} sample jobs and {len(accommodations)} sample accommodations.")


def seed():
    """Full seed: create tables, admin account, and sample data."""
    init_db()
    db = SessionLocal()

    try:
        seed_admin(db)
        seed_sample_data(db)
    finally:
        db.close()

    print("\n" + "=" * 60)
    print("  Database seeding complete!")
    print(f"  Admin login: {settings.DEV_ADMIN_EMAIL}")
    print(f"  Admin password: {settings.DEV_ADMIN_PASSWORD}")
    print("  ⚠️  DEVELOPMENT ONLY — remove before production!")
    print("=" * 60)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed()
