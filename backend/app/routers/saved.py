"""Saved jobs & accommodations (bookmarks) — authenticated users only."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Accommodation, Job, SavedAccommodation, SavedJob, User
from app.schemas import AccommodationOut, JobOut

router = APIRouter(prefix="/saved", tags=["saved"])


# ---------- Jobs ----------

@router.get("/jobs", response_model=list[JobOut])
def list_saved_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id)
        .order_by(SavedJob.created_at.desc())
        .all()
    )
    return [r.job for r in rows if r.job is not None]


@router.post("/jobs/{job_id}", status_code=status.HTTP_201_CREATED)
def save_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    row = SavedJob(user_id=current_user.id, job_id=job_id)
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()  # already saved — idempotent
    return {"detail": "saved", "job_id": job_id}


@router.delete("/jobs/{job_id}")
def unsave_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id)
        .delete()
    )
    db.commit()
    if not deleted:
        raise HTTPException(status_code=404, detail="Not saved")
    return {"detail": "unsaved", "job_id": job_id}


# ---------- Accommodations ----------

@router.get("/accommodations", response_model=list[AccommodationOut])
def list_saved_accommodations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(SavedAccommodation)
        .filter(SavedAccommodation.user_id == current_user.id)
        .order_by(SavedAccommodation.created_at.desc())
        .all()
    )
    return [r.accommodation for r in rows if r.accommodation is not None]


@router.post("/accommodations/{accommodation_id}", status_code=status.HTTP_201_CREATED)
def save_accommodation(
    accommodation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    acc = db.query(Accommodation).filter(Accommodation.id == accommodation_id).first()
    if acc is None:
        raise HTTPException(status_code=404, detail="Accommodation not found")
    row = SavedAccommodation(user_id=current_user.id, accommodation_id=accommodation_id)
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()  # idempotent
    return {"detail": "saved", "accommodation_id": accommodation_id}


@router.delete("/accommodations/{accommodation_id}")
def unsave_accommodation(
    accommodation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = (
        db.query(SavedAccommodation)
        .filter(
            SavedAccommodation.user_id == current_user.id,
            SavedAccommodation.accommodation_id == accommodation_id,
        )
        .delete()
    )
    db.commit()
    if not deleted:
        raise HTTPException(status_code=404, detail="Not saved")
    return {"detail": "unsaved", "accommodation_id": accommodation_id}
