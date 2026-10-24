# Roadmap and task tracker

Only mark tasks complete when the change exists in the repository and verification evidence is recorded.

## Milestone 0 — foundation
- [x] T-001 Create separate repository and confirm write access.
- [x] T-002 Add product specification.
- [x] T-003 Document architecture boundaries.
- [x] T-004 Define cost transparency and safety policy.
- [x] T-005 Create task tracker and milestone sequence.
- [x] T-006 Add frontend application scaffold.
- [x] T-007 Add automated frontend CI workflow (first run is being checked).
- [x] T-008 Add baseline unit tests.
- [x] T-009 Add contribution and security guidance.
- [x] T-010 Add deployment checklist.

## Milestone 1 — budget feasibility
- [x] T-011 Build minimal input form.
- [x] T-012 Add accessible input validation.
- [x] T-013 Implement deterministic feasibility calculator.
- [x] T-014 Define versioned rate schema.
- [ ] T-015 Verify Tamil Nadu benchmark sources.
- [x] T-016 Render itemized costs and assumptions.
- [x] T-017 Add budget-supported area range and caveats.
- [x] T-018 Add calculation unit and edge-case tests.
- [x] T-019 Add responsive styling.
- [ ] T-020 Add SEO metadata, sitemap, and robots strategy.

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
- [ ] T-035 Build 3D massing from canonical model.
- [ ] T-036 Add accessible controls and mobile fallback.
- [ ] T-037 Add performance and accessibility checks.
- [ ] T-038 Add privacy-safe analytics/error monitoring.
- [ ] T-039 Pilot against real Tamil Nadu quotes.
- [ ] T-040 Publish limitations and support workflow.

## Milestone 5 — production readiness
- [ ] T-041 Add professional review workflow.
- [ ] T-042 Add sourced, dated regional rules data.
- [ ] T-043 Export reports with versioned assumptions.
- [ ] T-044 Security review and dependency automation.
- [ ] T-045 Verify deployment and rollback.
- [ ] T-046 Evaluate paid customization after MVP validation.
- [x] T-047 Add Netlify build/publish configuration and pin Node.js 20.

## Status as of 2026-10-24 — implementation pass 2
- Tasks recorded: 47
- Implemented and documented in repository: 33
- Remaining or deliberately blocked: 14
- Milestones 1–3 now have committed frontend/backend implementations; CI verification of the latest commit is still pending and must be checked before calling the release deploy-ready.
- Deliberately not complete: T-015 (authoritative, dated Tamil Nadu benchmark verification); T-020 (absolute sitemap URL requires the final production hostname); Milestones 4–5 production/pilot items other than the existing Netlify build configuration.
- Current milestone: 1–3 implementation and verification.

### Evidence added in this pass
- Milestone 1: versioned rate assumptions, strict calculation input validation, gross plot/floor ceiling, explicit caveats, extended unit tests, metadata and robots policy. Rates remain unverified.
- Milestone 2: canonical feet-based room geometry, deterministic compact/balanced/open alternatives, boundary/overlap validation, dimensioned SVG, room schedule, tests and Markdown concept-brief export.
- Milestone 3: PostgreSQL-compatible SQLAlchemy schema, Alembic migration, Argon2id password hashes, signed short-lived bearer tokens, owner-scoped project CRUD, immutable numbered snapshots, frontend API client, browser-only project mode, privacy/retention policy and access-control tests.
- CI: frontend test/build plus Python API tests and Alembic migration execution are configured. Latest run outcome has not yet been verified in this working session.

### Release limitations that remain
- Cloud account mode requires a deployed API, private PostgreSQL database, a production JWT secret, and exact FRONTEND_ORIGINS / VITE_API_BASE_URL configuration.
- No email verification, password reset, rate limiting, account deletion, backup/restore drill, security audit, or production API deployment yet.
- The concept generator is deterministic geometry, not an AI-trained architectural designer. It does not calculate local code compliance or produce construction-ready drawings.

## Definition of done
A task is complete only when code/docs are committed and tests pass or limitations are documented. Never claim deployment without a verified URL and health check.