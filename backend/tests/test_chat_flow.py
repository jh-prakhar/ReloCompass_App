"""
Tests for the chat endpoint with a mocked LLM service.
Verifies: reply + session, history persistence, clear history, guardrail error.
"""
from unittest.mock import patch


FAKE_RAG_RESULT = {
    "reply": "You will need a study permit and proof of funds.",
    "sources": [
        {"title": "Canada Study Guide", "filename": "canada.md"}
    ],
    "model_used": "test-model",
    "usage": {"total_tokens": 42},
}


def test_chat_returns_reply_and_session(client):
    with patch("app.routers.chat.chat_with_rag", return_value=dict(FAKE_RAG_RESULT)):
        res = client.post("/api/chat/", json={
            "message": "What documents do I need for a Canadian study permit?",
        })
    assert res.status_code == 200
    data = res.json()
    assert data["reply"] == FAKE_RAG_RESULT["reply"]
    assert data["session_id"]
    assert data["sources"] == FAKE_RAG_RESULT["sources"]
    assert data["model_used"] == "test-model"


def test_chat_multi_turn_history_persists(client):
    session_id = None
    with patch("app.routers.chat.chat_with_rag", return_value=dict(FAKE_RAG_RESULT)):
        res1 = client.post("/api/chat/", json={"message": "first question"})
        session_id = res1.json()["session_id"]
        client.post("/api/chat/", json={
            "message": "second question", "session_id": session_id,
        })

    res = client.get(f"/api/chat/history/{session_id}")
    assert res.status_code == 200
    messages = res.json()["messages"]
    assert len(messages) == 4  # user, assistant, user, assistant
    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "first question"
    assert messages[1]["content"] == FAKE_RAG_RESULT["reply"]


def test_chat_clear_history(client):
    with patch("app.routers.chat.chat_with_rag", return_value=dict(FAKE_RAG_RESULT)):
        res = client.post("/api/chat/", json={"message": "hello"})
        session_id = res.json()["session_id"]

    res = client.delete(f"/api/chat/history/{session_id}")
    assert res.status_code == 200

    res = client.get(f"/api/chat/history/{session_id}")
    assert res.status_code == 200
    assert res.json()["messages"] == []


def test_chat_rejects_empty_message(client):
    res = client.post("/api/chat/", json={"message": ""})
    assert res.status_code == 422


def test_chat_passes_history_to_rag(client):
    captured = {}

    def fake_rag(user_message, conversation_history, user_context=None):
        captured["history"] = conversation_history
        captured["message"] = user_message
        return dict(FAKE_RAG_RESULT)

    with patch("app.routers.chat.chat_with_rag", side_effect=fake_rag):
        first = client.post("/api/chat/", json={"message": "q1"}).json()
        client.post("/api/chat/", json={
            "message": "q2", "session_id": first["session_id"],
        })

    # Second call must have received the first turn as history
    assert captured["history"]
    assert captured["history"][0]["content"] == "q1"
    assert captured["message"] == "q2"
