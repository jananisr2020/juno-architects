# Roadmap and task tracker

Only mark tasks complete when the change exists in the repository and verification evidence is recorded.

## Milestone 0 — foundation
- [x] T-001 Create separate repository and confirm write access.
- [x] T-002 Add product specification.
- [x] T-003 Document architecture boundaries.
- [x] T-004 Define cost transparency and safety policy.
- [x] T-005 Create task tracker and milestone sequence.
- [x] T-006 Add frontend application scaffold.
- [x] T-007 Add automated frontend/backend CI workflow (latest results pending verification).
- [x] T-008 Add baseline unit tests.
- [x] T-009 Add contribution and security guidance.
- [x] T-010 Add deployment checklist.

## Milestone 1 — budget feasibility
- [x] T-011 Build minimal input form.
- [x] T-012 Add accessible input validation.
- [x] T-013 Implement deterministic feasibility calculator.
- [x] T-014 Define versioned rate schema.
- [x] T-015 Add dated third-party Coimbatore market ranges and separate Tamil Nadu PWD references; retain explicit unverified-quote status.
- [x] T-016 Render itemized costs and assumptions.
- [x] T-017 Add budget-supported area range and caveats.
- [x] T-018 Add calculation unit and edge-case tests.
- [x] T-019 Add responsive styling.
- [x] T-020 Add SEO metadata, sitemap generation, and robots strategy (absolute sitemap/canonical generated when SITE_URL is configured).

## Milestone 2 — original structured plans
- [x] T-021 Define canonical geometry schema.
- [x] T-022 Define plot/building boundaries and units.
- [x] T-023 Validate bounds, overlaps, and dimensions.
- [x] T-024 Generate deterministic starter layouts.
- [x] T-025 Render SVG plans with dimensions and labels.
- [x] T-026 Compare alternatives.
- [x] T-027 Add geometry test fixtures.
- [x] T-028 Export concept brief.

## Milestone 3 — projects
- [x] T-029 Define privacy and retention policy.
- [x] T-030 Add PostgreSQL schema and migrations.
- [x] T-031 Add secure authentication.
- [x] T-032 Save, rename, duplicate, and delete projects.
- [x] T-033 Add version snapshots.
- [x] T-034 Add access-control tests.

## Milestone 4 — visualization and quality
- [x] T-035 Build isometric 3D massing from canonical plan geometry (floor height is illustrative).
- [x] T-036 Add accessible 2D/3D controls, visible keyboard focus and responsive mobile fallback.
- [x] T-037 Add compressed bundle budgets and automated semantic/mobile accessibility smoke checks (not a substitute for a full WCAG audit).
- [x] T-038 Add privacy-safe client error recovery and downloadable diagnostics; no remote telemetry is sent.
- [ ] T-039 Pilot against real Tamil Nadu quotes.
- [x] T-040 Publish limitations and privacy-safe support workflow.

## Milestone 5 — production readiness
- [x] T-041 Add owner-scoped professional review requests and reviewer-token status workflow (no automatic assignment or email yet).
- [x] T-042 Add sourced, dated Tamil Nadu/Coimbatore rule references; not machine-applied and amendments need professional verification.
- [x] T-043 Export concept reports with versioned pricing, sources, budget breakdown, assumptions and room schedule.
- [x] T-044 Add CodeQL, PR dependency review, Dependabot, API rate limits, account deletion/export and security guidance; independent human security review remains a release gate.
- [ ] T-045 Verify deployment and rollback.
- [ ] T-046 Evaluate paid customization after MVP validation.
- [x] T-047 Add Netlify build/publish configuration and pin Node.js 20.

## Status as of 2026-10-24 — implementation pass 2
- Tasks recorded: 47
- Implemented in repository: 44
- Remaining or externally blocked: 3 (T-039 real-quote pilot; T-045 live deployment/rollback verification; T-046 monetization evaluation after pilot validation).
- Milestones 1–3 are implemented; Milestone 4 is implemented except the real-quote pilot; Milestone 5 has deployment configuration, account export/deletion, automated security checks and report support, while live deployment and post-pilot monetization remain pending.
- CI run 40111758826 passed on commit 177c9a03bbdcc49990ebc43412d35b0b80c54669: frontend tests/build, npm audit, bundle budgets, accessibility smoke checks, backend tests and Alembic migration validation are green. CodeQL run 40111655793 passed on the code-equivalent 95e836 revision; the scan for the latest commit is still running. A passing CI build does not mean deployment is complete.
- Current milestone: 4–5 verification and pilot readiness.

### Evidence added in this pass
- Milestone 1: shared versioned low/mid/high Coimbatore market bands from dated third-party publications, explicit unverified-quote status, PWD source links, area uncertainty range, strict input validation, itemized allowances and SEO configuration.
- Milestone 2: canonical feet-based room geometry, deterministic compact/balanced/open alternatives, boundary/overlap validation, dimensioned SVG, isometric 3D massing, room schedule, tests and Markdown report export with versioned pricing assumptions.
- Milestone 3: PostgreSQL-compatible SQLAlchemy schema, Alembic migrations, Argon2id hashes, signed short-lived tokens, per-IP rate limits, owner-scoped CRUD/snapshots, account export/deletion, professional review workflow, readiness checks, frontend API client, Docker local stack and Render API blueprint.
- CI: frontend unit tests, TypeScript build, compressed bundle budgets, accessibility smoke checks, npm audit, Python API tests and migration execution passed on the last code-equivalent revision. CodeQL and dependency review workflows are configured.

### Release limitations that remain
- Cloud account mode requires a deployed API, private PostgreSQL database, a production JWT secret, and exact FRONTEND_ORIGINS / VITE_API_BASE_URL configuration.
- Still pending before public account launch: email verification/password reset delivery, shared Redis/gateway rate limiting for multiple API instances, independent security/legal review, real contractor quote validation, production database backup/restore drill, and live API/frontend deployment.
- The concept generator is deterministic geometry, not an AI-trained architectural designer. It does not calculate local code compliance or produce construction-ready drawings.

## Definition of done
A task is complete only when code/docs are committed and tests pass or limitations are documented. Never claim deployment without a verified URL and health check.