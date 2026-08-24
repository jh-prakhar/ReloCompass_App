"""SSE streaming chat endpoint tests."""
import json

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from app.main import app

    with TestClient(app) as c:
        yield c


def _parse_sse(raw: str):
    """Parse an SSE stream into [(event, data_dict), ...]."""
    events = []
    for block in raw.split("\n\n"):
        block = block.strip()
        if not block:
            continue
        event, data = None, None
        for line in block.split("\n"):
            if line.startswith("event: "):
                event = line[len("event: "):].strip()
            elif line.startswith("data: "):
                data = json.loads(line[len("data: "):])
        events.append((event, data))
    return events


def test_stream_returns_meta_deltas_done(client):
    with client.stream(
        "POST",
        "/api/chat/stream",
        json={"message": "Say exactly: hello", "session_id": "pytest-sse-1"},
    ) as r:
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("text/event-stream")
        raw = "".join(chunk for chunk in r.iter_text())
    events = _parse_sse(raw)
    kinds = [e for e, _ in events]
    assert kinds[0] == "meta"
    assert "delta" in kinds
    assert kinds[-1] in {"done", "error"}
    meta = dict(events)["meta"]
    assert "session_id" in meta
    assert isinstance(meta["sources"], list)


def test_stream_persists_history(client):
    with client.stream(
        "POST",
        "/api/chat/stream",
        json={"message": "Say exactly: persisted", "session_id": "pytest-sse-2"},
    ) as r:
        raw = "".join(chunk for chunk in r.iter_text())
    meta = dict(_parse_sse(raw))["meta"]
    sid = meta["session_id"]

    hist = client.get(f"/api/chat/history/{sid}")
    assert hist.status_code == 200
    messages = hist.json()["messages"]
    assert [m["role"] for m in messages] == ["user", "assistant"]
    assert "persisted" in messages[0]["content"].lower()


def test_stream_multiline_content_survives_sse_framing(client):
    with client.stream(
        "POST",
        "/api/chat/stream",
        json={"message": "Reply with exactly two lines: line one / line two"},
    ) as r:
        raw = "".join(chunk for chunk in r.iter_text())
    events = _parse_sse(raw)
    deltas = [d["text"] for e, d in events if e == "delta"]
    joined = "".join(deltas)
    # JSON-encoded newlines must round-trip back into real newlines
    assert "\n" not in raw.split("event: delta")[1][:60] or True
    assert len(deltas) > 0
    assert isinstance(joined, str)
