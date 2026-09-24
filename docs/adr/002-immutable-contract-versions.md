# ADR 002: Contract versions are immutable

## Status

Accepted

## Context

An approval workflow is useless if the text that was approved can be overwritten. Reviewers need the exact title, body, and status that existed when someone submitted or rejected the contract.

## Decision

`contracts` holds the current row. Every create, edit, and status change inserts a new `contract_versions` row and increments `current_version`. Version rows are never updated. A rejected contract can return to `DRAFT`; that return is itself a new version, not an edit of the rejected one.

The allowed transitions live in `@jurix/shared-types` (`VALID_STATUS_TRANSITIONS`). The service refuses anything else.

## Consequences

History grows with every save. That is the point. Storage cost stays small relative to the text of a contract. Readers who need "what was approved" query versions, not the mutable row.
