"""
Tests for API health and status endpoints.
"""


def test_health_endpoint(client):
    """GET /health returns healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_api_info_endpoint(client):
    """GET /api returns API metadata."""
    response = client.get("/api")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "endpoints" in data
    assert "chat" in data["endpoints"]
    assert "documents" in data["endpoints"]
    assert "ai_status" in data["endpoints"]


def test_ai_status_endpoint(client):
    """GET /api/ai/status returns AI subsystem status."""
    response = client.get("/api/ai/status")
    assert response.status_code == 200
    data = response.json()
    assert "llm_configured" in data
    assert "llm_model" in data
    assert "embedding_model" in data
    assert "faiss_index_size" in data
    assert "total_documents" in data
    assert "total_chunks" in data


def test_openapi_docs_available(client):
    """GET /docs returns Swagger UI (FastAPI auto-docs)."""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger" in response.text.lower() or "openapi" in response.text.lower()
