---
type: Architecture
description: "Simulation data flow, component tree, design decisions, and integration points."
title: "Financial Projections Architecture"
tags: [architecture, projections, data-flow, active]
created: 2026-06-26
updated: 2026-06-26
status: active
sources: ["raw/83-financial-projections/83-financial-projections.md", "raw/83-financial-projections/implementation.md"]
related: ["features/financial-projections", "plans/financial-projections-implementation", "architecture/investment-tracking-architecture"]
---

# Architecture: Financial Projections & Compound Interest Simulator

## Overview

A purely client-side simulation module. No Firestore writes, no server calls — all computation happens in a pure utility function driven by UI slider state. The feature integrates with the existing investment module by reading broker defaults but does not depend on it.

## Data Flow

```
User adjusts Slider
       │
       ▼
React state (useProjections hook)
       │
       ▼
generateFinancialProjection(input)  ← pure utility function
       │
       ├─► MonthlySnapshot[]  (array of 12×years data points)
       │
       ▼
Recharts AreaChart (two series)
    ├─ Total Invested (linear, green)
    └─ Projected Net Worth (exponential, indigo)

Final summary cards (computed from last snapshot)
```

## Input → Output Contract

```typescript
interface ProjectionInput {
  years: number;
  initialLumpSum: number;
  annualInflow: number;
  monthlyPac: number;
  etfAnnualReturn: number;
  cashAnnualRate: number;
}

interface MonthlySnapshot {
  monthIndex: number;
  year: number;
  monthNum: number;
  totalInvested: number;
  brokerCash: number;
  etfValue: number;
  netWorth: number;
}
```

## Component Tree

```
App.tsx
  └── Layout.tsx
        └── ProjectionsPage.tsx (route: /projections)
              ├── ProjectionsHeader.tsx — title + description
              ├── ProjectionControls.tsx — MUI Sliders + input fields
              │     ├── Slider: Horizon (years, 1–50)
              │     ├── Slider: ETF Return (0–20%)
              │     ├── Slider: Cash Interest Rate (0–10%)
              │     ├── NumberField: Initial Lump-Sum
              │     ├── NumberField: Monthly PAC
              │     └── NumberField: Annual Inflow
              ├── ProjectionChart.tsx — Recharts AreaChart
              │     ├── Series 1: Total Invested (green #10b981)
              │     └── Series 2: Net Worth (indigo #5b6cb8)
              └── ProjectionSummary.tsx — 3 metric cards
                    ├── Final Capital
                    ├── Total Interests Earned
                    └── Estimated Taxes
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | None (pure client-side) | No need to persist projections — they're what-if simulations |
| State | React local state / custom hook | No global store needed — single-page feature |
| Engine | Pure function in `src/lib/` | Trivially testable, no side effects, simple to verify |
| Chart | Recharts AreaChart | Already in project, consistent with portfolio charts |
| Input prefill | Optional read from `useInvestmentStore.brokerConfig` | Reduces friction if user has configured broker settings |
| No persistence | By design | Projections are ephemeral exploratory tools |

## Integration Points

- **Investment Store** (optional): pre-fill lump-sum, PAC, interest rate from `brokerConfig`
- **Nav / Routing**: `/projections` route with `React.lazy` (29 kB chunk), nav link in top AppBar + mobile drawer
- **i18n**: 15 new translation keys (EN/IT) under `projections` namespace

## Integration with Budget & Savings Rate Engine

The upcoming [[wiki/features/budget-savings-engine/budget-savings-engine]] can feed the projections simulator:

| Budget Feature | Projections Integration |
|----------------|------------------------|
| Real savings rate | Replace manual income/expense assumptions with actual savings rate from budget engine |
| Historical rate trend | Prefill projection CAGR-like inputs from computed historical savings rate |
| Budget surplus projection | Show "what if" scenarios: save X% more → investment growth impact |

See [[wiki/plans/budget-savings-engine-implementation#wave-6]] for the savings rate → investment bridge.

## Future: Configurable Rates

The proposed [[wiki/features/user-configurable-rates/user-configurable-rates]] feature will partially amend the "No persistence" design decision:

- The projection **engine** (`generateFinancialProjection`) remains a pure function — no persistence inside it
- However, its **inputs** (inflationRate, taxRate) will come from persistent user settings stored in Firestore
- The `useProjections` hook will read from `useUserSettingsStore` instead of hardcoded constants

See [[wiki/architecture/user-settings-data-flow]] for the full settings architecture.

## Related

- [[wiki/architecture/user-settings-data-flow]] — Proposed user settings architecture
- [[wiki/features/user-configurable-rates/user-configurable-rates]] — Proposed feature: configurable rates
- [[wiki/features/budget-savings-engine/budget-savings-engine]] — Budget module (savings rate data source)
- [[wiki/features/budget-savings-architecture/budget-savings-architecture]] — Budget architecture
- [[wiki/features/financial-projections/financial-projections]]
- [[wiki/plans/financial-projections-implementation]]
- [[wiki/plans/user-configurable-rates-implementation]]
- [[wiki/plans/budget-savings-engine-implementation]]
- [[wiki/architecture/investment-tracking-architecture]]
- [[wiki/architecture/tech-stack]]
