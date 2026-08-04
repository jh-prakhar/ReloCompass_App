# ReloCompass — Scope

## In Scope

### Phase 1: Foundation
- Next.js scaffold (App Router, TypeScript, Tailwind)
- Prisma schema with all tables
- Database migrations
- NextAuth credentials auth with bcrypt
- Registration with role selection (STUDENT, JOB_SEEKER, EMPLOYER)
- Login/logout flows
- Role-based profile pages
- UserPreferences persistence (personalization)

### Phase 2: AI Assistant
- Chat interface with streaming responses
- System prompt encoding relocation expertise + safety guardrails
- Context injection from user profile + preferences
- Conversation history persistence
- Quick-start prompt suggestions per user type

### Phase 3: Accommodation + Transport
- Accommodation listings with seed data
- Filter by type, budget range, city, amenities
- Save/unsave favorites
- Scam awareness banner
- City transport guides (seed data)
- Travel card/pass info per city

### Phase 4: Jobs + Employer Portal
- Employer: create job postings (title, description, skills, salary, visa sponsorship)
- Employer: search candidates by skills, country, experience, visa status
- Job Seeker: browse + filter jobs, apply
- Application status tracking
- AI CV builder and cover letter generator

### Phase 5: Community + Financial + Checklist
- Community hub: groups, events, mentorship listings
- Cost-of-living calculator (city-based budget breakdown)
- Relocation checklists: pre-departure, packing, post-arrival
- Checklist progress tracking

### Phase 6: Polish & Integration
- Unified role-based dashboard
- Responsive design pass (mobile, tablet, desktop)
- Full verification (infra, reviewer, tester)

## Out of Scope
- Real-time messaging/chat between users (beyond AI assistant)
- Payment processing for accommodation bookings
- Real integration with external job APIs (LinkedIn, Indeed)
- Legal document generation
- Multi-language i18n (English only for now)
- Mobile native apps (responsive web only)
