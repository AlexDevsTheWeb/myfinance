---
title: "Financial Projections & Compound Interest Simulator"
tags: [feature, projections, charting, implemented]
created: 2026-06-26
updated: 2026-06-26
status: implemented
sources: ["raw/83-financial-projections/83-financial-projections.md", "raw/83-financial-projections/implementation.md", "raw/FEATURES-GUIDE/FEATURES-GUIDE.md", "raw/ux-improvments/ux-improvments.md"]
related: ["features/investment-tracking-guide", "features/guida-investimenti", "plans/investment-tracking-v2-enhancements", "architecture/financial-projections-architecture", "plans/financial-projections-implementation", "features/investment-tracking"]
---

# Feature: Financial Projections & Compound Interest Simulator

Status: implemented
Priority: medium

## Description

A predictive charting module that lets users simulate the long-term growth (10–30 years) of their investment strategy based on compound interest and parametric market returns. Users adjust sliders for horizon, expected returns, and cash interest rates to see real-time projections.

## Requirements

### Simulation Engine
- Pure utility function `generateFinancialProjection()` producing monthly snapshots
- Inputs: investment horizon (years), ETF annual return (%), broker cash interest rate (%), initial lump-sum (€), monthly PAC amount (€), annual inflow (€)
- Algorithm: monthly loop — accrue cash interest, execute PAC transfer, apply ETF market return
- Output: array of `MonthlySnapshot` with `totalInvested`, `brokerCash`, `etfValue`, `netWorth`

### UI/UX Components
- Parametric sliders: MUI `<Slider />` for Horizon, ETF Return, Cash Interest Rate — real-time reactivity
- Projection chart: Recharts Area/Line Chart with two series — `Total Invested` (linear) vs `Projected Net Worth` (exponential)
- Summary cards: final metrics at end of timeline — `Final Capital`, `Total Interests Earned`, `Estimated Taxes`

### Configurable Parameters
- Investment horizon (years): default 20, range 1–50
- Estimated annual ETF return (%): default 7%, range 0–20%
- Broker cash interest rate (%): default 2%, range 0–10%
- Initial lump-sum (€): default 0
- Monthly PAC amount (€): default 200
- Annual inflow (€): default 0

## Implementation Notes

- Pure computation — no Firestore writes or server persistence needed. All simulation is client-side
- The engine is a pure function (no I/O, no state) making it trivially testable
- Pre-populate input defaults from `useInvestmentStore.brokerConfig` if available (PAC amount, lump sum, interest rate)
- No new npm packages needed — recharts, MUI, zustand, dayjs all already available
- Dark theme chart styling consistent with existing portfolio charts (`#5b6cb8` for net worth, `#10b981` for total invested)
- Feature always visible — no module gate
- `npm run build` passes with zero type errors

## Files Created

### Wave 1 — Types + Engine
- `src/store/types/projection.types.ts` — `IProjectionInput` (6 fields), `IMonthlySnapshot` (7 fields)
- `src/lib/compoundInterestUtils.ts` — `generateFinancialProjection()` pure function

### Wave 2 — UI Shell
- `src/components/projections/ProjectionControls.tsx` — 3 sliders + 3 text fields
- `src/components/projections/ProjectionChart.tsx` — Recharts AreaChart with gradient fills
- `src/components/projections/ProjectionSummary.tsx` — 3 metric Paper cards
- `src/components/projections/ProjectionsHeader.tsx` — Page title
- `src/pages/ProjectionsPage.tsx` — Responsive grid layout

### Wave 3 — Hook, Routing, i18n
- `src/hooks/useProjections.ts` — State + computation hook with optional broker prefill
- Route `/projections` added with `React.lazy` code-splitting (29 kB chunk)
- Nav link in Layout top AppBar (desktop) + drawer (mobile)
- 15 EN + 15 IT translation keys under `projections` namespace

## Future Enhancements

- [[wiki/features/user-configurable-rates/user-configurable-rates]] — Proposed: replace hardcoded inflation/tax rates with user-configurable values stored in Firestore

## Related

- [[wiki/plans/financial-projections-implementation]]
- [[wiki/architecture/financial-projections-architecture]]
- [[wiki/features/user-configurable-rates/user-configurable-rates]]
- [[wiki/features/investment-tracking/investment-tracking]]
- [[wiki/architecture/project-state]]
- Sources: [raw/83-financial-projections/83-financial-projections.md](raw/83-financial-projections/83-financial-projections.md), [raw/83-financial-projections/implementation.md](raw/83-financial-projections/implementation.md)
- [[wiki/features/investment-tracking-guide/investment-tracking-guide]] — User guide (EN)
- [[wiki/features/guida-investimenti/guida-investimenti]] — User guide (IT)
- [[wiki/plans/investment-tracking-v2-enhancements]] — V2 improvements plan (tax modeling)
