# Note!t
<img width="1872" height="956" alt="image" src="https://github.com/user-attachments/assets/05971dde-9153-47e4-80c6-d57de77e5113" />

An AI-powered notes application that automatically extracts actionable tasks, generates smart summaries, discovers relationships between notes, and produces daily digests — all in real time as you write.

Built as a full-stack monorepo with a React 19 + TypeScript frontend and an Express + MongoDB backend, backed by OpenAI GPT-4o-mini.

---

## Features

- **Rich-text note editor** — Tiptap-powered editor with inline bubble menu for bold, italic, lists, and more
- **AI summarization** — Every note is automatically summarized (≤2 sentences) and tagged with 3–5 relevant keywords on save
- **Automatic task extraction** — Action items mentioned in any note are turned into structured tasks with title, priority, due date, and recurrence — without any manual input
- **Note relationships** — Notes with overlapping topics are linked automatically, forming a personal knowledge graph
- **Daily digest** — A curated briefing of the day's notes, pending tasks, and focus areas, generated on demand
- **Multiple views** — Switch between a masonry grid, a weekly calendar, and a list view for both notes and tasks
- **Kanban task board** — Three-column board (Todo / In Progress / Done) with priority sorting and status transitions
- **Google OAuth + email/password auth** — Two sign-in options with JWT-based session management (7-day tokens)
- **Per-user AI usage tracking** — Configurable daily limit (default: 100 AI operations), resets at midnight
- **Theme-coloured notes** — Each note can be tinted: lavender, mint, sky, peach, or gray

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.9, Vite 7 |
| Styling | TailwindCSS 4, Radix UI, shadcn/ui |
| Rich text | Tiptap 3 (BubbleMenu, StarterKit) |
| Animations | Framer Motion 12, GSAP 3 |
| Data fetching | TanStack React Query 5, Axios |
| Auth (client) | @react-oauth/google, JWT in localStorage |
| Backend | Express 5, Node.js (ES Modules) |
| Database | MongoDB 7 via Mongoose 9 |
| AI | OpenAI SDK 6 (GPT-4o-mini, temp 0.2) |
| Auth (server) | bcrypt, google-auth-library, jsonwebtoken |
| Dev tooling | nodemon, ESLint, concurrently |

---

## Project Structure

```
/                          ← npm workspaces root
├── apps/
│   ├── api/               ← Express + Mongoose backend
│   │   └── src/
│   │       ├── ai/        ← OpenAI integration modules
│   │       ├── middleware/ ← JWT auth middleware
│   │       ├── models/    ← Mongoose schemas
│   │       ├── routes/    ← REST route handlers
│   │       └── utils/     ← AI usage tracking, JWT helpers
│   └── web/               ← React 19 + TypeScript frontend
│       └── src/
│           ├── api/       ← Axios client (auto-injects Bearer token)
│           ├── components/← shadcn-style UI primitives
│           └── features/  ← notes, tasks, auth, digest, general
└── packages/              ← Reserved for future shared packages
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)
- An OpenAI API key
- A Google OAuth 2.0 Client ID (and secret)

### 1. Clone and install

```bash
git clone <repo-url>
cd "ThinkStack - notes app"
npm install
```

### 2. Configure the backend

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in `apps/api/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/thinkstack
OPENAI_API_KEY=sk-...
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

### 3. Configure the frontend

```bash
cp apps/web/.env.example apps/web/.env
```

Fill in `apps/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

> **Note:** All `VITE_*` variables are bundled into the client-side JS at build time and are visible in the browser. Never put secrets (API keys, database URIs) in the frontend `.env`.

### 4. Run the app

```bash
npm run dev
```

This starts both servers concurrently:
- API: `http://localhost:5000`
- Web: `http://localhost:5173`

---

## Environment Variables

### Backend (`apps/api/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Port the Express server listens on |
| `MONGO_URI` | Yes | MongoDB connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI features |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID (server-side verification) |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |

### Frontend (`apps/web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Base URL of the backend API |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID (triggers the Google login popup) |

---

## AI Pipeline

When a note is saved or updated, three AI operations run in sequence:

```
Note saved
    │
    ├─► summarizeNote()   → aiSummary (≤2 sentences) + tags (3–5 keywords)
    │                        Model: gpt-4o-mini | Temp: 0.2 | Timeout: 5s | Retries: 2
    │
    ├─► extractTasks()    → structured tasks with title, priority, dueAt, recurrence
    │                        Parses relative dates ("tomorrow", "next Friday")
    │                        Infers priority from urgency language ("asap" → high)
    │
    └─► findRelations()   → keyword-overlap similarity against all user's notes
                             Creates Relation docs if Jaccard score > 0.2
```

Processing status on the note cycles: `idle → processing → completed | failed`

A per-user daily AI usage counter caps total operations at 100 (configurable). The counter resets at midnight.

---

## API Overview

Full documentation is in [apps/api/README.md](apps/api/README.md).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | — | Register with email + password |
| POST | `/auth/login` | — | Login, returns JWT |
| POST | `/auth/google` | — | Google OAuth login/register |
| GET | `/auth/me` | JWT | Get current user |
| POST | `/notes` | JWT | Create note, triggers AI pipeline |
| GET | `/notes` | JWT | List notes (search, date range, pagination) |
| PATCH | `/notes/:id` | JWT | Update note, re-runs AI pipeline |
| DELETE | `/notes/:id` | JWT | Delete note + tasks + relations |
| GET | `/tasks` | JWT | List tasks (filter by status or due date) |
| PATCH | `/tasks/:id` | JWT | Update task status |
| DELETE | `/tasks/:id` | JWT | Delete task |
| POST | `/digest/generate` | JWT | Generate today's daily digest |
| GET | `/digest` | JWT | Get today's digest |

---

## Data Models

| Model | Key Fields |
|-------|-----------|
| **User** | email, name, picture, passwordHash, provider (local/google), aiUsageCount, aiUsageLimit |
| **Note** | title, body (HTML), tags[], aiSummary, theme, processingStatus, extractedTasks[], relations[] |
| **Task** | title, status (todo/in_progress/done), priority (low/medium/high), dueAt, recurrence, sourceNote |
| **Relation** | fromNoteId, toNoteId, type (similar/reference/follow_up), confidence (0–1) |
| **DailyDigest** | dateKey (YYYY-MM-DD), summary, highlights[], focusAreas[], noteIds[], taskIds[] |

---

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start API + web dev servers concurrently (run from root) |
| `npm run dev --workspace=apps/api` | Start only the backend (nodemon) |
| `npm run dev --workspace=apps/web` | Start only the frontend (Vite HMR) |
| `npm run build --workspace=apps/web` | TypeScript check + production build |
| `npm run lint --workspace=apps/web` | ESLint check |
| `npm run preview --workspace=apps/web` | Preview the production build locally |

---

## Auth Flow

1. User signs up or logs in → server returns a signed JWT (7-day expiry)
2. JWT is stored in `localStorage`
3. The Axios client (`apps/web/src/api/client.ts`) automatically injects it as `Authorization: Bearer <token>` on every request
4. The server's `authMiddleware` verifies the token and attaches `req.user` to the request
5. On 401, the frontend clears the token and redirects to login

For Google OAuth: the browser sends a Google ID token to `/auth/google`; the server verifies it using `google-auth-library`, then issues its own JWT.

---

## Known Limitations / Roadmap

- The `findRelations` module currently uses keyword overlap (Jaccard similarity), not an LLM call — planned upgrade to embedding-based semantic search
- The Daily Digest backend is complete; the frontend UI tab shows "Coming Soon"
- No automated tests yet (`npm test` is a placeholder)
- The `packages/` directory is reserved for future shared packages (e.g., shared types between API and web)
