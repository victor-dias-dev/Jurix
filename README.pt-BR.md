# Jurix

[English](README.md)

[![CI](https://github.com/victor-dias-dev/Jurix/actions/workflows/ci.yml/badge.svg)](https://github.com/victor-dias-dev/Jurix/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

Workflow de contratos corporativos: uma máquina de estados fixa, uma versão imutável a cada mudança, e um registro de auditoria gravado na mesma transação do banco que a mudança.

`DRAFT` vai para `IN_REVIEW`, e de lá para `APPROVED` ou `REJECTED`. `REJECTED` pode voltar para `DRAFT`. Quem é VIEWER não lê rascunho. Contrato aprovado não se edita nem se exclui. Não é uma suíte jurídica: não há SSO real, nem assinatura digital, nem biblioteca de cláusulas.

![Dashboard](docs/screenshots/dashboard.png)
![Contratos](docs/screenshots/contracts.png)
![Revisão](docs/screenshots/review.png)

## O que o app cobre

- Login com três papéis: ADMIN, LEGAL e VIEWER
- Contratos: criar, editar, enviar, aprovar, rejeitar e voltar para rascunho
- Versões imutáveis e log de auditoria
- Administração de usuários
- Exportação do contrato em PDF

## Requisitos

- Node.js 20+
- pnpm 10+
- Docker e Docker Compose

## Como subir

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Usuários do seed: `admin@jurix.com` / `Admin@123`, `legal@jurix.com` / `Legal@123`, `viewer@jurix.com` / `Viewer@123`.

`pnpm dev` sobe a API NestJS e o app Next.js. Separado: `pnpm dev:backend` e `pnpm dev:frontend`.

App: http://localhost:3000. Prefixo da API: `/api`. Saúde: `GET /api/health`.

A API recusa subir se faltar `JWT_SECRET` ou `JWT_REFRESH_SECRET`. Copie o exemplo e deixe segredo real fora do git. O Compose publica o Postgres na porta `5433` do host.

pgAdmin opcional: `docker compose --profile tools up -d`, depois http://localhost:5050 (`admin@jurix.local` / `admin123`).

| Variável | Função |
| --- | --- |
| `NODE_ENV` | `development`, `test` ou `production` |
| `PORT` | Porta da API (`3001`) |
| `DB_HOST` | Host do PostgreSQL |
| `DB_PORT` | Porta do PostgreSQL (`5433` com o Compose) |
| `DB_USERNAME` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_DATABASE` | Nome do banco |
| `JWT_SECRET` | Segredo do access token. Obrigatório |
| `JWT_EXPIRES_IN` | Validade do access token (`15m`) |
| `JWT_REFRESH_SECRET` | Segredo do refresh token. Obrigatório |
| `JWT_REFRESH_EXPIRES_IN` | Validade do refresh token (`7d`) |
| `CORS_ORIGIN` | Origem permitida no browser |
| `NEXT_PUBLIC_API_URL` | Origem da API, sem `/api` (`http://localhost:3001`) |

## Verificação

```bash
pnpm test
pnpm --filter @jurix/backend test:e2e
pnpm lint
pnpm build
```

Os testes e2e exigem PostgreSQL com as variáveis do `.env.example`.

## Repositório

```text
apps/backend        API REST NestJS
apps/frontend       Next.js 14
packages/shared-types  Papéis, máquina de estados e permissões
```

Regras de negócio: [rules-documentation.md](rules-documentation.md). Notas técnicas: [tech-documentation.md](tech-documentation.md). Decisões: [docs/adr](docs/adr/001-zod-at-the-api-boundary.md). Por que a versão existe: [docs/pt/blog/aprovacao-de-contrato-sem-perder-historico.md](docs/pt/blog/aprovacao-de-contrato-sem-perder-historico.md).

## Contribuição

Veja [CONTRIBUTING.md](CONTRIBUTING.md). Falha de segurança entra pelo [reporte privado](https://github.com/victor-dias-dev/Jurix/security/advisories/new), descrito em [SECURITY.md](SECURITY.md).

Licença [MIT](LICENSE).
