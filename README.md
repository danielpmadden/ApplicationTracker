# Hiring Tracker

Domino's tracker for hiring — no excuses for ghosting.

## Overview

Hiring Tracker is a secure, Dockerized web application that gives recruiters and candidates real-time visibility into application progress. A modern React UI provides a drag-and-drop recruiter dashboard and a Domino's-style candidate progress tracker backed by a hardened Express API.

## Quick Start (Docker)

```bash
docker build -t hiring-tracker .
docker run -p 8080:80 \
  -e JWT_SECRET=change-me \
  hiring-tracker
```

Navigate to <http://localhost:8080> for the recruiter dashboard. Generate candidate tracking links by signing JWTs containing `candidate_id`, `job_id`, and a short-lived `exp` claim with the same `JWT_SECRET`.

## Configuration

Set the following environment variables to tune behavior:

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | Optional | Port for the Express server (defaults to 80). |
| `NODE_ENV` | Optional | `production` enables HTTPS enforcement and optimized logging. |
| `JWT_SECRET` | **Yes** | Secret used to sign and verify candidate tracking links. |
| `WEBHOOK_HMAC_SECRET` | Optional | Enables HMAC verification for `/api/webhooks/ats`. |
| `EMAIL_PROVIDER_KEY` | Optional | Placeholder for future notification integrations. |
| `SMS_PROVIDER_KEY` | Optional | Placeholder for SMS integrations. |
| `ANALYTICS_WRITE_KEY` | Optional | Enables privacy-friendly analytics headers when set. |

## Demo Data

Mock candidate data lives in `config/mock-candidates.json`. Update or extend this file to simulate different pipelines. Status values are normalized via `config/status-map.json`.

To preview the candidate tracker locally:

```bash
npm install
npm --prefix frontend install
npm run build:frontend
npm run sync:frontend
PORT=4173 JWT_SECRET=insecure-default npm start
```

Then sign a token:

```bash
node -e "console.log(require('jsonwebtoken').sign({candidate_id:'cand-001', job_id:'job-123', exp: Math.floor(Date.now()/1000)+600}, 'insecure-default'))"
```

Visit `http://localhost:4173/track?t=<token>`.

## Security Summary

- Strict CSP, HSTS, and no-sniff headers enforced by Helmet.
- HTTPS enforcement in production environments.
- JWT-based candidate links with short-lived expirations.
- Webhooks secured via SHA-256 HMAC signatures and replay protection.
- No persistent data store; only masked names and initials are served.

## Testing & CI

- `npm run lint` — ESLint + Prettier formatting rules.
- `npm run test` — Vitest unit and contract suites.
- `npm run test:e2e` — Playwright flows (requires running server).
- GitHub Actions workflow (`.github/workflows/ci.yml`) builds, lints, tests, and runs end-to-end checks with health probes.

## License

Released under the [MIT License](LICENSE).
