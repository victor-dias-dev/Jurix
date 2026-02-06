# 🏛️ Jurix - Plataforma de Contratos Jurídicos

Sistema corporativo para gerenciamento de contratos legais, com controle de acesso, workflow de aprovação, histórico de versões e foco em auditoria e segurança.

## 📋 Índice

- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Usuários de Demonstração](#-usuários-de-demonstração)
- [API Endpoints](#-api-endpoints)

## 🏗️ Arquitetura

Este projeto é organizado como um **monorepo** usando pnpm workspaces:

```
jurix/
├── apps/
│   ├── backend/      # NestJS REST API
│   └── frontend/     # Next.js 14 (App Router)
├── packages/
│   └── shared-types/ # Tipos TypeScript compartilhados
└── docker-compose.yml
```

### Stack Tecnológica

**Backend:**
- NestJS + TypeScript
- PostgreSQL
- Sequelize (ORM) + Knex.js (Migrations)
- JWT (Access + Refresh Token)
- RBAC (Role-Based Access Control)

**Frontend:**
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Zustand (Estado global)

## 📦 Pré-requisitos

- Node.js 18+
- pnpm 8+
- Docker e Docker Compose

## 🚀 Instalação

1. **Clone o repositório:**
```bash
git clone <repo-url>
cd jurix
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Inicie o banco de dados:**
```bash
docker-compose up -d
```

4. **Configure as variáveis de ambiente:**

O backend já possui um arquivo `.env` configurado para desenvolvimento local.
Para produção, copie `.env.example` e configure as variáveis.

5. **Execute as migrations:**
```bash
pnpm db:migrate
```

6. **Popule o banco com dados iniciais:**
```bash
pnpm db:seed
```

## ▶️ Executando o Projeto

**Desenvolvimento (frontend e backend simultaneamente):**
```bash
pnpm dev
```

**Apenas backend:**
```bash
pnpm dev:backend
```

**Apenas frontend:**
```bash
pnpm dev:frontend
```

### URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **pgAdmin:** http://localhost:5050 (admin@jurix.local / admin123)

## 📁 Estrutura do Projeto

### Backend (`apps/backend/src/`)

```
src/
├── config/           # Configurações (DB, JWT)
├── database/
│   ├── migrations/   # Migrations Knex
│   └── seeds/        # Seeds para dados iniciais
├── models/           # Modelos Sequelize
├── modules/
│   ├── auth/         # Autenticação JWT
│   ├── users/        # Gerenciamento de usuários
│   ├── contracts/    # CRUD e workflow de contratos
│   └── audit/        # Logs de auditoria
├── app.module.ts
└── main.ts
```

### Frontend (`apps/frontend/src/`)

```
src/
├── app/
│   ├── (authenticated)/  # Rotas protegidas
│   │   └── dashboard/
│   ├── login/
│   └── page.tsx          # Landing page
├── components/
│   └── layout/           # Sidebar, Header
├── lib/                  # Utilitários e API client
└── store/                # Zustand stores
```

## 👤 Usuários de Demonstração

Após executar o seed, os seguintes usuários estão disponíveis:

| Perfil | Email | Senha | Permissões |
|--------|-------|-------|------------|
| **ADMIN** | admin@jurix.com | Admin@123 | Acesso total |
| **LEGAL** | legal@jurix.com | Legal@123 | Criar, editar, aprovar contratos |
| **VIEWER** | viewer@jurix.com | Viewer@123 | Apenas visualização |

## 🔌 API Endpoints

### Autenticação

```
POST /api/auth/login      # Login
POST /api/auth/refresh    # Renovar token
POST /api/auth/logout     # Logout
```

### Contratos

```
GET    /api/contracts           # Listar contratos
POST   /api/contracts           # Criar contrato
GET    /api/contracts/:id       # Obter contrato
PUT    /api/contracts/:id       # Atualizar contrato
DELETE /api/contracts/:id       # Excluir contrato (ADMIN)

POST   /api/contracts/:id/submit    # Enviar para revisão
POST   /api/contracts/:id/approve   # Aprovar
POST   /api/contracts/:id/reject    # Rejeitar
GET    /api/contracts/:id/versions  # Histórico de versões
```

### Usuários

```
GET    /api/users       # Listar usuários (ADMIN)
POST   /api/users       # Criar usuário (ADMIN)
GET    /api/users/me    # Usuário atual
GET    /api/users/:id   # Obter usuário (ADMIN)
PUT    /api/users/:id   # Atualizar usuário (ADMIN)
DELETE /api/users/:id   # Desativar usuário (ADMIN)
```

### Auditoria

```
GET /api/audit          # Logs de auditoria
GET /api/audit/entity   # Logs por entidade
```

## 📜 Workflow de Contratos

```
DRAFT → IN_REVIEW → APPROVED
                ↘ REJECTED → DRAFT
```

- **DRAFT:** Rascunho, pode ser editado livremente
- **IN_REVIEW:** Em análise, bloqueado para edição
- **APPROVED:** Aprovado, somente leitura
- **REJECTED:** Rejeitado, pode retornar para DRAFT

## 🔐 Permissões (RBAC)

| Ação | ADMIN | LEGAL | VIEWER |
|------|-------|-------|--------|
| Criar contrato | ✅ | ✅ | ❌ |
| Editar contrato | ✅ | ✅ | ❌ |
| Excluir contrato | ✅ | ❌ | ❌ |
| Aprovar/Rejeitar | ✅ | ✅ | ❌ |
| Visualizar contrato | ✅ | ✅ | ✅* |
| Gerenciar usuários | ✅ | ❌ | ❌ |

*VIEWER não vê contratos em DRAFT

## 🛡️ Segurança

- JWT com Access Token (15min) + Refresh Token (7 dias)
- Logs de auditoria imutáveis
- Validação de dados com class-validator (backend) e Zod (compartilhado)
- Senhas hasheadas com bcrypt
- CORS configurado

---

Desenvolvido para demonstrar maturidade técnica em ambientes corporativos.
