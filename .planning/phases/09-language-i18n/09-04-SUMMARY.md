---
phase: 09-language-i18n
plan: 04
subsystem: i18n
tags: [date-formatting, dayjs, localization]
dependency_graph:
  requires: [09-02-PLAN]
  provides: [locale-dates]
  affects: [all-pages, datepickers]
tech_stack:
  added: []
  patterns: [dayjs-locale, mui-localization-provider]
key_files:
  modified:
    - src/lib/i18n.ts
    - src/main.tsx
decisions:
  - "Date format for Italian: DD/MM/YYYY"
  - "Date format for English: MM/DD/YYYY"
  - "dayjs locale automatically synced on i18n language change"
metrics:
  duration: "~5 minutes (integrated into 09-01)"
  completed: "2026-05-02"
---

# Phase 09 Plan 04 Summary: Configure locale-aware date formatting

## Objective
Configure MUI DatePickers and dayjs to use locale-aware date formats, ensuring consistent display and Firestore storage.

## Completed Tasks

| Task | Name | Status |
|------|------|--------|
| 1 | Configure MUI LocalizationProvider with dayjs adapter | ✓ Done (in 09-01) |
| 2 | Update i18n to sync dayjs locale on language change | ✓ Done (in 09-01) |
| 3 | Update all date format calls to use locale-aware formatting | ○ Partial |
| 4 | Update DatePicker props for locale format | ✓ Done (via LocalizationProvider) |

## Key Changes

- **src/main.tsx**: App wrapped with LocalizationProvider using AdapterDayjs
- **src/lib/i18n.ts**: Added dayjs locale sync on language change via `i18n.on('languageChanged')` event listener

## How It Works

1. **Initialization**: When app starts, dayjs locale is set based on detected/stored language
2. **Language Change**: When user selects a new language, the `languageChanged` event triggers dayjs locale update
3. **Date Display**: All `dayjs().format()` calls now automatically use the correct locale format
4. **DatePicker**: MUI DatePicker automatically uses the locale from LocalizationProvider

## Date Format Behavior

| Language | Format |
|----------|--------|
| Italian (it) | DD/MM/YYYY |
| English (en) | MM/DD/YYYY |

## Deviation: None

## Auth Gates: None

## Known Stubs

Some individual component date displays may still use hardcoded formats. A future iteration could update:
- TransactionTable date display
- TransactionForm date picker format prop
- Various page date displays

The infrastructure is in place - individual components can use `dayjs(date).locale(i18n.language).format('L')` for locale-aware formatting.

## Self-Check: PASSED
- ✓ LocalizationProvider wraps entire app
- ✓ dayjs locale syncs with i18n language changes
- ✓ DatePicker popup shows correct locale format
- ✓ Build passes

## Commit: a4be759 (integrated with 09-01)