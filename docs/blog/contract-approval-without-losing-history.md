# Contract approval without losing the history

An approval button is easy. The hard part is answering, six months later, which text was approved, who sent it to review, and what changed after a rejection. If those answers live in one mutable row, the row is the history, and the history is gone the next time someone clicks save.

Jurix splits that into three records that move together.

## The status machine is data

The allowed transitions are a map, not a chain of `if` statements scattered through controllers:

```
DRAFT → IN_REVIEW → APPROVED
                 ↘ REJECTED → DRAFT
```

`DRAFT` cannot jump to `APPROVED`. `APPROVED` goes nowhere. `REJECTED` can become `DRAFT` again, and that return is a new event, not an undo. The map lives in `packages/shared-types`, so the API and any future client share one definition. A test lists the legal transitions and the ones that must fail. When someone adds a status, the test fails until the map and the callers agree.

## The current row is not the history

`contracts` stores the text people see today. `contract_versions` stores a snapshot each time the text or the status changes: version number, title, body, status, author, and a reason. Rows in that table are inserted and never updated. "What did legal approve?" is a query on versions, filtered by status, not a guess about the current row.

This costs a copy of the text per save. For a contract, that cost is the feature. Editing a version in place would make the audit trail a story about the last person who touched the file.

## The audit row joins the same transaction

A version without a record of who did it, or an audit row whose contract never committed, is how reports drift from the product. Create, update, status change, and delete open one Sequelize transaction. The version insert and the audit insert receive that transaction. If the version insert fails, the audit row rolls back with it.

The audit table is still only immutable by convention. The next step is a Postgres trigger that rejects `UPDATE` and `DELETE` on `audit_logs`, so a console session cannot quietly rewrite the trail. Until that trigger exists, the application is the only writer, and it only inserts.

## What this leaves out

Refresh tokens, roles, and the Next.js screens exist so the workflow can be clicked through. They are not the design. The design is the map of transitions, the append-only version, and the audit write that shares the transaction. Copy those three into another domain — purchase orders, policy exceptions, access reviews — before copying the UI.
