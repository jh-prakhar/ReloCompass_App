"""Visa checklist generator tests."""
import pytest
from fastapi.testclient import TestClient

from app.services.visa_checklist import build_checklist, DESTINATIONS


@pytest.fixture
def client():
    from app.main import app

    with TestClient(app) as c:
        yield c


class TestService:
    def test_all_destinations_have_content(self):
        assert set(DESTINATIONS) == {"canada", "germany", "australia", "usa", "uk"}
        for dest_id, dest in DESTINATIONS.items():
            assert dest["visa_types"], f"{dest_id} has no visa types"
            assert dest["official_sources"]

    def test_build_checklist_structure(self):
        result = build_checklist("Germany", "student", "student")
        assert result["destination"] == "Germany"
        assert result["visa_type"] == "Student visa"
        assert result["total_items"] > 5
        phases = [p["phase"] for p in result["checklist"]]
        assert phases == sorted(phases, key=["prepare", "apply", "interview", "after_arrival"].index)
        all_ids = [i["id"] for p in result["checklist"] for i in p["items"]]
        assert len(all_ids) == len(set(all_ids)), "duplicate checklist items"
        assert any(i["id"] == "blocked" for p in result["checklist"] for i in p["items"])
        assert result["disclaimer"]

    def test_situation_adds_items(self):
        base = build_checklist("Canada", "study_permit", "student")
        family = build_checklist("Canada", "study_permit", "family")
        assert family["total_items"] > base["total_items"]
        assert any(i["id"] == "marriage" for p in family["checklist"] for i in p["items"])

    def test_unknown_destination_raises(self):
        with pytest.raises(KeyError):
            build_checklist("narnia", "student")

    def test_unknown_visa_type_raises(self):
        with pytest.raises(KeyError):
            build_checklist("Canada", "golden_visa")


class TestApi:
    def test_destinations_catalogue(self, client):
        r = client.get("/api/visa/destinations")
        assert r.status_code == 200
        dests = r.json()["destinations"]
        assert len(dests) == 5
        ids = [d["id"] for d in dests]
        assert "germany" in ids

    def test_checklist_endpoint(self, client):
        r = client.get("/api/visa/checklist", params={"destination": "australia", "visa_type": "student", "situation": "job_seeker"})
        assert r.status_code == 200
        data = r.json()
        assert data["total_items"] >= 8
        assert any("OSHC" in i["label"] for p in data["checklist"] for i in p["items"])

    def test_checklist_unknown_404(self, client):
        r = client.get("/api/visa/checklist", params={"destination": "atlantis", "visa_type": "student"})
        assert r.status_code == 404
        assert "Unknown destination" in r.json()["detail"]

    def test_checklist_missing_params_422(self, client):
        r = client.get("/api/visa/checklist")
        assert r.status_code == 422
