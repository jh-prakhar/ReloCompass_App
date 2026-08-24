"""
Integration tests for the job lifecycle:
public board filters → apply flow → employer portal (mine, applicants,
status updates, delete).
"""
import pytest

from app.services.auth import hash_password


@pytest.fixture
def student_headers(client, db_session):
    """Register a student and return auth headers."""
    from app.models import User, UserRole

    user = User(
        name="Student One",
        email="student1@relocompass.org",
        hashed_password=hash_password("TestPass123!"),
        role=UserRole.student,
    )
    db_session.add(user)
    db_session.commit()

    res = client.post("/api/auth/login", json={
        "email": "student1@relocompass.org",
        "password": "TestPass123!",
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def employer_headers(client, db_session):
    """Register an employer and return auth headers."""
    from app.models import User, UserRole

    user = User(
        name="Employer One",
        email="employer1@relocompass.org",
        hashed_password=hash_password("TestPass123!"),
        role=UserRole.employer,
    )
    db_session.add(user)
    db_session.commit()

    res = client.post("/api/auth/login", json={
        "email": "employer1@relocompass.org",
        "password": "TestPass123!",
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def posted_job(client, employer_headers):
    """Employer posts a job; return its JSON."""
    res = client.post("/api/jobs/", json={
        "title": "Registered Nurse",
        "company": "Toronto General Hospital",
        "description": "ICU nursing role with relocation support.",
        "location": "Toronto, Canada",
        "job_type": "Full-Time",
        "visa_sponsorship": True,
        "experience_years": "2-4 Years",
    }, headers=employer_headers)
    assert res.status_code == 201
    return res.json()


# ── Public board + filters ──

def test_list_jobs_default(client, db_session):
    from app.models import Job

    db_session.add(Job(
        title="Backend Developer", company="Acme",
        location="Berlin, Germany", is_active=True,
    ))
    db_session.commit()

    res = client.get("/api/jobs/")
    assert res.status_code == 200
    titles = [j["title"] for j in res.json()]
    assert "Backend Developer" in titles


def test_filter_by_query(client, db_session):
    from app.models import Job

    db_session.add_all([
        Job(title="Senior Chef", company="Acme", is_active=True),
        Job(title="Data Engineer", company="Acme", is_active=True),
    ])
    db_session.commit()

    res = client.get("/api/jobs/", params={"q": "chef"})
    assert res.status_code == 200
    titles = [j["title"] for j in res.json()]
    assert titles == ["Senior Chef"]


def test_filter_by_location(client, db_session):
    from app.models import Job

    db_session.add_all([
        Job(title="Barista", company="Cafe", location="Melbourne, Australia", is_active=True),
        Job(title="Bartender", company="Pub", location="Dublin, Ireland", is_active=True),
    ])
    db_session.commit()

    res = client.get("/api/jobs/", params={"location": "melbourne"})
    titles = [j["title"] for j in res.json()]
    assert titles == ["Barista"]


def test_filter_visa_only(client, db_session):
    from app.models import Job

    db_session.add_all([
        Job(title="Visa Job", company="A", visa_sponsorship=True, is_active=True),
        Job(title="No Visa Job", company="B", visa_sponsorship=False, is_active=True),
    ])
    db_session.commit()

    res = client.get("/api/jobs/", params={"visa_only": "true"})
    titles = [j["title"] for j in res.json()]
    assert titles == ["Visa Job"]


def test_filter_job_type(client, db_session):
    from app.models import Job

    db_session.add_all([
        Job(title="FT Role", company="A", job_type="Full-Time", is_active=True),
        Job(title="PT Role", company="A", job_type="Part-Time", is_active=True),
    ])
    db_session.commit()

    res = client.get("/api/jobs/", params={"job_type": "Part-Time"})
    titles = [j["title"] for j in res.json()]
    assert titles == ["PT Role"]


def test_inactive_jobs_hidden(client, db_session):
    from app.models import Job

    db_session.add(Job(title="Ghost Job", company="A", is_active=False))
    db_session.commit()

    res = client.get("/api/jobs/")
    assert all(j["title"] != "Ghost Job" for j in res.json())


# ── Apply flow ──

def test_student_can_apply(client, posted_job, student_headers):
    res = client.post(
        f"/api/jobs/{posted_job['id']}/apply",
        json={"cover_letter": "I am very interested."},
        headers=student_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "pending"
    assert data["job_id"] == posted_job["id"]


def test_duplicate_apply_conflict(client, posted_job, student_headers):
    payload = {"cover_letter": "first"}
    assert client.post(
        f"/api/jobs/{posted_job['id']}/apply", json=payload, headers=student_headers
    ).status_code == 201
    assert client.post(
        f"/api/jobs/{posted_job['id']}/apply", json=payload, headers=student_headers
    ).status_code == 409


def test_employer_cannot_apply(client, posted_job, employer_headers):
    res = client.post(
        f"/api/jobs/{posted_job['id']}/apply",
        json={"cover_letter": "hmm"},
        headers=employer_headers,
    )
    assert res.status_code == 403


def test_apply_requires_auth(client, posted_job):
    res = client.post(f"/api/jobs/{posted_job['id']}/apply", json={})
    assert res.status_code in (401, 403)


def test_my_applications(client, posted_job, student_headers):
    client.post(
        f"/api/jobs/{posted_job['id']}/apply",
        json={"cover_letter": "pick me"},
        headers=student_headers,
    )
    res = client.get("/api/jobs/applications/me", headers=student_headers)
    assert res.status_code == 200
    apps = res.json()
    assert len(apps) == 1
    assert apps[0]["job_id"] == posted_job["id"]


# ── Employer portal ──

def test_post_job_requires_employer(client, student_headers):
    res = client.post("/api/jobs/", json={
        "title": "Sneaky Job", "company": "Student Corp",
    }, headers=student_headers)
    assert res.status_code == 403


def test_post_job_requires_auth(client):
    res = client.post("/api/jobs/", json={"title": "x y", "company": "yz"})
    assert res.status_code in (401, 403)


def test_my_jobs(client, posted_job, employer_headers):
    res = client.get("/api/jobs/mine", headers=employer_headers)
    assert res.status_code == 200
    jobs = res.json()
    assert any(j["id"] == posted_job["id"] for j in jobs)


def test_my_jobs_requires_employer(client, student_headers):
    res = client.get("/api/jobs/mine", headers=student_headers)
    assert res.status_code == 403


def test_view_applicants_own_job(client, posted_job, employer_headers, student_headers):
    client.post(
        f"/api/jobs/{posted_job['id']}/apply",
        json={"cover_letter": "hello"},
        headers=student_headers,
    )
    res = client.get(f"/api/jobs/{posted_job['id']}/applications", headers=employer_headers)
    assert res.status_code == 200
    apps = res.json()
    assert len(apps) == 1
    assert apps[0]["applicant"]["email"] == "student1@relocompass.org"


def test_view_applicants_other_employers_job_forbidden(
    client, posted_job, db_session
):
    from app.models import User, UserRole

    other = User(
        name="Employer Two",
        email="employer2@relocompass.org",
        hashed_password=hash_password("TestPass123!"),
        role=UserRole.employer,
    )
    db_session.add(other)
    db_session.commit()
    token = client.post("/api/auth/login", json={
        "email": "employer2@relocompass.org",
        "password": "TestPass123!",
    }).json()["access_token"]

    res = client.get(
        f"/api/jobs/{posted_job['id']}/applications",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403


def test_update_application_status(client, posted_job, employer_headers, student_headers):
    apply_res = client.post(
        f"/api/jobs/{posted_job['id']}/apply",
        json={"cover_letter": "promote me"},
        headers=student_headers,
    )
    app_id = apply_res.json()["id"]

    res = client.patch(
        f"/api/jobs/applications/{app_id}",
        json={"status": "shortlisted"},
        headers=employer_headers,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "shortlisted"

    # Student sees the updated status
    mine = client.get("/api/jobs/applications/me", headers=student_headers).json()
    match = [a for a in mine if a["id"] == app_id]
    assert match and match[0]["status"] == "shortlisted"


def test_update_status_rejects_invalid_value(client, posted_job, employer_headers, student_headers):
    apply_res = client.post(
        f"/api/jobs/{posted_job['id']}/apply",
        json={},
        headers=student_headers,
    )
    app_id = apply_res.json()["id"]
    res = client.patch(
        f"/api/jobs/applications/{app_id}",
        json={"status": "banana"},
        headers=employer_headers,
    )
    assert res.status_code == 422


def test_delete_own_job(client, posted_job, employer_headers):
    res = client.delete(f"/api/jobs/{posted_job['id']}", headers=employer_headers)
    assert res.status_code == 200

    board = client.get("/api/jobs/").json()
    assert all(j["id"] != posted_job["id"] for j in board)


def test_delete_other_employers_job_forbidden(client, posted_job, db_session):
    from app.models import User, UserRole

    other = User(
        name="Employer Three",
        email="employer3@relocompass.org",
        hashed_password=hash_password("TestPass123!"),
        role=UserRole.employer,
    )
    db_session.add(other)
    db_session.commit()
    token = client.post("/api/auth/login", json={
        "email": "employer3@relocompass.org",
        "password": "TestPass123!",
    }).json()["access_token"]

    res = client.delete(
        f"/api/jobs/{posted_job['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403
