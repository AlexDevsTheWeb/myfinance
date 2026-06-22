---
title: "Codebase Concerns and Tech Debt"
tags: [architecture, tech-debt, bugs, security, performance]
created: 2026-06-22
updated: 2026-06-22
status: active
sources: ["raw/codebase/CONCERNS.md"]
related: ["architecture/project-state", "architecture/testing-status", "architecture/system-architecture"]
---

# Codebase Concerns and Tech Debt

*Analysis: 2026-06-22*

## Tech Debt

| Issue | Impact | Status |
|-------|--------|--------|
| Monolithic Zustand store (1231 lines, ~70 actions) | Maintainability, testability | In progress (was 1403, 13% reduction) |
| Boilerplate duplication (30+ identical try/catch async patterns) | Maintenance cost | Open |
| Redundant sanitization (sanitization/ + converters both do it) | Data drift risk | Open |
| Dead code: 70 lines commented out in `RecapCards.tsx` | Clutter | Open |
| Unused `handleEditTireChange` in CarPage.tsx | Dead code | Open |
| Redundant type re-exports in store | Import confusion | Open |
| `useSyncFinance` onSnapshot doesn't handle multi-tab well | Data loss risk | Open |
| `_migrateToMultiAccount` runs on every app mount | Wasteful | Open |
| Large component files (ConfigPage 897, CarPage 679, Layout 425) | Maintainability | Open |
| Missing test suite | Regression risk | Open |
| Duplicate category definitions | Maintenance burden | Open |

## Known Bugs

| Bug | Trigger | Status |
|-----|---------|--------|
| Race condition in `checkRecurring()` | Sync snapshot | ✅ Fixed (isCheckingRecurring flag) |
| Sync overwrites local edits | Multi-device editing | ✅ Fixed (hasLocalChanges tracking) |
| Import doesn't validate transaction data | Corrupted backup | ✅ Fixed (Backup.validateBackupData()) |
| Data loss on category deletion with subcategories | `isSaving: true` stuck | **Open** — store returns early without saving |
| No error handling for array update conflicts | Rapid clicks, multi-tab | **Open** |
| Deleting account doesn't clean up related transactions | Orphaned data | **Open** |
| Firestore doc size limit risk (1 MiB) | Heavy usage | **Open** — critical |

## Security Considerations

- App crashes on missing Firebase env vars — no graceful degradation
- No input sanitization beyond basic type checks — no max lengths, no XSS protection
- Firestore rules protect doc-level only — no field-level data validation
- All Firestore data loaded to client (no server-side filtering)

## Performance Bottlenecks

| Issue | Cause | File |
|-------|-------|------|
| Full-array filtering every render | Analytics hooks scan entire transactions array | `src/analytics/hooks/*.ts` |
| `checkRecurring` O(n×m) | Iterates every recurring × every month with 1000-iteration safety counter | Store |
| Charts rebuild object on every render | `emptyYear` not memoized | `src/components/dashboard/Charts.tsx` |
| Date formatting on every table render | `dayjs(t.date).format('LL')` per row | TransactionTable |
| Full array replacement | `updateDoc` with entire arrays | Store actions |
| Large initial data load | No pagination | `src/hooks/useSyncFinance.ts` |

## Fragile Areas

- **Recurring transaction engine** — complex date arithmetic, 1000-iteration safety counter hack, called from 3 places, zero tests
- **Date handling** — scattered across 25+ files, no centralized date utility, inconsistent formats
- **Import/backup** — `importAllData` completely replaces all data with no merge, no undo, two backup version formats
- **Firestore timestamp/null handling** — `toFirestore` converts undefined→null, `fromFirestore` reads null differently, mismatch risk
- `DeletedRecurringInstances` — grows indefinitely, never cleaned

## Scaling Limits

- **Firestore 1 MiB doc limit** — single `users/{userId}` doc. Current estimate: ~400-800 KiB for moderate user. Will silently fail writes when exceeded.
- **No pagination** — entire user document loaded into memory via `onSnapshot`
- **All transactions everywhere** — every page reads the full array, filtering client-side
- **In-memory state** — all data in Zustand store
- **No offline support**

## Dependencies at Risk

- **@dnd-kit/sortable v10 vs core v6** — incompatible version mismatch; sortable may be unused
- **standard-version ^9.5.0** — deprecated (2022), no active maintenance
- **@mui/x-date-pickers-pro** — requires commercial license; community version may suffice
- **Firebase SDK** — tight coupling, no abstraction layer

## Missing Critical Features

- Error boundaries (component crash → white screen)
- Offline support (all ops require network)
- Loading states / skeletons (only full-screen spinner on initial load)
- Data validation on write (no max lengths, no valid reference checks)
- CI/CD pipeline (no GitHub Actions for lint/typecheck)

## Related

- [[architecture/project-state]]
- [[architecture/testing-status]]
- [[architecture/system-architecture]]
