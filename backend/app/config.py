"""
ReloCompass Backend - Configuration Settings
All settings are loaded from environment variables with sensible dev defaults.
"""
import os
from pathlib import Path

# Load .env file if present
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(env_path)
except ImportError:
    pass


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings:
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = os.getenv("APP_NAME", "ReloCompass API")
    DEBUG: bool = os.getenv("APP_DEBUG", "true").lower() == "true"
    API_V1_PREFIX: str = "/api"

    # Database
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_NAME: str = os.getenv("DB_NAME", "relocompass")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )

    # JWT Auth
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET",
        "relocompass-dev-jwt-secret-change-in-production-2026",
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # CORS — configured via CORS_ORIGINS env var (comma-separated list,
    # backend-managed; includes the project domain at deploy time).
    # Static fallbacks cover local dev only.
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "https://jh-prakhar.github.io,http://localhost:8888,"
            "http://localhost:3000,http://127.0.0.1:8888,null",
        ).split(",")
        if origin.strip()
    ]

    # ── AI / LLM Configuration ──
    # OpenAI-compatible endpoint. Point to any LLM gateway by changing these.
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", ""))
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"))
    LLM_MODEL: str = os.getenv("LLM_MODEL", "z-ai/glm-5")
    LLM_EMBEDDING_MODEL: str = os.getenv("LLM_EMBEDDING_MODEL", "text-embedding-3-small")
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "2000"))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.7"))

    # ── RAG / Vector Search ──
    FAISS_INDEX_DIR: str = str(BASE_DIR / "embeddings")
    KNOWLEDGE_BASE_DIR: str = str(BASE_DIR / "knowledge_base")
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "800"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "150"))
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "5"))

    # ── Dev Admin Account (development only!) ──
    # Password comes from env; the fallback only boots environments
    # that never set it and is not used in production deploys.
    DEV_ADMIN_EMAIL: str = os.getenv("DEV_ADMIN_EMAIL", "admin@relocompass.org")
    DEV_ADMIN_PASSWORD: str = os.getenv("DEV_ADMIN_PASSWORD", "change-me-dev-only")

    @property
    def IS_LLM_CONFIGURED(self) -> bool:
        return bool(self.LLM_API_KEY and self.LLM_BASE_URL)


settings = Settings()
