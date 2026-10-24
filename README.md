# Juno Architects

AI-assisted concept planning and budget feasibility for homes, starting with Tamil Nadu, India.

> **Safety and scope:** Juno Architects is a concept-planning and early budgeting tool, not a substitute for a licensed architect, structural engineer, surveyor, or local approval authority. Generated layouts and cost figures must be checked before construction. Never represent an unreviewed concept as permit-ready or structurally safe.

## Product goals

- Collect a small set of essential inputs: location, plot dimensions, budget, building type, floors, and room needs.
- Estimate feasible built-up area against a transparent, region-aware cost model.
- Generate original concept layouts from a structured building model rather than copying existing architectural drawings.
- Keep 2D plans, area calculations, and cost estimates consistent with that model.
- Save projects and compare alternatives when authentication and persistence are introduced.
- Offer a free basic concept first; design memberships/customization can be evaluated after the MVP is validated.

## Current status

The repository is being initialized. See [the product specification](docs/PRODUCT_SPEC.md), [architecture](docs/ARCHITECTURE.md), [roadmap and task tracker](docs/ROADMAP.md), and [cost-estimation policy](docs/COST_ESTIMATION.md).

## Planned stack

- Frontend: React, TypeScript, Vite
- API: Python, FastAPI
- Cost engine: deterministic, tested Python calculations with dated/versioned rate assumptions
- Geometry: canonical structured plan model; SVG 2D renderer first, 3D viewer later
- Persistence: PostgreSQL when project accounts/saved projects are added
- CI: GitHub Actions for frontend and backend checks

The first milestone deliberately prioritizes a working, explainable feasibility calculator before AI-generated geometry or 3D rendering.

## Local development

### Frontend

```bash
npm install
npm run dev
```

### Backend (once the API scaffold is added)

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment variables

Do not commit secrets. A future backend will use environment variables for database credentials and any optional AI provider key. The core feasibility calculator must work without a paid AI API.

## Principles

1. **Original output:** use general design principles as inspiration, not copied plans, drawings, text, or assets.
2. **Explain assumptions:** every estimate should disclose rate source, effective date, inclusions, exclusions, and uncertainty.
3. **Geometry before imagery:** a floor plan must be represented as structured data so area, labels, exports, and future 3D views agree.
4. **Human review:** regulatory compliance and structural safety require qualified local professionals.
5. **No fake live prices:** never call benchmark assumptions a current quote unless verified against a current source.
6. **Small, testable increments:** every completed task should have a code change, test/evidence, and tracker update.
