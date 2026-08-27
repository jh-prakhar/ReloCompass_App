"""Relocation Planner — one plan per user, upserted from the planner UI."""
import json
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import RelocationPlan, User

router = APIRouter(prefix="/planner", tags=["planner"])


class ChecklistItem(BaseModel):
    id: str
    label: str
    done: bool = False


class PlanIn(BaseModel):
    destination_country: Optional[str] = Field(None, max_length=100)
    destination_city: Optional[str] = Field(None, max_length=100)
    move_date: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = Field(None, max_length=5000)
    checklist: Optional[list[ChecklistItem]] = None


class PlanOut(PlanIn):
    updated_at: Optional[str] = None


def _row_to_out(row: RelocationPlan | None) -> PlanOut:
    if row is None:
        return PlanOut(checklist=[])
    checklist = []
    if row.checklist_json:
        try:
            raw = json.loads(row.checklist_json)
            checklist = [ChecklistItem(**item) for item in raw]
        except (ValueError, TypeError):
            checklist = []
    return PlanOut(
        destination_country=row.destination_country,
        destination_city=row.destination_city,
        move_date=row.move_date,
        notes=row.notes,
        checklist=checklist,
        updated_at=row.updated_at.isoformat() if row.updated_at else None,
    )


@router.get("/", response_model=PlanOut)
def get_plan(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.query(RelocationPlan).filter(RelocationPlan.user_id == current_user.id).first()
    return _row_to_out(row)


@router.put("/", response_model=PlanOut)
def upsert_plan(plan_in: PlanIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.query(RelocationPlan).filter(RelocationPlan.user_id == current_user.id).first()
    if row is None:
        row = RelocationPlan(user_id=current_user.id)
        db.add(row)
    row.destination_country = plan_in.destination_country
    row.destination_city = plan_in.destination_city
    row.move_date = plan_in.move_date
    row.notes = plan_in.notes
    row.checklist_json = (
        json.dumps([item.model_dump() for item in plan_in.checklist]) if plan_in.checklist else None
    )
    db.commit()
    db.refresh(row)
    return _row_to_out(row)
