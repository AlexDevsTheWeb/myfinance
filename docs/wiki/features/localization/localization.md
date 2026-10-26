---
type: Feature
title: "Localization (i18n)"
description: "Italian and English UI via i18next + react-i18next, browser/localStorage language detection, dayjs locale sync, and a language selector in ConfigPage."
tags: [feature, i18n, frontend, localization]
created: 2026-10-26
updated: 2026-10-26
status: implemented
sources: ["raw/archive/gsd/phases/09-language-i18n/"]
related: ["wiki/features/user-configurable-rates/user-configurable-rates", "wiki/features/quick-actions-fab/quick-actions-fab"]
---

# Feature: Localization (i18n)

Status: implemented
Priority: high

## Description

The UI ships in **Italian and English**. Language is detected on first load,
persisted, and switchable from `ConfigPage` → General tab. Dates follow the same
locale.

## How it works

`apps/web/src/lib/i18n.ts` initializes a single i18next instance:

| Setting | Value |
|---|---|
| Libraries | `i18next`, `react-i18next`, `i18next-browser-languagedetector` |
| Resources | `apps/web/src/locales/it.json`, `en.json` |
| `fallbackLng` | `it` |
| `supportedLngs` | `it`, `en` |
| Detection order | `localStorage` → `navigator` |
| Cache | `localStorage` |

On load and on every `languageChanged` event the module also sets the **dayjs**
locale, so `DD/MM/YYYY` vs `MM/DD/YYYY` stays in sync with the UI language.
Firestore still stores dates as ISO `YYYY-MM-DD` strings — display formatting is
strictly a render-time concern.

Consumers call `useTranslation()` and read keys from JSON. At the time of writing
36 source files do so.

## Implementation Notes

- One instance imported as `import i18n from '../lib/i18n'`; `useFinanceStore`
  reads `i18n.language` directly for locale-dependent logic.
- Translation keys are namespaced by surface (`config.*`, `common.*`,
  `salary.title`, `insights.title`, …). The `it` file is the reference; `en` must
  keep the same shape.
- The language selector lives in the Config **General** tab and writes through
  the user settings store, so the choice follows the user across devices rather
  than staying in the browser.

## Requirements (as shipped)

- [x] i18next + react-i18next integration
- [x] Italian and English locale files
- [x] Browser detection with Italian fallback
- [x] Language selector in the UI
- [x] dayjs locale sync
- [x] Locale-safe date storage in Firestore
- [x] Hardcoded labels replaced with keys across pages and dialogs

## Related

- [[wiki/features/user-configurable-rates/user-configurable-rates]]
- Archived GSD phase: [09-language-i18n](../../../raw/archive/gsd/phases/09-language-i18n/)
