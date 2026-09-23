# Jurix

[![CI](https://github.com/victor-dias-dev/Jurix/actions/workflows/ci.yml/badge.svg)](https://github.com/victor-dias-dev/Jurix/actions/workflows/ci.yml)

Jurix is a reference implementation of a corporate contract workflow. A contract moves through a fixed status machine, every change is kept as an immutable version, and the audit row is written in the same database transaction as the change.

It is meant for people who want to read, run, and extend that workflow. It is not a complete legal suite: there is no real single sign-on, no digital signature, and no clause library.

[Português](docs/pt/README.md) · [Business rules](rules-documentation.md) · [Technical notes](tech-documentation.md) · [Decisions](docs/adr/001-zod-at-the-api-boundary.md) · [Why versions exist](docs/blog/contract-approval-without-losing-history.md)

## Workflow

```
DRAFT → IN_REVIEW → APPROVED
                 ↘ REJECTED → DRAFT
```

A viewer can read anything except drafts. Editing is allowed on `DRAFT` and `REJECTED` only. An approved contract cannot be deleted.

![Contract in review, with approve and reject](docs/images/approval-flow.png)

## Stack

| App | Role |
| --- | --- |
| `apps/backend` | NestJS API, PostgreSQL, Sequelize at runtime, Knex for migrations |
| `apps/frontend` | Next.js 14, Tailwind, Zustand |
| `packages/shared-types` | Roles, status transitions, permission helpers |

## Run it

Requirements: Node.js 20+, pnpm 10+, Docker.

```bash
git clone https://github.com/victor-dias-dev/Jurix
cd Jurix
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate && pnpm db:seed
pnpm dev
```

- App: http://localhost:3000
- API: http://localhost:3001/api
- Optional pgAdmin: `docker compose --profile tools up -d`, then http://localhost:5050 (`admin@jurix.local` / `admin123`)

The API reads `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DATABASE`. Compose publishes Postgres on host port **5433**. It refuses to start without `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### Demo accounts

These users exist only after `pnpm db:seed` on a local database.

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | admin@jurix.com | Admin@123 |
| LEGAL | legal@jurix.com | Legal@123 |
| VIEWER | viewer@jurix.com | Viewer@123 |

## Checks

```bash
pnpm lint
pnpm test
pnpm --filter @jurix/backend test:e2e
pnpm build
```

## Roadmap

1. OpenAPI generated from the Zod schemas, starting with the auth module.
2. A rate limit on `POST /api/auth/login`.
3. A Postgres trigger that refuses `UPDATE` and `DELETE` on `audit_logs`.

Those three are also listed as starter tasks in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © victor-dias-dev
