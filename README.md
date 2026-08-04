<div align="center">

# ReloCompass

### AI-Powered Global Relocation, Student Success & Employment Assistant

<img src="public/icon-512.png" alt="ReloCompass Logo" width="120"/>

Helping people from India & Nepal relocate abroad for education or employment — with AI guidance, verified listings, job matching, and community support.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [AI Capabilities](#ai-capabilities)
- [Technology Stack](#technology-stack)
- [Live Demo](#live-demo)
- [Installation](#installation)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [Folder Structure](#folder-structure)
- [User Roles](#user-roles)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**ReloCompass** is an AI-powered web platform that helps people from India and Nepal relocate abroad for education or employment. It covers the complete relocation journey — from the first decision to move, through preparation, arrival, and settling into a new country.

The platform serves three user roles:

| Role | Description |
|---|---|
| **Students** | International students preparing for undergraduate or postgraduate studies abroad |
| **Job Seekers** | Skilled professionals seeking employment opportunities overseas |
| **Employers** | Companies hiring talented professionals from India and Nepal |

---

## Problem Statement

Every year, hundreds of thousands of students and professionals from India and Nepal move abroad. The process is complex, stressful, and filled with uncertainty:

| Challenge | Impact |
|---|---|
| **Fragmented Information** | Relocation requires juggling dozens of sources — visa portals, university sites, housing platforms, and forums. |
| **Trust & Safety Concerns** | International movers are vulnerable to scams, from fake landlords to fraudulent job offers. |
| **Language & Cultural Barriers** | Understanding local norms, tenant rights, and professional etiquette in a new country is overwhelming. |
| **Social Isolation** | Moving abroad means leaving behind support networks and starting from scratch. |
| **Financial Uncertainty** | Without accurate cost-of-living data, budgeting for a new country is guesswork. |

---

## Solution

ReloCompass brings the entire relocation journey into one integrated platform:

- **AI Assistant** — 24/7 personalized guidance on visas, housing, jobs, and cultural tips
- **Accommodation Hub** — Verified listings with safety ratings and scam-prevention guidance
- **Job Board & Matching** — Employer-posted jobs with AI-powered candidate matching
- **Transportation Guide** — Local transit systems, student passes, and travel cards
- **Budget Planner** — Cost-of-living calculators tailored to each destination city
- **Relocation Checklist** — Trackable pre-departure, packing, and post-arrival tasks
- **Community Hub** — Student clubs, cultural groups, mentorship programs, and events

---

## Features

### For Students & Job Seekers

- **AI Relocation Assistant** — Chat-based assistant providing personalized guidance on visa requirements, documentation, timelines, and relocation logistics
- **Accommodation Search** — Filter and save housing listings by country, city, type, budget, and safety rating
- **Job Discovery & Applications** — Browse employer-posted jobs, filter by visa sponsorship, and apply with cover letters
- **Budget Planner** — Interactive sliders for estimating monthly costs (rent, food, transport, insurance) per destination city
- **Relocation Checklist** — Auto-seeded task lists for pre-departure, packing, and post-arrival phases with progress tracking
- **Transportation Guides** — City-specific public transit information, student pass details, and monthly costs
- **Community Hub** — Discover student clubs, cultural organizations, professional networks, and upcoming events
- **Profile & Preferences** — Set destination, budget, accommodation preferences, career goals, and more to personalize AI recommendations

### For Employers

- **Candidate Search** — Filter candidates by skills, target country, experience level, and visa status
- **Job Posting** — Create job listings with salary ranges, required skills, and visa sponsorship options
- **Dashboard Analytics** — Track posted jobs and manage applications
- **AI-Powered Matching** — Get insights on candidate-job fit

---

## AI Capabilities

The AI assistant is powered by an OpenAI-compatible LLM gateway. It uses each user's profile and preferences to provide context-aware guidance:

| Capability | Example |
|---|---|
| **Relocation Planning** | "I'm moving to Toronto for my master's. What documents do I need?" |
| **Accommodation Guidance** | "Can you find me accommodation near U of T?" |
| **Budget Estimation** | "How much should I budget for monthly expenses in Berlin?" |
| **Visa & Documentation** | "What's the visa process for skilled workers in Germany?" |
| **Cultural Tips** | "What should I know about renting an apartment in London?" |
| **Checklist Generation** | "Create a packing list for my move to Sydney." |

> **Note:** The AI assistant provides guidance only. For visa, immigration, and legal matters, always verify with official government sources.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Database** | MySQL 8 via Prisma ORM |
| **Authentication** | NextAuth.js (Credentials Provider, bcrypt) |
| **AI** | OpenAI-compatible LLM gateway |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Testing** | Jest + tsx |
| **Package Manager** | npm |

---

## Live Demo

The platform is deployed and accessible at:

**https://relocompass-tpfpaa.drytis.dev/**

- **Student / Job Seeker:** Create a free account to explore all features
- **Employer:** Register as an employer to access the hiring dashboard

> The mobile apps (Android & iOS) are in development. Download links will be activated upon publication.

---

## Installation

### Prerequisites

- **Node.js** 18.18+ (or 20+)
- **npm** 10+
- **MySQL** 8+ (or a MySQL-compatible database)
- An OpenAI-compatible LLM API key (for the AI assistant)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jh-prakhar/ReloCompass_App.git
   cd ReloCompass_App
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

4. **Set up the database:**

   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Open the app:**

   Navigate to `http://localhost:3000`

---

## Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed demo data
npm run seed

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm run start
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest test suite |
| `npm run seed` | Seed database with demo data |

---

## Environment Variables

Create a `.env` file in the project root with the following variables. **Never commit this file.**

```env
# Database
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DB_NAME"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI Assistant (OpenAI-compatible endpoint)
OPENAI_API_KEY="your-api-key"
OPENAI_BASE_URL="https://your-llm-endpoint/v1"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="ReloCompass"
```

> **Security:** The `.env` file is included in `.gitignore` and will never be committed. Generate a unique `NEXTAUTH_SECRET` using `openssl rand -base64 32`.

---

## Database Setup

This project uses **Prisma ORM** with **MySQL**. The schema is defined in `prisma/schema.prisma`.

### Schema Models

| Model | Purpose |
|---|---|
| `User` | User accounts with role-based access (STUDENT, JOB_SEEKER, EMPLOYER) |
| `UserPreference` | Per-user destination, budget, career, and accommodation preferences |
| `Company` | Employer company profiles |
| `Job` | Job postings by employers |
| `Application` | Job applications from users |
| `Accommodation` | Housing listings with safety ratings |
| `TransportGuide` | City-specific transit guides |
| `BudgetEstimate` | Monthly cost estimates per city and category |
| `CommunityGroup` | Student clubs, cultural groups, mentorship programs |
| `CommunityEvent` | Community-organized events |
| `ChatSession` | AI assistant conversation history |
| `ChecklistItem` | User relocation tasks |
| `Favorite` | Saved accommodation listings |

### Apply the Schema

```bash
npx prisma generate   # Generate the Prisma Client
npx prisma db push    # Create tables in your database
npm run seed          # Load demo data
```

---

## Deployment

### Deploying to Vercel / Netlify / Custom Server

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Set environment variables** on your hosting platform (see [Environment Variables](#environment-variables)).

3. **Ensure the database** is accessible from the deployment environment.

4. **Run migrations** on first deploy:

   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

### Deploying with Docker

```bash
# Build image
docker build -t relocompass .

# Run container
docker run -p 3000:3000 --env-file .env relocompass
```

---

## Folder Structure

```
ReloCompass_App/
├── prisma/
│   ├── schema.prisma          # Database schema (14 models)
│   ├── seed.ts                # Demo data seeder
│   └── migrations/            # Database migrations
├── public/
│   ├── favicon.svg            # Brand favicon
│   ├── icon-*.png             # PWA & app icons
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected app pages
│   │   │   ├── accommodation/ # Accommodation hub
│   │   │   ├── assistant/     # AI chat assistant
│   │   │   ├── budget/        # Budget planner
│   │   │   ├── candidates/    # Employer candidate search
│   │   │   ├── checklist/     # Relocation checklist
│     │   │   ├── community/   # Community hub
│   │   │   ├── dashboard/     # Role-based dashboard home
│   │   │   ├── jobs/          # Job board + posting
│   │   │   ├── profile/       # User preferences
│   │   │   └── transport/     # Transportation guides
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── chat/          # AI assistant endpoint
│   │   │   ├── jobs/          # Jobs CRUD
│   │   │   ├── accommodation/ # Listings API
│   │   │   └── ...            # Other API routes
│   │   ├── globals.css        # Global styles + design system
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Button, Card, Input, Badge
│   │   ├── brand/             # Logo & wordmark components
│   │   └── dashboard/         # Sidebar component
│   ├── config/
│   │   ├── constants.ts       # App constants
│   │   └── destinations.ts    # Countries, cities, types
│   ├── lib/
│   │   ├── ai/                # AI prompts & config
│   │   ├── __tests__/         # Unit tests
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── validators.ts      # Zod validation schemas
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── jest.config.ts             # Jest configuration
├── jest.setup.ts              # Jest setup
├── next.config.ts             # Next.js config
├── package.json
├── tsconfig.json
└── .env                       # Environment (never committed)
```

---

## User Roles

The platform supports three roles with distinct dashboards and permissions:

### Student & Job Seeker
- Access AI assistant, accommodation search, job board, budget planner, checklist, transport guides, and community
- Set personal preferences for personalized AI recommendations
- Save favorite accommodations and track job applications

### Employer
- Post and manage job listings
- Search and filter candidates by skills, experience, and visa status
- View and manage applications through the dashboard

---

## Future Roadmap

- [ ] **Mobile Apps** — Native Android (Kotlin) and iOS (Swift) applications
- [ ] **Verified Partnerships** — Direct integration with verified landlords and employers
- [ ] **Mentorship Network** — Connect experienced expatriates with newcomers
- [ ] **Visa Processing API** — Real-time visa status updates from government APIs
- [ ] **AI Document Review** — Automated CV, rental application, and visa form review
- [ ] **Multi-language Support** — Interface localization for Hindi, Nepali, and more
- [ ] **In-Platform Messaging** — Direct communication between employers and candidates
- [ ] **Payment Integration** — Subscription plans for premium employer features
- [ ] **Analytics Dashboard** — Advanced hiring and relocation analytics

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Guidelines

- Follow the existing code style and naming conventions
- Add tests for new features
- Ensure all tests pass (`npm test`) before submitting
- Keep PRs focused — one feature per PR
- Write clear commit messages

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 ReloCompass

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, restriction...
```

---

<div align="center">

**ReloCompass** — Made with care for India & Nepal.

[Report Bug](https://github.com/jh-prakhar/ReloCompass_App/issues) · [Request Feature](https://github.com/jh-prakhar/ReloCompass_App/issues) · [Live Demo](https://relocompass-tpfpaa.drytis.dev/)

</div>
