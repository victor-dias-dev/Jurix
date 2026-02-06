# 📄 Plataforma de Contratos Jurídicos

Sistema corporativo para gerenciamento de contratos legais, com controle de acesso, workflow de aprovação, histórico de versões e foco em auditoria e segurança.

---

## 📘 DOCUMENTAÇÃO TÉCNICA (ATUALIZADA — MONOREPO)

Esta aplicação é organizada como um **monorepo**, contendo frontend e backend versionados juntos, compartilhando padrões, configurações e pipelines.

---

## 1. Visão Geral do Monorepo

```
root/
 ├─ apps/
 │   ├─ frontend/        # Next.js (React)
 │   └─ backend/         # REST API Node.js
 ├─ packages/
 │   ├─ shared-types/    # Tipos compartilhados (opcional)
 │   └─ eslint-config/
 ├─ .github/
 │   └─ workflows/
 ├─ package.json
 ├─ pnpm-workspace.yaml
 └─ README.md
```

**Objetivos do monorepo:**

* Consistência de padrões
* Reuso de código
* Evolução coordenada entre front e back
* CI/CD unificado

---

# 🧩 BACKEND — DOCUMENTAÇÃO TÉCNICA

## 2. Visão Geral da Arquitetura (Backend)

Backend baseado em **REST API**, com separação clara de responsabilidades, validação na borda e regras de negócio centralizadas.

```
[ Client (Frontend / API Consumer) ]
              |
              | HTTP (REST)
              |
[ Controllers ]  ← Zod
              |
[ Services ]     ← Regras de negócio
              |
[ Repositories ]
        |                    |
 [ Sequelize ]         [ Knex.js ]
 (CRUD / Models)   (Migrations / SQL)
              |
         PostgreSQL
```

---

## 3. Stack Tecnológica (Backend)

* Node.js
* TypeScript
* REST API
* Express ou NestJS
* PostgreSQL
* Sequelize (ORM)
* Knex.js (migrations e SQL avançado)
* Zod (validação)
* JWT (Access + Refresh Token)
* RBAC

---

## 4. Estrutura de Pastas (Backend)

```
apps/backend/src/
 ├─ controllers/
 ├─ services/
 ├─ repositories/
 ├─ models/
 ├─ schemas/
 ├─ middlewares/
 ├─ database/
 │   ├─ knexfile.ts
 │   └─ migrations/
 ├─ enums/
 └─ app.ts
```

---

## 5. REST API — Padrões (Backend)

**Auth**

```
POST /auth/login
POST /auth/refresh
POST /auth/sso
```

**Contracts**

```
POST   /contracts
GET    /contracts
GET    /contracts/:id
PUT    /contracts/:id
DELETE /contracts/:id
```

**Workflow**

```
POST /contracts/:id/submit
POST /contracts/:id/approve
POST /contracts/:id/reject
```

**Histórico**

```
GET /contracts/:id/versions
```

---

## 6. Validação com Zod (Backend)

Toda entrada HTTP (body, params, query) é validada antes de chegar aos services.

Zod atua como **contrato da API**.

---

## 7. Autenticação e Segurança (Backend)

* JWT obrigatório em rotas privadas
* Middleware de autenticação
* Middleware de roles (RBAC)
* SSO Mock simulando Azure AD / Okta

---

## 8. Persistência (Backend)

**Sequelize**

* Modelagem de entidades
* Relacionamentos
* Transações

**Knex.js**

* Migrations versionadas
* Queries complexas
* Relatórios e auditoria

---

## 9. Auditoria e Versionamento (Backend)

* Toda alteração gera nova versão
* Logs de auditoria imutáveis
* Rastreabilidade completa

---

# 🎨 FRONTEND — DOCUMENTAÇÃO TÉCNICA

## 10. Visão Geral da Arquitetura (Frontend)

Frontend construído com **Next.js**, focado em segurança, performance e SSR para áreas privadas.

```
[ Browser ]
     |
     | SSR / CSR
     |
[ Next.js ]
     |
[ REST API Backend ]
```

---

## 11. Stack Tecnológica (Frontend)

* Next.js
* React
* TypeScript
* Tailwind CSS
* SSR para rotas privadas
* CSR para interações

---

## 12. Estrutura de Pastas (Frontend)

```
apps/frontend/
 ├─ app/ or pages/
 ├─ components/
 ├─ hooks/
 ├─ services/        # API client
 ├─ store/           # estado global
 ├─ schemas/         # Zod (opcional, espelhando backend)
 ├─ styles/
 └─ middleware.ts    # proteção de rotas
```

---

## 13. Autenticação (Frontend)

* Tokens armazenados de forma segura
* Middleware do Next.js protege rotas privadas
* SSR valida sessão antes de renderizar

---

## 14. Comunicação com Backend

* REST API
* API Client centralizado
* Tratamento global de erros
* Loading e retry controlados

---

## 15. Performance (Frontend)

* SSR para páginas autenticadas
* Code splitting
* Componentes reutilizáveis
* Otimização de bundle

---

## 16. Testes (Frontend)

* Unitários (componentes e hooks)
* E2E (fluxos principais)

---

# ⚙️ CI/CD — MONOREPO

## 17. Pipeline

* Lint front e back
* Testes unitários e e2e
* Build frontend e backend

Opcional:

* Deploy por app

---

## ✅ Considerações Técnicas Finais

Este monorepo demonstra maturidade técnica ao unir:

* Backend REST robusto
* Frontend moderno com SSR
* Validação forte com Zod
* Arquitetura limpa
* Governança e auditoria

Projeto alinhado a ambientes corporativos e vagas sênior.
