# Privacy, storage, and retention

## Data handled
The planner processes a city/region, plot dimensions, budget, room count, finish preference and generated geometry. Treat these as personal project information even without a name or street address.

## Browser-only storage
Anonymous concepts are stored in local storage on the current device and are not synced. Anyone with access to that browser profile may be able to view or delete them. Users can delete local projects or clear site data.

## Account-backed storage
The API stores an email, Argon2id password hash, project title, JSON snapshots, review-request notes and timestamps in PostgreSQL. Passwords are never stored in plaintext. Project routes are owner-scoped. Account deletion requires the current password and deletes the account and owned projects; database backups may retain deleted records until backup retention expires.

## Diagnostics
The frontend error boundary does not transmit analytics or exception contents to a third party. It offers an optional diagnostic JSON containing only an incident ID, timestamp, app version and generic error category. It intentionally excludes stack traces, addresses, budgets, credentials and project payloads. The API does not log request bodies or bearer tokens by design. Hosting-provider access logs and database backups are still governed by their provider retention settings.

## Professional review workflow
An authenticated user can submit a review request for a saved cloud project and view its status. Requests are stored as requested until an authorized reviewer changes the status. The application does not assign a real architect, send email, promise a response, or represent the result as statutory approval. Do not include sensitive information in review notes.

## Security boundaries
- Use HTTPS, a private PostgreSQL database, a random JWT secret and exact CORS origins.
- Auth routes have per-IP limits; the default in-memory limiter is not a substitute for a shared Redis/gateway limiter on multi-instance production.
- REVIEW_ADMIN_TOKEN is a separate secret for the review-decision endpoint. Do not share it with clients.
- Do not log passwords, bearer tokens or full project payloads.
- Email verification and password recovery are not yet wired to an email delivery provider.
- Never put database credentials or JWT secrets in Vite variables.

## Limitations
This implementation is not a substitute for a security audit or legal review. Configure retention, backup expiry, monitoring, email verification/recovery and a formal privacy-request workflow before public launch. Do not submit street-level property data until production privacy controls are approved.
