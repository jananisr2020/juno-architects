# Juno Architects

Original concept planning and early budget feasibility for homes, starting with Tamil Nadu, India.

> **Safety and scope:** Juno Architects is an early concept-planning tool, not a substitute for a licensed architect, structural engineer, surveyor, or local approval authority. Generated layouts and cost figures must be checked before construction. Never represent an unreviewed concept as permit-ready or structurally safe.

## Implemented in the repository

- Responsive React + TypeScript + Vite frontend.
- Budget, location, plot dimensions, floor count, bedroom count, building type and finish inputs with validation.
- Deterministic cost/area calculator with itemized allowances, versioned shared rate configuration and visible source references.
- Versioned low/mid/high Coimbatore market research bands, source links and transparent uncertainty. These are third-party published ranges, not independently verified contractor quotes; official PWD references remain separate because the scope differs.
- Original deterministic concept-layout generator with a canonical feet-based geometry model, plot/building bounds checks, room-overlap checks, and compact/balanced/open alternatives.
- Isometric 3D massing view generated from the same footprint and room zones; floor heights are illustrative, not structural design.
- Dimensioned SVG floor-plan rendering, room-area schedule, and downloadable Markdown concept brief.
- Browser-local project save/rename/duplicate/delete and version snapshots.
- Optional FastAPI client for account-backed projects when VITE_API_BASE_URL is configured.
- FastAPI API with Argon2id password hashing, short-lived bearer tokens, per-IP rate limits, owner-scoped project CRUD, immutable numbered snapshots, password-confirmed account deletion, professional review request workflow and PostgreSQL-compatible Alembic migrations.
- SEO metadata plus sitemap/robots/canonical generation when SITE_URL is configured.
- GitHub Actions for frontend tests/build, compressed asset budgets, accessibility smoke checks, backend tests/migration checks, CodeQL and dependency review; Dependabot updates are configured.

## Honest current limitations

- The concept generator is deterministic, **not yet a generative-AI design model**. It is not a full architectural layout solver and does not handle doors/windows, stairs, room connectivity, ventilation, structural systems, setbacks, FSI or local building-code compliance.
- Cost rates remain illustrative and unverified. Official reference documents do not by themselves validate the placeholder rates for private residential work.
- Local projects remain on the current browser/device. Cloud accounts require a separately deployed API, private PostgreSQL database, a production JWT secret and exact CORS/frontend URL configuration.
- Email verification and password reset still need a configured email provider. Production multi-instance rate limiting, backup/restore drills, security review and live API/database deployment remain before public account launch.
- No production deployment is claimed until a live URL, database migration, health check and smoke tests are verified.

## Repository guides

- [Product specification](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap and task tracker](docs/ROADMAP.md)
- [Cost-estimation policy and source references](docs/COST_ESTIMATION.md)
- [Privacy and retention](docs/PRIVACY.md)
- [Support and professional review workflow](docs/SUPPORT.md)
- [API setup and endpoint guide](backend/README.md)
- [Deployment checklist](docs/DEPLOYMENT.md)
- [Security guidance](SECURITY.md)

## Local development

### Frontend

```bash
npm install
npm run dev
```

For production SEO metadata, set SITE_URL to the final HTTPS origin before running npm run build. The build will generate sitemap.xml, robots.txt and the canonical URL from that value. If SITE_URL is absent, it skips absolute sitemap/canonical generation rather than inventing a domain.

### Backend

Use Python 3.11+. From the repository root:

```bash
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -e ".[test]"
```

Set DATABASE_URL, JWT_SECRET (random, at least 32 characters), and FRONTEND_ORIGINS. Then run:

```bash
alembic upgrade head
uvicorn backend.app.main:app --reload
pytest -q
```

See [backend/README.md](backend/README.md) for details.

## Principles

1. **Original output:** use general design principles as inspiration, not copied plans, drawings, text, or assets.
2. **Explain assumptions:** disclose source, effective date, inclusions, exclusions and uncertainty.
3. **Geometry before imagery:** 2D plans, room areas, exports and future 3D views should derive from one structured model.
4. **Human review:** regulatory compliance and structural safety require qualified local professionals.
5. **No fake live prices:** never call benchmark assumptions a current quote unless verified against current sources.
6. **Small, testable increments:** completed tasks should have a code change, tests/evidence, and a tracker update.
