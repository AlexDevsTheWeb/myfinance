---
type: Bug
title: "Firestore rules drift — deployed rules missing the recurringTransactions path"
description: "Deployed Firestore rules predated the recurring subcollection rule, silently denying every recurring read/backfill so checkRecurring could never run — fixed by redeploying repo rules + gate hardening."
tags: [bug, firestore, rules, recurring, infra]
created: 2026-10-01
updated: 2026-10-01
status: fixed
severity: critical
sources: ["raw/bugs/firestore-rules-drift/firestore-rules-drift.md"]
related: ["wiki/bugs/recurring-preload-month-bound", "wiki/features/first-of-month-recurring/first-of-month-recurring"]
---

# Bug: Firestore rules drift — recurringTransactions path denied

Status: **fixed**
Severity: **critical**

## Symptom

On October 1st the app showed **only the day-1 recurring instance** despite the full-month
preload fix being deployed. Console showed unattributed errors:

- `Uncaught Error in snapshot listener: FirebaseError: [code=permission-denied]`
- `Error in initializeUser transaction: FirebaseError: Missing or insufficient permissions.`

The 10s gate diagnostic pinpointed it:

```json
{ "gates": { "hasLoaded": true, "txnsLoaded": true, "recurringLoaded": false },
  "syncErrors": {
    "users/…/recurringTransactions": "Missing or insufficient permissions.",
    "users/… (initializeUser)": "Missing or insufficient permissions." },
  "templatesLoaded": 12, "lastRecurringCheck": null }
```

## Reproduction

1. Load the app with stale rules deployed (any date).
2. Within 10s the console prints the `[sync] recurring check still not run` diagnostic with
   `recurringLoaded: false` and both denied-path errors.

## Root Cause Analysis

**The rules RELEASE live in Firebase console was stale.** Repo `firestore.rules` has included
the `users/{userId}/recurringTransactions` rule since `f20161f` (2026-08-06, #56 migration),
but the last deploy-adjacent rules commit predates it (`cb442d4`, 2026-07-12) — the file was
never deployed after the migration. Firestore default is deny → every query/write on that
subcollection returned `permission-denied`.

Knock-on effects made it a silent feature-killer:

- The recurring listener has no `onError` → error surfaced without a path.
- `recurringSubColLoaded` never became true → **all three gates** feeding `checkRecurring()`
  stayed closed → no generation, no throttle stamp, no retry — just a stale UI.
- `backfillRecurringToSubCollection` fails on the same path, but its error is swallowed by
  `initializeUser`'s catch and mislabeled as a "transaction" error.
- The 12 templates visible in the store came from the legacy `recurringTransactions` array
  still on the main doc — masking the empty subcollection.

Both `syncErrors` are therefore the **same root cause** (the recurring path); doc +
transactions listeners were healthy.

## Fix

1. **Deployed the repo rules** (the actual fix, confirmed working by the user):
   ```bash
   npx firebase deploy --only firestore:rules
   ```
2. **Client hardening** in `src/hooks/useSyncFinance.ts` (PR #181):
   - `e5b0a96` — labeled `onError` callbacks per listener path + one-shot 10s diagnostic
     (prints gates, sync errors, and loaded counts when the check never runs).
   - `5cda137` — `maybeCheckRecurring()` requires a **non-empty** template list before burning
     `hasCheckedRecurring`; an empty first snapshot (subcollection mid-migration) no longer
     deadlocks the session — the gate re-evaluates when the backfill populates it, so
     generation happens on the same load.

## Prevention

- Any PR touching `firestore.rules` must include an explicit
  `npx firebase deploy --only firestore:rules` step — hosting/code deploys do **not** push
  rules.
- The labeled listener errors + gate diagnostic stay in place as early warning for future
  drift (the exact denied path prints within 10s).

## Related

- [[wiki/bugs/recurring-preload-month-bound]] — the generation-bound bug this incident masked
- [[wiki/features/first-of-month-recurring/first-of-month-recurring]] — feature this blocked
- Source: [raw/bugs/firestore-rules-drift/firestore-rules-drift.md](raw/bugs/firestore-rules-drift/firestore-rules-drift.md)
