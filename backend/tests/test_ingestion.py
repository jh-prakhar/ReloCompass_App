"""
Tests for the ingestion pipeline — chunking, text extraction, category detection.
"""
import pytest
from pathlib import Path

from app.ai.ingestion import (
    chunk_text,
    clean_text,
    detect_category,
    SUPPORTED_EXTENSIONS,
)


class TestChunking:
    def test_short_text_returns_single_chunk(self):
        """Text shorter than chunk_size returns one chunk."""
        text = "This is a short piece of text."
        chunks = chunk_text(text, chunk_size=800, overlap=150)
        assert len(chunks) == 1
        assert chunks[0] == text.strip()

    def test_long_text_is_chunked(self):
        """Long text is split into multiple overlapping chunks."""
        text = " ".join(["word"] * 500)  # ~2500 chars
        chunks = chunk_text(text, chunk_size=800, overlap=150)
        assert len(chunks) > 1

    def test_empty_text_returns_empty_list(self):
        """Empty or whitespace-only text returns no chunks."""
        assert chunk_text("") == []
        assert chunk_text("   \n  \t  ") == []

    def test_chunks_have_overlap(self):
        """Consecutive chunks share overlapping text."""
        text = "Sentence one. Sentence two. Sentence three. " * 20
        chunks = chunk_text(text, chunk_size=200, overlap=50)
        if len(chunks) > 1:
            # The overlap region should appear in both chunks
            overlap_check = chunks[0][-30:]
            assert overlap_check[:10] in chunks[1]


class TestCleanText:
    def test_removes_extra_whitespace(self):
        assert clean_text("hello    world") == "hello world"

    def test_removes_null_chars(self):
        assert clean_text("hello\x00world") == "helloworld"

    def test_strips_leading_trailing(self):
        assert clean_text("  hello  ") == "hello"

    def test_normalizes_newlines(self):
        text = "line one\n\n\nline two"
        result = clean_text(text)
        assert "\n\n\n" not in result


class TestCategoryDetection:
    def test_student_relocation_category(self):
        category = detect_category("student_housing.md", "dorm apartment rental")
        assert category == "student_relocation"

    def test_transportation_category(self):
        category = detect_category("transport.md", "metro bus train")
        assert category == "transportation"

    def test_employment_category(self):
        category = detect_category("jobs.md", "resume interview career")
        assert category == "employment"

    def test_employer_category(self):
        category = detect_category("hiring.md", "candidate recruit hiring")
        assert category == "employer"

    def test_general_fallback(self):
        category = detect_category("random.txt", "lorem ipsum dolor sit amet")
        assert category == "general"


class TestSupportedExtensions:
    def test_pdf_supported(self):
        assert ".pdf" in SUPPORTED_EXTENSIONS

    def test_docx_supported(self):
        assert ".docx" in SUPPORTED_EXTENSIONS

    def test_txt_supported(self):
        assert ".txt" in SUPPORTED_EXTENSIONS

    def test_md_supported(self):
        assert ".md" in SUPPORTED_EXTENSIONS

    def test_csv_supported(self):
        assert ".csv" in SUPPORTED_EXTENSIONS

    def test_json_supported(self):
        assert ".json" in SUPPORTED_EXTENSIONS
