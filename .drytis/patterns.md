# ReloCompass — Coding Patterns

## Naming Conventions
- **Files**: kebab-case for components (`accommodation-card.tsx`), camelCase for utils
- **Components**: PascalCase (`AccommodationCard`)
- **Functions**: camelCase (`formatCurrency`)
- **Types/Enums**: PascalCase (`UserRole`, `ApplicationStatus`)
- **DB fields**: camelCase (Prisma convention)

## Error Handling
- API routes: always wrap in try/catch, return `{ error: string }` with appropriate status
- Client: show user-friendly error messages via toast/inline
- Never expose stack traces to users
- Use Zod for all input validation → 400 on invalid

## Auth Patterns
- `getServerSession(authOptions)` in server components
- `useSession()` in client components
- API routes: check session → return 401 if missing
- Role checks: `session.user.role === 'EMPLOYER'` before employer endpoints
- Redirect: middleware or server-side redirect for protected routes

## Component Patterns
- Server components by default, `"use client"` only when needed (forms, interactivity)
- Prop types via TypeScript interfaces
- Loading states via Suspense or local state
- Reusable UI primitives in `components/ui/`

## Data Fetching
- Server components: Prisma direct queries
- Client mutations: fetch to API routes
- Optimistic updates where appropriate

## AI Safety Guardrails (in system prompt)
- Never guarantee admission or employment
- Never encourage illegal work or visa violations
- Never assist with fraudulent documents
- Recommend unsafe accommodations is forbidden
- No discrimination or bias
- Always be transparent about uncertainty
- Direct to official sources for visa/immigration

## Test Conventions
- Unit tests: `*.test.ts` / `*.test.tsx` next to the file or in `__tests__/`
- Test file naming: `<module>.test.ts`
- Integration tests: API route tests with Prisma mocking
- Use `describe`/`it`/`expect` from Jest
- Mock external dependencies (LLM, email)

## Styling
- Tailwind utility classes, no custom CSS except globals.css theme
- Responsive: mobile-first (`sm:`, `md:`, `lg:`)
- Color palette: primary blue/teal for trust, warm accents
- Dark mode support deferred
