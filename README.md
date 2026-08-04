# 🧭 ReloCompass

### AI-Powered Global Relocation, Student Success & Employment Assistant

<p align="center">
  <img src="public/icon-512.png" alt="ReloCompass Logo" width="120"/>
</p>

<p align="center">
  Helping people from India & Nepal relocate abroad for education or employment — with AI guidance, verified listings, job matching, and community support.
</p>

<p align="center">
  <a href="#features"><img alt="Features" src="https://img.shields.io/badge/Features-AI%20Powered-blue?style=for-the-badge"/></a>
  <a href="#technology-stack"><img alt="Tech Stack" src="https://img.shields.io/badge/Stack-Next.js%2016-black?style=for-the-badge"/></a>
  <a href="#license"><img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/></a>
  <a href="#live-demo"><img alt="Live Demo" src="https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge"/></a>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [AI Capabilities](#ai-capabilities)
- [Technology Stack](#technology-stack)
- [Live Demo](#live-demo)
- [Installation](#installation)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Folder Structure](#folder-structure)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Future Roadmap](#future-roadmap)
- [License](#license)

---

## 🌍 Overview

**ReloCompass** is an AI-powered web platform designed to support the complete relocation journey — from the first decision to move abroad, through preparation, arrival, and settling into a new country.

The platform serves three roles:
- **Students** pursuing education abroad
- **Job Seekers** looking for employment opportunities overseas
- **Employers** hiring international talent from India and Nepal

---

## 🔴 Problem Statement

Every year, hundreds of thousands of students and professionals from India and Nepal move abroad. The process is complex, stressful, and filled with uncertainty:

| Challenge | Impact |
|---|---|
| **Fragmented Information** | Relocation requires juggling dozens of sources — visa portals, university sites, housing platforms, and forums. |
| **Trust & Safety Concerns** | International movers are vulnerable to scams, from fake landlords to fraudulent job offers. |
| **Language & Cultural Barriers** | Understanding local norms, tenant rights, and professional etiquette in a new country is overwhelming. |
| **Social Isolation** | Moving abroad means leaving behind support networks and starting from scratch. |
| **Financial Uncertainty** | Without accurate cost-of-living data, budgeting for a new country is guesswork. |

---

## ✅ Solution

ReloCompass brings the entire relocation journey into one integrated platform:

- 🤖 **AI Assistant** — 24/7 personalized guidance on visas, housing, jobs, and cultural tips
- 🏠 **Accommodation Hub** — Verified listings with safety ratings and scam-prevention guidance
- 💼 **Job Board & Matching** — Employer-posted jobs with AI-powered candidate matching
- 🚌 **Transportation Guide** — Local transit systems, student passes, and travel cards
- 💰 **Budget Planner** — Cost-of-living calculators tailored to each destination city
- ✅ **Relocation Checklist** — Trackable pre-departure, packing, and post-arrival tasks
- 👥 **Community Hub** — Student clubs, cultural groups, mentorship programs, and events

---

## ✨ Features

### AI Relocation Assistant
- Personalized chat interface powered by AI
- Context-aware guidance based on user profile and destination
- Creates personalized checklists and recommendations
- Available 24/7 — reduces reliance on expensive immigration consultants

### Accommodation Hub
- Browse dorms, shared apartments, and homestays
- Filter by country, city, type, and budget
- Safety ratings and amenity information
- Scam-prevention awareness section
- Save favorites

### Job Board & Matching
- Employer-posted job opportunities
- Filter by location, visa sponsorship, job type
- AI-powered candidate matching for employers
- Direct application management
- Verified employer badges

### Transportation Guide
- Local transit system information for major cities
- Student discount passes and monthly passes
- City-by-city navigation guidance

### Budget Planner
- Interactive cost-of-living calculator
- 7 budget categories (rent, food, transport, utilities, insurance, entertainment, tuition)
- Monthly expense estimation with emergency savings recommendation
- Adjustable sliders for each category

### Relocation Checklist
- Pre-departure, packing, and post-arrival task tracking
- Progress tracking with visual indicators
- Add custom tasks
- Auto-seeds with 30 common relocation tasks

### Community Hub
- Student clubs, cultural organizations, and professional networks
- Mentorship programs and volunteer opportunities
- Upcoming community events
- Filter by country

### Premium UI/UX
- Modern design system with Midnight Blue, Electric Blue, and Cyan palette
- Glassmorphism effects and animated gradient backgrounds
- Framer Motion animations (fade-in, scroll progress, staggered reveals)
- Fully responsive — mobile, tablet, desktop
- Lucide SVG icons throughout
- PWA-ready with manifest and app icons

---

## 🤖 AI Capabilities

The AI assistant is at the heart of ReloCompass. It uses each user's profile — destination, budget, timeline, career goals, and accommodation preferences — to provide personalized, context-aware guidance.

| Capability | Description |
|---|---|
| **Relocation Q&A** | Answers relocation questions in plain language — from visa requirements to housing searches |
| **Personalized Checklists** | Creates customized checklists based on the user's destination and timeline |
| **Accommodation Recommendations** | Suggests options matching the user's budget and preferences |
| **Employer Guidance** | Helps employers write effective job descriptions and provides candidate matching |
| **Cultural Tips** | Offers practical advice for settling into a new country |
| **Always Available** | Available 24/7, reducing reliance on expensive immigration consultants |

> ⚠️ **Important:** The AI assistant provides guidance only. For visa, immigration, and legal matters, always verify with official government sources.

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Custom design system + Lucide icons |
| **Animations** | Framer Motion |
| **Database** | MySQL |
| **ORM** | Prisma |
| **Authentication** | NextAuth.js (Credentials Provider + bcrypt) |
| **AI Integration** | OpenAI-compatible API (GLM-5 model) |
| **Testing** | Jest + Supertest |
| **Icons** | Lucide React |
| **Deployment** | Docker + Caddy reverse proxy |

---

## 🌐 Live Demo

- **Web App**: [https://relocompass-tpfpaa.drytis.dev/](https://relocompass-tpfpaa.drytis.dev/)
- **Mobile Apps**: Coming soon (Android & iOS in development)

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Student | student@test.com | testpass123 |
| Employer | employer@test.com | testpass123 |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- MySQL database
- An OpenAI-compatible API key (or use the built-in gateway)

### Setup

```bash
# Clone the repository
git clone https://github.com/jh-prakhar/relocompass.git
cd relocompass

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, NextAuth secret, and AI API key

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed the database with sample data
npx tsx prisma/seed.ts

# Build and run
npm run build
npm run start
```

The app will be available at `http://localhost:3000`.

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Run tests
npm test

# Run Prisma Studio (database GUI)
npx prisma studio
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mysql://user:password@localhost:3306/relocompass"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
OPENAI_API_KEY="your-ai-api-key"
OPENAI_BASE_URL="https://your-ai-gateway-url"
```

---

## 🚀 Deployment

### Standard Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Run database migrations:**
   ```bash
   npx prisma db push
   ```

3. **Seed initial data:**
   ```bash
   npx tsx prisma/seed.ts
   ```

4. **Start the production server:**
   ```bash
   npm run start
   ```

### Docker Deployment

```bash
# Build the image
docker build -t relocompass .

# Run the container
docker run -p 3000:3000 --env-file .env relocompass
```

---

## 📁 Folder Structure

```
relocompass/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Migration files
├── public/
│   ├── icon-*.png             # App icons (multiple sizes)
│   ├── favicon.*              # Favicon files
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Dashboard pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── assistant/     # AI chat interface
│   │   │   ├── accommodation/ # Accommodation listings
│   │   │   ├── transport/     # Transportation guides
│   │   │   ├── jobs/          # Job board & posting
│   │   │   ├── candidates/    # Employer candidate search
│   │   │   ├── community/     # Community hub
│   │   │   ├── budget/        # Budget planner
│   │   │   ├── checklist/     # Relocation checklist
│   │   │   └── profile/       # User preferences
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── api/               # API route handlers
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── chat/          # AI chat endpoint
│   │   │   ├── jobs/          # Jobs CRUD
│   │   │   ├── candidates/    # Candidate search
│   │   │   ├── accommodation/ # Listings search
│   │   │   ├── checklist/     # Checklist CRUD
│   │   │   ├── budget/        # Budget estimates
│   │   │   ├── community/     # Community data
│   │   │   ├── transport/     # Transport guides
│   │   │   ├── favorites/     # Save/unsave listings
│   │   │   ├── profile/       # User preferences
│   │   │   ├── register/      # Registration endpoint
│   │   │   ├── applications/  # Job applications
│   │   │   └── contact/       # Contact form
│   │   ├── globals.css        # Global styles + design system
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── brand/             # Brand logo components
│     ├── dashboard/           # Dashboard sidebar
│   │   └── ui/                # Reusable UI components
│   ├── config/
│   │   ├── constants.ts       # App constants
│   │   └── destinations.ts    # Country/city data
│   ├── lib/
│   │   ├── ai/                # AI prompt builder
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client
│   │   └── validators.ts      # Zod schemas
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Route protection
├── jest.config.ts             # Test configuration
├── next.config.ts             # Next.js config
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

---

## 👤 User Roles

### Student & Job Seeker
- AI relocation assistant
- Accommodation search and favorites
- Job board with filtering and applications
- Transportation guides
- Budget planner
- Relocation checklist
- Community hub access
- Personalized preferences

### Employer
- Post job opportunities
- AI-powered candidate matching
- Candidate search with filters (skills, country, experience, visa status)
- Application management dashboard
- Verified employer badge

---

## 🗄 Database Schema

The platform uses 12 Prisma models:

| Model | Purpose |
|---|---|
| `User` | User accounts with role-based access |
| `UserPreference` | Personalized relocation preferences |
| `Company` | Employer company profiles |
| `Job` | Job postings |
| `Application` | Job applications with status tracking |
| `Accommodation` | Housing listings with safety ratings |
| `Favorite` | Saved accommodations |
| `TransportGuide` | City transit guides |
| `BudgetEstimate` | Cost-of-living data per city |
| `CommunityGroup` | Student/cultural/professional groups |
| `CommunityEvent` | Community events |
| `ChecklistItem` | User relocation tasks |
| `ChatSession` | AI assistant conversation history |

---

## 🗺 Future Roadmap

- [ ] Mobile apps for Android and iOS
- [ ] Expand to support more source countries beyond India & Nepal
- [ ] Verified landlord and employer partnerships
- [ ] Mentorship network connecting experienced expatriates with newcomers
- [ ] Real-time visa processing updates
- [ ] AI-powered document review (CVs, rental applications, visa forms)
- [ ] Multi-language support
- [ ] In-app messaging between users and employers/landlords
- [ ] Integration with university course catalogs
- [ ] Predictive analytics for relocation success

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

**Prakhar Jha**  
📧 [prakharnpp@gmail.com](mailto:prakharnpp@gmail.com)  
🌐 [Portfolio](https://jh-prakhar.github.io/prakhar_protfolio/)

---

<p align="center">
  Made with care for India & Nepal 🧭
</p>
