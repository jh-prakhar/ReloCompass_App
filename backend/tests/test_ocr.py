"""OCR / multi-modal ingestion tests."""
import pytest
from PIL import Image, ImageDraw

from app.ai.ingestion import IMAGE_EXTENSIONS, SUPPORTED_EXTENSIONS, _pdf_has_text


def _make_text_image(path, lines):
    img = Image.new("RGB", (640, 60 + 44 * len(lines)), "white")
    d = ImageDraw.Draw(img)
    y = 24
    for line in lines:
        d.text((24, y), line, fill="black")
        y += 44
    img.save(path)


class TestIngestionSupport:
    def test_image_extensions_supported(self):
        assert IMAGE_EXTENSIONS <= SUPPORTED_EXTENSIONS

    def test_pdf_has_text_false_for_missing_file(self, tmp_path):
        assert _pdf_has_text(tmp_path / "nope.pdf") is False


@pytest.mark.slow
class TestLiveOcr:
    """Hits the real vision model — run with -m 'not slow' to skip offline."""

    def test_ocr_image_transcribes_text(self, tmp_path):
        from app.ai.ocr import ocr_image

        img = tmp_path / "doc.png"
        _make_text_image(img, ["ReloCompass OCR Test", "Passport required for visa"])
        try:
            text = ocr_image(img)
        except RuntimeError as e:
            pytest.skip(f"LLM gateway unavailable: {e}")
        assert "passport" in text.lower()

    def test_oversized_image_rejected(self, tmp_path):
        from app.ai.ocr import MAX_IMAGE_BYTES, ocr_image

        img = tmp_path / "big.png"
        Image.new("RGB", (10, 10), "white").save(img)
        img.write_bytes(b"\x89PNG" + b"\x00" * (MAX_IMAGE_BYTES + 1))
        with pytest.raises(ValueError, match="too large"):
            ocr_image(img)
