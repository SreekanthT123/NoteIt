# ThinkStack — Web

React 19 + TypeScript + Vite frontend for the ThinkStack notes app. Provides a rich-text note editor, a Kanban task board, multiple view modes, and Google OAuth sign-in — all connected to the ThinkStack API.

---

## Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.4 | UI framework |
| TypeScript | ~5.9.3 | Type safety |
| Vite | 7.3.1 | Dev server and production bundler |
| TailwindCSS | 4.2.2 | Utility-first styling |
| Radix UI | 1.4.3 | Accessible headless UI primitives |
| TanStack React Query | 5.91.2 | Server state management (fetching, caching, mutations) |
| Axios | 1.13.6 | HTTP client with auto-injected auth headers |
| Tiptap | 3.20.4 | Rich-text editor (BubbleMenu, StarterKit) |
| Framer Motion | 12.38.0 | Page and component animations |
| GSAP | 3.15.0 | Landing page scroll animations |
| Lucide React | 0.577.0 | Icon set |
| Sonner | 2.0.7 | Toast notifications |
| React Masonry CSS | 1.0.16 | Responsive masonry grid layout |
| date-fns | 4.1.0 | Date formatting and manipulation |
| @react-oauth/google | 0.13.4 | Google OAuth one-tap login |

---

## Setup

### 1. Install dependencies (from repo root)

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `apps/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

> All `VITE_*` variables are baked into the JavaScript bundle at build time. They are visible in the browser — do not put secrets here.

### 3. Start development server

```bash
npm run dev --workspace=apps/web
```

App runs at `http://localhost:5173` with hot module replacement.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Base URL of the backend API (e.g. `http://localhost:5000`) |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID — triggers the Google sign-in popup |

Types are declared in [src/vite-env.d.ts](src/vite-env.d.ts) for TypeScript autocomplete on `import.meta.env.*`.

---

## Project Structure

```
src/
├── api/
│   └── client.ts           ← Axios instance — auto-injects Authorization: Bearer <token>
├── components/
│   └── ui/                 ← Reusable shadcn-style primitives (Button, Input, Tabs, etc.)
├── features/
│   ├── auth/
│   │   ├── Login.tsx        ← Email/password + Google OAuth login form
│   │   └── Signup.tsx       ← Registration form
│   ├── notes/
│   │   ├── Notes.tsx        ← Masonry grid + search + pagination
│   │   ├── NoteCard.tsx     ← Individual note (edit, delete, AI summary, theme)
│   │   ├── NotesCalendarView.tsx  ← Weekly calendar view for notes
│   │   └── NotesListView.tsx      ← Linear list view for notes
│   ├── tasks/
│   │   ├── Tasks.tsx        ← Three-column Kanban board
│   │   ├── TaskCard.tsx     ← Individual task (status toggle, priority badge, due date)
│   │   └── TasksCalendarView.tsx  ← Weekly calendar view for tasks
│   ├── digest/
│   │   └── Digest.tsx       ← Daily digest display and trigger
│   └── general/
│       ├── Editor.tsx       ← Tiptap rich-text editor with BubbleMenu
│       ├── AiUsage.tsx      ← AI usage count display in header
│       └── Landing.tsx      ← Marketing landing page (auth entry point)
├── App.tsx                  ← Root: auth routing + main tab shell
├── main.tsx                 ← ReactDOM entry point — wraps with QueryClient + GoogleOAuthProvider
├── index.css                ← TailwindCSS base + global styles
└── vite-env.d.ts            ← TypeScript declarations for import.meta.env
```

---

## Application Structure

### Auth routing (`App.tsx`)

Unauthenticated users see the landing page → login/signup flow. Authenticated users land in the main tab shell with three tabs: **Notes**, **Tasks**, and **Digest**.

### Notes tab

Three view modes, switchable from the toolbar:

| View | Component | Description |
|------|-----------|-------------|
| Grid | `Notes.tsx` | Responsive masonry layout (3 cols → 1 col on mobile) |
| Calendar | `NotesCalendarView.tsx` | Weekly calendar — notes placed by creation date |
| List | `NotesListView.tsx` | Linear scrollable list |

**Features:**
- Debounced search (300ms) across title, body, and tags
- Load-more pagination (20 notes per page)
- Create note button opens the Tiptap editor
- AI summary toggle — show/hide generated summaries on note cards
- Theme selector — apply a colour tint to new notes
- Temporary "ghost" card shown while a note is saving (optimistic UI)
- Processing status polling — refreshes tasks when a note finishes AI processing

### Tasks tab

Two view modes:

| View | Component | Description |
|------|-----------|-------------|
| Kanban | `Tasks.tsx` | Three columns: Todo, In Progress, Done |
| Calendar | `TasksCalendarView.tsx` | Weekly calendar — tasks placed by due date |

**Kanban features:**
- Priority sorting within each column (high → medium → low)
- Inline status transition via `TaskCard` controls
- Overdue and "due today" filtering
- Source note displayed on each task card (links back to the originating note)

### Digest tab

Displays a curated daily briefing with:
- A narrative summary of the day's notes and tasks
- Highlights — short excerpts from today's notes
- Focus areas — the most frequent topics across notes

The "Generate Digest" button triggers a `POST /digest/generate` call. Frontend UI marked as "Coming Soon" in the main tab — the component (`Digest.tsx`) is functional.

---

## State Management

- **Server state:** TanStack React Query — all API calls go through `useQuery` / `useMutation` hooks with automatic caching and background refetching
- **Local UI state:** React `useState` — modal open/close, view mode, filter selections
- **No global client store** — no Redux, Zustand, or Context API for data

---

## API Client

`src/api/client.ts` — an Axios instance configured to:

1. Set `baseURL` to `VITE_API_BASE_URL`
2. Inject `Authorization: Bearer <token>` on every outgoing request (reads from `localStorage`)
3. (Frontend handles 401 responses by clearing the token and redirecting to login)

---

## Auth Flow

1. User clicks "Sign in with Google" → Google OAuth popup → ID token returned
2. ID token is sent to `POST /auth/google`
3. Server verifies with Google, returns a ThinkStack JWT
4. JWT is stored in `localStorage`
5. Axios interceptor picks it up automatically on all subsequent requests
6. Token is valid for 7 days; on expiry the server returns 401 → user is redirected to login

For email/password: credentials sent to `POST /auth/login`, same JWT flow.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR at `localhost:5173` |
| `npm run build` | TypeScript check (`tsc -b`) + production bundle (`vite build`) |
| `npm run lint` | ESLint check across all `.ts` / `.tsx` files |
| `npm run preview` | Serve the production build locally for final checks |

All commands should be run as:
```bash
npm run <script> --workspace=apps/web
```
or from the `apps/web/` directory directly.

---

## Key Design Decisions

- **React Query over custom hooks** — eliminates hand-rolled loading/error state; mutations automatically invalidate related queries so the UI stays consistent
- **Tiptap for rich text** — gives a Notion-like inline formatting experience with BubbleMenu; the output is HTML stored in `Note.body`
- **No global store** — all shared state is either server state (React Query) or props/local state; avoids unnecessary complexity for this app's scale
- **Optimistic UI for note creation** — a temporary card renders immediately while the API call is in flight, so the editor feels instant
- **CSS-in-class (Tailwind)** — no separate CSS files; all styling co-located with components via utility classes
