# Privacy, storage, and retention

## Data handled by the MVP
The planner asks for a city/region, plot dimensions, budget, room count, finish preference, and generated room geometry. Treat this as personal project information even when it does not include a name or street address.

## Browser-only storage
The unauthenticated concept workspace stores saved concepts in the browser's local storage on the current device. It does not sync to a server. Anyone with access to the same browser profile may be able to view or remove those concepts. Users can delete saved concepts from the workspace or clear the browser's site data.

## Account-backed storage
The API stores an email address, an Argon2id password hash produced by argon2-cffi, project titles, JSON project snapshots, and timestamps in PostgreSQL. Passwords are never stored in plaintext. Project routes filter by authenticated owner; unknown or other-user project IDs return the same 404 response.

## Retention and deletion
Users can delete individual projects through the API. Deleting a project cascades to its snapshots. Account deletion, email verification, password reset, export-all, retention automation, backup expiry, and legal/privacy-request workflows are not yet implemented; do not launch public accounts until those are designed and tested. Database backups may retain deleted records until the configured backup retention period expires.

## Security boundaries
- Configure a random JWT_SECRET of at least 32 characters and use HTTPS in deployment.
- Use a private PostgreSQL database and apply Alembic migrations before starting the API.
- Restrict CORS to the exact production frontend origin at the hosting layer or API gateway.
- Do not log passwords, bearer tokens, or full project payloads.
- Configure rate limiting, abuse monitoring, account verification and recovery before public launch.
- Never put database credentials or JWT_SECRET in Vite variables; variables prefixed VITE_ are public in the browser bundle.

## Limitations
This is a product implementation baseline, not a substitute for a security audit or legal review. Do not submit street-level property data until the production privacy controls and retention terms are approved.
