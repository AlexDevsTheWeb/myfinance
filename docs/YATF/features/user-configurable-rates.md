---
title: "User-Configurable Inflation & Tax Rates for Projections"
tags: [feature, projections, settings, draft]
created: 2026-07-05
updated: 2026-07-05
status: draft
sources: ["raw/103.md"]
related: ["features/tax-inflation-modeling", "features/financial-projections", "architecture/user-settings-data-flow", "plans/user-configurable-rates-implementation", "architecture/financial-projections-architecture"]
---

# Feature: User-Configurable Inflation & Tax Rates for Projections

Status: draft
Priority: low

## Description

Replace the hardcoded inflation (2%) and tax (26%) rates in the financial projections engine with user-configurable values stored per user. This allows users to customize rates based on their country of residence or personal financial assumptions.

Currently, inflation and tax values are hardcoded constants. Users cannot adjust them, making projections inaccurate for non-default scenarios.

## Requirements

- Replace hardcoded `DEFAULT_INFLATION_RATE` and `DEFAULT_TAX_RATE` constants with user-specific values
- New **Settings** page/panel (route: `/settings`) with input fields for inflation rate and tax rate
- Store rates per user in Firestore (new `userSettings` subcollection or extended user doc)
- Load user settings on app startup; fall back to sensible defaults if none stored
- Refactor `generateFinancialProjection` and `useProjections` to accept configurable rates
- Validate inputs: non-negative floats, display as percentages (0–100%), store as decimals (0–1)
- Cache settings locally to reduce API calls

## User Flow

1. User navigates to `/settings` → sees form with Inflation Rate and Tax Rate fields pre-filled with current values (or defaults)
2. User adjusts values and clicks **Save** → settings persisted to Firestore
3. User navigates to `/projections` → projections use the saved rates
4. "Reset to Defaults" restores the application defaults

## Implementation Notes

- Pure client-side simulation becomes **settings-dependent** — projection engine now reads from user settings store instead of constants
- The existing `adjustForInflation` toggle in `ProjectionControls` should use the configured rate instead of hardcoded 2%
- Fallback defaults: inflation 3%, tax 20% (matching typical global averages)
- Future-proof: the settings store pattern can be extended for additional user preferences
- No migration needed for existing users — they'll get defaults until they configure custom rates

## Related

- [[features/tax-inflation-modeling]] — Current inflation toggle (hardcoded 2%)
- [[features/financial-projections]] — Projections page that consumes the rates
- [[architecture/user-settings-data-flow]] — Settings architecture, API, DB schema
- [[plans/user-configurable-rates-implementation]] — Task breakdown and timeline
- [[architecture/financial-projections-architecture]] — Projections architecture (will need update)
- Source: [raw/103.md](raw/103.md)
