---
title: "Financial Projections Implementation Plan"
tags: [plans, implementation, projections, charting, planned]
created: 2026-06-26
updated: 2026-06-26
status: planned
sources: ["raw/83-financial-projections/issue.md"]
related: ["features/financial-projections", "architecture/financial-projections-architecture", "architecture/project-state"]
---

# Plan: Financial Projections & Compound Interest Simulator

Status: planned
Branch: `feat/83-financial-projections`

## Goal

Build a pure client-side simulation module that lets users model long-term investment growth through parametric sliders, with real-time chart updates and summary metrics.

## Implementation Plan

### Plan 83-01: Simulation Engine + Types

**Files to create:**
- `src/lib/compoundInterestUtils.ts` — pure `generateFinancialProjection()` function
- `src/store/types/projection.types.ts` — `ProjectionInput`, `MonthlySnapshot` interfaces

**Details:**
- Implement the deterministic monthly-loop algorithm from the issue spec
- Monthly equivalent rates: `Math.pow(1 + annualRate, 1/12) - 1`
- Annual inflow credited at month 1 of each year (after year 1)
- Cash interest accrued before PAC deduction each month
- PAC caps at available cash balance
- ETF growth applied after PAC execution
- All monetary values `Math.round()` to integers
- TypeScript strict types with no `any`
- Unit-testable pure function (no I/O, no state)

### Plan 83-02: Projection Page UI Shell

**Files to create:**
- `src/pages/ProjectionsPage.tsx` — main page layout
- `src/components/projections/ProjectionControls.tsx` — slider + input panel
- `src/components/projections/ProjectionChart.tsx` — Recharts area chart
- `src/components/projections/ProjectionSummary.tsx` — final metric cards
- `src/components/projections/ProjectionsHeader.tsx` — page header

**Details:**
- MUI `<Slider />` components for: Horizon (1–50), ETF Return (0–20%), Cash Rate (0–10%)
- MUI `<TextField type="number" />` for: Lump Sum, Monthly PAC, Annual Inflow
- Sliders update state on `onChange` (no debounce — pure computation is fast)
- Recharts `<AreaChart />` with two `<Area>` series:
  - Total Invested: `#10b981` (green), filled with gradient
  - Net Worth: `#5b6cb8` (indigo), filled with gradient
- Three summary `<Paper>` cards showing final values from last snapshot
- Dark theme styling via `sx` prop, consistent with existing pages
- `Box` + `Grid` responsive layout (left: controls, right: chart on desktop)

### Plan 83-03: Custom Hook + Routing + i18n

**Files to create:**
- `src/hooks/useProjections.ts` — encapsulates all slider state + engine call

**Files to modify:**
- `src/App.tsx` — add `/projections` route
- `src/components/layout/Layout.tsx` — add nav link
- `src/i18n/en.json` — add ~15 EN translation keys
- `src/i18n/it.json` — add ~15 IT translation keys

**Details:**
- `useProjections` hook returns: `input`, `snapshots`, `setParam(key, value)`, `summary`
- Summary computed via `useMemo` from last snapshot: `finalCapital`, `totalInterests`, `estimatedTaxes`
- Pre-fill defaults from `useInvestmentStore.brokerConfig` (optional enhancement)
- Route: `/projections` protected by `<ProtectedRoute>`
- Nav link in Layout — place under "Investments" or as standalone entry
- Feature gating: always visible or gated behind `investmentTracking` module toggle

## Verification

- `npm run build` passes with zero type errors
- `generateFinancialProjection()` produces correct snapshots for known inputs
  - 0% return → net worth = total invested (flat)
  - 12 months with $1000 lump sum + $100/mo PAC at 0% → net worth = $2200
- Sliders update chart in real-time without jank
- Chart renders two distinct series with correct colors
- Summary cards show correct final values from last snapshot
- No Firestore writes triggered during any interaction

## Dependencies

- [[features/investment-tracking]] — optional prefill source for default values
- No external API or backend dependencies

## Related

- [[features/financial-projections]]
- [[architecture/financial-projections-architecture]]
- [[architecture/project-state]]
- [[architecture/tech-stack]]
