# Deployed Firestore rules missing the recurringTransactions path (rules drift)

Date: 2026-10-01
Status: fixed (deployed from repo `firestore.rules`)
Branch: feat/YATF-first-of-month-recurring (PR #181)

## Symptom

After the full-month preload fix was pushed, the user reported the app still showed **only the
day-1 recurring instance** on October 1st, even after restarting server + Chrome. Console:

```
@firebase/firestore: Firestore (12.15.0): Uncaught Error in snapshot listener:
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.

Error in initializeUser transaction: FirebaseError: Missing or insufficient permissions.
```

The 10s gate diagnostic (commit `e5b0a96`) reported:

```json
{
  "gates": { "hasLoaded": true, "txnsLoaded": true, "recurringLoaded": false,
             "isInitializing": false },
  "syncErrors": {
    "users/7ON3.../recurringTransactions": "Missing or insufficient permissions.",
    "users/7ON3... (initializeUser)": "Missing or insufficient permissions."
  },
  "templatesLoaded": 12,
  "transactionsLoaded": 480,
  "lastRecurringCheck": null
}
```

## Diagnosis

1. Both `syncErrors` are the **same path**: the recurring listener, *and* the backfill inside
   `initializeUser` — `backfillRecurringToSubCollection` calls `getDocs()` on
   `users/{uid}/recurringTransactions` and its error is caught by the `initializeUser` try/catch
   (mislabeled as "transaction" error).
2. The `users/{uid}` document listener and the `transactions` subcollection listener both
   worked → those rules were fine.
3. Repo `firestore.rules` has contained the recurring rule since commit `f20161f` (2026-08-06,
   #56 subcollection migration):
   ```
   match /users/{userId}/recurringTransactions/{recId} {
     allow read, write: if isOwner(userId);
     allow create: if isOwner(userId);
     allow delete: if isOwner(userId);
   }
   ```
4. Git history of `firestore.rules`: last deploy-adjacent commit `cb442d4` (2026-07-12,
   "remove extra closing brace") — **predates** the recurring rule. Conclusion: the rules
   RELEASE live in the Firebase console was stale and never included the `recurringTransactions`
   match → Firestore's default is deny → `permission-denied` for any query/write on it.

## Why the feature silently died (no error surfaced anywhere useful)

- The listener error had no `onError` callback → SDK logged an unattributed
  "Uncaught Error in snapshot listener" with no path.
- `recurringSubColLoaded` stayed `false` → **all three gates** (`initializeUser` finally, doc
  listener, txns listener) that call `checkRecurring()` never fired → `lastRecurringCheck` stayed
  `null` forever; no generation, no error, no retry.
- The 12 templates in the store came from the **legacy `recurringTransactions` array on the main
  doc** (converter still passes it through) — which made the app look half-alive.
- Why did it seem to work before? The day-1 instance visible on Oct 1 had been generated in an
  earlier session; the same rules gap has been silently blocking the subcollection path
  (including every backfill attempt) since the migration-era code went live without the rules
  being deployed.

## Fix

1. **Deploy the repo rules** (the actual fix, one command from the project root):
   ```bash
   npx firebase deploy --only firestore:rules   # project myfinancetracker-b257e
   ```
   Uploaded the current repo `firestore.rules` (identical to `development`, owner-only on all
   paths). Confirmed working by the user: full-month generation ran immediately after reload.
2. **Client hardening** (same PR):
   - `e5b0a96` — labeled `onError` callbacks per listener path + one-shot 10s diagnostic that
     prints gate flags / sync errors / loaded counts when `checkRecurring` never runs.
   - `5cda137` — `maybeCheckRecurring` gate requires a **non-empty** template list before
     burning `hasCheckedRecurring`, so the empty-subcollection snapshot that may arrive first
     (mid-migration) no longer deadlocks the session; the gate re-evaluates when the backfill
     populates the subcollection.

## Prevention

- `firestore.rules` changes must be **explicitly deployed** — code deploys (hosting) do not
  include them unless `--only firestore:rules` is passed. Treat any PR touching
  `firestore.rules` as requiring a deploy step in its checklist.
- The labeled listener errors + 10s gate diagnostic remain in `useSyncFinance` as early
  warning: a future rules drift now prints the exact denied path within 10s of load.
