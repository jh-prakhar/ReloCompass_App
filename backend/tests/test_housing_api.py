"""University housing availability tests (demo provider)."""
import pytest
from fastapi.testclient import TestClient

from app.services.university_housing import (
    AvailabilityQuery,
    DemoUniversityProvider,
    provider_for,
)


@pytest.fixture
def client():
    from app.main import app

    with TestClient(app) as c:
        yield c


class TestProvider:
    def test_provider_registry(self):
        p = provider_for("demo")
        assert p.id == "demo"
        assert "TU Berlin" in p.universities()
        with pytest.raises(KeyError):
            provider_for("nonexistent")

    def test_availability_filters(self):
        p = DemoUniversityProvider()
        opts = p.availability(AvailabilityQuery(university="TU Berlin"))
        assert len(opts) >= 2
        assert all(o.university == "TU Berlin" for o in opts)

        cheap = p.availability(
            AvailabilityQuery(university="TU Berlin", max_monthly_cost=400)
        )
        assert all(o.monthly_cost <= 400 for o in cheap)

        dorms = p.availability(AvailabilityQuery(university="TU Berlin", kind="dorm"))
        assert dorms and all(o.kind == "dorm" for o in dorms)

    def test_unknown_university_empty(self):
        p = DemoUniversityProvider()
        assert p.availability(AvailabilityQuery(university="Hogwarts")) == []


class TestApi:
    def test_providers_endpoint(self, client):
        r = client.get("/api/housing/providers")
        assert r.status_code == 200
        provs = r.json()["providers"]
        assert any(p["id"] == "demo" for p in provs)

    def test_availability_endpoint(self, client):
        r = client.get("/api/housing/availability", params={"university": "LMU Munich"})
        assert r.status_code == 200
        data = r.json()
        assert data["count"] == len(data["options"])
        assert data["count"] >= 2
        assert data["provider"]["id"] == "demo"
        for o in data["options"]:
            assert o["currency"] == "EUR"
            assert o["monthly_cost"] > 0

    def test_availability_cost_filter(self, client):
        r = client.get(
            "/api/housing/availability",
            params={"university": "LMU Munich", "max_monthly_cost": 500},
        )
        assert r.status_code == 200
        assert all(o["monthly_cost"] <= 500 for o in r.json()["options"])

    def test_availability_unknown_provider_404(self, client):
        r = client.get(
            "/api/housing/availability",
            params={"university": "TU Berlin", "provider_id": "future"},
        )
        assert r.status_code == 404
