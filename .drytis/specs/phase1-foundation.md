# Task Spec: Phase 1 — Foundation

## Goal
Scaffold Next.js app, create Prisma schema with all tables, run migrations, implement NextAuth credentials auth with 3 roles, registration with role selection, login/logout, role-based profiles, and user preferences persistence.

## Files to Create/Modify
1. `prisma/schema.prisma` — Full database schema
2. `src/lib/prisma.ts` — Prisma client singleton
3. `src/lib/auth.ts` — NextAuth configuration
4. `src/lib/validators.ts` — Zod validation schemas
5. `src/types/index.ts` — Shared types
6. `src/config/destinations.ts` — Country/city data
7. `src/config/constants.ts` — App constants
8. `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
9. `src/app/api/register/route.ts` — Registration endpoint
10. `src/app/api/profile/route.ts` — Profile/preferences update
11. `src/app/layout.tsx` — Root layout with SessionProvider
12. `src/app/page.tsx` — Landing page
13. `src/app/globals.css` — Theme + Tailwind
14. `src/app/(auth)/layout.tsx` — Auth layout
15. `src/app/(auth)/login/page.tsx` — Login page
16. `src/app/(auth)/register/page.tsx` — Registration page
17. `src/app/(dashboard)/layout.tsx` — Dashboard shell
18. `src/app/(dashboard)/dashboard/page.tsx` — Role-based dashboard
19. `src/app/(dashboard)/profile/page.tsx` — Profile & preferences
20. `src/components/providers.tsx` — SessionProvider wrapper
21. `src/components/ui/*.tsx` — UI primitives (Button, Card, Input, Select, Badge, etc.)
22. `src/components/layout/navbar.tsx` — Top navigation
23. `src/middleware.ts` — Route protection middleware
24. `prisma/seed.ts` — Seed script with sample data
25. `jest.config.ts` — Jest configuration
26. `jest.setup.ts` — Jest setup

## Acceptance Criteria
- [ ] Next.js builds successfully (`npm run build`)
- [ ] Prisma schema defines all tables per schema.md
- [ ] Migrations run successfully
- [ ] Users can register as STUDENT, JOB_SEEKER, or EMPLOYER
- [ ] Passwords hashed with bcrypt
- [ ] Login works for all roles
- [ ] Protected routes redirect to /login when unauthenticated
- [ ] Role-based dashboard shows different content per role
- [ ] Profile page saves and loads user preferences
- [ ] Landing page is attractive and explains the platform
- [ ] Navigation works (login, register, dashboard, logout)
- [ ] Unit tests for validators and auth utilities pass
- [ ] Seed data populates accommodations, transport guides, budget estimates

## Tests
### Unit Tests
- `src/lib/__tests__/validators.test.ts` — Zod schemas validate/reject correctly
- `src/lib/__tests__/auth.test.ts` — Password hash/compare

### Integration Tests
- `src/app/api/__tests__/register.test.ts` — Registration API (validation, duplicate email, role assignment)
- `src/app/api/__tests__/profile.test.ts` — Profile update API

## Edge Cases
- Duplicate email registration → 409
- Invalid role → 400
- Missing fields → 400
- Session expiry → redirect to login
- Employer without company profile → auto-create Company on register
