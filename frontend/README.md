# FindYourTeacher — Frontend

Next.js 14 App Router frontend for the FindYourTeacher language teaching marketplace.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript, strict mode)
- **Styling**: Tailwind CSS
- **i18n**: next-intl (French default, English)
- **Server State**: TanStack Query (React Query)
- **HTTP Client**: axios with interceptors for auto token refresh

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your values
```

## Running

```bash
npm run dev     # development at localhost:3000
npm run build   # production build
npm run start   # production server
```

## Routes

| Route                                        | Description                            |
|----------------------------------------------|----------------------------------------|
| `/[locale]`                                  | Landing page                           |
| `/[locale]/login`                            | Login                                  |
| `/[locale]/register`                         | Register (supports ?role=teacher)      |
| `/[locale]/teachers`                         | Browse teachers (public)               |
| `/[locale]/teachers/[id]`                    | Teacher profile + booking flow         |
| `/[locale]/groups`                           | Browse groups (public)                 |
| `/[locale]/groups/[id]`                      | Group detail + join flow               |
| `/[locale]/dashboard/teacher`                | Teacher dashboard (protected)          |
| `/[locale]/dashboard/teacher/profile`        | Edit teacher profile                   |
| `/[locale]/dashboard/teacher/availability`   | Manage availability slots              |
| `/[locale]/dashboard/teacher/calls`          | Discovery calls (confirm/cancel)       |
| `/[locale]/dashboard/teacher/groups`         | Manage groups (create, deactivate)     |
| `/[locale]/dashboard/teacher/groups/[id]`    | Group member management                |
| `/[locale]/dashboard/student`                | Student dashboard (protected)          |
| `/[locale]/dashboard/student/calls`          | Student's onboarding calls             |
| `/[locale]/dashboard/student/groups`         | Student's group memberships            |

## i18n

Translation files are in `/messages/fr.json` and `/messages/en.json`. All UI text is externalized — nothing hardcoded.
