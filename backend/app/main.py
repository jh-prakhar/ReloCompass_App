"""
ReloCompass Backend - FastAPI Application Entry Point
Run: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.routers import auth, jobs, accommodations, contact, users
from app.routers import chat, documents, ai_status, admin, community, visa, housing

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables, seed admin, load FAISS index."""
    logging.basicConfig(level=logging.INFO)

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")

    # Seed development admin account + sample data
    try:
        from app.seed import seed_admin, seed_sample_data
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            seed_admin(db)
            seed_sample_data(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Seeding failed: {e}")

    # Load FAISS index if it exists
    try:
        from app.ai.vector_store import vector_store
        if vector_store.load():
            logger.info(f"FAISS index loaded: {vector_store.size} vectors")
        else:
            logger.info("No FAISS index found. Run the ingestion pipeline to build one.")
    except Exception as e:
        logger.error(f"FAISS index load failed: {e}")

    yield

    logger.info("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Global Relocation Platform API",
    version="2.0.0",
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


# ── Cache headers for PWA assets ──
# The service worker and the JS that registers it must always revalidate,
# otherwise a heuristically-cached stale copy silently skips SW registration.
@app.middleware("http")
async def pwa_cache_control(request: Request, call_next):
    response = await call_next(request)
    path = request.url.path
    if path == "/sw.js" or path.startswith("/js/"):
        response.headers["Cache-Control"] = "no-cache"
    return response

# ── Register API routers ──
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs.router, prefix=settings.API_V1_PREFIX)
app.include_router(accommodations.router, prefix=settings.API_V1_PREFIX)
app.include_router(contact.router, prefix=settings.API_V1_PREFIX)

# AI routers
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)
app.include_router(documents.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_status.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)
app.include_router(community.router, prefix=settings.API_V1_PREFIX)
app.include_router(visa.router, prefix=settings.API_V1_PREFIX)
app.include_router(housing.router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
@app.get("/api/health")
def health():
    """Liveness probe — no auth, no DB round-trip."""
    return {"status": "healthy", "version": "2.0.0"}


@app.get("/api")
def api_info():
    """API metadata endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "jobs": "/api/jobs",
            "accommodations": "/api/accommodations",
            "contact": "/api/contact",
            "chat": "/api/chat",
            "community": "/api/community",
            "visa": "/api/visa",
            "housing": "/api/housing",
            "documents": "/api/documents",
            "ai_status": "/api/ai/status",
            "admin": "/api/admin",
        },
    }


# ── Serve static frontend files ──
# The frontend (HTML/CSS/JS) is served from /docs.
# In production, these same files are deployed to GitHub Pages.
# API routes under /api/ are matched first; everything else -> static files.
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "docs"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
