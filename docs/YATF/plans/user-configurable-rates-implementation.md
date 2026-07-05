---
title: "Plan: User-Configurable Inflation & Tax Rates"
tags: [plan, projections, settings, draft]
created: 2026-07-05
updated: 2026-07-05
status: draft
sources: ["raw/103.md"]
related: ["features/user-configurable-rates", "features/tax-inflation-modeling", "features/financial-projections", "architecture/user-settings-data-flow"]
---

# Plan: User-Configurable Inflation & Tax Rates

Status: draft

## Goal

Enable users to configure custom inflation and tax rates used in financial projections, stored per user in Firestore, with fallback defaults.

## Steps

1. [ ] **Database — Firestore schema changes**
  - Add `userSettings` subcollection to user doc (or extend user doc)
  - Fields: `inflationRate` (number, decimal), `taxRate` (number, decimal), `updatedAt` (timestamp)
  - Set default values for existing users via migration script

2. [ ] **State management — Settings store**
  - Create `useUserSettingsStore` (Zustand) with: `inflationRate`, `taxRate`, `isLoaded`
  - Actions: `fetchSettings()`, `updateSettings(settings)`, `resetToDefaults()`
  - Hydrate on app load for authenticated user
  - Cache in `localStorage` to reduce reads

3. [ ] **API / Firebase integration**
  - Add Firestore read/write functions in `src/lib/` for user settings
  - Security rules: only authenticated user can read/write their own settings

4. [ ] **Settings page**
  - Create `/settings` route with `SettingsPage` component
  - Reusable `SettingsForm` with validation (0–100% range, non-negative)
  - Save and Reset to Defaults buttons
  - i18n keys (EN/IT) for settings labels and validation messages

5. [ ] **Projection engine refactor**
  - Remove hardcoded `DEFAULT_INFLATION_RATE` and `DEFAULT_TAX_RATE` from `compoundInterestUtils.ts`
  - Update `generateFinancialProjection()` to accept `inflationRate` and `taxRate` as parameters
  - Wire `useProjections()` to read from `useUserSettingsStore`
  - Update the `adjustForInflation` toggle to use the user-configured rate instead of hardcoded 2%

6. [ ] **Testing & QA**
  - Unit tests for projection engine with various rate combinations
  - Integration tests for settings persistence (create/read/update)
  - UI validation on settings form
  - Regression: projections still work with default rates for unconfigured users

## Dependencies

- [[features/user-configurable-rates]] — Feature spec
- [[architecture/user-settings-data-flow]] — Architecture design
- [[features/tax-inflation-modeling]] — Current inflation implementation (will be updated)
- [[features/financial-projections]] — Projections page that consumes rates

## Effort Estimate

| Task | Effort |
|------|--------|
| Database schema + migration | 1 day |
| Backend API endpoints + validation | 1–2 days |
| Settings page + form | 1–2 days |
| Refactor calculation functions | 0.5 day |
| State management integration | 0.5 day |
| Testing & QA | 1 day |
| **Total** | **5–7 days** |

## Verification

- [ ] User can save custom inflation/tax rates via settings page
- [ ] Projections engine uses saved rates instead of hardcoded values
- [ ] Unconfigured users see correct default values
- [ ] Inflation toggle on ProjectionControls uses user's configured rate
- [ ] Rates persist across sessions
- [ ] Existing projections function unchanged for users with default settings
