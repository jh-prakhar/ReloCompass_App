"""
ReloCompass Backend — Test Configuration
Uses SQLite in-memory database for fast, isolated tests.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.models import User, UserRole
from app.services.auth import hash_password
from app.main import app

# ── SQLite in-memory test database ──
TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=TEST_ENGINE)
    session = TestSessionLocal()

    yield session

    session.close()
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture(scope="function")
def client(db_session):
    """Test client with DB dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_token(client, db_session):
    """Create an admin user and return a valid JWT token."""
    admin = User(
        name="Test Admin",
        email="testadmin@relocompass.org",
        hashed_password=hash_password("Admin@12345"),
        role=UserRole.admin,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()

    response = client.post("/api/auth/login", json={
        "email": "testadmin@relocompass.org",
        "password": "Admin@12345",
    })
    return response.json()["access_token"]


@pytest.fixture
def student_token(client, db_session):
    """Create a student user and return a valid JWT token."""
    student = User(
        name="Test Student",
        email="teststudent@relocompass.org",
        hashed_password=hash_password("Student@123"),
        role=UserRole.student,
        is_active=True,
    )
    db_session.add(student)
    db_session.commit()

    response = client.post("/api/auth/login", json={
        "email": "teststudent@relocompass.org",
        "password": "Student@123",
    })
    return response.json()["access_token"]
