# FindYourTeacher — Backend

NestJS REST API for the FindYourTeacher language teaching marketplace.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10 (TypeScript, strict mode)
- **Database**: PostgreSQL on Neon (serverless)
- **ORM**: Prisma 6
- **Auth**: JWT (access + refresh tokens), Passport
- **Validation**: class-validator + class-transformer
- **Security**: helmet, CORS, bcrypt, @nestjs/throttler

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npx prisma generate
npx prisma migrate dev
```

## Running

```bash
npm run start:dev       # development (watch mode)
npm run start:prod      # production
npx prisma studio       # database GUI at localhost:5555
```

## API Routes

| Module          | Prefix                  | Endpoints                                                 |
|-----------------|-------------------------|-----------------------------------------------------------|
| Auth            | `/api/auth`             | register, login, refresh, logout                          |
| Users           | `/api/users`            | me                                                        |
| Teachers        | `/api/teachers`         | profile CRUD, availability CRUD, browse, public profile   |
| Onboarding      | `/api/onboarding`       | book call, student/teacher lists, confirm/cancel/done     |
| Groups          | `/api/groups`           | CRUD, browse, join/leave, membership approval/removal     |
| Sessions        | `/api/sessions`         | schedule, start/end/cancel, session detail, Jitsi rooms   |
| Payments        | `/api/payments`         | buy credits, verify (Flouci), student balances, earnings  |
| Recommendations | `/api/recommendations`  | create/edit review, teacher reviews, admin approve/reject |

## Environment Variables

See `.env.example` for the full list. All are validated at startup via Joi.
