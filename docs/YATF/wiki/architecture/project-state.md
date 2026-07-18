---
type: Architecture
description: "Current project state, active focus areas, and next prioritized steps."
title: "Project State"
tags: [architecture, state, project]
created: 2026-06-22
updated: 2026-07-11
status: active
sources: ["raw/STATE.md", "raw/99-manual-review-2706/99-manual-review-2706.md", "raw/go-to-market/go-to-market.md"]
related: ["plans/roadmap", "architecture/concerns-and-tech-debt", "features/car-management-redesign", "features/dashboard-redesign", "features/sidebar-redesign", "plans/manual-review-99-implementation", "plans/go-to-market", "decisions/saas-readiness", "queries/app-review"]
---

# Project State

*Updated: 2026-07-11*

## Current Focus

| Field | Value |
|-------|-------|
| Priority | **Go-to-Market: Phase 0 — Quick Wins** |
| Issue | [#138](https://github.com/AlexDevsTheWeb/myfinance/issues/138) |
| Status | Pre-launch / Soft beta preparation |

The project has shifted focus from feature development to **go-to-market readiness**. The goal is to fix critical data integrity issues, recruit beta testers, validate the product with real users, and monetize only after proven retention.

See [[wiki/plans/go-to-market]] for the full phased plan.

## Store Refactoring Progress

- 1403 → 1224 lines (13% reduction, Phase #46)
- Extracted: types, validation, sanitization, defaults, backup, sync modules
- Build: ✓ Passing

### Completed Extractions
- [x] Types to `src/store/types/finance.types.ts`
- [x] Validation to `src/store/validation/finance.validation.ts`
- [x] Sanitization to `src/store/sanitization/` (transaction.ts, recurring.ts)
- [x] Defaults to `src/store/defaults.ts`
- [x] Backup (export/preview) to `src/store/backup/index.ts`
- [x] Sync config to `src/store/sync/index.ts`
- [x] Updated converters.ts to use extracted types
- [x] Updated useSyncFinance hook to use centralized defaults

## Key Concerns (Active)

1. **Massive Store File**: `useFinanceStore.ts` at 1224 lines (was 1403)
2. **Missing Test Suite**: No Vitest/Jest configured
3. **Duplicate Categories**: Defined in both store and sync hook
4. **Race Condition**: `checkRecurring()` can generate duplicates

## Phase 0 — Immediate Quick Wins

Top priorities before showing the app to beta users:

1. **Fix ticker bug** — `BrokerAccount.ticker` not persisted (investments are the #1 selling point)
2. **Add error boundary** — prevent white screen on render crash
3. **Swap `alert()`/`confirm()` → MUI dialogs** in ConfigPage
4. **Add loading states** — skeletons/spinners on Dashboard, Transactions, Investments

## Bug Fixes Applied

- ✅ Race condition in checkRecurring — added `isCheckingRecurring` flag
- ✅ Sync overwrites local edits — added `hasLocalChanges` tracking
- ✅ Import validation — added `Backup.validateBackupData()`
- ✅ Car statistics year i18next interpolation
- ✅ Ticker persistence (critical) — `BrokerAccount` missing `ticker` field

## Fixed Issues

1. ✅ **Backup/Restore data coverage** — budget targets and full investment data (broker accounts, holdings, cash adjustments, dividends). See [[wiki/plans/backup-restore-data-coverage]].
2. ✅ **Ticker persistence** — `BrokerAccount.ticker` now saves correctly. Existing accounts need manual re-entry.
3. ✅ **Car statistics bug** — i18next `{{variable}}` syntax fixed.

## Next Steps

1. Complete Phase 0 quick wins ([[wiki/plans/go-to-market]])
2. Migrate transactions to Firestore sub-collection (Phase 1)
3. Recruit 10-15 beta testers from Italian finance communities

## Related

- [[wiki/architecture/concerns-and-tech-debt]]
- [[wiki/plans/roadmap]]
- [[wiki/plans/go-to-market]]
- [[wiki/decisions/saas-readiness]]
- [[wiki/queries/app-review]]
- [[wiki/conventions/coding-conventions]]
