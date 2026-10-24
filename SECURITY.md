# Security policy

## Reporting
Please report suspected vulnerabilities privately to the repository owner through GitHub's private vulnerability reporting feature when available. Do not publish credentials, personal data, or exploit details in a public issue.

## Current data-handling boundaries
- Do not commit API keys, database credentials, session secrets, private floor plans, or customer records.
- Do not add authentication or persistent personal project storage without access-control tests and documented retention/deletion behavior.
- Treat all user input and future model output as untrusted.
- Do not send user floor-plan details to third-party AI services without clear disclosure and user consent.
- Keep dependencies updated and review CI results before merging.
