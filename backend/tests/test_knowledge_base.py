"""
Tests for knowledge base document quality and content.
"""
from pathlib import Path

from app.config import settings


KB_DIR = Path(settings.KNOWLEDGE_BASE_DIR)


def test_knowledge_base_directory_exists():
    """Knowledge base directory exists."""
    assert KB_DIR.exists(), f"Knowledge base dir not found: {KB_DIR}"
    assert KB_DIR.is_dir()


def test_student_accommodation_document_exists():
    """Student accommodation guide exists and has content."""
    path = KB_DIR / "student_accommodation.md"
    assert path.exists()
    content = path.read_text()
    assert len(content) > 500  # substantial content
    assert "accommodation" in content.lower() or "housing" in content.lower()


def test_transportation_guide_exists():
    """Transportation guide exists and has content."""
    path = KB_DIR / "transportation_guide.md"
    assert path.exists()
    content = path.read_text()
    assert len(content) > 500
    assert "transport" in content.lower() or "transit" in content.lower()


def test_employment_guide_exists():
    """Employment guide exists and has content."""
    path = KB_DIR / "employment_guide.md"
    assert path.exists()
    content = path.read_text()
    assert len(content) > 500
    assert any(word in content.lower() for word in ["job", "resume", "interview", "career"])


def test_employer_guide_exists():
    """Employer guide exists and has content."""
    path = KB_DIR / "employer_guide.md"
    assert path.exists()
    content = path.read_text()
    assert len(content) > 500


def test_student_banking_document_exists():
    """Banking and insurance guide exists."""
    path = KB_DIR / "student_banking_insurance.md"
    assert path.exists()
    content = path.read_text()
    assert len(content) > 500


def test_student_packing_document_exists():
    """Packing and onboarding guide exists."""
    path = KB_DIR / "student_packing_onboarding.md"
    assert path.exists()
    content = path.read_text()
    assert len(content) > 500


def test_all_kb_files_are_markdown():
    """All knowledge base files should be markdown or other supported formats."""
    from app.ai.ingestion import SUPPORTED_EXTENSIONS
    for f in KB_DIR.iterdir():
        if f.is_file():
            assert f.suffix.lower() in SUPPORTED_EXTENSIONS, f"Unsupported file type: {f.name}"
