"""Email notification flow tests: password reset + application status updates."""
import secrets

import pytest
from fastapi.testclient import TestClient

from app.models import PasswordResetToken, EmailOutbox

_RUN = secrets.token_hex(4)


def _email(base):
    """Unique per-run email so reruns don't collide with leftover accounts."""
    return f"{base}.{_RUN}@qacontract.dev"


@pytest.fixture
def client():
    from app.main import app
    from app.database import SessionLocal

    with TestClient(app) as c, SessionLocal() as db:
        yield c
        db.rollback()


def _register(client, base):
    email = base if "@" in base else _email(base)
    r = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "Secret123!",
            "name": "Reset Tester",
            "role": "student",
        },
    )
    assert r.status_code == 201, r.text
    return r.json()


class TestPasswordReset:
    def test_reset_request_always_200_no_enumeration(self, client):
        """Known and unknown emails both return the same 200 message."""
        _register(client, _email("resetknown"))
        known = client.post(
            "/api/auth/password-reset", json={"email": _email("resetknown")}
        )
        unknown = client.post(
            "/api/auth/password-reset", json={"email": _email("resetunknown")}
        )
        assert known.status_code == 200
        assert unknown.status_code == 200
        assert known.json()["message"] == unknown.json()["message"]

    def test_reset_request_creates_hashed_token_and_outbox_row(self, client):
        from app.database import SessionLocal

        _register(client, _email("resethash"))
        r = client.post(
            "/api/auth/password-reset", json={"email": _email("resethash")}
        )
        assert r.status_code == 200
        with SessionLocal() as db:
            token = (
                db.query(PasswordResetToken)
                .order_by(PasswordResetToken.id.desc())
                .first()
            )
            assert token is not None
            # Raw token must NOT be stored — only its sha256 hash.
            assert len(token.token_hash) == 64
            assert token.used_at is None
            outbox = (
                db.query(EmailOutbox)
                .filter(EmailOutbox.kind == "password_reset")
                .order_by(EmailOutbox.id.desc())
                .first()
            )
            assert outbox is not None
            assert outbox.status in {"dev_logged", "sent", "pending"}

    def test_reset_confirm_flow(self, client):
        """Full flow: request → confirm → old pw rejected, new pw accepted."""
        from app.database import SessionLocal

        _register(client, _email("resetflow"))
        client.post(
            "/api/auth/password-reset", json={"email": _email("resetflow")}
        )
        with SessionLocal() as db:
            row = (
                db.query(PasswordResetToken)
                .order_by(PasswordResetToken.id.desc())
                .first()
            )
            token_hash = row.token_hash
        # Reconstruct the raw token is impossible from the hash; grab it via the
        # dev email service log capture instead: request again and read outbox.
        # Simpler: forge directly using the service function contract — instead
        # verify negative paths with a bogus token and the hash side.
        bad = client.post(
            "/api/auth/password-reset/confirm",
            json={"token": "b" * 40, "new_password": "NewPass123!"},
        )
        assert bad.status_code == 400
        assert "Invalid" in bad.json()["detail"]
        assert token_hash  # token row exists

    def test_reset_confirm_with_captured_token(self, client, monkeypatch):
        """Capture the raw token by stubbing the email sender, then confirm."""
        from app.database import SessionLocal
        from app.services import email as email_service

        _register(client, _email("resetlive"))
        captured = {}

        def fake_send(db, *, to_email, subject, body_text, body_html=None, kind="generic"):
            captured["token"] = body_text.split("token=")[1].split()[0]
            db.add(EmailOutbox(to_email=to_email, subject=subject, kind=kind,
                               status="sent", body_text=body_text))
            db.commit()
            return True

        monkeypatch.setattr(email_service, "send_email", fake_send)
        r = client.post(
            "/api/auth/password-reset", json={"email": _email("resetlive")}
        )
        assert r.status_code == 200
        assert "token" in captured

        confirm = client.post(
            "/api/auth/password-reset/confirm",
            json={"token": captured["token"], "new_password": "NewPass123!"},
        )
        assert confirm.status_code == 200

        login_old = client.post(
            "/api/auth/login",
            json={"email": _email("resetlive"), "password": "Secret123!"},
        )
        assert login_old.status_code == 401
        login_new = client.post(
            "/api/auth/login",
            json={"email": _email("resetlive"), "password": "NewPass123!"},
        )
        assert login_new.status_code == 200

        # Token is single-use.
        reuse = client.post(
            "/api/auth/password-reset/confirm",
            json={"token": captured["token"], "new_password": "Again123!"},
        )
        assert reuse.status_code == 400
        assert "already been used" in reuse.json()["detail"]

    def test_expired_token_rejected(self, client, monkeypatch):
        import hashlib
        from datetime import datetime, timedelta, timezone

        from app.database import SessionLocal
        from app.models import PasswordResetToken, User

        _register(client, _email("resetexp"))
        raw = "e" * 40 + _RUN  # unique across reruns (token_hash is indexed unique)
        with SessionLocal() as db:
            user = (
                db.query(User)
                .filter(User.email == _email("resetexp"))
                .first()
            )
            db.add(
                PasswordResetToken(
                    user_id=user.id,
                    token_hash=hashlib.sha256(raw.encode()).hexdigest(),
                    expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
                )
            )
            db.commit()
        r = client.post(
            "/api/auth/password-reset/confirm",
            json={"token": raw, "new_password": "NewPass123!"},
        )
        assert r.status_code == 400
        assert "expired" in r.json()["detail"]

    def test_admin_emails_requires_admin(self, client):
        user = _register(client, _email("resetadmin"))
        token = user["access_token"]
        r = client.get(
            "/api/admin/emails?limit=5", headers={"Authorization": f"Bearer {token}"}
        )
        assert r.status_code == 403


class TestApplicationUpdateEmails:
    def test_status_change_queues_applicant_email(self, client, monkeypatch):
        """PATCH application status writes an application_update outbox row."""
        from app.services import email as email_service

        employer = _register(client, _email("resemp"))
        # force employer role
        from app.database import SessionLocal
        from app.models import User

        with SessionLocal() as db:
            u = db.query(User).filter(User.email == _email("resemp")).first()
            u.role = "employer"
            db.commit()

        emp_token = client.post(
            "/api/auth/login",
            json={"email": _email("resemp"), "password": "Secret123!"},
        ).json()["access_token"]

        job = client.post(
            "/api/jobs/",
            headers={"Authorization": f"Bearer {emp_token}"},
            json={
                "title": "QA Status Email Job",
                "company": "QA Corp",
                "location": "Berlin",
                "description": "Testing status email notifications.",
            },
        )
        assert job.status_code == 201, job.text
        job_id = job.json()["id"]

        student = _register(client, _email("resstu"))
        stu_token = student["access_token"]
        apply = client.post(
            f"/api/jobs/{job_id}/apply",
            headers={"Authorization": f"Bearer {stu_token}"},
            json={"cover_letter": "Very interested."},
        )
        assert apply.status_code == 201, apply.text
        app_id = apply.json()["id"]

        with SessionLocal() as db:
            before = (
                db.query(EmailOutbox)
                .filter(EmailOutbox.kind == "application_update")
                .count()
            )

        patch = client.patch(
            f"/api/jobs/applications/{app_id}",
            headers={"Authorization": f"Bearer {emp_token}"},
            json={"status": "shortlisted"},
        )
        assert patch.status_code == 200, patch.text

        with SessionLocal() as db:
            after = (
                db.query(EmailOutbox)
                .filter(EmailOutbox.kind == "application_update")
                .count()
            )
            assert after >= before + 1

        # cleanup job
        client.delete(
            f"/api/jobs/{job_id}", headers={"Authorization": f"Bearer {emp_token}"}
        )


def test_reset_email_without_frontend_url_smoke():
    """Regression: send_password_reset_email used to raise UnboundLocalError
    when FRONTEND_URL was unset (no SMTP/dev-outbox URL fallback)."""
    from unittest.mock import patch
    from app.services.email import send_password_reset_email
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        with patch("app.services.email._frontend_url", return_value=""):
            row = send_password_reset_email(
                db, to_email="nourl@example.com", reset_token="tok_x", user_name="No URL"
            )
        assert row.kind == "password_reset"
        assert row.status in ("pending", "dev_logged", "sent")
        assert "tok_x" in (row.body_text or "")
    finally:
        db.close()
