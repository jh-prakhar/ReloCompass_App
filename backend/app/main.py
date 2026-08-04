"""
ReloCompass Backend - FastAPI Application Entry Point
Run: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.routers import auth, jobs, accommodations, contact, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Global Relocation Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allows GitHub Pages frontend and other configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs.router, prefix=settings.API_V1_PREFIX)
app.include_router(accommodations.router, prefix=settings.API_V1_PREFIX)
app.include_router(contact.router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api")
def api_info():
    """API metadata endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


# ── Serve static frontend files ──
# The frontend (HTML/CSS/JS) is served from /docs.
# In production, these same files are deployed to GitHub Pages.
# API routes under /api/ are matched first; everything else -> static files.
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "docs"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
