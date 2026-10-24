# Deployment checklist

## Current architecture
Netlify serves the static React/Vite frontend. The FastAPI API and PostgreSQL database are separate services. A static frontend deployment alone does not activate cloud accounts.

## Frontend (Netlify)
- Build command: npm run build
- Publish directory: dist
- Node.js 20 is pinned in netlify.toml and .nvmrc.
- Set SITE_URL to the final HTTPS origin to generate absolute sitemap/robots/canonical metadata.
- Set VITE_API_BASE_URL to the deployed API HTTPS origin only after it is live; this value is public in the browser bundle.
- Never put database credentials, JWT secrets or reviewer tokens in VITE_* variables.

## API + PostgreSQL
A local development stack is available with docker compose up --build. Local-only credentials in docker-compose.yml must never be reused in production.

A Render blueprint and API container are provided:
1. Import the GitHub repository into your hosting provider.
2. Provision a private PostgreSQL database with backups; provide DATABASE_URL in the API service environment.
3. Set FRONTEND_ORIGINS to the exact HTTPS frontend origin.
4. Generate independent random JWT_SECRET and REVIEW_ADMIN_TOKEN values. Never use local or CI secrets.
5. Configure the API host and database; the container applies Alembic migrations before starting FastAPI.
6. Confirm GET /health, account registration/login, project CRUD/snapshots, account deletion and review request authorization.
7. Confirm the API service has persistent PostgreSQL and that migration rollback/restore is documented.

The Render blueprint deliberately requires an externally provisioned PostgreSQL URL. It does not create a database or deploy itself from this repository.

## Before public account launch
- [ ] Configure email verification and password reset with an approved mail provider.
- [ ] Replace in-memory rate-limit storage with Redis or gateway rate limiting for multiple API instances.
- [ ] Confirm HTTPS, exact CORS, secret rotation, backups and a successful restore drill.
- [ ] Complete a security review, privacy/legal review and professional review process.
- [ ] Collect dated, scope-matched Coimbatore quotations and validate the price bands.
- [ ] Verify the latest CI and security workflows on the intended commit.
- [ ] Confirm the final domain, canonical URL and sitemap.
- [ ] Smoke-test mobile controls, keyboard navigation, exports and browser console.

## Release and rollback evidence
- [ ] Record deployed frontend and API URLs, commit SHA, migration revision and CI run.
- [ ] Verify the deployed API health endpoint and frontend/API cross-origin calls.
- [ ] Test invalid input, authentication, project access isolation, deletion and reviewer authorization.
- [ ] Keep the previous frontend deployment available for rollback and document the database restore procedure.

Never claim deployment is complete until the live URLs, database migration, health checks and smoke tests have been verified.
