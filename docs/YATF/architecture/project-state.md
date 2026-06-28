---
title: "Project State"
tags: [architecture, state, project]
created: 2026-06-22
updated: 2026-06-28
status: active
sources: ["raw/STATE.md", "raw/99-manual-review-2706.md"]
related: ["plans/roadmap", "architecture/concerns-and-tech-debt", "features/car-management-redesign", "features/dashboard-redesign", "features/sidebar-redesign", "plans/manual-review-99-implementation"]
---

# Project State

*Updated: 2026-05-15*

## Current Focus

| Field | Value |
|-------|-------|
| Issue | #46 - Massive Store Refactor |
| Branch | feat/46-massive-store-refactor |
| Status | In Progress |

## Store Refactoring Progress

- 1403 → 1224 lines (13% reduction)
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

## New Work Items (from Manual Review #99)

1. **Dashboard Redesign** — Split dashboard into overview + enhanced transactions; move account details to full-screen dialog; add conditional charts
2. **Sidebar Navigation** — Replace horizontal top bar with vertical left sidebar; group Finance and Investment items
3. **Car Statistics Bug** — i18next interpolation syntax uses `{{year}}` but locale files have `{year}`
4. **Translation Polish** — Several strings in Layout.tsx are hardcoded instead of using `t()`
5. **Padding Reduction** — Reduce card/container padding from 24px/16px to 12px across ~20 components

## Bug Fixes Applied

- ✅ Race condition in checkRecurring — added `isCheckingRecurring` flag
- ✅ Sync overwrites local edits — added `hasLocalChanges` tracking
- ✅ Import validation — added `Backup.validateBackupData()`

## Next Steps

1. Add test suite — Configure Vitest
2. Update CONCERNS.md — Mark fixed issues as resolved

## Related

- [[architecture/concerns-and-tech-debt]]
- [[plans/roadmap]]
- [[conventions/coding-conventions]]
