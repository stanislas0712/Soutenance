# Build Summary — Fullstack Demo

## What Was Built

A complete fullstack web application demonstrating a 3-agent Claude Code team:

| Layer | Tech | Location |
|-------|------|----------|
| REST API | Node.js + Express | `src/api/` (port 3001) |
| React UI | React 18 + Vite | `src/` (port 3000) |
| Test suite | Node.js 18 built-in fetch + assert | `tests/` |

### API Endpoints (`src/api/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user (name + email required) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Partial update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/posts` | List posts (optional `?userId=` filter) |
| POST | `/api/posts` | Create post (title + content + userId) |
| GET | `/api/posts/:id` | Get post by ID |
| PUT | `/api/posts/:id` | Update post title/content |
| DELETE | `/api/posts/:id` | Delete post |

Both resources use in-memory arrays with auto-incrementing IDs and seed data (3 users, 3 posts) on startup.

### Frontend (`src/`)

Two-tab layout (Users / Posts), each tab renders a full CRUD table:
- Inline "Add" form row at the top of the table
- Inline "Edit" mode per row (click Edit → fields become inputs)
- Delete with `window.confirm` guard
- Loading and error states
- Vite proxy: all `/api/*` requests forward to port 3001 (no CORS issues in browser)

### Tests (`tests/`)

13 tests covering:
- Health check
- Users: GET all, POST (success + validation error), GET by ID, GET 404, PUT, DELETE + 404 re-check
- Posts: GET all, POST, GET filter by userId, GET by ID, DELETE + 404 re-check

Run with Node.js 18+ (uses built-in `fetch` — no npm packages needed). Writes results to `tests/report.md`.

---

## Key Decisions

### 1. In-memory state (no database)
Keeps the demo self-contained and zero-setup. Data resets on restart — intentional for a demo.

### 2. Vite proxy instead of CORS headers for the UI
The browser always hits port 3000; Vite forwards `/api` to 3001. The API does have CORS configured (for tools like Postman or the test runner), but the UI never needs it.

### 3. Node built-in `fetch` + `assert` for tests
No test framework dependency (no Jest, no Mocha). Works out of the box with Node 18+. The test runner writes a markdown report so results are reviewable as a file, not just terminal output.

### 4. Sequential agent execution: Backend → Frontend + QA
Backend Dev ran first (foreground) to establish the API contract. Frontend Dev and QA could then reference confirmed endpoint shapes. Frontend Dev and QA ran in parallel once the contract was known.

### 5. Orchestrator wrote files for denied subagents
Background subagents (Frontend Dev, QA) had Write/Bash permissions denied at the user prompt. They returned their intended file contents in their result messages; the orchestrator (main Claude) wrote all files directly. This is the standard fallback pattern — documented in `docs/agent-teams-reference.md`.

---

## How to Run

```bash
# Terminal 1 — Start the API
cd c:/Soutenance/Gestion-de-budget/fullstack-demo/src/api
npm install
node server.js
# → "API running on port 3001"

# Terminal 2 — Start the React UI
cd c:/Soutenance/Gestion-de-budget/fullstack-demo
npm install
npm run dev
# → "Local: http://localhost:3000"

# Terminal 3 — Run tests (API must be running)
cd c:/Soutenance/Gestion-de-budget/fullstack-demo
node tests/run.js
# → writes tests/report.md
```

Requirements: Node.js 18+, npm.

---

## File Tree

```
fullstack-demo/
├── docs/
│   ├── agent-teams-reference.md   ← master agent teams guide
│   └── build-summary.md           ← this file
├── src/
│   ├── api/
│   │   ├── package.json           ← express, cors
│   │   ├── server.js              ← Express app, port 3001
│   │   └── routes/
│   │       ├── users.js           ← Users CRUD + in-memory store
│   │       └── posts.js           ← Posts CRUD + ?userId filter
│   ├── components/
│   │   ├── UserList.jsx           ← Full CRUD table: users
│   │   └── PostList.jsx           ← Full CRUD table: posts
│   ├── api.js                     ← apiFetch() helper
│   ├── App.jsx                    ← Two-tab layout
│   └── main.jsx                   ← React 18 createRoot
├── tests/
│   ├── api.test.js                ← 13 test cases
│   ├── run.js                     ← Entry point, writes report.md
│   ├── report.md                  ← Test results (auto-generated)
│   └── package.json               ← type: module
├── index.html
├── package.json                   ← Vite + React 18
└── vite.config.js                 ← /api proxy → port 3001
```
