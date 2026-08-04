# 🧭 ReloCompass

### AI-Powered Global Relocation, Student Success & Employment Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![FAISS](https://img.shields.io/badge/FAISS-Vector%20DB-orange?logo=facebook&logoColor=white)](https://github.com/facebookresearch/faiss)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [AI Assistant Architecture](#ai-assistant-architecture)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
  - [Backend Setup (Python / FastAPI)](#backend-setup-python--fastapi)
  - [Frontend Setup (HTML / CSS / Vanilla JS)](#frontend-setup-html--css--vanilla-js)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Deployment](#deployment)
- [Frontend–Backend Integration](#frontendbackend-integration)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

**ReloCompass** helps international students, job seekers, and employers navigate the complexities of global relocation. The platform combines an AI assistant, accommodation search, transportation guides, job matching, community resources, and financial planning tools — all in one place.

The project is built with a clear **frontend–backend separation**:

- **Frontend:** Static HTML5, CSS3, and Vanilla JavaScript (deployed via GitHub Pages)
- **Backend:** Python REST API using FastAPI, SQLAlchemy, and JWT authentication

---

## Features

### For Students & Job Seekers
- **AI Assistant** — Chat-based guidance for relocation questions, visa info, and city recommendations
- **Accommodation Hub** — Search student housing, dorms, shared apartments by city and budget
- **Transportation Guide** — Public transit info, airport connections, and travel tips for major destinations
- **Job Board & Matching** — Browse job listings with visa sponsorship filters
- **Community Hub** — Connect with other relocators through groups and events
- **Financial Planning** — Budget estimators for cost of living across cities
- **Relocation Checklists** — Step-by-step task lists for a smooth move

### For Employers
- **Post Jobs** — Create listings with visa sponsorship details
- **Candidate Matching** — Review applications from relocating professionals
- **Company Profile** — Showcase your organization to a global talent pool

### Platform-wide
- **Secure Authentication** — JWT-based login with bcrypt password hashing
- **Role-Based Access** — Student, Job Seeker, Employer, and Admin accounts
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Accessibility** — WCAG 2.1 AA compliant with semantic HTML and ARIA labels

### AI-Powered Features
- **Conversational Chat Assistant** — RAG-powered AI that answers relocation questions grounded in a curated knowledge base
- **Document Ingestion Pipeline** — Upload PDF, DOCX, TXT, MD, CSV, JSON documents; automatic text extraction, chunking, embedding, and FAISS indexing
- **FAISS Vector Search** — Retrieves the most relevant knowledge base passages to ground AI responses
- **Session Memory** — Multi-turn conversations with context retention
- **Source Citations** — AI cites which knowledge base document each answer came from
- **Honest Fallbacks** — The AI says "I don't know" rather than inventing information
- **Admin Panel** — Upload documents, rebuild the index, manage users, and monitor AI usage
- **Personalized Recommendations** — Responses tailored to user role (student, job seeker, employer) and profile

---

## AI Assistant Architecture

ReloCompass uses a **Retrieval-Augmented Generation (RAG)** pipeline to ensure AI responses are accurate, grounded, and cite their sources.

### How It Works

```
User Question
     │
     ▼
┌─────────────────────┐     ┌──────────────────────────┐
│  Embedding (local)  │     │   Knowledge Base         │
│  BAAI/bge-small-en  │     │   6 curated markdown     │
│  384-dim vectors    │     │   documents              │
└────────┬────────────┘     └──────────────────────────┘
         │                               │
         ▼                               ▼
┌─────────────────────────────────────────────────────────┐
│              FAISS Vector Index (FAISS)                  │
│    Cosine similarity search → top-K relevant chunks      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              LLM (OpenAI-compatible)                    │
│  System prompt + retrieved context + user question      │
│  → Grounded answer with source citations                │
│  → Honest "I don't know" when context is insufficient   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
                   Response + Sources
```

### Knowledge Base

The knowledge base covers four domains critical to relocation:

| Domain | Document(s) | Coverage |
|--------|-------------|----------|
| **Student Relocation** | `student_accommodation.md`, `student_banking_insurance.md`, `student_packing_onboarding.md` | Housing types, rental tips, scam awareness, banking setup, health insurance, packing checklists, university onboarding |
| **Transportation** | `transportation_guide.md` | Metro systems, buses, trains, airport transfers, student travel cards, ride-sharing |
| **Employment** | `employment_guide.md` | Resume/CV guidance, interview preparation, part-time/full-time jobs, visa-aware recommendations |
| **Employers** | `employer_guide.md` | Candidate matching, hiring international talent, job posting best practices |

### Document Ingestion Pipeline

```
Upload (PDF/DOCX/TXT/MD/CSV/JSON)
    │
    ├──► Text Extraction (pypdf, python-docx, built-in readers)
    ├──► Text Cleaning (whitespace normalization, null removal)
    ├──► Chunking (800 chars, 150 overlap, sentence-boundary aware)
    ├──► Embedding (BAAI/bge-small-en-v1.5 via fastembed — local ONNX)
    └──► FAISS Indexing (normalized L2 + inner-product = cosine similarity)
```

**Supported file types:** `.pdf`, `.docx`, `.doc`, `.txt`, `.md`, `.csv`, `.json`

### Admin Panel

Authenticated administrators can:
- Upload new knowledge base documents via the API or admin dashboard
- Rebuild the FAISS index from scratch (re-processes all documents)
- View AI usage logs (tokens used, latency, success/failure)
- Manage user accounts
- Monitor system health (LLM status, vector index size, document count)

**Dev Admin Account** (auto-seeded, development only):
- Email: `admin@relocompass.org`
- Password: `Admin@12345`
- **⚠️ Remove or change before any production deployment.**

---

## Architecture

```
┌─────────────────────────┐         REST API (JSON)         ┌──────────────────────────┐
│   Frontend (GitHub Pages) │  ◄──────────────────────────►  │   Backend (FastAPI)       │
│                         │                                │                          │
│  HTML5 / CSS3 / JS      │   POST /api/auth/register      │  Python 3.11+            │
│  No build step          │   POST /api/auth/login         │  FastAPI + Uvicorn       │
│  Served statically      │   GET  /api/jobs/              │  SQLAlchemy ORM          │
│                         │   POST /api/contact/           │  JWT (python-jose)       │
│  js/auth.js → JWT       │   ...                          │  bcrypt password hash    │
│  stored in localStorage │                                │  MySQL / PostgreSQL      │
└─────────────────────────┘                                └──────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3 (Custom Properties, Flexbox, Grid), Vanilla JavaScript (ES6+) |
| **Backend** | Python 3.11+, FastAPI, Uvicorn |
| **Database** | MySQL (production) / SQLite (development fallback) |
| **ORM** | SQLAlchemy 2.0 |
| **AI / LLM** | OpenAI-compatible API (configurable model, gateway-agnostic) |
| **Embeddings** | BAAI/bge-small-en-v1.5 via fastembed (local ONNX — no external API) |
| **Vector Search** | FAISS (faiss-cpu) with cosine similarity |
| **Document Processing** | pypdf (PDF), python-docx (DOCX), built-in readers (TXT, MD, CSV, JSON) |
| **Authentication** | JWT tokens via `python-jose`, bcrypt password hashing |
| **API Docs** | Auto-generated Swagger UI at `/docs`, ReDoc at `/redoc` |

---

## Repository Structure

```
ReloCompass_App/
│
├── docs/                       # Frontend (served by GitHub Pages)
│   ├── index.html              # Landing page
│   ├── about.html              # About page
│   ├── jobs.html               # Job board
│   ├── employers.html          # Employer info page
│   ├── contact.html            # Contact form
│   ├── login.html              # Login page
│   ├── register.html           # Sign-up page
│   ├── dashboard.html          # User dashboard (protected)
│   ├── css/
│   │   ├── style.css           # Main stylesheet (design system)
│   │   ├── responsive.css       # Media queries
│   │   └── animations.css       # Keyframe animations
│   ├── js/
│   │   ├── main.js             # Navigation, animations, interactions
│   │   ├── auth.js             # Authentication logic (register, login, JWT)
│   │   ├── contact.js          # Contact form validation + submission
│   │   └── config.js           # API base URL configuration
│   └── assets/
│       └── icons/              # SVG logos
│
├── backend/                    # Python backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── config.py           # Settings (reads from env vars)
│   │   ├── deps.py             # Dependencies (get_current_user, get_admin_user)
│   │   ├── schemas.py          # Pydantic request/response models
│   │   ├── seed.py             # Database seeding script
│   │   ├── database/           # SQLAlchemy engine, session, Base
│   │   ├── models/             # SQLAlchemy ORM models (User, Job, ChatSession, etc.)
│   │   ├── routers/
│   │   │   ├── auth.py         # /api/auth/* — register, login, me
│   │   │   ├── users.py        # /api/users/* — profile management
│   │   │   ├── jobs.py         # /api/jobs/* — job board CRUD
│   │   │   ├── accommodations.py # /api/accommodations/* — housing listings
│   │   │   ├── contact.py      # /api/contact/* — contact form
│   │   │   ├── chat.py         # /api/chat/* — AI conversational chat
│   │   │   ├── documents.py    # /api/documents/* — upload + index management
│   │   │   ├── ai_status.py    # /api/ai/status — AI subsystem health
│   │   │   └── admin.py        # /api/admin/* — admin dashboard
│   │   ├── ai/                 # AI subsystem
│   │   │   ├── llm_service.py  # OpenAI-compatible LLM client + local embeddings
│   │   │   ├── vector_store.py # FAISS vector index management
│   │   │   ├── rag_service.py  # RAG pipeline (retrieval + generation)
│   │   │   └── ingestion.py    # Document processing pipeline
│   │   ├── templates/          # Jinja2 admin dashboard templates
│   │   └── services/
│   │       └── auth.py         # Password hashing, JWT token creation
│   ├── knowledge_base/         # Curated markdown knowledge documents
│   │   ├── student_accommodation.md
│   │   ├── student_banking_insurance.md
│   │   ├── student_packing_onboarding.md
│   │   ├── transportation_guide.md
│   │   ├── employment_guide.md
│   │   └── employer_guide.md
│   ├── tests/                  # Pytest test suite (46 tests)
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   └── README.md               # Backend-specific docs
/   │
├── README.md                   # This file
├── LICENSE                     # MIT License
└── .gitignore
```

---

## Prerequisites

- **Python** 3.11 or higher
- **MySQL** 8.0+ (or use SQLite for local development)
- **Git**
- A modern web browser

---

## Installation Guide

### Backend Setup (Python / FastAPI)

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jh-prakhar/ReloCompass_App.git
   cd ReloCompass_App
   ```

2. **Create a virtual environment:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate   # Linux/macOS
   # venv\Scripts\activate    # Windows
   ```

3. **Install Python dependencies:**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

5. **Run the backend:**

   ```bash
   # Development (with auto-reload)
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Production
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

6. **Verify the backend is running:**

   - API root: http://localhost:8000/
   - Swagger docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

### Frontend Setup (HTML / CSS / Vanilla JS)

The frontend is pure static files — no build step required.

1. **For local development:**

   ```bash
   # Serve the docs/ folder with any static server
   cd docs
   python3 -m http.server 8888
   # Visit http://localhost:8888
   ```

2. **Connect to the backend:**

   Edit `docs/js/config.js` and set `BASE_URL` to your backend URL:

   ```javascript
   const API_CONFIG = {
     BASE_URL: 'http://localhost:8000',  // Your FastAPI backend
     // ...
   };
   ```

3. **For GitHub Pages deployment:**

   Push to the `main` branch — GitHub Pages serves the `docs/` folder automatically.
   See [Deployment](#deployment) for details.

---

## Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | `ReloCompass API` |
| `APP_DEBUG` | Enable debug mode | `true` |
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `3306` |
| `DB_NAME` | Database name | `relocompass` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database password | *(required)* |
| `JWT_SECRET` | Secret key for signing JWT tokens | *(required in production)* |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:8888` |
| `LLM_API_KEY` | OpenAI-compatible API key for LLM chat | *(required for AI)* |
| `LLM_BASE_URL` | LLM API base URL | `https://api.openai.com/v1` |
| `LLM_MODEL` | Chat completion model name | `z-ai/glm-5` |
| `LLM_EMBEDDING_MODEL` | Embedding model (local fastembed) | `text-embedding-3-small` |
| `LLM_MAX_TOKENS` | Max tokens per AI response | `2000` |
| `LLM_TEMPERATURE` | LLM creativity (0=deterministic, 1=creative) | `0.7` |
| `CHUNK_SIZE` | Text chunk size for ingestion | `800` |
| `CHUNK_OVERLAP` | Overlap between chunks | `150` |
| `RAG_TOP_K` | Number of chunks retrieved per query | `5` |
| `DEV_ADMIN_EMAIL` | Dev admin email (auto-seeded) | `admin@relocompass.org` |
| `DEV_ADMIN_PASSWORD` | Dev admin password (auto-seeded) | `Admin@12345` |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user, return JWT token | No |
| `GET` | `/api/auth/me` | Get current authenticated user | Yes |
| `POST` | `/api/auth/logout` | Logout (client-side token removal) | Yes |
| `POST` | `/api/auth/password-reset` | Request password reset (placeholder) | No |

**Register Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "role": "student"
}
```

**Login Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student"
  }
}
```

### Jobs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/jobs/` | List all active job listings | No |
| `GET` | `/api/jobs/{id}` | Get a specific job by ID | No |
| `POST` | `/api/jobs/` | Create a new job posting | Employer |
| `POST` | `/api/jobs/{id}/apply` | Apply to a job | Yes |

### Accommodations

| Method | Endpoint | Description | Auth |
|### Accommodations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/accommodations/` | List all active accommodation listings | No |
| `GET` | `/api/accommodations/{id}` | Get a specific accommodation by ID | No |

### Users

| Method | Endpoint | Description | Auth |
|### Users

| Updated User Profile | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users/me` | Get current user profile | Yes |
| `PUT` | `/api/users/me` | Update profile (name, phone, bio, etc.) | Yes |

### Contact

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/contact/` | Submit a contact message | No |

**Contact Request:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "subject": "Partnership Inquiry",
  "message": "I'd like to discuss a potential partnership with ReloCompass."
}
```

### AI Chat

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/chat/` | Send a message to the AI assistant | Optional |
| `GET` | `/api/chat/history/{session_id}` | Get conversation history | No |
| `DELETE` | `/api/chat/history/{session_id}` | Clear a conversation | No |

**Chat Request:**
```json
{
  "message": "What types of accommodation are available for students?",
  "session_id": "optional-existing-session-uuid",
  "user_context": "optional-context-string"
}
```

**Chat Response:**
```json
{
  "reply": "Based on the knowledge base, students can choose from dormitories, shared apartments...",
  "session_id": "uuid-for-conversation-continuity",
  "sources": [
    {
      "source": "student_accommodation.md",
      "category": "student_relocation",
      "score": 0.846
    }
  ],
  "model_used": "z-ai/glm-5"
}
```

### AI Documents (Admin Only)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/documents/` | List all uploaded documents | Admin |
| `POST` | `/api/documents/upload` | Upload + ingest document(s) | Admin |
| `DELETE` | `/api/documents/{id}` | Delete a document | Admin |
| `POST` | `/api/documents/rebuild-index` | Rebuild the FAISS index from all KB docs | Admin |

### AI Status & Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Basic health check | No |
| `GET` | `/api/ai/status` | AI subsystem status (LLM, FAISS, docs) | No |

**AI Status Response:**
```json
{
  "llm_configured": true,
  "llm_model": "z-ai/glm-5",
  "embedding_model": "BAAI/bge-small-en-v1.5 (local)",
  "faiss_index_size": 38,
  "total_documents": 6,
  "total_chunks": 38
}
```

---

## Authentication Flow

```
1. User fills out Register form (register.html)
   → POST /api/auth/register {name, email, password, role}
   → Backend hashes password (bcrypt), stores user, returns JWT
   → Frontend stores token in localStorage, redirects to dashboard

2. User logs in (login.html)
   → POST /api/auth/login {email, password}
   → Backend verifies password against hash, returns JWT
   → Frontend stores token in localStorage, redirects to dashboard

3. Authenticated requests
   → Frontend sends Authorization: Bearer <token> header
   → Backend validates JWT, extracts user_id
   → Returns protected data

4. Logout
   → Frontend removes token from localStorage
   → Redirects to login page
```

---

## Deployment

### Frontend (GitHub Pages)

The frontend deploys automatically via GitHub Pages:

1. Push to `main` branch
2. GitHub Pages settings: **Source = Deploy from branch → `main` → `/docs`**
3. Site is live at: **https://jh-prakhar.github.io/ReloCompass_App/**

**Note:** Update `docs/js/config.js` `BASE_URL` to point to your backend's public URL.

### Backend (Production)

The backend can be deployed to any Python-friendly host:

**Option A: VPS / Docker**

```bash
# Build and run with Docker (if Dockerfile is provided)
docker build -t relocompass-api .
docker run -p 8000:8000 --env-file backend/.env relocompass-api

# Or run directly with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Option B: Platform as a Service (Render, Railway, Fly.io)**

1. Create a new service pointing to this repository
2. Set the root directory to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (see [Environment Variables](#environment-variables))

---

## Frontend–Backend Integration

The frontend communicates with the backend exclusively through REST API calls.

### How it works

1. `docs/js/config.js` defines the API base URL for each environment
2. `docs/js/auth.js` handles all authentication API calls and stores the JWT
3. `docs/js/contact.js` submits the contact form to the backend
4. All API responses are JSON — no server-side rendering

### CORS Configuration

The backend allows cross-origin requests from:
- `https://jh-prakhar.github.io` (GitHub Pages frontend)
- `http://localhost:8888` (local development)

Update `CORS_ORIGINS` in `backend/.env` if deploying to a different domain.

---

## Future Improvements

- [x] ~~Real AI assistant integration (OpenAI / LLM-powered chat)~~ — **Done!**
- [x] ~~Admin dashboard for content management~~ — **Done!**
- [ ] Email notification system (password reset, application updates)
- [ ] Advanced job matching algorithm (skills + location + preferences)
- [ ] Multi-language support (Hindi, Nepali, Spanish, French)
- [ ] Progressive Web App (PWA) with offline support
- [ ] Real-time chat between community members
- [ ] Visa & immigration document checklist generator
- [ ] Integration with university APIs for housing availability
- [ ] Streaming AI responses (SSE) for real-time chat experience
- [ ] Multi-modal document ingestion (images, scanned PDFs via OCR)

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

### 🔗 Links

- **Live Website:** https://jh-prakhar.github.io/ReloCompass_App/
- **GitHub Repository:** https://github.com/jh-prakhar/ReloCompass_App

---

### Contact

**Prakhar Jha** — [prakharnpp@gmail.com](mailto:prakharnpp@gmail.com)
