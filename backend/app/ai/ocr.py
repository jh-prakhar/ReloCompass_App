"""Multi-modal OCR: images & scanned PDFs → text via the LLM's vision input.

No local tesseract — the chat gateway is vision-capable, so we send the
image as a base64 data URL and ask for a faithful transcription. Works for
photographs of documents, screenshots, and scanned PDFs without a text layer.
"""
from __future__ import annotations

import base64
import logging
import re
from pathlib import Path

logger = logging.getLogger(__name__)

MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8 MB per image
MAX_PDF_PAGES_OCR = 10

# Vision-capable model on the LLM gateway (the default chat model is text-only).
OCR_MODEL = "drytis/kimi"

MIME_BY_EXT = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}

_OCR_PROMPT = (
    "Transcribe ALL text visible in this document image. Preserve headings, "
    "lists, and paragraph structure using plain text and line breaks. "
    "If parts are illegible, write [illegible]. Do not summarize, do not add "
    "commentary — transcribe only."
)


def ocr_image(file_path: Path) -> str:
    """Transcribe a single image file via the vision LLM."""
    ext = file_path.suffix.lower()
    if ext not in MIME_BY_EXT:
        raise ValueError(f"Not an OCR-able image: {ext}")
    data = file_path.read_bytes()
    if len(data) > MAX_IMAGE_BYTES:
        raise ValueError(f"Image too large for OCR ({len(data) // 1024 // 1024} MB > 8 MB)")

    b64 = base64.b64encode(data).decode()
    return _vision_transcribe(b64, MIME_BY_EXT[ext])


def ocr_scanned_pdf(file_path: Path) -> str:
    """Rasterize a textless PDF page-by-page and OCR each page.

    Rasterization uses PIL via pdf2image-free path: we render pages to PNG
    with pypdf's page images when embedded, else fall back to whole-file
    single image submission. Scanned PDFs usually store page scans as
    embedded images, which pypdf can extract directly.
    """
    from pypdf import PdfReader

    reader = PdfReader(str(file_path))
    pages_text: list[str] = []
    for page in reader.pages[:MAX_PDF_PAGES_OCR]:
        extracted = ""
        try:
            for image in page.images:
                b64 = base64.b64encode(image.data).decode()
                mime = "image/png"
                if image.name and image.name.lower().endswith((".jpg", ".jpeg")):
                    mime = "image/jpeg"
                extracted += _vision_transcribe(b64, mime) + "\n\n"
        except Exception as e:  # noqa: BLE001 — page-level failures shouldn't kill the doc
            logger.warning("OCR failed for one PDF page: %s", e)
        if extracted.strip():
            pages_text.append(extracted.strip())

    if not pages_text:
        raise ValueError(
            "No extractable page images found — the PDF may be vector-only with no text. "
            "Export pages as images and upload those instead."
        )
    return "\n\n---- page break ----\n\n".join(pages_text)


def _vision_transcribe(b64_data: str, mime: str) -> str:
    """Call the vision-capable chat model with one image and return text."""
    from app.ai.llm_service import llm_service

    if not llm_service.is_configured():
        raise RuntimeError("OCR requires the LLM service to be configured")

    try:
        response = llm_service.client.chat.completions.create(
            model=OCR_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": _OCR_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{b64_data}"},
                        },
                    ],
                }
            ],
            max_tokens=2048,
            temperature=1,  # this gateway model only accepts temperature=1
        )
        text = response.choices[0].message.content or ""
        return _clean(text)
    except RuntimeError:
        raise
    except Exception as e:  # noqa: BLE001
        logger.error("Vision OCR failed: %s", e)
        raise RuntimeError(f"OCR service error: {type(e).__name__}") from e


def _clean(text: str) -> str:
    # strip common LLM wrappers like "Here is the transcription:"
    text = text.strip()
    text = re.sub(r"^(here is|here's)[^\n:]*:\s*", "", text, flags=re.IGNORECASE)
    return text.strip()
