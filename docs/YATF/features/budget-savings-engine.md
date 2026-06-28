---
title: "Budget & Savings Rate Engine"
tags: [feature, budget, savings, planned]
created: 2026-06-28
updated: 2026-06-28
status: planned
sources: ["raw/100-budget-savings-engine/issue.md"]
related: ["features/investment-tracking", "features/financial-projections", "features/crud-etf-transactions", "architecture/budget-savings-architecture", "architecture/financial-projections-architecture", "architecture/investment-tracking-architecture"]
---

# Feature: Budget & Savings Rate Engine

Status: planned
Priority: high

## Description

Advanced Budgeting and Target Tracking Module that transforms the application from pure investment tracking to full-featured personal finance management with real-time savings rate calculation and optimization. Adds a `/budget` route with budget configuration, progress tracking via Recharts visualizations, and a savings rate engine that bridges operational budgets with the investment pipeline.

## Sub-features

### 1. Core Data Architecture & Schema

Time-aware budget configuration with frequency support, integrated with the existing Firestore user document pattern.

**Requirements:**
- `BudgetConfig` TypeScript interface with fields: `{ id, category, period: "monthly" | "semiannual" | "annual", targetAmount, color, name? }`
- `BudgetProgressSnapshot` interface for computed progress data (client-side, not persisted)
- Budget configs stored in `budgetTargets[]` array on the user Firestore document
- Support for assigning budgets to expense categories (multi-category, or per-category)
- Default budget configs seeded from existing category list
- Integrates with liquidity management (cash accounts) and investment pipelines (surplus routing)

### 2. Advanced UX Visualizations (Recharts)

Three chart types for the `/budget` page, following existing dark-theme Recharts conventions.

**Requirements:**

**Non-Linear Progress Bars (Bullet Charts):**
- Horizontal gauge per budget category tracking percentage usage
- Multi-stage coloring: Safe zone (<70% green), Warning zone (71–99% amber), Breach zone (>=100% red)
- Real-time over-budget impact visualization (show by how much)
- MUI LinearProgress with custom coloring, or custom Recharts BarChart

**Grouped Comparative Bars:**
- Dual bar chart per category: Target (ghost bar) vs. Actual (filled bar)
- Time-period selector to view different months/periods
- Show temporal volatility — which categories consistently over/under-budget

**Accumulative Burn-Up Line Chart:**
- Time-based trajectory visualization for macro targets (total budget)
- Ideal burn rate (linear target ÷ days) vs. Actual spend rate (cumulative)
- Predicts end-of-period overshoot/undershoot based on current velocity

### 3. "Savings Rate Target" Engine

A pure client-side computation engine that calculates savings rate and provides a real-time feedback loop.

**Requirements:**
- Formula: `(Total Income − Total Expenses) / Total Income` for the selected period
- Breakdown visualization: where income is going (expenses by category, savings, investments)
- Live gauge component showing current savings rate vs. target rate
- Historical savings rate trend (line chart over past months)
- Comparison to target rate (configurable in BudgetConfig)
- Suggested investment allocation based on surplus (bridge to `/invest`)

## Integration Points

| System | Connection |
|--------|------------|
| Finance transactions | Budget progress computed from `transactions[]` filtered by category + date |
| Category system | Budgets assigned to `categories[]` — expense categories only |
| Investment tracking | Savings rate surplus → suggested PAC amounts in `/invest` |
| Financial projections | Savings rate data can prefill projection inputs |
| Firestore | `budgetTargets[]` stored in user document alongside existing arrays |
| Config page | Budget module toggle in `IAppModules` + budget settings |

## Related

- [[features/investment-tracking]] — Investment pipeline, target for surplus routing
- [[features/financial-projections]] — Projections simulation fed by savings rate data
- [[features/crud-etf-transactions]] — Transaction patterns
- [[architecture/budget-savings-architecture]] — Architecture & data flow
- [[architecture/financial-projections-architecture]] — Projections data flow
- [[architecture/investment-tracking-architecture]] — Investment tracking architecture
- [[plans/budget-savings-engine-implementation]] — Implementation plan
- Source: [raw/100-budget-savings-engine/issue.md](raw/100-budget-savings-engine/issue.md)
