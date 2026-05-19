# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThinkStack is a full-stack AI-powered notes app. It extracts tasks from notes, generates summaries/tags, finds relations between notes, and produces daily digests. Built as an npm workspace monorepo with a React/TypeScript frontend and Express/MongoDB backend.

## Commands

### Run everything (from repo root)
```bash
npm run dev
```
This concurrently starts both the API (nodemon) and web (Vite) dev servers.

### Backend only (`apps/api`)
```bash
npm run dev --workspace=apps/api   # nodemon on src/server.js
```

### Frontend only (`apps/web`)
```bash
npm run dev --workspace=apps/web   # Vite dev server
npm run build --workspace=apps/web # tsc -b && vite build
npm run lint --workspace=apps/web  # eslint .
npm run preview --workspace=apps/web
```

## Environment Setup

**`apps/api/.env`** (required keys):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/noteit
OPENAI_API_KEY=
JWT_SECRET=
GOOGLE_CLIENT_ID=
```

**`apps/web/.env`** (required keys):
```
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=
```

## Architecture

### Monorepo layout
```
/                        ← root (npm workspaces: apps/*, packages/*)
├── apps/api/            ← Express + Mongoose backend
└── apps/web/            ← React 19 + TypeScript + Vite frontend
```

### Backend (`apps/api/src/`)

Entry point: `server.js` — registers CORS, JSON parsing, all routes, connects Mongoose.

| Directory | Purpose |
|-----------|---------|
| `routes/` | `auth`, `notes`, `tasks`, `digest` — REST handlers |
| `models/` | Mongoose schemas: `User`, `Note`, `Task`, `Relation`, `DailyDigest` |
| `ai/` | OpenAI integrations (gpt-4o-mini, temp 0.2) |
| `middleware/auth.js` | JWT validation — applied to all protected routes |
| `utils/aiUsage.js` | Per-user daily AI quota (default 100 ops, resets midnight) |
| `utils/jwt.js` | Token generation (7-day expiry) |

**AI pipeline per note save:**
1. `summarizeNote.js` → summary + tags (JSON output)
2. `extractTasks.js` → task array with title, dueAt, recurrence, priority
3. `findRelation.js` → keyword-overlap comparison against existing notes → `Relation` docs

Note processing status cycles: `idle → processing → completed | failed`

### Frontend (`apps/web/src/`)

Entry point: `main.tsx` — wraps app in `QueryClientProvider` and `GoogleOAuthProvider`.

`App.tsx` handles top-level auth routing (unauthenticated → `authLayout`, authenticated → tabbed shell with Notes/Tasks/Digest).

| Directory | Purpose |
|-----------|---------|
| `api/client.ts` | Axios instance — attaches `Authorization: Bearer <token>` from localStorage on every request |
| `features/auth/` | Login (email+password + Google OAuth), Signup |
| `features/notes/` | `Notes.tsx` (masonry list, search), `NoteCard.tsx`, `NotesCalendarView.tsx` |
| `features/tasks/` | `Tasks.tsx` (filtered list), `TaskCard.tsx`, `TasksCalendarView.tsx` |
| `features/digest/` | `Digest.tsx` — manual trigger + display |
| `features/general/` | `Editor.tsx` (Tiptap rich text), `AiUsage.tsx`, `Landing.tsx` |
| `components/ui/` | shadcn-style primitives (Button, Input, Tabs, DropdownMenu, Avatar, …) |

**State management:** React Query for all server state; `useState` for local UI state. No global client-side store.

**Auth flow:** JWT stored in `localStorage` → Axios interceptor adds header → 401 responses clear token and redirect to login.

## Key Data Models

**Note:** `title`, `body` (HTML from Tiptap), `tags[]`, `aiSummary`, `theme` (lavender/mint/sky/peach/gray), `processingStatus`, `tasks[]` (refs), `relations[]` (refs)

**Task:** `title`, `status` (todo/in_progress/done), `priority` (low/medium/high), `dueAt`, `recurrence`, `sourceNote` (ref), `sourceText`

**Relation:** `noteA`, `noteB`, `type` (similar/reference/follow_up), `confidenceScore`

**DailyDigest:** keyed by `userId + date`, contains `summary`, `highlights[]`, `focusAreas[]`

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Radix UI |
| Rich text | Tiptap (with BubbleMenu for bold/italic/lists) |
| Data fetching | TanStack React Query + Axios |
| Auth (client) | `@react-oauth/google`, JWT in localStorage |
| Backend | Express.js, Node.js |
| Database | MongoDB via Mongoose |
| AI | OpenAI SDK (`gpt-4o-mini`) |
| Auth (server) | bcrypt passwords, `google-auth-library`, JWT |
| Dev tooling | nodemon (API), ESLint + TypeScript (web), concurrently (root) |

## Notes

- Tests are not yet implemented (`npm test` in api is a placeholder).
- `packages/` directory exists but is empty — reserved for future shared packages.
- Search is debounced 300ms on the frontend; filtering (status, today, overdue) is client-side on already-fetched tasks.
- The `findRelation.js` AI module currently uses keyword overlap (not an LLM call); the others call OpenAI with retry/timeout logic.
