---
type: Plan
title: "B-lite scaling — recurring subcollection + offline persistence"
description: "Migrate recurringTransactions to a subcollection and enable Firestore offline persistence now; defer virtualization/PWA to launch."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/56"
tags: [plan, scaling, firestore, offline]
created: 2026-08-06
updated: 2026-08-06
status: in-progress
sources: ["raw/56-blite-recurring-migration/56-blite-recurring-migration.md"]
related:
  - "wiki/bugs/transactions-array-write-back.md"
  - "wiki/decisions/pwa-strategy.md"
  - "wiki/plans/go-to-market.md"
---

# Plan: B-lite Scaling

Status: in-progress

## Goal

Address the two highest-value/lowest-risk items from #56 now:

1. Migrate `recurringTransactions[]` to a subcollection (consistency with the transactions migration; removes the second-largest array from the 1 MiB main doc).
2. Enable Firestore offline persistence (offline reads of synced data + queued writes).

Defer virtualization/pagination, PWA service worker, and remaining array migrations to the launch phase.

## Steps

1. [ ] Add `recurringTransactionConverter` + refs in `src/lib/converters.ts`
2. [ ] Add `recurringTransactions` subcollection rule in `firestore.rules`
3. [ ] Add `backfillRecurringToSubCollection()` in `src/store/sync/index.ts`; call on init
4. [ ] Load recurring from subcollection via `onSnapshot` in `useSyncFinance.ts`
5. [ ] Route all 11 store write sites to the subcollection (helper `persistRecurringToSubcollection`)
6. [ ] Enable offline persistence in `src/lib/firebase.ts` (`initializeFirestore` + `persistentLocalCache`)
7. [ ] Grep to confirm no main-doc `recurringTransactions:` writes remain
8. [ ] Verify: build + lint + OKF

## Dependencies

- [[wiki/bugs/transactions-array-write-back]] — established the subcollection persistence pattern (helper + changed-only writes)
- [[wiki/decisions/pwa-strategy]] — offline asset caching deferred to PWA step
- [[wiki/plans/go-to-market]] — remaining scale items tracked for launch

## Verification

- `npm run build` clean; `npm run lint` no new issues
- Real-login smoke test: backfill runs, recurring loads from subcollection, add/update/delete persist correctly
- Wiki updated post-implementation (this plan → completed)

## Related

- Source: [raw/56-blite-recurring-migration](raw/56-blite-recurring-migration/56-blite-recurring-migration.md)
