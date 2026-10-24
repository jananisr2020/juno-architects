# Juno Architects API

FastAPI backend for indicative feasibility calculations, account-scoped concept projects and professional review requests.

## Local setup

Use Python 3.11 or newer. From the repository root:

    python -m venv .venv
    # Windows PowerShell: .venv\Scripts\Activate.ps1
    # macOS/Linux: source .venv/bin/activate
    python -m pip install -e ".[test]"

Set DATABASE_URL, JWT_SECRET (random, at least 32 characters), FRONTEND_ORIGINS (exact browser origins), and REVIEW_ADMIN_TOKEN (separate random secret for reviewer operations).

For local PostgreSQL plus API, use docker compose up --build. The credentials in docker-compose.yml are local development only and must never be reused in production.

Apply migrations and start the server:

    alembic upgrade head
    uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

- GET /health is liveness.
- GET /health/ready verifies the database connection.
- Interactive API schema is at /docs.

## Endpoints
- POST /api/v1/auth/register and /login — account creation/login; email verification delivery is not configured yet.
- POST /api/v1/feasibility — transparent cost and supported-area range from the shared market-band configuration.
- GET/POST /api/v1/projects — list/create current user's projects.
- GET/PATCH/DELETE /api/v1/projects/{id} — read/rename/delete owned projects.
- POST /api/v1/projects/{id}/duplicate and /snapshots — duplicate and append immutable version snapshots.
- GET /api/v1/account/export — export the authenticated user's account, projects and review requests.
- DELETE /api/v1/account — delete the account after current-password confirmation.
- POST /api/v1/projects/{id}/review-requests and GET /api/v1/review-requests — create/list user-owned review requests.
- PATCH /api/v1/review-requests/{id} — reviewer-only status update with X-Review-Admin-Token.

Passwords use argon2-cffi's Argon2id password hashing. Project lookups are owner-scoped and return 404 for another user's IDs. The API does not log request bodies or bearer tokens by design.

## Security and production requirements
The app has in-memory per-IP limits, but multi-instance production should use a shared Redis/gateway limiter. Configure HTTPS, private PostgreSQL, exact CORS, separate secrets, database backups and a tested restore. Email verification and password reset still require an approved mail provider. Reviewer operations require a secret kept only on the API service; no review request implies professional assignment or building approval.

Rates are third-party published Coimbatore market ranges, not independently verified quotes and not calibrated for other cities. See docs/COST_ESTIMATION.md. Regional rule links are reference-only; no compliance calculation is performed.
