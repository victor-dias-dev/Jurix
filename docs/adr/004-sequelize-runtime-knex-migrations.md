# ADR 004: Sequelize at runtime, Knex for migrations

## Status

Accepted

## Context

The API models relationships, transactions, and eager loads. Migrations need an explicit, ordered SQL history that can be applied to an empty database. Using both libraries as two ways to do the same job produced duplicate migration files.

## Decision

Sequelize is the runtime ORM: models, queries, and transactions. Knex is used only by `pnpm db:migrate` and `pnpm db:seed`. There is one migration file per table. `synchronize` stays off, so Sequelize never alters the schema on boot.

## Consequences

A column exists when both the Knex migration and the Sequelize model name it. Contributors change the schema by adding a migration, not by editing a model and hoping boot will catch up. We do not introduce a second query layer for reports in this repository.
