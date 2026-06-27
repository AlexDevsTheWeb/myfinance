---
title: "Financial Projections Implementation Plan"
tags: [plans, implementation, projections, charting, completed]
created: 2026-06-26
updated: 2026-06-26
status: completed
sources: ["raw/83-financial-projections/issue.md", "raw/83-financial-projections/implementation.md"]
related: ["features/financial-projections", "architecture/financial-projections-architecture", "architecture/project-state"]
---

# Plan: Financial Projections & Compound Interest Simulator

Status: completed
Branch: `feat/YATF-83`

## Goal

Build a pure client-side simulation module that lets users model long-term investment growth through parametric sliders, with real-time chart updates and summary metrics.

## Implementation Plan

### ✅ Plan 83-01: Simulation Engine + Types (DONE)

**Files created:**
- `src/lib/compoundInterestUtils.ts` — pure `generateFinancialProjection()` function
- `src/store/types/projection.types.ts` — `IProjectionInput`, `IMonthlySnapshot` interfaces

**Details:**
- Deterministic monthly-loop algorithm implemented
- Monthly equivalent rates: `Math.pow(1 + annualRate, 1/12) - 1`
- Annual inflow credited at month 1 of each year (after year 1)
- Cash interest accrued before PAC deduction each month
- PAC caps at available cash balance
- ETF growth applied after PAC execution
- All monetary values `Math.round()` to integers

### ✅ Plan 83-02: Projection Page UI Shell (DONE)

**Files created:**
- `src/pages/ProjectionsPage.tsx` — main page layout
- `src/components/projections/ProjectionControls.tsx` — slider + input panel
- `src/components/projections/ProjectionChart.tsx` — Recharts area chart
- `src/components/projections/ProjectionSummary.tsx` — final metric cards
- `src/components/projections/ProjectionsHeader.tsx` — page header

**Details:**
- MUI `<Slider />` for Horizon (1–50), ETF Return (0–20%), Cash Rate (0–10%)
- MUI `<TextField type="number" />` for Lump Sum, Monthly PAC, Annual Inflow
- Recharts `<AreaChart />` with two `<Area>` series (green invested, indigo net worth)
- Three summary `<Paper>` cards with EUR formatting
- Dark theme styling via `sx` prop
- Responsive `Grid` layout

### ✅ Plan 83-03: Custom Hook + Routing + i18n (DONE)

**Files created:**
- `src/hooks/useProjections.ts` — encapsulates all state + computation

**Files modified:**
- `src/App.tsx` — `/projections` route with lazy loading
- `src/components/layout/Layout.tsx` — nav link in desktop AppBar + mobile drawer
- `src/locales/en.json` — 15 EN translation keys
- `src/locales/it.json` — 15 IT translation keys

**Details:**
- `useProjections` hook returns `input`, `snapshots`, `setParam`, `resetToDefaults`, `summary`, `chartData`
- Summary computed via `useMemo`: `finalCapital`, `totalInterests`, `estimatedTaxes`
- Pre-fill from `useInvestmentStore.brokerConfig` with try/catch fallback
- Route: `/projections` protected by `<ProtectedRoute>`, lazy-loaded (29 kB chunk)
- Feature always visible — no module gate

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
