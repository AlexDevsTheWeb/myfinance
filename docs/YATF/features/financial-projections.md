---
title: "Financial Projections & Compound Interest Simulator"
tags: [feature, projections, charting, simulated]
created: 2026-06-26
updated: 2026-06-26
status: planned
sources: ["raw/83-financial-projections/issue.md"]
related: ["architecture/financial-projections-architecture", "plans/financial-projections-implementation", "features/investment-tracking"]
---

# Feature: Financial Projections & Compound Interest Simulator

Status: planned
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
- Pre-populate input defaults from `useInvestmentStore.brokerConfig` if available (PAC amount, lump sum, interest rate, ticker)
- No new npm packages needed — recharts, MUI, zustand, dayjs all already available
- Dark theme chart styling consistent with existing portfolio charts (`#5b6cb8` for net worth, `#10b981` for total invested)

## Related

- [[plans/financial-projections-implementation]]
- [[architecture/financial-projections-architecture]]
- [[features/investment-tracking]]
- [[architecture/project-state]]
- Source: [raw/83-financial-projections/issue.md](raw/83-financial-projections/issue.md)
