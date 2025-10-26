# Contributing to Hiring Tracker

We welcome contributions that make hiring more transparent. Please follow the guidelines below to help keep our project healthy and secure.

## Development Workflow

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   npm --prefix frontend install
   ```
3. Run the local development server:
   ```bash
   npm run build:frontend && npm run sync:frontend && PORT=4173 npm start
   ```
4. Frontend development can leverage Vite's dev server:
   ```bash
   npm --prefix frontend run dev
   ```

## Coding Standards

- Use TypeScript for frontend code. Avoid the `any` type.
- Follow the linting rules enforced by `npm run lint` and formatting with Prettier.
- Keep accessibility (WCAG 2.2 AA) in mind. Use semantic HTML and keyboard-friendly interactions.
- Never commit real secrets. Use environment variables and update `.env.example` when adding new settings.

## Tests

- Unit & contract tests: `npm run test`
- E2E tests (requires running server):
  ```bash
  PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 JWT_SECRET=insecure-default npm run test:e2e
  ```
- Add or update tests with your feature to maintain coverage.

## Security

- Report vulnerabilities privately to security@hiringtracker.example.
- Validate and sanitize any new external inputs.
- Do not introduce persistent storage of PII.

Thank you for helping build an accountable hiring experience!
