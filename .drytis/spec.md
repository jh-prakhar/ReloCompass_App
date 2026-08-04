# ReloCompass — Project Specification

## Overview
ReloCompass is an AI-powered Global Relocation, Student Success, and Employment Assistant platform.
It helps international students and skilled workers from India & Nepal relocate abroad with confidence.

## Tech Stack
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Database**: MySQL + Prisma ORM
- **AI**: OpenAI-compatible API (conversational assistant with streaming)
- **Auth**: NextAuth.js (Credentials provider, 3 roles: STUDENT, JOB_SEEKER, EMPLOYER)
- **UI**: Tailwind CSS + custom components
- **Testing**: Jest + Testing Library (unit/integration), Playwright (browser via tester)

## Key Decisions
- App Router with `src/` directory
- Prisma ORM for MySQL — all schema via migrations
- Credentials-based auth with bcrypt password hashing
- AI assistant uses OpenAI-compatible API with a structured system prompt encoding safety guardrails
- Personalization via UserPreferences table linked to the user profile
- All env vars stored via backend env-key system, never hardcoded

## User Roles
1. **STUDENT** — moving abroad for education (UG, PG, diploma, research)
2. **JOB_SEEKER** — relocating for employment
3. **EMPLOYER** — posts jobs, searches candidates, hires

## Core Modules
1. Auth & Profiles (with personalization preferences)
2. AI Relocation Assistant (streaming chat)
3. Accommodation Hub (listings, filters, favorites)
4. Transportation Guide (per-city info)
5. Job Board & Matching (employer posting, candidate search)
6. Community Hub (groups, events, networking)
7. Financial Planning (cost-of-living calculator)
8. Relocation Checklists (pre-departure, packing, post-arrival)
