# ADR 003: Refresh tokens are stored as hashes

## Status

Accepted

## Context

A refresh token is a long-lived credential. Storing it in `users.refresh_token` and comparing it with `!==` leaks the token to anyone who can read the table, and it keeps a single session per user by accident.

## Decision

The API signs the refresh token and stores only its SHA-256 hash in `refresh_tokens`, with `expires_at` and `is_revoked`. Login inserts a row. Refresh finds the hash, revokes it, and inserts the hash of the new token. Logout and user deactivation revoke every active hash for that user.

The users table does not have a refresh-token column. `JWT_SECRET` and `JWT_REFRESH_SECRET` are required at boot.

## Consequences

A database copy does not contain a usable refresh token. A user can hold more than one session, and each one can be revoked on its own. Lookup is by hash, so the comparison does not use the raw token.
