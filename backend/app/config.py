"""
ReloCompass Backend - Configuration Settings
"""
import os
from pathlib import Path

# Load .env file if present
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(env_path)
except ImportError:
    pass  # python-dotenv not installed in production

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

    # CORS — allows GitHub Pages frontend + local dev
    CORS_ORIGINS: list = [
        "https://jh-prakhar.github.io",
        "https://relocompass-tpfpaa.drytis.dev",
        "http://localhost:8888",
        "http://localhost:3000",
        "http://127.0.0.1:8888",
        "null",  # file:// protocol
    ]


settings = Settings()
