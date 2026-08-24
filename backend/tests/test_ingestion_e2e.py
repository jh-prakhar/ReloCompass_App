"""End-to-end document ingestion tests (the coverage gap the reviewer flagged)."""
import pathlib

import pytest

from app.ai.ingestion import ingest_document


def _write(tmp_path, name, content):
    p = tmp_path / name
    p.write_text(content, encoding="utf-8")
    return p


class TestIngestDocument:
    def test_txt_happy_path(self, tmp_path):
        p = _write(
            tmp_path,
            "e2e_check.txt",
            "Relocation guidance for international students. " * 30,
        )
        result = ingest_document(p, filename="e2e_check.txt", category="general")
        assert result["success"] is True
        assert result["ocr_used"] is False
        assert result["num_chunks"] >= 1

    def test_markdown_ingest(self, tmp_path):
        p = _write(
            tmp_path,
            "guide.md",
            "# Visa basics\n\nApply early. Check official sources.\n\n" * 40,
        )
        result = ingest_document(p)
        assert result["success"] is True
        assert result["category"] in {"visa", "general", "immigration"}

    def test_unsupported_extension_raises(self, tmp_path):
        p = _write(tmp_path, "bad.exe", "nope")
        with pytest.raises(ValueError, match="Unsupported file type"):
            ingest_document(p)

    def test_empty_document_fails_gracefully(self, tmp_path):
        p = _write(tmp_path, "empty.txt", "   ")
        result = ingest_document(p)
        assert result["success"] is False
        assert result["num_chunks"] == 0
