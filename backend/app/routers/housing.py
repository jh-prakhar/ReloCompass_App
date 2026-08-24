"""ReloCompass Backend — University Housing Router (provider-based)."""
from datetime import date

from fastapi import APIRouter, HTTPException, Query

from app.services.university_housing import PROVIDERS, provider_for

router = APIRouter(prefix="/housing", tags=["university-housing"])


@router.get("/providers")
def list_providers():
    """Housing data providers (demo now; real university APIs later)."""
    return {
        "providers": [
            {"id": p.id, "label": p.label, "universities": p.universities()}
            for p in PROVIDERS.values()
        ]
    }


@router.get("/availability")
def availability(
    university: str = Query(..., min_length=2, max_length=200),
    move_in: date | None = None,
    max_monthly_cost: float | None = Query(default=None, ge=0),
    kind: str | None = Query(default=None, description="dorm | shared_flat | studio | homestay"),
    provider_id: str = "demo",
):
    """Housing availability for a university from the selected provider."""
    try:
        provider = provider_for(provider_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e.args[0] if e.args else e))

    from app.services.university_housing import AvailabilityQuery

    query = AvailabilityQuery(
        university=university,
        move_in=move_in,
        max_monthly_cost=max_monthly_cost,
        kind=kind,
    )
    options = provider.availability(query)
    return {
        "university": university,
        "provider": {"id": provider.id, "label": provider.label},
        "options": [o.model_dump(mode="json") for o in options],
        "count": len(options),
    }
