---
type: Feature
title: "Recurring subcollection migration + offline persistence"
description: "recurringTransactions moved from the main user doc array to a Firestore subcollection, and offline persistence enabled via persistentLocalCache."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/56"
tags: [feature, scaling, firestore, offline]
created: 2026-08-06
updated: 2026-08-06
status: implemented
sources: ["raw/56-blite-recurring-migration/56-blite-recurring-migration.md"]
related:
  - "wiki/bugs/transactions-array-write-back.md"
  - "wiki/plans/56-blite-recurring-migration.md"
  - "wiki/decisions/pwa-strategy.md"
---

# Feature: Recurring Subcollection Migration + Offline Persistence

Status: implemented
Priority: high

## Description

Scaling work for [#56](https://github.com/AlexDevsTheWeb/myfinance/issues/56): migrate the `recurringTransactions` array out of the 1 MiB-limited main Firestore user document into its own subcollection (consistent with the earlier transactions migration), and enable Firestore offline persistence so synced data is readable and writes are queued while offline.

## Requirements

- All recurring read/write paths use the `users/{uid}/recurringTransactions/{recId}` subcollection
- Idempotent backfill from the legacy main-doc array, safe to run on every launch
- Legacy main-doc field no longer written; old field left in place for rollback
- Firestore offline persistence active (persistent cache + multi-tab)
- No regression to the 1 MiB limit exposure or rename/remap persistence bugs

## Implementation Notes

- `src/lib/converters.ts`: `RecurringTransactionDoc` interface, `recurringTransactionConverter`, `getRecurringDocRef()`, `getRecurringTransactionsCollectionRef()`
- `firestore.rules`: `match /users/{userId}/recurringTransactions/{recId}` with `isOwner` guard
- `src/store/sync/index.ts`: `backfillRecurringToSubCollection()` — writes only missing docs
- `src/hooks/useSyncFinance.ts`: recurring `onSnapshot` listener replaces main-doc array reads; `checkRecurring` gate waits for both subcollections to load
- `src/store/useFinanceStore.ts`: `persistRecurringToSubcollection()` helper (writeBatch, 400-op chunks); all 11 write sites routed to subcollection (setRecurringTransactions, _migrateToMultiAccount, renameCategory, renameSubcategory, deleteSubcategoryAndRemap, moveSubcategory, addRecurring, updateRecurring, checkRecurring, deleteRecurring, importAllData)
- `src/lib/firebase.ts`: `getFirestore(app)` replaced with `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`, guarded by a pre-flight IndexedDB availability probe — when IndexedDB is unavailable (Safari private browsing, embedded WebViews) it falls back to `getFirestore(app)` (plain in-memory client, identical to pre-persistence behavior). The SDK does not throw synchronously from `initializeFirestore`, so a simple try/catch would not catch the failure.

## Deferred

- Virtualization/pagination of transactions list
- PWA service worker / full offline asset caching
- Remaining array migrations (categories, carMileage, budgetTargets) — tracked in go-to-market plan

## Related

- [[wiki/plans/56-blite-recurring-migration]]
- [[wiki/bugs/transactions-array-write-back]]
- [[wiki/decisions/pwa-strategy]]
- Source: [raw/56-blite-recurring-migration](raw/56-blite-recurring-migration/56-blite-recurring-migration.md)
