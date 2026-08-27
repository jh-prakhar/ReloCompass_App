"""Phase 5 — Saved items, Planner, Notifications, Settings endpoint tests."""
import pytest
from fastapi.testclient import TestClient

from app.models import Accommodation, Job, Notification, User, UserRole
from app.services.auth import hash_password


@pytest.fixture
def employer_token(client, db_session):
    u = User(
        name="Test Employer",
        email="testemployer@relocompass.org",
        hashed_password=hash_password("Employer@12345"),
        role=UserRole.employer,
        is_active=True,
    )
    db_session.add(u)
    db_session.commit()
    r = client.post("/api/auth/login", json={
        "email": "testemployer@relocompass.org",
        "password": "Employer@12345",
    })
    return r.json()["access_token"]


@pytest.fixture
def sample_job(db_session):
    job = Job(
        title="Saved Flow Sample Job",
        company="Sample Co (Sample)",
        is_sample=True,
        is_active=True,
    )
    db_session.add(job)
    db_session.commit()
    return job


@pytest.fixture
def sample_acc(db_session):
    acc = Accommodation(
        title="Saved Flow Sample Acc",
        acc_type="dorm",
        price=500.0,
        city="Toronto",
        is_sample=True,
    )
    db_session.add(acc)
    db_session.commit()
    return acc


AUTH = lambda t: {"Authorization": f"Bearer {t}"}  # noqa: E731


# ────────────────────────── Saved jobs ──────────────────────────

class TestSavedJobs:
    def test_requires_auth(self, client):
        assert client.get("/api/saved/jobs").status_code == 401

    def test_save_list_unsave(self, client, student_token, sample_job):
        r = client.post(f"/api/saved/jobs/{sample_job.id}", headers=AUTH(student_token))
        assert r.status_code == 201

        r = client.get("/api/saved/jobs", headers=AUTH(student_token))
        assert r.status_code == 200
        titles = [j["title"] for j in r.json()]
        assert titles == ["Saved Flow Sample Job"]

        r = client.delete(f"/api/saved/jobs/{sample_job.id}", headers=AUTH(student_token))
        assert r.status_code == 200
        assert client.get("/api/saved/jobs", headers=AUTH(student_token)).json() == []

    def test_save_is_idempotent(self, client, student_token, sample_job):
        assert client.post(f"/api/saved/jobs/{sample_job.id}", headers=AUTH(student_token)).status_code == 201
        assert client.post(f"/api/saved/jobs/{sample_job.id}", headers=AUTH(student_token)).status_code == 201
        assert len(client.get("/api/saved/jobs", headers=AUTH(student_token)).json()) == 1

    def test_save_missing_job_404(self, client, student_token):
        assert client.post("/api/saved/jobs/99999", headers=AUTH(student_token)).status_code == 404

    def test_unsave_missing_404(self, client, student_token):
        assert client.delete("/api/saved/jobs/99999", headers=AUTH(student_token)).status_code == 404

    def test_saved_jobs_are_per_user(self, client, student_token, employer_token, sample_job):
        client.post(f"/api/saved/jobs/{sample_job.id}", headers=AUTH(student_token))
        assert client.get("/api/saved/jobs", headers=AUTH(employer_token)).json() == []


class TestSavedAccommodations:
    def test_requires_auth(self, client):
        assert client.get("/api/saved/accommodations").status_code == 401

    def test_save_list_unsave(self, client, student_token, sample_acc):
        r = client.post(f"/api/saved/accommodations/{sample_acc.id}", headers=AUTH(student_token))
        assert r.status_code == 201
        r = client.get("/api/saved/accommodations", headers=AUTH(student_token))
        assert [a["title"] for a in r.json()] == ["Saved Flow Sample Acc"]
        assert client.delete(
            f"/api/saved/accommodations/{sample_acc.id}", headers=AUTH(student_token)
        ).status_code == 200

    def test_save_missing_404(self, client, student_token):
        assert client.post("/api/saved/accommodations/99999", headers=AUTH(student_token)).status_code == 404


# ────────────────────────── Planner ──────────────────────────

class TestPlanner:
    def test_requires_auth(self, client):
        assert client.get("/api/planner/").status_code == 401

    def test_empty_plan_initially(self, client, student_token):
        r = client.get("/api/planner/", headers=AUTH(student_token))
        assert r.status_code == 200
        assert r.json()["checklist"] == []
        assert r.json()["destination_country"] is None

    def test_put_then_get_roundtrip(self, client, student_token):
        payload = {
            "destination_country": "Canada",
            "destination_city": "Toronto",
            "move_date": "2026-09-01",
            "notes": "Fall intake",
            "checklist": [
                {"id": "visa", "label": "Study permit", "done": True},
                {"id": "housing", "label": "Book viewings", "done": False},
            ],
        }
        r = client.put("/api/planner/", json=payload, headers=AUTH(student_token))
        assert r.status_code == 200
        assert r.json()["destination_city"] == "Toronto"
        assert len(r.json()["checklist"]) == 2

        r = client.get("/api/planner/", headers=AUTH(student_token))
        assert [c["label"] for c in r.json()["checklist"]] == ["Study permit", "Book viewings"]
        assert r.json()["checklist"][0]["done"] is True

    def test_upsert_replaces_existing_plan(self, client, student_token):
        client.put("/api/planner/", json={"destination_country": "Germany"}, headers=AUTH(student_token))
        client.put("/api/planner/", json={"destination_country": "Australia"}, headers=AUTH(student_token))
        assert client.get("/api/planner/", headers=AUTH(student_token)).json()["destination_country"] == "Australia"

    def test_plans_are_per_user(self, client, student_token, employer_token):
        client.put("/api/planner/", json={"destination_country": "Spain"}, headers=AUTH(student_token))
        r = client.get("/api/planner/", headers=AUTH(employer_token))
        assert r.json()["destination_country"] is None


# ────────────────────────── Notifications ──────────────────────────

class TestNotifications:
    def _seed_notif(self, db_session, user_id, read=False):
        db_session.add(Notification(
            user_id=user_id,
            kind="application_update",
            title="Application update: X",
            body="moved to reviewed",
            is_read=read,
        ))
        db_session.commit()

    def _student_id(self, db_session):
        return db_session.query(User).filter_by(email="teststudent@relocompass.org").first().id

    def test_requires_auth(self, client):
        assert client.get("/api/notifications/").status_code == 401

    def test_list_and_unread_count(self, client, db_session, student_token):
        self._seed_notif(db_session, self._student_id(db_session))
        self._seed_notif(db_session, self._student_id(db_session))

        r = client.get("/api/notifications/", headers=AUTH(student_token))
        assert len(r.json()) == 2
        r = client.get("/api/notifications/unread-count", headers=AUTH(student_token))
        assert r.json()["count"] == 2

    def test_unread_only_filter(self, client, db_session, student_token):
        uid = self._student_id(db_session)
        self._seed_notif(db_session, uid, read=True)
        self._seed_notif(db_session, uid, read=False)
        r = client.get("/api/notifications/?unread_only=true", headers=AUTH(student_token))
        assert len(r.json()) == 1
        assert r.json()[0]["is_read"] is False

    def test_mark_read_and_read_all(self, client, db_session, student_token):
        uid = self._student_id(db_session)
        self._seed_notif(db_session, uid)
        self._seed_notif(db_session, uid)

        rows = db_session.query(Notification).filter_by(user_id=uid).all()
        first_id = rows[0].id

        r = client.post(f"/api/notifications/{first_id}/read", headers=AUTH(student_token))
        assert r.status_code == 200
        assert client.get("/api/notifications/unread-count", headers=AUTH(student_token)).json()["count"] == 1

        r = client.post("/api/notifications/read-all", headers=AUTH(student_token))
        assert r.json()["updated"] == 1
        assert client.get("/api/notifications/unread-count", headers=AUTH(student_token)).json()["count"] == 0

    def test_cannot_read_others_notification(self, client, db_session, student_token, employer_token):
        uid = self._student_id(db_session)
        self._seed_notif(db_session, uid)
        nid = db_session.query(Notification).filter_by(user_id=uid).first().id
        assert client.post(f"/api/notifications/{nid}/read", headers=AUTH(employer_token)).status_code == 404


# ────────────────────────── Settings ──────────────────────────

class TestSettings:
    def test_requires_auth(self, client):
        assert client.put("/api/settings/language", json={"preferred_language": "fr"}).status_code == 401

    def test_set_valid_language(self, client, student_token):
        r = client.put("/api/settings/language", json={"preferred_language": "fr"}, headers=AUTH(student_token))
        assert r.status_code == 200
        assert r.json()["preferred_language"] == "fr"

        r = client.get("/api/users/me", headers=AUTH(student_token))
        assert r.json()["preferred_language"] == "fr"

    def test_reject_invalid_language(self, client, student_token):
        r = client.put("/api/settings/language", json={"preferred_language": "zz"}, headers=AUTH(student_token))
        assert r.status_code == 422

    def test_password_change_cycle(self, client, student_token):
        r = client.put("/api/settings/password", json={
            "current_password": "Student@123",
            "new_password": "NewPass99",
        }, headers=AUTH(student_token))
        assert r.status_code == 200

        login = client.post("/api/auth/login", json={
            "email": "teststudent@relocompass.org",
            "password": "NewPass99",
        })
        assert login.status_code == 200

        # old password no longer works
        old = client.post("/api/auth/login", json={
            "email": "teststudent@relocompass.org",
            "password": "Student@123",
        })
        assert old.status_code == 401

    def test_password_change_wrong_current(self, client, student_token):
        r = client.put("/api/settings/password", json={
            "current_password": "wrong-password",
            "new_password": "NewPass99",
        }, headers=AUTH(student_token))
        assert r.status_code == 400

    def test_password_change_same_password_rejected(self, client, student_token):
        r = client.put("/api/settings/password", json={
            "current_password": "Student@123",
            "new_password": "Student@123",
        }, headers=AUTH(student_token))
        assert r.status_code == 400
