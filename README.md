# FindYourTeacher

A language teaching marketplace for Tunisia. Teachers create profiles, manage availability and groups. Students browse teachers, book discovery calls, and join group classes.

## Architecture

```
FindYourTeacher/
├── backend/          # NestJS 10 REST API
├── frontend/         # Next.js 14 App Router
└── README.md
```

**Backend** — NestJS with Prisma ORM, PostgreSQL (Neon serverless), JWT auth with refresh token rotation, class-validator DTOs, role-based guards.

**Frontend** — Next.js 14 App Router, Tailwind CSS, next-intl (FR/EN), TanStack Query, axios with auto token refresh.

## Features

- **Authentication** — Register/login as student or teacher, JWT access + refresh tokens, httpOnly cookie rotation with reuse detection
- **Teacher profiles** — Bio, languages taught, audience types, availability slots
- **Discovery calls** — Students book short placement calls from teacher availability. Teachers confirm, mark done, or cancel. Teachers see student phone/email for contact. Sidebar badges show pending (red) and confirmed (yellow) counts
- **Groups** — Teachers create language groups (level, audience, max students, price). Students browse and request to join. Teachers approve or remove members. Sidebar badge for pending requests
- **Sessions & Video** — Teachers schedule sessions for groups. Jitsi Meet embedded video rooms. Teachers start/end/cancel sessions
- **Session Credits** — Students buy 1-4 session credits per group via Flouci payment gateway. Credits consumed when teacher ends a session. Sandbox mode for development
- **Recommendations** — Students leave optional star rating + comment for teachers. Rating-only reviews auto-approved. Comments require admin approval. Students can edit their review
- **Admin Dashboard** — Admin role can approve or reject recommendation comments
- **Public browse** — Search teachers by name, filter by language/audience. Filter groups by language/level/audience. Paginated results
- **Navigation** — Students can browse teachers and groups from their dashboard. Public pages detect auth and show dashboard link
- **i18n** — Full French and English support, locale-prefixed routes

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### Backend

```bash
cd backend
npm install
cp .env.example .env          # fill in DB URL, JWT secrets, etc.
npx prisma generate
npx prisma migrate dev
npm run start:dev              # runs on localhost:3001
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # set NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev                    # runs on localhost:3000
```

### Docker (alternative)

```bash
docker compose up              # starts PostgreSQL, backend, and frontend
```

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Backend    | NestJS 10, TypeScript, Prisma 6, Passport JWT |
| Frontend   | Next.js 14, Tailwind CSS, next-intl, TanStack Query |
| Database   | PostgreSQL (Neon serverless)                  |
| Auth       | JWT access (15min) + refresh (7d, httpOnly)   |
| Testing    | Jest (backend unit tests)                     |
| CI/CD      | GitHub Actions (lint, typecheck, test, build)  |
| Dev Env    | Docker Compose (PostgreSQL, backend, frontend) |
| Currency   | Tunisian Dinar (TND), Decimal(10,3)           |

## API Modules

| Module          | Prefix                  | Description                                         |
|-----------------|-------------------------|-----------------------------------------------------|
| Auth            | `/api/auth`             | Register, login, refresh, logout                    |
| Users           | `/api/users`            | Current user profile                                |
| Teachers        | `/api/teachers`         | Profile CRUD, availability, browse, public profile  |
| Onboarding      | `/api/onboarding`       | Book/confirm/cancel/done discovery calls            |
| Groups          | `/api/groups`           | Group CRUD, browse, join/leave, membership mgmt     |
| Sessions        | `/api/sessions`         | Schedule, start/end/cancel sessions, Jitsi rooms    |
| Payments        | `/api/payments`         | Buy credits (Flouci), verify, balances, earnings    |
| Recommendations | `/api/recommendations`  | Student reviews, admin approve/reject               |

## Deployment

**Backend** → [Render](https://render.com) (free tier, auto-deploy from GitHub)
**Frontend** → [Vercel](https://vercel.com) (optimized for Next.js)
**Database** → [Neon](https://neon.tech) (serverless PostgreSQL)

### Deploy steps

1. Push code to GitHub
2. **Render**: New Web Service → connect repo → it reads `render.yaml` → set env vars (`DATABASE_URL`, `FRONTEND_URL`, `FLOUCI_APP_TOKEN`, `FLOUCI_APP_SECRET`)
3. **Vercel**: Import project → root directory = `frontend` → set `NEXT_PUBLIC_API_URL` to Render backend URL
4. Update Render `FRONTEND_URL` env var to the Vercel deployment URL

## Project Status

- [x] Phase 1 — Foundation (NestJS, Next.js, Prisma, JWT auth, i18n)
- [x] Phase 2 — Teacher Core (profiles, availability, browse)
- [x] Phase 3 — Student Core (onboarding calls, groups, student dashboard)
- [x] Phase 4 — Sessions & Video (Jitsi Meet integration)
- [x] Phase 5 — Payments (Flouci), Recommendations, Admin Dashboard
- [x] Phase 6 — CI/CD, Unit Tests, Docker Dev Environment

## License

Private — all rights reserved.
