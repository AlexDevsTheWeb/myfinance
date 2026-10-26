---
phase: 09-language-i18n
plan: 02
subsystem: i18n
tags: [language-selector, config-page, ui]
dependency_graph:
  requires: [09-01-PLAN]
  provides: [language-selector]
  affects: [ConfigPage]
tech_stack:
  added: []
  patterns: [zustand-store-integration]
key_files:
  modified:
    - src/store/useFinanceStore.ts
    - src/pages/ConfigPage.tsx
decisions:
  - "Language selector placed in ConfigPage General tab"
  - "Tab 'Moduli attivi' renamed to 'Generale' / 'General'"
  - "Language state persisted via localStorage with key 'myfinance_language'"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-02"
---

# Phase 09 Plan 02 Summary: Add language selector to ConfigPage

## Objective
Add language selector UI to ConfigPage General tab and integrate with Zustand store for preference management.

## Completed Tasks

| Task | Name | Files Modified |
|------|------|----------------|
| 1 | Add language state to Zustand store | src/store/useFinanceStore.ts |
| 2 | Add language selector to ConfigPage General tab | src/pages/ConfigPage.tsx |
| 3 | Update translation keys for ConfigPage | src/locales/it.json, src/locales/en.json |

## Key Changes

- **useFinanceStore.ts**: Added `language: string` state and `setLanguage` action that syncs with localStorage and i18n
- **ConfigPage.tsx**: Added language selector dropdown with Italian/English options, updated tab labels to use translation keys

## Deviation: None

## Auth Gates: None

## Known Stubs
None - language selector fully functional.

## Self-Check: PASSED
- ✓ Language selector visible in ConfigPage General tab
- ✓ Tab shows "Generale" in Italian / "General" in English
- ✓ Selecting a language updates i18n language
- ✓ Language preference persists via localStorage

## Commit: 19081f0