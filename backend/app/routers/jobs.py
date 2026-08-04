"""
ReloCompass Backend - Jobs Router
Public job board + employer job management + applications.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Job, Application, User, UserRole
from app.schemas import JobCreate, JobOut, ApplicationCreate, ApplicationOut, MessageResponse

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/", response_model=list[JobOut])
def list_jobs(
    skip: int = 0,
    limit: int = 50,
    location: str | None = None,
    db: Session = Depends(get_db),
):
    """Public endpoint — list all active jobs (includes samples)."""
    query = db.query(Job).filter(Job.is_active == True)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    return query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a single job by ID."""
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/", response_model=JobOut, status_code=201)
def create_job(
    payload: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Employers only — post a new job."""
    if current_user.role != UserRole.employer:
        raise HTTPException(
            status_code=403,
            detail="Only employer accounts can post jobs",
        )
    job = Job(
        title=payload.title,
        company=payload.company,
        description=payload.description,
        location=payload.location,
        job_type=payload.job_type,
        visa_sponsorship=payload.visa_sponsorship,
        experience_years=payload.experience_years,
        employer_id=current_user.id,
        is_sample=False,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.post("/{job_id}/apply", response_model=ApplicationOut, status_code=201)
def apply_for_job(
    job_id: int,
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Students/Job seekers — apply for a job."""
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = (
        db.query(Application)
        .filter(Application.job_id == job_id, Application.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied for this job")

    application = Application(
        job_id=job_id,
        user_id=current_user.id,
        cover_letter=payload.cover_letter,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/applications/me", response_model=list[ApplicationOut])
def my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the current user's job applications."""
    return (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.created_at.desc())
        .all()
    )
