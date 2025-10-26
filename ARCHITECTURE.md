# Hiring Tracker Architecture

## Overview

Hiring Tracker is a stateless web application that visualizes candidate journeys for recruiters and applicants.
It consists of a Vite + React frontend and an Express backend, packaged in a hardened multi-stage Docker image.

## Frontend

- **Framework**: React 18 with TypeScript and Vite.
- **Styling**: TailwindCSS and shadcn-inspired tokens.
- **State/Data**: React Query manages remote state with optimistic updates after drag-and-drop changes.
- **Internationalization**: i18next loads translation files from `frontend/public/locales`.
- **Accessibility**: Semantic HTML, keyboard-friendly drag/drop, and high-contrast theming.
- **Animations**: Framer Motion powers progress and card transitions.
- **Integration**: `src/lib/atsAdapter.ts` normalizes external ATS data using `config/status-map.json`.

## Backend

- **Server**: Express 4 with security middleware (Helmet, compression) and structured logging via pino.
- **Static Assets**: Serves `/public` which is populated by the frontend build pipeline.
- **API**:
  - `GET /api/status/all` returns masked candidate summaries.
  - `GET /api/status/:candidateId` returns a detailed record with timeline.
  - `POST /api/status/:candidateId` allows stage updates (mock automation hooks).
  - `GET /api/track?t=<JWT>` validates short-lived JWT links for candidates.
  - `POST /api/webhooks/ats` validates HMAC-signed webhook payloads and deduplicates by `event_id`.
  - `GET /health` and `GET /metrics` expose health and operational telemetry.
- **Data**: In-memory map seeded from `config/mock-candidates.json`. No persistent database.

## Security Controls

- HTTPS enforcement when `NODE_ENV=production`.
- Helmet-managed HSTS, CSP, no-sniff, and permissions-policy headers.
- JWT verification for candidate links; secrets loaded from environment.
- Webhook signature validation using SHA-256 HMAC and replay protection.
- Structured logs carry request IDs generated per request.

## Testing

- **Unit**: Validates status mapping and JWT signing logic with Vitest.
- **Contract**: Exercises the ATS adapter to ensure normalized stage output.
- **E2E**: Playwright scripts cover recruiter and candidate flows against a running server.

## Observability

- Pino HTTP logging emits JSON lines for easy ingestion.
- `/metrics` returns runtime metrics suitable for scraping.
- Optional analytics via `ANALYTICS_WRITE_KEY`, disabled by default.

## Containerization

- Multi-stage Dockerfile builds the frontend, prunes dev dependencies, and runs as an unprivileged user.
- Read-only filesystem with only necessary directories writable.
- HEALTHCHECK probes `/health` to support orchestrators.

## Future Integrations

- `atsAdapter` can be extended to fetch live data from Greenhouse, Lever, or Workday.
- Replace in-memory state with a cache or microservice when multi-instance scaling is needed.
- Connect automation preview to email/SMS providers via the provided API keys.
