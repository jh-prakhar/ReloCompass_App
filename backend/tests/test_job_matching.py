"""Job matching algorithm tests."""
import secrets

import pytest
from fastapi.testclient import TestClient

_RUN = secrets.token_hex(4)


@pytest.fixture
def client():
    from app.main import app

    with TestClient(app) as c:
        yield c


def _register(client, base, role="student", extra_profile=None):
    email = f"{base}.{_RUN}@qacontract.dev"
    r = client.post(
        "/api/auth/register",
        json={"email": email, "password": "Secret123!", "name": "Match Tester", "role": role},
    )
    assert r.status_code == 201, r.text
    token = r.json()["access_token"]
    if extra_profile:
        pr = client.put(
            "/api/users/me",
            json=extra_profile,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert pr.status_code == 200, pr.text
    return token


def _post_job(client, token, **fields):
    body = {
        "title": fields.get("title", "Test Job"),
        "company": fields.get("company", "Match Corp"),
        "location": fields.get("location", "Remote"),
        "description": fields.get("description", ""),
        "visa_sponsorship": fields.get("visa_sponsorship", False),
    }
    r = client.post("/api/jobs/", json=body, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 201, r.text
    return r.json()["id"]


class TestMatchingService:
    def test_skill_extraction(self):
        from app.services.matching import _extract_skills

        assert "react" in _extract_skills("Looking for React and TypeScript developer")
        assert "python" in _extract_skills("Python backend with FastAPI")
        assert "cooking" in _extract_skills("Line cook / kitchen staff needed")
        assert _extract_skills("") == set()

    def test_score_ranks_skill_match_above_mismatch(self):
        from datetime import datetime, timezone

        from app.services.matching import score_job

        class J:
            title = "React Developer"
            description = "React TypeScript frontend"
            location = "Berlin"
            requirements = None
            visa_sponsorship = True
            created_at = datetime.now(timezone.utc)

        good = score_job(
            J(), user_skills_text="React developer with TypeScript",
            user_city="Berlin", user_country="Germany", needs_visa=True,
        )
        bad = score_job(
            J(), user_skills_text="Warehouse and logistics worker",
            user_city="Toronto", user_country="Canada", needs_visa=False,
        )
        assert good["score"] > bad["score"]
        assert "react" in good["skills_matched"]
        assert good["reasons"][0].startswith("Matches your skills")


class TestMatchEndpoint:
    def test_match_requires_auth(self, client):
        r = client.get("/api/jobs/match")
        assert r.status_code == 401

    def test_match_returns_ranked_matches(self, client):
        emp = _register(client, "matchemp", role="employer")
        j1 = _post_job(
            client, emp,
            title="Senior React Engineer",
            description="React, TypeScript, REST API development",
            location="Berlin, Germany",
            visa_sponsorship=True,
        )
        j2 = _post_job(
            client, emp,
            title="Warehouse Associate",
            description="Warehouse logistics picking packing",
            location="Toronto, ON",
            visa_sponsorship=False,
        )
        stu = _register(
            client, "matchstu",
            extra_profile={"city": "Berlin", "country": "Germany", "bio": "React and TypeScript developer"},
        )
        r = client.get(
            "/api/jobs/match",
            params={"skills": "react typescript", "city": "Berlin", "country": "Germany", "needs_visa": True},
            headers={"Authorization": f"Bearer {stu}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "matches" in data
        scores = [m["score"] for m in data["matches"]]
        assert scores == sorted(scores, reverse=True)

        ids = [m["job"]["id"] for m in data["matches"]]
        assert j1 in ids
        react_match = next(m for m in data["matches"] if m["job"]["id"] == j1)
        assert react_match["score"] >= 70
        assert "react" in react_match["skills_matched"]
        assert any("Berlin" in reason for reason in react_match["reasons"])

        # cleanup
        client.delete(f"/api/jobs/{j1}", headers={"Authorization": f"Bearer {emp}"})
        client.delete(f"/api/jobs/{j2}", headers={"Authorization": f"Bearer {emp}"})

    def test_min_score_filter(self, client):
        stu = _register(client, "matchmin", extra_profile={"city": "Nowhereville"})
        r = client.get(
            "/api/jobs/match",
            params={"min_score": 99},
            headers={"Authorization": f"Bearer {stu}"},
        )
        assert r.status_code == 200
        data = r.json()
        assert all(m["score"] >= 99 for m in data["matches"])
