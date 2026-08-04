"""
Tests for authentication endpoints.
"""


def test_register_student(client):
    """POST /api/auth/register creates a new student account."""
    response = client.post("/api/auth/register", json={
        "name": "New Student",
        "email": "newstudent@relocompass.org",
        "password": "TestPass123!",
        "role": "student",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "newstudent@relocompass.org"
    assert data["user"]["role"] == "student"
    assert "access_token" in data


def test_register_employer(client):
    """POST /api/auth/register creates a new employer account."""
    response = client.post("/api/auth/register", json={
        "name": "New Employer",
        "email": "newemployer@relocompass.org",
        "password": "TestPass123!",
        "role": "employer",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["role"] == "employer"


def test_register_duplicate_email_fails(client, db_session):
    """Duplicate email registration returns error."""
    # First registration
    response = client.post("/api/auth/register", json={
        "name": "User One",
        "email": "dup@relocompass.org",
        "password": "TestPass123!",
        "role": "student",
    })
    assert response.status_code == 201

    # Duplicate
    response = client.post("/api/auth/register", json={
        "name": "User Two",
        "email": "dup@relocompass.org",
        "password": "TestPass123!",
        "role": "student",
    })
    assert response.status_code in (400, 409)


def test_login_success(client, db_session):
    """POST /api/auth/login returns JWT token for valid credentials."""
    # Register first
    client.post("/api/auth/register", json={
        "name": "Login User",
        "email": "login@relocompass.org",
        "password": "TestPass123!",
        "role": "student",
    })

    # Login
    response = client.post("/api/auth/login", json={
        "email": "login@relocompass.org",
        "password": "TestPass123!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@relocompass.org"


def test_login_wrong_password(client, db_session):
    """Login with wrong password returns 401."""
    client.post("/api/auth/register", json={
        "name": "Login User",
        "email": "wrongpw@relocompass.org",
        "password": "CorrectPass123!",
        "role": "student",
    })

    response = client.post("/api/auth/login", json={
        "email": "wrongpw@relocompass.org",
        "password": "WrongPass456!",
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Login with non-existent email returns 401."""
    response = client.post("/api/auth/login", json={
        "email": "ghost@relocompass.org",
        "password": "TestPass123!",
    })
    assert response.status_code == 401


def test_protected_endpoint_requires_auth(client):
    """GET /api/users/me without token returns 401."""
    response = client.get("/api/users/me")
    assert response.status_code == 401


def test_protected_endpoint_with_token(client, student_token):
    """GET /api/users/me with valid token returns user info."""
    response = client.get("/api/users/me", headers={
        "Authorization": f"Bearer {student_token}",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "teststudent@relocompass.org"
    assert data["role"] == "student"


def test_admin_role_property(client, admin_token):
    """Admin user has is_admin=True."""
    response = client.get("/api/users/me", headers={
        "Authorization": f"Bearer {admin_token}",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
    assert data["is_admin"] is True
