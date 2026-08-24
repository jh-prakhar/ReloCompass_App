"""
ReloCompass Backend - Jobs Router
Public job board + employer job management + applications.
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.deps import get_current_user
from app.models import Job, Application, User, UserRole
from app.schemas import (
    JobCreate, JobOut, ApplicationCreate, ApplicationOut,
    ApplicationStatusUpdate, ApplicationWithApplicantOut, MessageResponse,
)

router = APIRouter(prefix="/jobs", tags=["jobs"])

VALID_APPLICATION_STATUSES = {"pending", "reviewed", "shortlisted", "rejected", "accepted"}


from app.services.email import send_application_status_email


def _notify_applicant_async(*, application_id: int, new_status: str) -> None:
    """Background task: email the applicant about their status change."""
    db = SessionLocal()
    try:
        application = (
            db.query(Application)
            .filter(Application.id == application_id)
            .first()
        )
        if not application:
            return
        send_application_status_email(
            db,
            to_email=application.applicant.email,
            user_name=application.applicant.name,
            job_title=application.job.title,
            company=application.job.company,
            new_status=new_status,
        )
    except Exception as e:  # noqa: BLE001 — notification failures never break the flow
        import logging
        logging.getLogger("relocompass.jobs").error(
            "Status-change email failed for application %s: %s", application_id, e
        )
    finally:
        db.close()


@router.get("/", response_model=list[JobOut])
def list_jobs(
    skip: int = 0,
    limit: int = Query(default=50, ge=1, le=100),
    q: str | None = None,
    location: str | None = None,
    job_type: str | None = None,
    visa_only: bool = False,
    db: Session = Depends(get_db),
):
    """Public endpoint — list all active jobs with optional filters."""
    query = db.query(Job).filter(Job.is_active == True)  # noqa: E712
    if q:
        like = f"%{q}%"
        query = query.filter(or_(
            Job.title.ilike(like),
            Job.company.ilike(like),
            Job.description.ilike(like),
        ))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Job.job_type == job_type)
    if visa_only:
        query = query.filter(Job.visa_sponsorship == True)  # noqa: E712
    return query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/mine", response_model=list[JobOut])
def my_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Employers only — list jobs this employer has posted."""
    if current_user.role != UserRole.employer:
        raise HTTPException(status_code=403, detail="Only employer accounts can view posted jobs")
    return (
        db.query(Job)
        .filter(Job.employer_id == current_user.id)
        .order_by(Job.created_at.desc())
        .all()
    )


@router.get("/match")
def match_jobs(
    limit: int = Query(default=10, ge=1, le=50),
    min_score: int = Query(default=0, ge=0, le=100),
    skills: str | None = Query(default=None, description="Comma-separated skills text"),
    city: str | None = Query(default=None),
    country: str | None = Query(default=None),
    needs_visa: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ranked job recommendations for the signed-in user.

    Signals: skills overlap (40%), location (25%), visa sponsorship (20%),
    recency (15%). Profile fields (city/country) come from the user's profile
    unless overridden via query params; `skills` may come from a skills
    input on the profile or the query string.
    """
    from app.services.matching import score_job

    user_skills_text = " ".join(
        filter(None, [skills, current_user.bio or ""])
    )
    user_city = city or current_user.city
    user_country = country or current_user.country

    jobs = (
        db.query(Job)
        .filter(Job.is_active == True)  # noqa: E712
        .order_by(Job.created_at.desc())
        .limit(200)
        .all()
    )

    scored = []
    for job in jobs:
        result = score_job(
            job,
            user_skills_text=user_skills_text,
            user_city=user_city,
            user_country=user_country,
            needs_visa=needs_visa,
        )
        if result["score"] >= min_score:
            scored.append({
                "job": JobOut.model_validate(job, from_attributes=True).model_dump(),
                "score": result["score"],
                "reasons": result["reasons"],
                "skills_matched": result["skills_matched"],
            })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"matches": scored[:limit], "total_scored": len(scored)}


@router.get("/applications/me", response_model=list[ApplicationOut])
def my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Students / job seekers — list their own applications."""
    return (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.created_at.desc())
        .all()
    )


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a single job by ID."""
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()  # noqa: E712
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
    """Students/job seekers — apply for a job."""
    if current_user.role == UserRole.employer:
        raise HTTPException(status_code=403, detail="Employers cannot apply for jobs")
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()  # noqa: E712
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


@router.get("/{job_id}/applications", response_model=list[ApplicationWithApplicantOut])
def job_applications(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Employers only — list applicants for a job they own."""
    if current_user.role != UserRole.employer:
        raise HTTPException(status_code=403, detail="Only employer accounts can view applicants")
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view applicants for your own jobs")
    return (
        db.query(Application)
        .join(User, Application.user_id == User.id)
        .filter(Application.job_id == job_id)
        .order_by(Application.created_at.desc())
        .all()
    )


@router.patch("/applications/{application_id}", response_model=ApplicationOut)
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Employers only — update the status of an application for their own job."""
    if current_user.role != UserRole.employer:
        raise HTTPException(status_code=403, detail="Only employer accounts can update applications")

    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job or job.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update applications for your own jobs")

    application.status = payload.status
    db.commit()
    db.refresh(application)

    # Notify the applicant by email (own DB session; failures never block the API).
    background_tasks.add_task(
        _notify_applicant_async,
        application_id=application.id,
        new_status=payload.status,
    )
    return application


@router.delete("/{job_id}", response_model=MessageResponse)
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Employers only — deactivate (soft-delete) a job they own."""
    if current_user.role != UserRole.employer:
        raise HTTPException(status_code=403, detail="Only employer accounts can delete jobs")
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own jobs")

    job.is_active = False
    db.commit()
    return MessageResponse(message="Job deleted", detail=str(job_id))
