# Contributing

Jurix is a reference implementation of a contract approval workflow: a status machine, an immutable version for every change, and an audit row written in the same database transaction.

## Setup

Requirements: Node.js 20+, pnpm 10+, and Docker.

```bash
git clone https://github.com/victor-dias-dev/Jurix
cd Jurix
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate && pnpm db:seed
pnpm dev
```

The API listens on http://localhost:3001 and the app on http://localhost:3000. pgAdmin is optional: `docker compose --profile tools up -d`.

## Checks

```bash
pnpm lint
pnpm test
pnpm --filter @jurix/backend test:e2e
pnpm build
```

`pnpm test` covers the status machine and the service rules. The end-to-end test needs Postgres with the variables from `.env.example` (host port `5433` when you use Docker Compose).

## Pull requests

- Keep a change focused on one behavior.
- Add or update a test when you change a status transition, a permission, or the audit trail.
- Do not commit `.env` or real secrets.
- Run `pnpm lint` and `pnpm test` before opening the pull request.

## Good first issues

These three are open on purpose. Copy one into a GitHub issue if it is not already there.

1. **OpenAPI for the auth module.** Generate an OpenAPI description from the Zod schemas in `apps/backend/src/modules/auth/schemas` and serve it from the API. Start with login, refresh, and logout.
2. **Rate limit on login.** Add a limit to `POST /api/auth/login` so repeated failures from one address are rejected. Cover it with a test.
3. **Immutable audit rows.** Add a Postgres trigger that refuses `UPDATE` and `DELETE` on `audit_logs`. The application already writes the row inside the contract transaction; the database should make that write final.
