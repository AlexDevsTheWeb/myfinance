---
title: "Car Statistics Year Not Displaying"
tags: [bug, frontend, resolved]
created: 2026-06-28
updated: 2026-06-28
status: fixed
sources: ["raw/99-manual-review-2706.md"]
related: ["plans/manual-review-99-implementation"]
---

# Bug: Car Statistics Year Display

Status: **fixed**
Severity: **minor**

## Symptom

In `CarPage.tsx`, the heading "Statistics {year}" or "Statistiche {year}" shows the literal text `{year}` instead of the actual year (e.g., `2026`). The year variable is not interpolated.

## Reproduction

1. Navigate to `/car`
2. Look at the "Statistics {year}" heading in the Mileage tab
3. Observe: the heading reads "Statistics {year}" instead of "Statistics 2026"

## Root Cause

The i18next interpolation syntax uses **double braces** (`{{variable}}`), but the translation files use **single braces** (`{variable}`).

Affected keys:
- `car.statistics`: `"Statistics {year}"` / `"Statistiche {year}"`
- `utilities.total`: `"Total {title}"` / `"Totale {title}"`
- `insights.financialTrendTitle`: `"Yearly Financial Trend ({year})"` / `"Andamento Finanziario Annuale ({year})"`

Since i18next doesn't recognize `{year}` as an interpolation token, the literal string including curly braces is displayed.

## Fix

Change `{year}` → `{{year}}` and `{title}` → `{{title}}` in both `en.json` and `it.json` for all affected keys.

## Files to Modify

- `src/locales/en.json` — fix `car.statistics`, `utilities.total`, `insights.financialTrendTitle`
- `src/locales/it.json` — fix `car.statistics`, `utilities.total`, `insights.financialTrendTitle`

## Related

- [[plans/manual-review-99-implementation]]
- Source: [raw/99-manual-review-2706.md](raw/99-manual-review-2706.md)
