---
type: Bug
title: "Legacy transactions[] written back to main user doc"
description: "5 store actions re-wrote the full transactions array to the dead transactions field on users/{uid} — re-bloating toward 1 MiB and losing renames on reload. Fixed by persisting changed transactions to the subcollection."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/56"
tags: [bug, scaling, firestore, transactions]
created: 2026-08-06
updated: 2026-08-06
status: fixed
severity: major
sources: ["raw/scaling-limits-review/scaling-limits-review.md"]
related:
  - "wiki/decisions/firestore-rate-limiting.md"
  - "wiki/architecture/concerns-and-tech-debt.md"
---

# Bug: Legacy transactions[] written back to main user doc

Status: fixed
Severity: major

## Symptom

After transactions were migrated to the `users/{uid}/transactions` subcollection, five store actions still wrote the **full transactions array** back to the legacy `transactions` field on the main `users/{uid}` doc:

- `_migrateToMultiAccount`
- `renameCategory`
- `renameSubcategory`
- `deleteSubcategoryAndRemap`
- `moveSubcategory`

Consequences:
1. **Doc bloat** — the dead `transactions[]` array re-appeared in the main doc, risking the 1 MiB Firestore document limit (write amplification on every rename/move).
2. **Lost renames** — reads now come only from the subcollection (`onSnapshot` in `useSyncFinance.ts`), so the rename/remap never persisted anywhere real and silently reverted on reload.

## Reproduction

1. Open Config → rename a category that has transactions.
2. Reload the app — the renamed category reverts to the old name (because the subcollection docs were never updated).
3. Inspect Firestore `users/{uid}` — the `transactions` array field exists again with every transaction.

## Root Cause Analysis

The subcollection migration updated transaction **reads** (`onSnapshot(txnsRef)`, `UserDoc` dropped `transactions`), but four rename/remap actions and the migration helper still used the legacy persistence path: `updateDoc(docRef, { transactions: <full array> })`. That both re-created the bloated field and bypassed the subcollection entirely.

## Fix

- Added module-level helper `persistTransactionsToSubcollection(userId, transactions)` in `src/store/useFinanceStore.ts` — writes the given transactions to the subcollection via `writeBatch`, chunked at 400 ops/batch.
- Each affected action now computes only the **changed** transactions (matching its rename/remap predicate) and persists them to the subcollection; the main-doc `updateDoc` writes only the still-valid fields (`categories` / `recurringTransactions`).
- `_migrateToMultiAccount` persists only the transactions it changed (those missing `accountId`).

## Verification

- `npm run build` clean.
- `npm run lint` — no new issues (same pre-existing 19 problems before/after).
- No remaining `transactions:` write to the main doc (grep-verified).

## Related

- [[wiki/decisions/firestore-rate-limiting]]
- [[wiki/architecture/concerns-and-tech-debt]]
- Source: [raw/scaling-limits-review](raw/scaling-limits-review/scaling-limits-review.md)
