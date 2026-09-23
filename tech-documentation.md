# Technical notes

Jurix is a pnpm workspace. The pieces that exist in this repository are the ones below. Decisions that are easy to relitigate are written down in [docs/adr](docs/adr/001-zod-at-the-api-boundary.md).

```
jurix/
├── apps/
│   ├── backend/          # NestJS REST API
│   └── frontend/         # Next.js 14 (App Router)
├── packages/
│   └── shared-types/     # Enums, status machine, permission helpers
├── docs/
│   ├── adr/
│   ├── blog/
│   └── pt/
├── .github/workflows/    # CI: lint, test, e2e, build
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

## Backend

```
apps/backend/src/
├── config/               # Database and JWT. JWT secrets are required.
├── database/
│   ├── migrations/       # One Knex file per table
│   ├── seeds/
│   └── knexfile.ts
├── models/               # Sequelize models
├── modules/
│   ├── auth/
│   ├── users/
│   ├── contracts/
│   ├── audit/
│   └── health/
└── common/               # Zod pipe, HTTP exception filter
```

Runtime queries and transactions use Sequelize. Knex applies migrations and seeds only. `synchronize` is off.

Request bodies are validated with Zod. The status machine and the permission helpers live in `@jurix/shared-types` and are covered by unit tests. Contract create, update, status change, and delete pass the Sequelize transaction into the version insert and into `AuditService.log`.

Refresh tokens are SHA-256 hashes in `refresh_tokens`. The users table does not store the token.

Ports and variables are the ones in `.env.example`: API `3001`, app `3000`, Postgres on host port `5433`.

## Frontend

```
apps/frontend/src/
├── app/                  # App Router, including the authenticated routes
├── components/
├── lib/api.ts            # Fetch client. NEXT_PUBLIC_API_URL is the origin; /api is prefixed here.
├── store/
└── middleware.ts
```

`next dev` uses port 3000. `next.config.js` reads the root `.env` so `NEXT_PUBLIC_API_URL` is the same value the API example uses.

## Tests and CI

- `packages/shared-types`: status transitions and permissions.
- `apps/backend`: contract workflow and auth rules, with models mocked.
- `apps/backend` `test:e2e`: migrate, seed, invalid login, create, and submit, against Postgres.

GitHub Actions runs lint, unit tests, the end-to-end test on `postgres:16-alpine`, and the build. See [.github/workflows/ci.yml](.github/workflows/ci.yml).

Business behavior is described in [rules-documentation.md](rules-documentation.md).
