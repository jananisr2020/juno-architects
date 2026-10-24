# Architecture

## Current shape
Juno Architects is a modular monolith split into a static React/Vite frontend and a FastAPI JSON API. The frontend supports anonymous local planning without a server; account-backed projects require a separately deployed API and PostgreSQL.

```text
Browser
 ├─ React + TypeScript
 │   ├─ deterministic feasibility calculator
 │   ├─ canonical feet-based plan geometry → SVG + concept brief
 │   ├─ local-only saved projects
 │   └─ optional authenticated API client
 └─ HTTPS JSON API (FastAPI)
     ├─ validated feasibility endpoint
     ├─ shared versioned rate config (shared/rates.v1.json)
     ├─ Argon2id password hashing + short-lived signed bearer tokens
     └─ owner-scoped project CRUD + immutable snapshots
          └─ PostgreSQL (Alembic migrations)
```

## Architectural rules
- Keep cost calculations deterministic and make both frontend and backend consume the same versioned data in shared/rates.v1.json.
- The configuration's current numeric rates are unverified placeholders. Reference documents are recorded separately; do not mark rates verified until the building scope, inclusions, taxes, date and current local quotations are matched.
- Use one canonical plan model for 2D, future 3D, room areas and exports. A raster image is never treated as an editable measured plan.
- The current starter layout generator is deterministic, not a generative-AI model. It validates dimensions, plot/building boundaries, room overlaps and unique IDs. Room connectivity, windows/doors, stairs, ventilation, setbacks, FSI and code compliance are not solved.
- Keep secrets in server environment variables; never expose DATABASE_URL or JWT_SECRET through Vite variables.
- Do not persist personal home details without documented privacy, access, retention and deletion controls.
- Project queries must always be owner-scoped. Do not reveal whether another user's project ID exists.

## Main modules
- src/App.tsx — budget/plot input form and results.
- src/lib/feasibility.ts — frontend calculation consuming shared rate JSON.
- src/lib/plan-model.ts — canonical geometry, deterministic alternatives, bounds/overlap validation and area helpers.
- src/components/PlanWorkspace.tsx — SVG plan renderer, alternatives, concept export, local projects and optional cloud account UI.
- src/lib/projects.ts — browser-local project lifecycle and snapshots.
- src/lib/api.ts — typed HTTP client for account and cloud project endpoints.
- shared/rates.v1.json — versioned assumptions and source provenance used by both clients.
- backend/app/main.py — API, SQLAlchemy models, authentication and owner-scoped routes.
- backend/migrations/versions/0001_initial_projects_auth.py — initial users/projects/snapshots migration.
- backend/tests/test_api.py and src/lib/*.test.ts — API, calculation, geometry and local-project regression tests.
- scripts/seo.mjs — optional production sitemap, robots and canonical generation from SITE_URL.

## API contract
- GET /health — liveness check.
- POST /api/v1/feasibility — validated input and transparent itemized result with rate configuration ID/status.
- POST /api/v1/auth/register and POST /api/v1/auth/login — account creation/login; return a short-lived bearer token.
- GET/POST /api/v1/projects — list/create current user's projects.
- GET/PATCH/DELETE /api/v1/projects/{id} — read, rename or delete owned projects.
- POST /api/v1/projects/{id}/duplicate — copy a project and its history.
- POST /api/v1/projects/{id}/snapshots — append a numbered snapshot without overwriting earlier versions.

## Deployment boundaries
Netlify hosts only the static frontend. The API and PostgreSQL require a separate host, secrets, migration execution, HTTPS and an exact FRONTEND_ORIGINS allowlist. Public account launch still requires rate limiting, email verification/recovery, account deletion, backup/restore testing and security review.
