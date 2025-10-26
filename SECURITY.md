# Security Policy

## Supported Versions

The main branch receives security updates. Please keep dependencies current.

## Reporting a Vulnerability

Email security@hiringtracker.example with a detailed description of the vulnerability, steps to reproduce, and suggested mitigation.
We aim to acknowledge reports within 48 hours.

## Best Practices

- All tokens are signed with `JWT_SECRET` and expire quickly. Never share links publicly.
- Webhooks must be signed with `WEBHOOK_HMAC_SECRET`. Events are deduplicated using `event_id`.
- Only masked candidate names and initials are ever served by the API. Do not introduce persistent PII storage.
- Enforce HTTPS (reverse proxy or load balancer) in production. HSTS and CSP are enabled by default.
- Secrets must be provided via environment variables. Never commit `.env` files.

Thank you for helping keep Hiring Tracker secure.
