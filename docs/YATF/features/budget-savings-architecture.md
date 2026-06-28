---
title: "Budget & Savings Rate Architecture"
tags: [architecture, budget, savings, data-flow, planned]
created: 2026-06-28
updated: 2026-06-28
status: active
sources: ["raw/100-budget-savings-engine/issue.md"]
related: ["features/budget-savings-engine", "features/investment-tracking", "features/financial-projections", "architecture/investment-tracking-architecture", "architecture/financial-projections-architecture", "architecture/system-architecture"]
---

# Architecture: Budget & Savings Rate Engine

## Overview

The Budget & Savings Rate module adds a new domain to the existing MyFinance ecosystem. It follows the same architectural patterns as the investment tracking module — a standalone Zustand store (`useBudgetStore`), Firestore array fields on the user document, and Recharts for visualization.

Unlike the investment module, budget **progress** is computed client-side from existing `transactions[]` data — no new subcollections or complex sync needed. Budget **configs** (targets, periods) are the only persisted data.

## Data Flow

```
User sets Budget Target
        │
        ▼
useBudgetStore (Zustand)
        │
        ├──► budgetTargets[] state + Firestore write
        │
User views Budget Page
        │
        ▼
BudgetEngine (pure computation utility)
        │
        ├──► Reads: transactions[] (from useFinanceStore)
        │         budgetTargets (from useBudgetStore)
        │         date range (from UI selector)
        │
        ├──► Computes: BudgetProgressSnapshot[]
        │         per category: { targetAmount, actualSpent, percentage, remaining }
        │         per period:   { totalBudget, totalSpent, savingsRate, surplus }
        │
        ▼
Recharts Visualizations
    ├── BulletChart (progress per category)
    ├── ComparisonBar (target vs actual)
    ├── BurnUpLine (cumulative trajectory)
    └── SavingsGauge (rate gauge)
```

## Firestore Schema

Budget configs follow the existing pattern — array field on the `users/{userId}` document:

```typescript
interface UserDoc {
  // ... existing fields
  
  budgetTargets: BudgetTarget[];     // NEW
}

interface BudgetTarget {
  id: string;                        // uuid
  category: string;                  // matches ICategory.name (expense categories only)
  period: 'monthly' | 'semiannual' | 'annual';
  targetAmount: number;              // in EUR
  color: string;                     // hex color for charts
  name?: string;                     // optional override (defaults to category name)
  createdAt: string;                 // ISO date
  updatedAt: string;
}
```

### BudgetProgressSnapshot (computed, not persisted)

```typescript
interface BudgetProgressSnapshot {
  category: string;
  targetAmount: number;
  actualSpent: number;
  percentage: number;                // 0–100+
  remaining: number;                 // targetAmount − actualSpent
  status: 'safe' | 'warning' | 'breach';
  periodStart: string;
  periodEnd: string;
}
```

**Why not persist progress?** Budget progress is ephemeral — it changes as new transactions are added. Persisting it would require recomputation trigger hooks. Computing from canonical `transactions[]` on render is simpler and always consistent.

## Store Architecture

**`useBudgetStore.ts`** (new standalone Zustand store):

- **State:** `budgetTargets: BudgetTarget[]`, `isSaving`, `saveError`
- **CRUD actions:** `addBudgetTarget`, `updateBudgetTarget`, `deleteBudgetTarget` — each follows the optimistic-update → Firestore write pattern identical to `useFinanceStore` and `useInvestmentStore`
- **No progress state in store** — computed on the fly by the budget engine

**`useBudgetSync.ts`** (new sync hook):

- `onSnapshot` subscription to user document, reads `budgetTargets[]`
- Initializes from `getDefaultUserConfig()` in `sync/index.ts`
- Same pattern as `useSyncFinance` and `useInvestmentSync`

## Budget Engine (Computation Layer)

A pure utility function (no side effects, trivially testable):

```typescript
function computeBudgetProgress(
  transactions: ITransaction[],
  budgetTargets: BudgetTarget[],
  dateRange: { start: string; end: string }
): {
  snapshots: BudgetProgressSnapshot[];
  totals: {
    totalBudget: number;
    totalSpent: number;
    savingsRate: number;     // (income − expenses) / income
    surplus: number;         // totalBudget − totalSpent
  };
  periodSummary: PeriodSummary;
}
```

Placed in `src/lib/budgetEngine.ts` — parallel to `compoundInterestUtils.ts`.

### Savings Rate Computation

```
SavingsRate = (TotalIncome − TotalExpenses) / TotalIncome

Where:
  TotalIncome   = sum of income transactions in date range
  TotalExpenses = sum of expense transactions in date range (all categories)
  SavingsRate   = decimal, displayed as percentage (e.g. 0.25 → "25%")
```

The savings rate is a **cross-domain metric** — it reads from the finance store's `transactions[]` and feeds into investment planning (surplus → suggested PAC).

## Component Tree

```
App.tsx
  └── Layout.tsx
        └── BudgetPage.tsx (route: /budget)
              ├── PeriodSelector (month/semiannual/year picker)
              ├── SavingsRateGauge.tsx (circular or linear gauge)
              │     └── Current rate vs target rate, with diff indicator
              │
              ├── BudgetSummaryCards
              │     ├── Total Budgeted
              │     ├── Total Spent
              │     ├── Remaining
              │     └── Savings Rate %
              │
              ├── BudgetCategoryList
              │     └── BudgetCategoryCard (one per target)
              │           ├── BulletChart (progress bar with zones)
              │           └── Quick stats (spent / target / remaining)
              │
              ├── ComparisonBarChart (Target vs Actual — Recharts BarChart)
              │
              ├── BurnUpLineChart (Cumulative spend vs ideal — Recharts AreaChart)
              │
              └── SavingsRateTrendChart (historical rate — Recharts LineChart)
```

## Charting Architecture

| Chart | Component | Library | Data Source |
|-------|-----------|---------|-------------|
| Per-category progress | `BulletChart` | MUI LinearProgress + custom theming | `BudgetProgressSnapshot[].percentage` |
| Target vs actual | `ComparisonBarChart` | Recharts BarChart | `BudgetProgressSnapshot[]` |
| Cumulative burn | `BurnUpLineChart` | Recharts AreaChart | Computed daily cumulative from transactions |
| Savings rate gauge | `SavingsRateGauge` | MUI Radial gauge or custom SVG | Engine `savingsRate` output |
| Historical trend | `SavingsRateTrendChart` | Recharts LineChart | Monthly snapshots computed from transactions |

## Integration Points

| System | Integration | Direction |
|--------|-------------|-----------|
| Finance store | Reads `transactions[]` for progress computation | Budget → Finance (read-only) |
| Investment tracking | Feeds surplus/savings rate for PAC suggestions | Budget → Invest (read) |
| Financial projections | Savings rate → prefill projection inputs | Budget → Projections (read) |
| Config page | Budget module toggle in `IAppModules` | Config → Budget (toggle) |
| Layout | Nav link in sidebar/drawer behind module toggle | Layout → Budget (nav) |

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Budget config storage | Array on user doc (not subcollection) | Simpler, matches existing pattern, budgets are low-volume |
| Progress persistence | None (computed client-side) | Always consistent with transactions; no sync complexity |
| Store approach | Standalone Zustand store | Matches investment module separation pattern |
| Chart library | Recharts v3.8.1 | Already in project, all needed chart types available |
| Savings rate engine | Pure utility in `src/lib/` | Testable, no side effects, matches projections pattern |
| Module toggle | New `budgetTracking` key in `IAppModules` | Consistent with car/utilities/investment pattern |

## Related

- [[features/budget-savings-engine]] — Feature description
- [[features/investment-tracking]] — Investment pipeline (surplus target)
- [[features/financial-projections]] — Projections (savings rate consumer)
- [[architecture/system-architecture]] — Overall system architecture
- [[architecture/investment-tracking-architecture]] — Investment architecture
- [[architecture/financial-projections-architecture]] — Projections architecture
- [[plans/budget-savings-engine-implementation]] — Implementation plan
- Source: [raw/100-budget-savings-engine/issue.md](raw/100-budget-savings-engine/issue.md)
