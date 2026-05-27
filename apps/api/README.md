# ThinkStack — API

Express 5 + MongoDB backend for the ThinkStack notes app. Handles authentication, note management, AI processing, and task/digest generation.

---

## Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | 5.2.1 | HTTP server and routing |
| Mongoose | 9.2.3 | MongoDB ODM |
| OpenAI SDK | 6.25.0 | GPT-4o-mini AI features |
| jsonwebtoken | 9.0.3 | JWT generation and verification |
| bcrypt | 6.0.0 | Password hashing |
| google-auth-library | 10.6.2 | Google OAuth ID token verification |
| dotenv | 17.3.1 | Environment variable loading |
| cors | 2.8.6 | Cross-origin request handling |
| nodemon | — (dev) | Auto-restart on file changes |

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

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/thinkstack
OPENAI_API_KEY=sk-...
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

### 3. Start development server

```bash
npm run dev --workspace=apps/api
```

The server starts on `http://localhost:5000` (or the port in your `.env`).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port |
| `MONGO_URI` | Yes | MongoDB connection string |
| `OPENAI_API_KEY` | Yes | Used by summarizeNote and extractTasks |
| `JWT_SECRET` | Yes | Must be a long random string — used to sign all tokens |
| `GOOGLE_CLIENT_ID` | Yes | Used to verify Google ID tokens on `/auth/google` |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |

---

## Project Structure

```
src/
├── server.js          ← Entry point: registers middleware, routes, connects DB
├── ai/
│   ├── summarizeNote.js   ← GPT-4o-mini: generates summary + tags
│   ├── extractTasks.js    ← GPT-4o-mini: extracts structured tasks
│   ├── findRelation.js    ← Keyword-overlap: finds similar notes
│   └── generateDigest.js  ← Generates daily digest summary
├── middleware/
│   └── auth.js            ← JWT verification, attaches req.user
├── models/
│   ├── User.js
│   ├── Note.js
│   ├── Task.js
│   ├── Relation.js
│   └── DailyDigest.js
├── routes/
│   ├── auth.routes.js
│   ├── notes.routes.js
│   ├── tasks.routes.js
│   └── digest.routes.js
└── utils/
    ├── aiUsage.js     ← Per-user daily AI quota tracking
    └── jwt.js         ← Token generation helper
```

---

## API Endpoints

All routes except `/auth/signup`, `/auth/login`, and `/auth/google` require a valid JWT passed as:

```
Authorization: Bearer <token>
```

---

### Auth — `/auth`

#### `POST /auth/signup`

Register a new user with email and password.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "Alice"
}
```

**Response:**
```json
{
  "token": "<jwt>",
  "user": { "_id": "...", "email": "...", "name": "..." }
}
```

---

#### `POST /auth/login`

Login with email and password.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** Same shape as signup.

---

#### `POST /auth/google`

Exchange a Google ID token (from the frontend OAuth flow) for a ThinkStack JWT.

**Request body:**
```json
{
  "idToken": "<google-id-token>"
}
```

**Behaviour:** Creates a new user on first login; subsequent logins return the existing account. Merges if an email-only account already exists.

**Response:** Same shape as signup.

---

#### `GET /auth/me` — *requires JWT*

Return the authenticated user's profile.

**Response:**
```json
{
  "_id": "...",
  "email": "...",
  "name": "...",
  "picture": "...",
  "aiUsageCount": 3,
  "aiUsageLimit": 100
}
```

---

### Notes — `/notes` — *all require JWT*

#### `POST /notes`

Create a new note. Triggers the full AI pipeline asynchronously (summarization → task extraction → relation finding).

**Request body:**
```json
{
  "title": "Meeting notes",
  "body": "<p>Discuss roadmap. Ship by Friday.</p>",
  "theme": "lavender"
}
```

**Theme options:** `lavender` | `mint` | `sky` | `peach` | `gray`

**Response:** The created Note document. Processing begins immediately in the background — poll `processingStatus` to track completion (`idle → processing → completed | failed`).

---

#### `GET /notes`

Fetch the authenticated user's notes with optional filtering and pagination.

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search in title, body, and tags |
| `limit` | number | Max results (default: 20, max: 100) |
| `skip` | number | Pagination offset |
| `startDate` | ISO date | Filter notes created on or after this date |
| `endDate` | ISO date | Filter notes created on or before this date |

**Response:**
```json
{
  "notes": [...],
  "total": 42,
  "hasMore": true
}
```

---

#### `PATCH /notes/:id`

Update a note's title, body, or theme. Re-runs the AI pipeline if the body changed.

**Request body:** Any subset of `{ title, body, theme }`.

**Response:** Updated Note document.

---

#### `DELETE /notes/:id`

Delete a note and cascade-delete all associated Tasks and Relations.

**Response:** `{ message: "Note deleted" }`

---

### Tasks — `/tasks` — *all require JWT*

#### `GET /tasks`

Fetch the authenticated user's tasks.

**Query parameters:**

| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `status` | string | `todo` \| `in_progress` \| `done` | Filter by status |
| `due` | string | `today` \| `overdue` | `today` = due today; `overdue` = past due and not done |

---

#### `PATCH /tasks/:id`

Update a task's status (and optionally other fields).

**Request body:**
```json
{
  "status": "in_progress"
}
```

---

#### `DELETE /tasks/:id`

Delete a task by ID.

---

### Digest — `/digest` — *all require JWT*

#### `POST /digest/generate`

Generate (or regenerate) today's daily digest. Summarises notes created today, pending tasks, and frequent topics.

**Response:**
```json
{
  "summary": "You created 3 notes today and have 5 pending tasks.",
  "highlights": ["First note excerpt...", "Second note excerpt..."],
  "focusAreas": ["architecture", "deadline", "review"]
}
```

---

#### `GET /digest`

Fetch today's existing digest. Returns `404` if none has been generated yet today.

---

## Data Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `email` | String | Required, unique |
| `name` | String | Default: `""` |
| `picture` | String | Profile image URL |
| `passwordHash` | String | Absent for Google-only accounts |
| `provider` | `"local"` \| `"google"` | Default: `"local"` |
| `aiUsageCount` | Number | Incremented each AI call, resets daily |
| `aiUsageLimit` | Number | Default: 100 |
| `lastUsageReset` | Date | Timestamp of last daily reset |

---

### Note

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Trimmed, optional |
| `userId` | ObjectId → User | Required, indexed |
| `body` | String | HTML from Tiptap editor, required |
| `tags` | [String] | AI-generated, indexed |
| `aiSummary` | String | AI-generated summary |
| `processingStatus` | `"idle"` \| `"processing"` \| `"completed"` \| `"failed"` | Indexed |
| `theme` | `"lavender"` \| `"mint"` \| `"sky"` \| `"peach"` \| `"gray"` | Default: `"lavender"` |
| `extractedTasks` | [ObjectId → Task] | Populated on fetch |
| `aiProcessedAt` | Date | When AI last ran |
| `lastAnalyzedContentHash` | String | Used to skip re-processing unchanged content |
| `lastProcessingError` | String | Set if processing fails |

---

### Task

| Field | Type | Notes |
|-------|------|-------|
| `noteId` | ObjectId → Note | Parent note |
| `userId` | ObjectId → User | Required, indexed |
| `title` | String | Required |
| `status` | `"todo"` \| `"in_progress"` \| `"done"` | Default: `"todo"` |
| `priority` | `"low"` \| `"medium"` \| `"high"` | Default: `"low"` |
| `dueAt` | Date | Parsed from note content |
| `recurrence` | `"daily"` \| `"weekly"` \| `"none"` | Default: `"none"` |
| `type` | `"one_time"` \| `"recurring"` | Default: `"one_time"` |
| `sourceText` | String | Original sentence the task was extracted from |

---

### Relation

| Field | Type | Notes |
|-------|------|-------|
| `fromNoteId` | ObjectId → Note | Source note |
| `toNoteId` | ObjectId → Note | Related note |
| `type` | `"similar"` \| `"reference"` \| `"follow_up"` | Default: `"similar"` |
| `confidence` | Number | Jaccard similarity score (0–1) |
| `approved` | Boolean | Reserved for user approval UI |
| `userId` | ObjectId → User | Required, indexed |

---

### DailyDigest

| Field | Type | Notes |
|-------|------|-------|
| `dateKey` | String | `YYYY-MM-DD`, unique per user |
| `userId` | ObjectId → User | Required, indexed |
| `summary` | String | Narrative digest |
| `highlights` | [String] | Excerpts from today's notes |
| `focusAreas` | [String] | Most-frequent topics |
| `noteIds` | [ObjectId] | Notes included in this digest |
| `taskIds` | [ObjectId] | Tasks included in this digest |

---

## AI Pipeline

When a note is created or its body changes, three steps run in the background:

### 1. `summarizeNote(content, user)`

- Model: `gpt-4o-mini`, temperature `0.2`
- Returns `{ summary, tags }` as JSON
- Retries: 2 automatic retries on transient failure
- Timeout: 5 seconds per attempt
- Increments AI usage counter

### 2. `extractTasks(content, user, title)`

- Model: `gpt-4o-mini`, temperature `0.2`
- Returns an array of task objects with:
  - `title` — short imperative description
  - `type` — `"one_time"` or `"recurring"`
  - `dueAt` — ISO date parsed from relative phrases ("tomorrow", "next Friday")
  - `recurrence` — `"daily"` / `"weekly"` / `"none"`
  - `priority` — inferred from urgency language ("asap" → `"high"`, "important" → `"medium"`)
  - `sourceText` — the original sentence it was extracted from
- Increments AI usage counter

### 3. `findRelations(newNote, existingNotes)`

- Algorithm: Jaccard similarity on tokenised note bodies
- Does **not** call OpenAI (no API cost)
- Creates a `Relation` document for any pair with similarity score > 0.2
- Planned upgrade: embedding-based semantic similarity

---

## Auth Flow

1. Password auth: bcrypt compares submitted password against stored `passwordHash`
2. Google OAuth: `google-auth-library` verifies the Google ID token, extracts email + profile info
3. Both paths return a signed JWT (`{ userId }` payload, 7-day expiry)
4. Protected routes run `authMiddleware`, which verifies the JWT and loads `req.user` from MongoDB
5. Returns `401` if the token is missing, expired, or the user no longer exists

---

## AI Usage Limits

`utils/aiUsage.js` — `checkAndUpdateUsage(user)`:

- Checks if the current date differs from `user.lastUsageReset` — if so, resets `aiUsageCount` to 0
- Throws `"Daily usage limit reached"` if `aiUsageCount >= aiUsageLimit`
- Otherwise increments `aiUsageCount` and saves the user

Default limit: **100 operations/day per user** (configurable via `User.aiUsageLimit`).
