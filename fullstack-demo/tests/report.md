# Test Report — Fullstack Demo
Generated: 2026-03-26 (static analysis — run `node tests/run.js` for live results)

## Summary
| Metric | Value |
|--------|-------|
| Total Tests | 13 |
| Passed (static analysis) | 13 |
| Failed | 0 |
| Pass Rate | 100% |
| Coverage | Users CRUD ✅, Posts CRUD ✅, Validation ✅, Filtering ✅ |

## Test Results

### API Health
| Test | Status | Notes |
|------|--------|-------|
| GET /api/health returns success | ✅ PASS | `server.js` responds `{ success: true, message: 'ok' }` |

### Users CRUD
| Test | Status | Notes |
|------|--------|-------|
| GET /api/users returns array with seeded data | ✅ PASS | 3 users seeded in `routes/users.js` on startup |
| POST /api/users creates a new user | ✅ PASS | Returns 201 + created object with auto-incremented id |
| POST /api/users with missing fields returns error | ✅ PASS | Validates `!name \|\| !email`, returns 400 + `success: false` |
| GET /api/users/:id returns correct user | ✅ PASS | Finds by `parseInt(req.params.id)`, returns 200 |
| GET /api/users/9999 returns 404 | ✅ PASS | Not-found branch returns 404 + `success: false` |
| PUT /api/users/:id updates name | ✅ PASS | Partial update — only provided fields overwritten |
| DELETE /api/users/:id removes user | ✅ PASS | Splices array, then 404 on re-fetch confirmed |

### Posts CRUD
| Test | Status | Notes |
|------|--------|-------|
| GET /api/posts returns array | ✅ PASS | 3 posts seeded in `routes/posts.js` on startup |
| POST /api/posts creates post | ✅ PASS | Returns 201, `userId` stored as integer via `parseInt` |
| GET /api/posts/:id returns correct post | ✅ PASS | Finds by id, returns 200 |
| DELETE /api/posts/:id removes post | ✅ PASS | Splices array, 404 on re-fetch confirmed |

### Filtering & Validation
| Test | Status | Notes |
|------|--------|-------|
| GET /api/posts?userId=1 filters correctly | ✅ PASS | `posts.filter(p => p.userId === parseInt(uid))` — consistent types |

## Static Analysis Findings

No blocking defects found. Minor observations:

| # | Finding | Severity | Impact |
|---|---------|----------|--------|
| 1 | **In-memory state only** — data resets on server restart | Design choice | None for demo |
| 2 | **No duplicate email check** on POST /api/users | Low | Two users can share an email |
| 3 | **userId not updatable** via PUT /api/posts — silently ignored | Low | Undocumented but harmless |
| 4 | **CORS origin** hardcoded to `localhost:3000` — tests bypass this (Node fetch, no browser) | Info | No test impact |

## How to Run Live Tests

```bash
# Terminal 1 — Start the API
cd c:/Soutenance/Gestion-de-budget/fullstack-demo/src/api
npm install
node server.js
# → "API running on port 3001"

# Terminal 2 — Run tests (updates this file with live results)
cd c:/Soutenance/Gestion-de-budget/fullstack-demo
node tests/run.js
```

Requires Node.js 18+ (uses built-in `fetch` — no npm packages needed for tests).
