"""ReloCompass Backend — Visa Checklist Router."""
from fastapi import APIRouter, HTTPException, Query

from app.services.visa_checklist import DESTINATIONS, build_checklist

router = APIRouter(prefix="/visa", tags=["visa-checklist"])


@router.get("/destinations")
def list_destinations():
    """Destination + visa type catalogue for the checklist builder UI."""
    return {
        "destinations": [
            {
                "id": dest_id,
                "label": dest["label"],
                "visa_types": [
                    {"id": vt_id, "label": vt["label"]}
                    for vt_id, vt in dest["visa_types"].items()
                ],
                "official_sources": dest["official_sources"],
            }
            for dest_id, dest in DESTINATIONS.items()
        ]
    }


@router.get("/checklist")
def get_checklist(
    destination: str = Query(..., min_length=2, max_length=50),
    visa_type: str = Query(..., min_length=2, max_length=50),
    situation: str | None = Query(default=None),
):
    """Generate an ordered visa document checklist for a destination + visa type."""
    try:
        return build_checklist(destination, visa_type, situation)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e.args[0] if e.args else e))
