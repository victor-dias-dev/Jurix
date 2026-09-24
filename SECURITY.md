# Security

Jurix stores contract text, account passwords, and an audit trail. Report vulnerabilities privately.

## Reporting

Open a [private security advisory](https://github.com/victor-dias-dev/Jurix/security/advisories/new) on this repository. Do not file a public issue, and do not include exploit details in a pull request.

Include the affected version or commit, the role required to trigger the issue, and the impact you observed.

## What this repository already enforces

- The API process refuses to start when `JWT_SECRET` or `JWT_REFRESH_SECRET` is missing. There is no default signing key.
- Refresh tokens are stored as SHA-256 hashes. Logout and user deactivation revoke the active hashes.
- Login returns the same message for an unknown account, a wrong password, and an inactive account.
- Demo passwords in the README exist only for a local database created by `pnpm db:seed`. Do not reuse them anywhere else.

## Out of scope

The demo seed, the local pgAdmin profile, and the example secrets in `.env.example` are development defaults. A production deployment must replace every secret and must not expose pgAdmin.
