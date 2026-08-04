# ReloCompass — Architecture

## Directory Structure
```
src/
├── app/
│   ├── layout.tsx              → Root layout (providers, fonts)
│   ├── page.tsx                → Landing page
│   ├── globals.css             → Tailwind + theme
│   ├── (auth)/
│   │   ├── login/page.tsx      → Login form
│   │   ├── register/page.tsx   → Registration with role selection
│   │   └── layout.tsx          → Auth layout (centered card)
│   ├── (dashboard)/
│   │   ├── layout.tsx          → Dashboard shell (sidebar + header)
│   │   ├── dashboard/page.tsx  → Role-based dashboard
│   │   ├── profile/page.tsx    → Edit profile + preferences
│   │   ├── assistant/page.tsx  → AI chat interface
│   │   ├── accommodation/page.tsx → Listings + filters
│   │   ├── transport/page.tsx  → City transport guides
│   │   ├── jobs/
│   │   │   ├── page.tsx        → Job board (job seekers)
│   │   │   └── post/page.tsx   → Post a job (employers)
│   │   ├── candidates/page.tsx → Candidate search (employers)
│   │   ├── community/page.tsx  → Groups + events
│   │   ├── budget/page.tsx     → Cost-of-living calculator
│   │   └── checklist/page.tsx  → Relocation tracker
│   └── api/
│       ├── auth/[...nextauth]/ → NextAuth route
│       ├── register/route.ts   → Registration API
│       ├── chat/route.ts       → AI chat (streaming)
│       ├── profile/route.ts    → Update preferences
│       ├── jobs/route.ts       → Job CRUD
│       ├── candidates/route.ts → Candidate search
│       ├── applications/route.ts → Apply to jobs
│       ├── favorites/route.ts  → Toggle accommodation favorite
│       └── checklist/route.ts  → Update checklist items
├── components/
│   ├── ui/                     → Reusable UI primitives (Button, Card, etc.)
│   ├── auth/                   → LoginForm, RegisterForm, RoleSelector
│   ├── assistant/              → ChatMessage, ChatInput, ChatWindow
│   ├── accommodation/          → AccommodationCard, FilterBar
│   ├── jobs/                   → JobCard, CandidateCard, ApplicationStatus
│   ├── dashboard/              → Sidebar, Header, StatCard
│   └── layout/                 → Navbar, Footer
├── lib/
│   ├── prisma.ts               → Prisma client singleton
│   ├── auth.ts                 → NextAuth config
│   ├── ai/
│   │   ├── client.ts           → OpenAI-compatible client setup
│   │   ├── prompts.ts          → System prompt builder + safety guardrails
│   │   └── tools.ts            → Context injection helpers
│   ├── validators.ts           → Zod schemas for all inputs
│   └── utils.ts                → General helpers
├── types/
│   └── index.ts                → Shared TypeScript types
└── config/
    ├── destinations.ts         → Country/city data
    └── constants.ts            → App constants
```

## Data Flow
1. **Auth**: User registers → API creates User + UserPreference + (if employer) Company → NextAuth session
2. **AI Assistant**: User sends message → API loads profile+preferences → builds context → calls LLM with streaming → streams chunks back → persists conversation
3. **Jobs**: Employer creates job → stored with skills as comma-separated → Job seekers filter → apply → Application created
4. **Accommodation**: Seed data + future user listings → filtered by city/budget/type → favorited by user

## Routing
- Public: `/` (landing)
- Auth: `/login`, `/register`
- Protected (session required): `/dashboard/*`
- API: `/api/*`
- Role-gated: employer-only routes redirect non-employers

## API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/register | Register new user |
| POST | /api/auth/[...nextauth] | NextAuth handlers |
| POST | /api/chat | AI chat (streaming) |
| PUT | /api/profile | Update preferences |
| GET/POST | /api/jobs | List/create jobs |
| GET | /api/candidates | Search candidates |
| POST | /api/applications | Apply to job |
| POST | /api/favorites | Toggle favorite |
| GET/POST/PUT | /api/checklist | Checklist management |
