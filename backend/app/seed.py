"""
ReloCompass Backend - Database Seed Script
Inserts sample job and accommodation data.
Run: python -m app.seed
"""
from app.database import SessionLocal, engine, Base
from app.models import Job, Accommodation


def init_db():
    """Create tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


def seed():
    init_db()
    db = SessionLocal()

    # Check if already seeded
    if db.query(Job).count() > 0:
        print("Jobs already exist, skipping seed.")
        db.close()
        return

    # ── Sample Jobs ──
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

    # ── Sample Accommodations ──
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
    print(f"Seeded {len(jobs)} sample jobs and {len(accommodations)} sample accommodations.")
    db.close()


if __name__ == "__main__":
    seed()
