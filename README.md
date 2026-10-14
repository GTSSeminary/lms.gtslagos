# GTS Student LMS

A **standalone, student-facing Learning Management System (SPA)** for GTS Seminary
students. It is a **separate application** that consumes the existing GTS **admin API** —
it has **no backend of its own** and **never touches the admin database directly**.

## Stack

- **Vite + React 19 (JavaScript, not TypeScript)**
- **Tailwind CSS v4**
- **React Router v7**
- Functional components + hooks

This mirrors the admin client's stack for compatibility.

## Design system

- Primary indigo `#4F46E5` (Tailwind `indigo-600`)
- Page background `#F8FAFC` (Tailwind `slate-50`)
- White cards, `rounded-3xl` (24px), subtle shadow, `gap-4` spacing
- Fonts: **Outfit** (display/headings), **Inter** (body), **JetBrains Mono** (data/numbers)
  loaded via Google Fonts `<link>` in `index.html`

## Getting started

```bash
npm install
npm run dev
```

The app reads the API base URL from `VITE_API_URL`, falling back to
`https://api.gtslagos.com`. Copy `.env.example` to `.env` and adjust if needed:

```bash
cp .env.example .env
```

```
VITE_API_URL=https://api.gtslagos.com
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally

## Pages

| Route                | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `/login`             | Student email/password login                         |
| `/forgot-password`   | Request a password reset code                        |
| `/reset-password`    | Reset password with code                             |
| `/dashboard`         | Greeting + summary cards + quick links               |
| `/study-guide`       | Study plan timeline                                  |
| `/courses`           | Courses grouped by state                             |
| `/courses/:courseId` | Course overview, sessions, materials, attendance     |
| `/exams`             | MCQ (admin quiz in new tab) + essay inline submit    |
| `/results`           | Pass/Fail results table                              |
| `/attendance`        | Per-course attendance vs. minimum                    |
| `/graduation`        | Graduation status & set info                         |
| `/profile`           | Account details                                      |

## Deploying to Vercel (lms.gtslagos.com)

1. Push this repo to GitHub/GitLab and import it into Vercel.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add the environment variable `VITE_API_URL=https://api.gtslagos.com`.
4. Add a domain: `lms.gtslagos.com` (configure DNS / Vercel's auto-DNS).
5. `vercel.json` already rewrites all routes to `index.html` for SPA routing.
