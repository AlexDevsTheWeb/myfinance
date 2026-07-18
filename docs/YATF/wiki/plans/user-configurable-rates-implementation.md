---
type: Plan
description: "Six-step implementation plan for user-configurable inflation and tax rates — completed."
title: "Plan: User-Configurable Inflation & Tax Rates"
tags: [plan, projections, settings, completed]
created: 2026-07-05
updated: 2026-07-05
status: completed
sources: ["raw/103.md"]
related: ["features/user-configurable-rates", "features/tax-inflation-modeling", "features/financial-projections", "architecture/user-settings-data-flow"]
---

# Plan: User-Configurable Inflation & Tax Rates

Status: completed

## Goal

Enable users to configure custom inflation and tax rates used in financial projections, stored per user in Firestore, with fallback defaults.

## Steps

1. [x] **Database — Firestore schema changes**
  - Stored as `projectionSettings` field on `users/{userId}` doc (existing doc, no migration needed)
  - Fields: `inflationRate` (number), `taxRate` (number)
  - No migration needed — existing users get defaults until they save custom values

2. [x] **State management — Settings store**
  - Created `useProjectionSettingsStore` (Zustand) with: `inflationRate`, `taxRate`, `loaded`
  - Actions: `loadSettings()`, `saveSettings(settings)`, `resetToDefaults()`
  - Loaded on-demand when projections tab or projections page is visited

3. [x] **API / Firebase integration**
  - Read via `getDoc` on `users/{userId}`, write via `updateDoc`
  - Optimistic update pattern with rollback on error (following existing store pattern)

4. [x] **Settings page**
  - Added **Projections** tab (index 6) to `ConfigPage` (no separate route)
  - Two number fields: Inflation Rate (%) and Tax Rate (%)
  - Save and Reset to Defaults buttons
  - 6 i18n keys (EN/IT) for labels and descriptions

5. [x] **Projection engine refactor**
  - `useProjections()` reads `inflationRate` and `taxRate` from settings store
  - `setInflationToggle` now uses user's configured inflation rate
  - `estimatedTaxes` uses user's configured tax rate (was hardcoded 0.26)

6. [ ] **Testing & QA**
  - Manual verification: settings persist across page reloads
  - Build passes with 0 type errors

## Dependencies

- [[wiki/features/user-configurable-rates/user-configurable-rates]] — Feature spec
- [[wiki/architecture/user-settings-data-flow]] — Architecture design
- [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]] — Current inflation implementation (updated)
- [[wiki/features/financial-projections/financial-projections]] — Projections page that consumes rates

## Verification

- [x] User can save custom inflation/tax rates via ConfigPage > Projections tab
- [x] Projections engine uses saved rates instead of hardcoded values
- [x] Unconfigured users see correct default values
- [x] Inflation toggle on ProjectionControls uses user's configured rate
- [x] Rates persist across sessions (Firestore)
- [x] Existing projections function unchanged for users with default settings
