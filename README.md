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
- **Discovery calls** — Students book short placement calls from teacher availability. Teachers confirm or cancel. Sidebar badges show pending (red) and confirmed (yellow) counts
- **Groups** — Teachers create language groups (level, audience, max students, price). Students browse and request to join. Teachers approve or remove members. Sidebar badge for pending requests
- **Public browse** — Filter teachers by language/audience. Filter groups by language/level/audience. Paginated results
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

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Backend    | NestJS 10, TypeScript, Prisma 6, Passport JWT |
| Frontend   | Next.js 14, Tailwind CSS, next-intl, TanStack Query |
| Database   | PostgreSQL (Neon serverless)                  |
| Auth       | JWT access (15min) + refresh (7d, httpOnly)   |
| Currency   | Tunisian Dinar (TND), Decimal(10,3)           |

## API Modules

| Module      | Prefix              | Description                                         |
|-------------|---------------------|-----------------------------------------------------|
| Auth        | `/api/auth`         | Register, login, refresh, logout                    |
| Users       | `/api/users`        | Current user profile                                |
| Teachers    | `/api/teachers`     | Profile CRUD, availability, browse, public profile  |
| Onboarding  | `/api/onboarding`   | Book/confirm/cancel discovery calls                 |
| Groups      | `/api/groups`       | Group CRUD, browse, join/leave, membership mgmt     |

## Project Status

- [x] Phase 1 — Foundation (NestJS, Next.js, Prisma, JWT auth, i18n)
- [x] Phase 2 — Teacher Core (profiles, availability, browse)
- [x] Phase 3 — Student Core (onboarding calls, groups, student dashboard)
- [ ] Phase 4 — Sessions & Video (Jitsi Meet integration)
- [ ] Phase 5 — Payments & Recommendations
- [ ] Phase 6 — CI/CD, Testing, Deploy

## License

Private — all rights reserved.
