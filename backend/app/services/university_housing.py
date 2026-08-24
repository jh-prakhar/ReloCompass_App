"""University housing availability — pluggable provider interface.

Real university APIs are future integrations (each university exposes
different endpoints/auth). The `HousingProvider` protocol defines the
contract; `DemoUniversityProvider` returns deterministic sample data so
the whole flow works end-to-end today. A real provider implements the
same protocol and is registered in PROVIDERS.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Protocol

from pydantic import BaseModel, Field


class HousingOption(BaseModel):
    """One bookable housing option returned by a provider."""
    provider: str
    university: str
    campus: str | None = None
    kind: str = Field(description="dorm | shared_flat | studio | homestay")
    title: str
    monthly_cost: float
    currency: str = "EUR"
    available_from: date
    available_to: date | None = None
    distance_km: float | None = None
    meals_included: bool = False
    url: str | None = None
    notes: str | None = None


class AvailabilityQuery(BaseModel):
    university: str
    move_in: date | None = None
    max_monthly_cost: float | None = None
    kind: str | None = None


class HousingProvider(Protocol):
    """Contract every housing provider implements."""

    id: str
    label: str

    def universities(self) -> list[str]: ...

    def availability(self, query: AvailabilityQuery) -> list[HousingOption]: ...


class DemoUniversityProvider:
    """Deterministic demo data for three universities.

    Real integrations later: each university's housing office API would be
    wrapped in its own provider class with the same two methods.
    """

    id = "demo"
    label = "Demo University Housing"

    _UNIVERSITIES = ["TU Berlin", "LMU Munich", "University of Toronto"]

    _CATALOG = {
        "TU Berlin": [
            ("dorm", "Studentendorf Schlachtensee — single room", 380, 1.2, False, "Shared kitchen; waitlist applies"),
            ("shared_flat", "WG room near Charlottenburg campus", 450, 0.6, False, "Anmeldung possible"),
            ("studio", "Micro-apartment, Wedding", 640, 3.4, False, "Furnished, 20 m²"),
            ("homestay", "Host family, Zehlendorf", 520, 8.0, True, "Breakfast + dinner included"),
        ],
        "LMU Munich": [
            ("dorm", "Studentenwerk dorm — single room", 420, 1.5, False, "Applied via Studentenwerk portal"),
            ("shared_flat", "WG room, Maxvorstadt", 580, 0.9, False, "Very central"),
            ("studio", "Studio, Garching campus", 700, 0.3, False, "Near TUM satellite campus"),
        ],
        "University of Toronto": [
            ("dorm", "Chestnut Residence — single", 1150, 1.8, True, "Meal plan mandatory"),
            ("shared_flat", "Shared 2BR, Bloor St", 980, 1.1, False, "Steps from St. George campus"),
            ("homestay", "Homestay, North York", 850, 12.0, True, "Commute ~35 min by subway"),
        ],
    }

    def universities(self) -> list[str]:
        return list(self._UNIVERSITIES)

    def availability(self, query: AvailabilityQuery) -> list[HousingOption]:
        rows = self._CATALOG.get(query.university)
        if not rows:
            return []

        # Deterministic "seasonal" availability: options 2, 3 alternate months
        move_in = query.move_in or date.today() + timedelta(days=30)
        options: list[HousingOption] = []
        for idx, (kind, title, cost, dist, meals, notes) in enumerate(rows):
            if query.kind and kind != query.kind:
                continue
            if query.max_monthly_cost and cost > query.max_monthly_cost:
                continue
            if idx % 2 == 1 and move_in.month in (9, 10):
                continue  # "high season" — some options full
            currency = "CAD" if "Toronto" in query.university else "EUR"
            options.append(
                HousingOption(
                    provider=self.id,
                    university=query.university,
                    kind=kind,
                    title=title,
                    monthly_cost=cost,
                    currency=currency,
                    available_from=move_in,
                    distance_km=dist,
                    meals_included=meals,
                    notes=notes,
                )
            )
        return options


PROVIDERS: dict[str, HousingProvider] = {
    DemoUniversityProvider.id: DemoUniversityProvider(),
}


def provider_for(provider_id: str) -> HousingProvider:
    try:
        return PROVIDERS[provider_id]
    except KeyError:
        raise KeyError(
            f"Unknown housing provider '{provider_id}'. Available: {', '.join(PROVIDERS)}"
        )
