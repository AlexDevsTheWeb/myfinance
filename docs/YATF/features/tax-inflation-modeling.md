---
title: "Financial Projections — Smart Tax & Inflation Modeling"
tags: [feature, projections, tax, inflation, implemented]
created: 2026-06-27
updated: 2026-06-27
status: implemented
sources: ["raw/93-tax-inflation/issue.md", "raw/12-investment-tracking-v2/implementation.md"]
related: ["features/financial-projections", "plans/investment-tracking-v2-enhancements", "architecture/financial-projections-architecture"]
---

# Feature: Financial Projections — Smart Tax & Inflation Modeling

Status: implemented
Priority: low

## Description

Add inflation-adjusted projections to the financial simulator with a toggle. Implemented in Plan 12-06.

## What Was Built

### Types & Engine

- `IProjectionInput` extended with `adjustForInflation?: boolean` (default false) and `inflationRate?: number` (default 0.02).
- `generateFinancialProjection` applies per-month inflation adjustment: `monthlyInflation = (1 + annual)^(1/12) - 1`, applied as divisor per snapshot based on `monthIndex` (Pitfall 5 fix).

### UI Layer

- **ProjectionControls.tsx:** MUI Switch labeled "Adjust for Inflation (2%)" via `onInflationToggle` callback.
- **ProjectionChart.tsx:** Third `nominalValue` dashed red (`#ef4444`) Recharts Area line when toggle is on.
- **ProjectionSummary.tsx:** "Real Final Capital" MetricCard (red `#ef4444`) when toggle is on.

### Hook Logic

- `useProjections` exposes `setInflationToggle(enabled)` function.
- Dual snapshot computation: nominal snapshots always computed with `adjustForInflation: false` for the overlay line.

## Implementation Notes

- Inflation applied as divisor to nominal values per-month (not just final value).
- Tax remains on nominal gains — inflation adjustment does not affect tax computation.
- When inflation is on, `netWorth` line shows real value; `nominalValue` dashed overlay shows original.
- Dual snapshot computation (nominal + real) for chart overlay.

## Files

- **Modified:** `projection.types.ts`, `compoundInterestUtils.ts`, `useProjections.ts`, `ProjectionControls.tsx`, `ProjectionChart.tsx`, `ProjectionSummary.tsx`, `ProjectionsPage.tsx`, `en.json`, `it.json`

## Related

- [[features/financial-projections]]
- [[architecture/financial-projections-architecture]]
- [[plans/investment-tracking-v2-enhancements]]
- GitHub: [#93](https://github.com/AlexDevsTheWeb/myfinance/issues/93)
- Source: [raw/12-investment-tracking-v2/implementation.md](raw/12-investment-tracking-v2/implementation.md)
