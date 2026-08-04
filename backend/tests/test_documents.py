"""
Tests for document upload and admin access control.
"""
import io


def test_document_list_requires_admin(client, student_token):
    """GET /api/documents/ rejects non-admin users."""
    response = client.get(
        "/api/documents/",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 403


def test_document_list_requires_auth(client):
    """GET /api/documents/ rejects unauthenticated requests."""
    response = client.get("/api/documents/")
    assert response.status_code == 401


def test_document_list_empty(client, admin_token):
    """GET /api/documents/ returns empty list when no documents uploaded."""
    response = client.get(
        "/api/documents/",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json() == []


def test_document_upload_requires_admin(client, student_token):
    """POST /api/documents/upload rejects non-admin users."""
    fake_file = io.BytesIO(b"test content")
    response = client.post(
        "/api/documents/upload",
        headers={"Authorization": f"Bearer {student_token}"},
        files={"files": ("test.txt", fake_file, "text/plain")},
    )
    assert response.status_code == 403


def test_rebuild_index_requires_admin(client, student_token):
    """POST /api/documents/rebuild-index rejects non-admin users."""
    response = client.post(
        "/api/documents/rebuild-index",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 403


def test_rebuild_index_requires_auth(client):
    """POST /api/documents/rebuild-index rejects unauthenticated requests."""
    response = client.post("/api/documents/rebuild-index")
    assert response.status_code == 401
