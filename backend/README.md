# Juno Architects API

FastAPI backend for feasibility calculations and account-scoped concept projects.

## Local setup

Use Python 3.11 or newer.

```bash
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -e ".[test]"
```

Set environment variables before starting:

- DATABASE_URL: PostgreSQL URL, e.g. postgresql+psycopg://user:password@host:5432/juno
- JWT_SECRET: cryptographically random secret with at least 32 characters
- FRONTEND_ORIGINS: comma-separated exact browser origins, e.g. http://localhost:5173
- JUNO_AUTO_CREATE_TABLES: only set to true for disposable local development; production uses migrations

Apply migrations and start the server:

```bash
alembic upgrade head
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Health endpoint: GET /health. Interactive API schema: /docs (disable or protect it if production policy requires).

## Implemented endpoints

- POST /api/v1/auth/register — email + minimum 12-character password
- POST /api/v1/auth/login — bearer token
- POST /api/v1/feasibility — validated indicative calculation
- GET/POST /api/v1/projects — list/create projects for current user
- GET/PATCH/DELETE /api/v1/projects/{id} — read/rename/delete owned project
- POST /api/v1/projects/{id}/duplicate — duplicate project and snapshots
- POST /api/v1/projects/{id}/snapshots — append a versioned immutable payload

Passwords use pwdlib's recommended Argon2id hashing. Project lookups are owner-scoped and return 404 for another user's IDs. The API does not store bearer tokens or passwords in project payloads.

## Frontend integration

Set VITE_API_BASE_URL in the frontend build environment to the deployed API base URL. Set FRONTEND_ORIGINS on the API to the exact deployed frontend origin. Never expose DATABASE_URL or JWT_SECRET through Vite variables.

## Before public launch

Rate limiting, email verification, password reset, account deletion, privacy request workflow, database backup/restore drills, structured logging, dependency scanning, security review, and a verified production deployment are still required. The feasibility rates are placeholders until dated local source documents and current contractor quotations are reviewed.
