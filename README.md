# 🧭 ReloCompass

### AI-Powered Global Relocation, Student Success & Employment Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
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
- **Role-Based Access** — Student, Job Seeker, and Employer accounts
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Accessibility** — WCAG 2.1 AA compliant with semantic HTML and ARIA labels

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
│   │   ├── deps.py             # Dependencies (get_current_user, etc.)
│   │   ├── schemas.py          # Pydantic request/response models
│   │   ├── seed.py             # Database seeding script
│   │   ├── database/
│   │   │   └── __init__.py     # SQLAlchemy engine, session, Base
│   │   ├── models/
│   │   │   └── __init__.py     # SQLAlchemy ORM models
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # /api/auth/* — register, login, me, logout
│   │   │   ├── users.py        # /api/users/* — profile management
│   │   │   ├── jobs.py         # /api/jobs/* — job board CRUD
│   │   │   ├── accommodations.py # /api/accommodations/* — housing listings
│   │   │   └── contact.py      # /api/contact/* — contact form
│   │   └── services/
│   │       └── auth.py         # Password hashing, JWT token creation
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
  " assistant@relocompass.com",
  "subject": "Partnership Inquiry",
  "message": "I'd like to discuss a potential partnership with ReloCompass."
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

- [ ] Real AI assistant integration (OpenAI / LLM-powered chat)
- [ ] Email notification system (password reset, application updates)
- [ ] Advanced job matching algorithm (skills + location + preferences)
- [ ] Multi-language support (Hindi, Nepali, Spanish, French)
- [ ] Progressive Web App (PWA) with offline support
- [ ] Admin dashboard for content management
- [ ] Real-time chat between community members
- [ ] Visa & immigration document checklist generator
- [ ] Integration with university APIs for housing availability

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
