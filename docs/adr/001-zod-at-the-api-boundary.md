# ADR 001: Zod at the API boundary

## Status

Accepted

## Context

Every HTTP body that changes a user, a session, or a contract has to be checked before a service runs. The same shapes are useful to the Next.js app.

## Decision

Request bodies are parsed with Zod in a pipe at the controller. The inferred type is the input of the service. `@jurix/shared-types` holds the enums, the status machine, and the permission helpers that both apps import. Class-validator is not used.

Query strings are still checked by the controller pipes that already exist for list endpoints. Zod stays the place where a new field gets its rule.

## Consequences

A new field is a schema change plus a test of the rule it encodes. The service can trust the shape, and it still has to enforce the workflow, because a valid body can still be an illegal status transition.
