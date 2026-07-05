---
title: "User-Configurable Inflation & Tax Rates for Projections"
tags: [feature, projections, settings, implemented]
created: 2026-07-05
updated: 2026-07-05
status: implemented
sources: ["raw/103.md"]
related: ["features/tax-inflation-modeling", "features/financial-projections", "architecture/user-settings-data-flow", "plans/user-configurable-rates-implementation", "architecture/financial-projections-architecture"]
---

# Feature: User-Configurable Inflation & Tax Rates for Projections

Status: implemented
Priority: low

## Description

Replace the hardcoded inflation (2%) and tax (26%) rates in the financial projections engine with user-configurable values stored per user in Firestore. Settings are available in a dedicated **Projections** tab in ConfigPage.

## What Was Built

### Store — `useProjectionSettingsStore`
- Zustand store with `inflationRate` and `taxRate` fields
- `loadSettings()` — reads `projectionSettings` from `users/{userId}` Firestore doc
- `saveSettings(settings)` — writes to Firestore with optimistic update + rollback
- `resetToDefaults()` — resets to application defaults (2% inflation, 26% tax)
- Falls back to defaults when no settings exist in Firestore

### ConfigPage — Projections Tab
- New tab in the main settings page (index 6, icon: `ShowChart`)
- Two number fields: **Inflation Rate (%)** and **Tax Rate (%)**
- **Save** button persists to Firestore
- **Reset to Defaults** restores application defaults
- Inputs validated as percentages (0–100%, step 0.1)
- Values auto-populated from Firestore when tab is selected

### Hook — `useProjections`
- Reads `inflationRate` and `taxRate` from `useProjectionSettingsStore`
- `setInflationToggle` now sets `inflationRate` to the user's configured value
- `estimatedTaxes` computed using the user's configured tax rate (instead of hardcoded 26%)

### i18n
- 6 new EN keys: `config.projections`, `config.projectionsDescription`, `config.inflationRate`, `config.taxRate`, `config.resetDefaults`
- 6 new IT keys with Italian translations

## User Flow

1. User navigates to **ConfigPage > Projections** tab
2. Sees current inflation rate and tax rate pre-filled from saved settings (or defaults)
3. Adjusts values and clicks **Save** → persisted to Firestore
4. User visits `/projections` page → projections use saved rates
5. "Reset to Defaults" restores 2% inflation / 26% tax

## Files Changed

| File | Change |
|------|--------|
| `src/store/useProjectionSettingsStore.ts` | **New** — Zustand store with Firestore persistence |
| `src/pages/ConfigPage.tsx` | **Modified** — added Projections tab (index 6) with form |
| `src/hooks/useProjections.ts` | **Modified** — reads settings store for rates |
| `src/locales/en.json` | **Modified** — 6 new config keys |
| `src/locales/it.json` | **Modified** — 6 new config keys |

## Related

- [[features/tax-inflation-modeling]] — Current inflation toggle (now uses configured rate)
- [[features/financial-projections]] — Projections page that consumes the rates
- [[architecture/user-settings-data-flow]] — Settings architecture, Firestore schema, store design
- [[plans/user-configurable-rates-implementation]] — Task breakdown
- [[architecture/financial-projections-architecture]] — Projections architecture (updated)
- Source: [raw/103.md](raw/103.md)
