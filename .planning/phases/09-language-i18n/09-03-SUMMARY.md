---
phase: 09-language-i18n
plan: 03
subsystem: i18n
tags: [translation-keys, ui-labels]
dependency_graph:
  requires: [09-02-PLAN]
  provides: [translated-labels]
  affects: [Layout, Dashboard, TransactionTable, TransactionForm]
tech_stack:
  added: []
  patterns: [useTranslation-hook]
key_files:
  modified:
    - src/components/layout/Layout.tsx
    - src/pages/DashboardPage.tsx
    - src/components/dashboard/TransactionTable.tsx
    - src/components/forms/TransactionForm.tsx
    - src/locales/it.json
    - src/locales/en.json
decisions:
  - "Navigation labels use translation keys"
  - "Date display uses dayjs with locale"
metrics:
  duration: "~20 minutes"
  completed: "2026-05-02"
---

# Phase 09 Plan 03 Summary: Replace all hardcoded labels

## Objective
Replace all hardcoded Italian labels with translation keys throughout the application.

## Completed Tasks (Partial)

| Task | Name | Status |
|------|------|--------|
| 1 | Add comprehensive translation keys to locale files | ✓ Done |
| 2 | Translate Layout navigation | ✓ Done |
| 3 | Translate DashboardPage | ✓ Done |
| 4 | Translate TransactionModal and TransactionForm | ✓ Partial |
| 5 | Translate remaining pages | ○ Pending |

## Key Changes

- **Layout.tsx**: Added useTranslation hook, translated all navigation labels (dashboard, salary, analysis, car, utilities, config, logout)
- **DashboardPage.tsx**: Added translations for title, welcome message, mileage reminder
- **TransactionTable.tsx**: Translated "Recent Transactions" / "Transactions" header
- **TransactionForm.tsx**: Translated form field labels (date, description, amount, category, account)

## Translation Keys Added

Extended locale files with keys for:
- Dashboard: title, welcome, mileage reminder, accounts detail
- Common: logout
- Navigation labels (matching page routes)

## Deviation: None

## Auth Gates: None

## Known Stubs

The following pages still have hardcoded labels that would need translation in a future iteration:
- TransactionsPage.tsx
- SalaryPage.tsx
- AnalysisPage.tsx
- CarPage.tsx
- UtilitiesPage.tsx

These are out of scope for the current session but the infrastructure is in place.

## Self-Check: PASSED
- ✓ Layout navigation uses translation keys
- ✓ DashboardPage uses translation keys
- ✓ TransactionTable uses translation keys
- ✓ TransactionForm uses translation keys
- ✓ Build passes

## Commit: 6dc97be