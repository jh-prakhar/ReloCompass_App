"""
ReloCompass AI - Document Ingestion Pipeline
Processes documents (PDF, DOCX, TXT, MD, CSV, JSON) into chunks
and adds them to the FAISS vector index.
"""
import csv
import io
import json
import logging
from pathlib import Path
from typing import Optional

from app.config import settings
from app.ai.vector_store import vector_store

logger = logging.getLogger(__name__)


# ── Document Readers ──

def read_pdf(file_path: Path) -> str:
    """Extract text from a PDF file."""
    from pypdf import PdfReader
    reader = PdfReader(str(file_path))
    pages = [page.extract_text() for page in reader.pages if page.extract_text()]
    return "\n\n".join(pages)


def read_docx(file_path: Path) -> str:
    """Extract text from a DOCX file."""
    from docx import Document
    doc = Document(str(file_path))
    return "\n\n".join([para.text for para in doc.paragraphs if para.text.strip()])


def read_txt(file_path: Path) -> str:
    """Read a plain text file."""
    return file_path.read_text(encoding="utf-8")


def read_markdown(file_path: Path) -> str:
    """Read a markdown file (raw text — the LLM handles markdown natively)."""
    return file_path.read_text(encoding="utf-8")


def read_csv(file_path: Path) -> str:
    """Read a CSV file and convert rows to text."""
    text_parts = []
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            row_text = " | ".join(f"{k}: {v}" for k, v in row.items())
            text_parts.append(row_text)
    return "\n\n".join(text_parts)


def read_json(file_path: Path) -> str:
    """Read a JSON file and convert to readable text."""
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return json.dumps(data, indent=2, ensure_ascii=False)


# Map file extensions to readers
READERS = {
    ".pdf": read_pdf,
    ".docx": read_docx,
    ".doc": read_docx,   # best-effort
    ".txt": read_txt,
    ".md": read_markdown,
    ".markdown": read_markdown,
    ".csv": read_csv,
    ".json": read_json,
}

SUPPORTED_EXTENSIONS = set(READERS.keys())


def detect_category(filename: str, content: str) -> str:
    """Auto-detect the knowledge category from filename/content."""
    name_lower = filename.lower()
    content_lower = content[:2000].lower()

    if any(w in name_lower or w in content_lower for w in
           ["student", "housing", "dorm", "apartment", "rental", "accommodation", "banking", "insurance", "packing"]):
        return "student_relocation"
    if any(w in name_lower or w in content_lower for w in
           ["transport", "metro", "bus", "train", "airport", "travel card", "ride-share"]):
        return "transportation"
    if any(w in name_lower or w in content_lower for w in
           ["resume", "interview", "job", "career", "workplace", "visa-aware"]):
        return "employment"
    if any(w in name_lower or w in content_lower for w in
           ["employer", "hiring", "candidate", "recruit"]):
        return "employer"
    return "general"


# ── Text Chunking ──

def chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> list[str]:
    """
    Split text into overlapping chunks for better embedding quality.
    Uses a simple sentence-boundary-aware splitter.
    """
    chunk_size = chunk_size or settings.CHUNK_SIZE
    overlap = overlap or settings.CHUNK_OVERLAP

    if len(text) <= chunk_size:
        return [text.strip()] if text.strip() else []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        # Try to break at a sentence boundary
        if end < len(text):
            # Look for the last period/newline within the last 20% of the chunk
            boundary_zone = text[end - chunk_size // 5 : end]
            last_period = boundary_zone.rfind(". ")
            last_newline = boundary_zone.rfind("\n")

            boundary = max(last_period, last_newline)
            if boundary != -1:
                end = end - chunk_size // 5 + boundary + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks


# ── Pipeline ──

def ingest_document(
    file_path: Path,
    filename: str = None,
    category: str = None,
) -> dict:
    """
    Process a single document: read → clean → chunk → embed → index.
    Returns: {filename, category, num_chunks, success}
    """
    file_path = Path(file_path)
    filename = filename or file_path.name
    ext = file_path.suffix.lower()

    if ext not in READERS:
        raise ValueError(f"Unsupported file type: {ext}. Supported: {', '.join(SUPPORTED_EXTENSIONS)}")

    # Read document
    reader = READERS[ext]
    raw_text = reader(file_path)

    if not raw_text.strip():
        logger.warning(f"No text extracted from {filename}")
        return {"filename": filename, "category": category or "general", "num_chunks": 0, "success": False}

    # Clean text
    text = clean_text(raw_text)

    # Auto-detect category if not provided
    if not category:
        category = detect_category(filename, text)

    # Chunk
    chunks_raw = chunk_text(text)

    # Build chunk dicts with metadata
    chunks = [
        {
            "text": chunk,
            "source": filename,
            "category": category,
            "chunk_index": i,
        }
        for i, chunk in enumerate(chunks_raw)
    ]

    # Add to vector store
    if chunks:
        vector_store.add_chunks(chunks)
        vector_store.save()

    logger.info(f"Ingested {filename}: {len(chunks)} chunks, category={category}")
    return {
        "filename": filename,
        "category": category,
        "num_chunks": len(chunks),
        "success": True,
    }


def ingest_directory(directory: Path = None) -> list[dict]:
    """
    Process all supported documents in a directory.
    Returns a list of ingestion results.
    """
    directory = Path(directory or settings.KNOWLEDGE_BASE_DIR)
    results = []

    if not directory.exists():
        logger.warning(f"Directory not found: {directory}")
        return results

    for file_path in sorted(directory.iterdir()):
        if file_path.is_file() and file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
            try:
                result = ingest_document(file_path)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to ingest {file_path.name}: {e}")
                results.append({
                    "filename": file_path.name,
                    "category": "unknown",
                    "num_chunks": 0,
                    "success": False,
                    "error": str(e),
                })

    return results


def clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    # Remove excessive whitespace
    lines = [line.strip() for line in text.splitlines()]
    text = " ".join(line for line in lines if line)

    # Normalize multiple spaces
    while "  " in text:
        text = text.replace("  ", " ")

    # Remove null characters
    text = text.replace("\x00", "")

    return text.strip()


def rebuild_index(directory: Path = None) -> dict:
    """
    Full rebuild: clear the index and re-ingest all knowledge base documents.
    Returns: {total_documents, total_chunks, results}
    """
    logger.info("Starting full index rebuild...")
    vector_store.clear()

    results = ingest_directory(directory)

    total_chunks = sum(r["num_chunks"] for r in results if r.get("success"))
    total_docs = sum(1 for r in results if r.get("success"))

    logger.info(f"Index rebuild complete: {total_docs} documents, {total_chunks} chunks")
    return {
        "total_documents": total_docs,
        "total_chunks": total_chunks,
        "results": results,
    }
