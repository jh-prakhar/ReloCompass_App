"""
ReloCompass AI - LLM Service
Abstraction layer for LLM calls. Supports any OpenAI-compatible API.
The provider can be changed by updating env vars without code changes.
"""
import logging
import time
from typing import Optional

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """
    Wraps an OpenAI-compatible LLM endpoint.
    Works with OpenAI, Azure OpenAI, local LLMs (Ollama/vLLM),
    and Drytis LLM gateway — any endpoint that speaks the OpenAI API.
    """

    def __init__(self):
        self._client: Optional[OpenAI] = None
        self.model = settings.LLM_MODEL
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.temperature = settings.LLM_TEMPERATURE

    @property
    def client(self) -> OpenAI:
        """Lazy-init the OpenAI client."""
        if self._client is None:
            if not settings.LLM_API_KEY:
                raise RuntimeError(
                    "LLM_API_KEY is not configured. Set OPENAI_API_KEY in the environment."
                )
            self._client = OpenAI(
                api_key=settings.LLM_API_KEY,
                base_url=settings.LLM_BASE_URL,
            )
        return self._client

    def chat(
        self,
        messages: list[dict],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> dict:
        """
        Send a chat completion request to the LLM.
        Returns dict with: reply, model, usage, latency_ms.
        """
        start = time.time()
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature or self.temperature,
                max_tokens=max_tokens or self.max_tokens,
            )
            latency_ms = int((time.time() - start) * 1000)
            return {
                "reply": response.choices[0].message.content,
                "model": response.model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
                "latency_ms": latency_ms,
            }
        except Exception as e:
            logger.error(f"LLM chat error: {e}")
            latency_ms = int((time.time() - start) * 1000)
            return {
                "reply": f"I apologize, but I'm having trouble connecting to the AI service right now. Please try again later. Error: {type(e).__name__}",
                "model": self.model,
                "usage": None,
                "latency_ms": latency_ms,
                "error": str(e),
            }

    def chat_stream(
        self,
        messages: list[dict],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ):
        """
        Stream a chat completion. Yields content deltas (str).
        Raises on connection errors — caller decides how to surface.
        """
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature or self.temperature,
            max_tokens=max_tokens or self.max_tokens,
            stream=True,
        )
        for chunk in response:
            if not getattr(chunk, "choices", None):
                continue
            delta = chunk.choices[0].delta
            content = getattr(delta, "content", None)
            if content:
                yield content

    # ── Embeddings (local via fastembed — no external API needed) ──
    _embedder = None

    @classmethod
    def get_embedder(cls):
        """Lazy-init the local ONNX embedder (BAAI/bge-small-en-v1.5, 384-dim)."""
        if cls._embedder is None:
            from fastembed import TextEmbedding
            cls._embedder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        return cls._embedder

    def embeddings(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for a list of texts using local fastembed model."""
        try:
            embedder = self.get_embedder()
            embeddings = list(embedder.embed(texts))
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            raise

    def embedding(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        return self.embeddings([text])[0]

    def is_configured(self) -> bool:
        """Check if the LLM is configured."""
        return settings.IS_LLM_CONFIGURED


# Singleton
llm_service = LLMService()
