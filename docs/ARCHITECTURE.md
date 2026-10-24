# Architecture

## Current shape
Juno Architects is a modular monolith split into a static React/Vite frontend and FastAPI JSON API. Anonymous planning and local project storage work in the browser; account-backed projects require a separately deployed API and PostgreSQL.

Browser
- React + TypeScript + Vite.
- Feasibility calculator consumes shared/rates.v1.json.
- Canonical feet-based plan geometry drives dimensioned 2D SVG and isometric 3D massing.
- Local-only project save/rename/duplicate/delete and immutable snapshots.
- Optional authenticated API client, professional review request UI and account data export.
- Privacy-first error boundary with downloadable generic incident report; no remote telemetry.

HTTPS API (FastAPI)
- Validated feasibility endpoint and the same shared rate configuration.
- Argon2id password hashing, short-lived signed bearer tokens and per-IP rate limits.
- Owner-scoped project CRUD and versioned snapshots.
- Password-confirmed account deletion and authenticated account-data export.
- Owner-scoped professional review request workflow with separate reviewer token.
- PostgreSQL persistence and Alembic migrations.

## Architectural rules
- Keep frontend and backend cost calculations on the same versioned data file.
- Current rates are third-party published Coimbatore market ranges, not independently verified quotes and not calibrated for other cities. Keep provenance and uncertainty visible.
- Government PWD schedules and private turnkey market bands measure different scopes; do not combine them without scope normalization.
- Use one canonical plan model for 2D, 3D, room areas and exports. A raster image is never treated as an editable measured plan.
- The current layout engine is deterministic, not generative AI. It does not solve room connectivity, doors/windows, stairs, ventilation, structural design, setbacks, FSI or code compliance.
- Regional rules are source links only and are not machine-applied. The latest Gazette amendments and competent authority must be checked by a qualified professional.
- Keep secrets in server environment variables; never expose DATABASE_URL, JWT_SECRET or REVIEW_ADMIN_TOKEN through Vite variables.
- Project queries must be owner-scoped. Do not reveal whether another user's project ID exists.
- Diagnostic reports must not contain project payloads, stack traces, credentials or street-level property details.

## Main modules
- src/App.tsx — feasibility form, itemized results, rate provenance and regional rules references.
- src/lib/feasibility.ts — deterministic calculation and range uncertainty.
- shared/rates.v1.json — versioned market research bands and sources shared by frontend/API.
- shared/regional-rules.v1.json — dated official rules links with reference-only status.
- src/lib/plan-model.ts — canonical geometry, deterministic alternatives and bounds/overlap validation.
- src/components/PlanWorkspace.tsx — 2D plan, isometric 3D view switch, exports, local projects and optional cloud account UI.
- src/components/MassingView.tsx — isometric SVG derived from the canonical plan footprint and room zones.
- src/lib/projects.ts — browser-local project lifecycle and snapshots.
- src/lib/api.ts — typed HTTP client for account, projects, export and review requests.
- src/components/ErrorBoundary.tsx — local recovery screen and privacy-safe diagnostic download.
- backend/app/main.py — API, SQLAlchemy models, auth, projects, review requests and readiness.
- backend/migrations/versions — versioned schema migrations.
- backend/tests and src/**/*.test.tsx — API, cost, geometry, project and massing tests.
- scripts/check-bundle.mjs — compressed JavaScript/CSS size budgets.
- scripts/check-a11y-contract.mjs — semantic/mobile accessibility smoke checks.
- .github/workflows/ci.yml, security.yml and .github/dependabot.yml — CI, CodeQL, dependency review and automated updates.

## API endpoints
- GET /health and GET /health/ready — liveness and database readiness.
- POST /api/v1/feasibility — range-based indicative cost/area response with provenance.
- POST /api/v1/auth/register and /login — account creation/login; email verification is not yet wired.
- GET/POST /api/v1/projects and GET/PATCH/DELETE /api/v1/projects/{id} — owner-scoped project CRUD.
- POST /api/v1/projects/{id}/duplicate and /snapshots — project duplication and immutable versions.
- GET /api/v1/account/export and DELETE /api/v1/account — user data export and password-confirmed account deletion.
- POST /api/v1/projects/{id}/review-requests and GET /api/v1/review-requests — user review requests/status.
- PATCH /api/v1/review-requests/{id} — reviewer status update protected by REVIEW_ADMIN_TOKEN.

## Deployment boundaries
Netlify hosts the static frontend. The API and PostgreSQL need separate hosting, secrets, migration execution and exact CORS configuration. Dockerfile.api, docker-compose.yml and render.yaml provide container/local setup. The Render blueprint expects a separately provisioned PostgreSQL URL. Email verification/reset, shared Redis/gateway rate limiting, backup/restore testing, production security/legal review, live deployment and smoke tests remain release gates.
