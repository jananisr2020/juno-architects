# Architecture

## Direction
Begin as a modular monolith. Avoid microservices until real usage warrants them.

```text
Browser -> React + TypeScript UI -> JSON API -> FastAPI
                                         ├─ validation
                                         ├─ feasibility service
                                         ├─ versioned rate configuration
                                         └─ later: structured plan generator / auth / projects
                                              -> PostgreSQL
```

## Rules
- Keep cost calculations pure and deterministic; rate assumptions live in versioned data, not UI code.
- Use one canonical plan model for 2D, 3D, area calculations, and exports.
- AI may propose constraints/layout candidates; deterministic validation checks dimensions, overlaps, boundaries, and room connectivity before display.
- Never treat a raster image as an editable measured floor plan.
- Keep secrets in environment variables; never commit credentials.
- Do not persist home details before defining privacy, access, retention, and deletion controls.

## Planned modules
- `src/`: frontend UI.
- `backend/app/main.py`: API entry point.
- `backend/app/schemas.py`: request and response contracts.
- `backend/app/services/feasibility.py`: cost/area logic.
- `backend/app/data/rates.json`: dated benchmark configuration.
- `docs/`: product, architecture, cost policy, roadmap.

## API direction
`POST /api/v1/feasibility` accepts project inputs and returns normalized values, an indicative area range, itemized allowances, assumptions/exclusions, rate configuration ID, and professional-review warnings. The API must validate inputs and version its contract.