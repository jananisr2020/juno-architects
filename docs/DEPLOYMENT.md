# Deployment checklist

## Current architecture
The frontend is a Vite static site and can be hosted on Netlify. The authenticated project API is a separate FastAPI service and needs a reachable API host plus PostgreSQL. A static Netlify deployment alone does not activate cloud accounts or database-backed projects.

## Frontend static deployment
- Build command: npm run build
- Publish directory: dist
- Node.js: 20 (configured in netlify.toml and .nvmrc)
- Set VITE_API_BASE_URL to the HTTPS base URL of the deployed API only after the API is live. This value is public in the browser bundle.
- The API base URL must not be a placeholder or an unverified host.
- Confirm the final production hostname before adding canonical metadata and an absolute sitemap URL.

## API deployment
- Use Python 3.11+ and install with python -m pip install -e .
- Provision a private PostgreSQL database and set DATABASE_URL using the psycopg SQLAlchemy driver.
- Generate JWT_SECRET with a cryptographically secure random value of at least 32 characters. Do not use the CI example secret.
- Set FRONTEND_ORIGINS to the exact production frontend origin(s), comma-separated, without a wildcard.
- Run alembic upgrade head as a release step before starting uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT.
- Verify GET /health, registration/login, project create/list/rename/duplicate/delete, and cross-account denial.
- Configure HTTPS, rate limiting, logging that excludes tokens and project payloads, database backups, restore tests, alerts and a security review before public account use.

## Before deployment
- [ ] Confirm the latest intended commit is on the deployment branch.
- [ ] Confirm both frontend and backend CI jobs pass for that commit.
- [ ] Verify mobile layout, keyboard navigation, form validation, SVG labels and export.
- [ ] Confirm all displayed rates are marked verified or illustrative.
- [ ] Confirm no secrets or private project data are in the repository or frontend bundle.
- [ ] Confirm the privacy notice and limitations are visible.
- [ ] Confirm the final production domain and sitemap.

## After deployment
- [ ] Open the published URL in a private/incognito session.
- [ ] Check browser console and network errors.
- [ ] Test valid and invalid budget/plot inputs and compare the estimate to test examples.
- [ ] Verify API health and cross-origin account requests.
- [ ] Confirm the deployed commit SHA.
- [ ] Record URL, timestamp, CI run and smoke-test evidence in the roadmap.
- [ ] Keep the previous deployment available for rollback.

Never claim deployment is complete until the published frontend URL, API health, database migration, and smoke tests have been verified.
