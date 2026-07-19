---
type: Plan
description: "V4 Budget & Savings Rate implementation: six waves, eleven new files, ten modified."
title: "Budget & Savings Rate Engine — Implementation Plan"
tags: [plan, budget, savings, draft]
created: 2026-06-28
updated: 2026-06-28
status: completed
sources: ["raw/100-budget-savings-engine/100-budget-savings-engine.md"]
related: ["features/budget-savings-engine", "features/budget-savings-architecture", "features/investment-tracking", "features/financial-projections", "architecture/budget-savings-architecture", "architecture/investment-tracking-architecture", "architecture/financial-projections-architecture"]
---

# Plan: Budget & Savings Rate Engine — Implementation

Status: completed

## Goal

Implement a full Budget & Savings Rate module (`/budget`) with budget target configuration, real-time progress tracking via Recharts visualizations, and a savings rate engine that bridges operational budgets with the investment pipeline.

## Architecture Analysis

### Pattern Fit

The budget module follows the exact same architectural patterns as the existing investment tracking module:

| Aspect | Investment (reference) | Budget (new) |
|--------|----------------------|--------------|
| Store | `useInvestmentStore.ts` (standalone Zustand) | `useBudgetStore.ts` (standalone Zustand) |
| Types | `investment.types.ts` | `budget.types.ts` |
| Firestore | Array fields on user doc | `budgetTargets[]` on user doc |
| Sync | `useInvestmentSync.ts` | `useBudgetSync.ts` |
| Defaults | In `getDefaultUserConfig()` | Seed in `getDefaultUserConfig()` |
| Module toggle | `investmentTracking` in `IAppModules` | `budgetTracking` in `IAppModules` |

### Key Difference from Investment Module

Budget **progress is not persisted** — it's computed live from `transactions[]` by a pure utility function. This means:
- No Firestore writes for progress data
- No subcollection to manage
- Progress is always consistent with current transactions
- Computation must be efficient (filter + sum over date range + per category)

### Cross-Module Dependencies

The budget module is read-only consumer of the finance store's `transactions[]`. It does **not** modify finance data. The savings rate engine bridges to investment by computing surplus that could feed PAC suggestions, but the bridge is advisory (display-only in V4, actionable in future versions).

## Implementation Order

| Order | Wave | Feature | Dependencies | Effort |
|-------|------|---------|-------------|--------|
| 1 | Wave 1 | Types, Store, Sync, Defaults, Firestore rules | None | Medium |
| 2 | Wave 2 | Budget Engine (pure computation utility) | Wave 1 | Medium |
| 3 | Wave 3 | UI — BudgetPage shell + SavingsRateGauge + SummaryCards | Wave 2 | Medium |
| 4 | Wave 4 | UI — BulletChart + ComparisonBarChart + BurnUpLineChart | Wave 2 | Large |
| 5 | Wave 5 | Routing, Nav, Module Toggle, i18n | Wave 1 | Small |
| 6 | Wave 6 | Savings rate → Investment bridge (surplus display) | Wave 3, invest store | Small |

**Rationale:** Types/store first (foundation). Engine second (core logic, testable independently). UI waves build on the engine output. Navigation/i18n waves are lightweight wiring. The investment bridge is last because it's additive on top of completed module.

---

## Wave 1 — Types, Store, Sync, Defaults, Firestore Rules

### Files to create
- `src/store/types/budget.types.ts` — `BudgetTarget` interface, CRUD action types
- `src/store/useBudgetStore.ts` — Zustand store with CRUD actions
- `src/store/useBudgetSync.ts` — Firestore sync hook

### Files to modify
- `src/store/types/index.ts` — export budget types
- `src/store/types/finance.types.ts` — add `budgetTracking: boolean` to `IAppModules`
- `src/lib/converters.ts` — add `budgetTargets` to `UserDoc` interface and firestore converters (`fromFirestore`, `toFirestore`)
- `src/store/sync/index.ts` — add `budgetTargets: []` to `getDefaultUserConfig()`, import + call `useBudgetSync` in initialization
- `firestore.rules` — add read/write rules for `budgetTargets` field

### BudgetTarget type
```typescript
export interface BudgetTarget {
  id: string;
  category: string;
  period: 'monthly' | 'semiannual' | 'annual';
  targetAmount: number;
  color: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Store actions
```typescript
interface BudgetStore {
  budgetTargets: BudgetTarget[];
  isSaving: boolean;
  saveError: string | null;

  addBudgetTarget: (target: Omit<BudgetTarget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudgetTarget: (id: string, updates: Partial<BudgetTarget>) => Promise<void>;
  deleteBudgetTarget: (id: string) => Promise<void>;
  setBudgetTargets: (targets: BudgetTarget[]) => void;
}
```

### Firestore rules addition
```javascript
match /users/{userId} {
  // ... existing rules
  
  // Budget targets field-level read/write
  allow read: if request.auth != null && request.auth.uid == userId;
  // Allow write on the budgetTargets field
  // (already covered by document-level write rule if using field writes)
}
```

---

## Wave 2 — Budget Engine (Pure Computation Utility)

### File to create
- `src/lib/budgetEngine.ts` — pure computation functions

### Functions
```typescript
export interface BudgetProgressSnapshot {
  category: string;
  targetAmount: number;
  actualSpent: number;
  percentage: number;
  remaining: number;
  status: 'safe' | 'warning' | 'breach';
  periodStart: string;
  periodEnd: string;
}

export interface PeriodSummary {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  totalBudgeted: number;
  totalSpent: number;
  surplus: number;
  dailyBurnRate: number;
  daysRemaining: number;
  projectedOvershoot: number;
}

export function computeBudgetProgress(
  transactions: ITransaction[],
  budgetTargets: BudgetTarget[],
  dateRange: { start: string; end: string }
): {
  snapshots: BudgetProgressSnapshot[];
  summary: PeriodSummary;
} { /* ... */ }

export function computeSavingsRate(
  transactions: ITransaction[],
  dateRange: { start: string; end: string }
): number { /* ... */ }

export function computeHistoricalSavingsRate(
  transactions: ITransaction[],
  months: number
): { month: string; rate: number }[] { /* ... */ }

export function computeBurnUpData(
  transactions: ITransaction[],
  budgetTargets: BudgetTarget[],
  dateRange: { start: string; end: string }
): { date: string; actual: number; ideal: number }[] { /* ... */ }
```

### Computation logic

**Budget progress per category:**
```
filter transactions by category + date range + type === 'expense'
sum amounts (absolute value)
percentage = actualSpent / targetAmount * 100
status = percentage < 70 ? 'safe' : percentage < 100 ? 'warning' : 'breach'
remaining = targetAmount - actualSpent
```

**Savings rate:**
```
totalIncome = sum of income transactions in date range
totalExpenses = sum of expense transactions (absolute) in date range
rate = (totalIncome - totalExpenses) / totalIncome
```

**Burn-up data:**
```
daysInPeriod = endDate - startDate
per-day ideal = totalBudget / daysInPeriod
for each transaction date (sorted), compute cumulative actual
for each day, ideal = (dayIndex / daysInPeriod) * totalBudget
```

---

## Wave 3 — BudgetPage Shell + SavingsRateGauge + SummaryCards

### Files to create
- `src/pages/BudgetPage.tsx` — main page component
- `src/components/budget/SavingsRateGauge.tsx` — savings rate gauge (MUI CircularProgress or custom)
- `src/components/budget/BudgetSummaryCards.tsx` — 4 summary metric cards

### BudgetPage structure
```typescript
function BudgetPage() {
  const { budgetTargets } = useBudgetStore();
  const { transactions } = useFinanceStore();
  const [dateRange, setDateRange] = useState({ start, end });

  const { snapshots, summary } = useMemo(
    () => computeBudgetProgress(transactions, budgetTargets, dateRange),
    [transactions, budgetTargets, dateRange]
  );

  return (
    <>
      <PeriodSelector value={dateRange} onChange={setDateRange} />
      <SavingsRateGauge rate={summary.savingsRate} />
      <BudgetSummaryCards summary={summary} />
      <BudgetCategoryList snapshots={snapshots} />
      <ComparisonBarChart snapshots={snapshots} />
      <BurnUpLineChart transactions={transactions} targets={budgetTargets} dateRange={dateRange} />
    </>
  );
}
```

### SavingsRateGauge
- Uses MUI `CircularProgress` with `variant="determinate"`
- Color: green >20%, amber 10–20%, red <10%
- Shows current rate % + target rate % with diff indicator
- Placement: top of page, hero-style

### BudgetSummaryCards
- MUI `Grid` of 4 `Paper` cards:
  - Total Budgeted (sum of all target amounts)
  - Total Spent (sum of actual expenses in budget categories)
  - Remaining (totalBudgeted − totalSpent)
  - Savings Rate % (highlighted, largest card)

---

## Wave 4 — Recharts Visualizations

### Files to create
- `src/components/budget/BulletChart.tsx` — per-category progress bars
- `src/components/budget/ComparisonBarChart.tsx` — target vs actual bars
- `src/components/budget/BurnUpLineChart.tsx` — cumulative burn-up trajectory

### BulletChart (per-category)
- Uses MUI `LinearProgress` with custom `sx` theming for color zones
- Shows: category name, progress bar (color-coded), spent/target, percentage text
- Threshold lines: safe/warning/breach zone indicators
- Multiple bars rendered in a list layout

### ComparisonBarChart
- Recharts `BarChart` with `ResponsiveContainer`
- Two `Bar` series per category: Target (ghost/faded), Actual (filled)
- X-axis: category names
- Y-axis: EUR amount
- Legend: Target vs Actual
- Color: actual bar inherits from BudgetTarget.color

### BurnUpLineChart
- Recharts `AreaChart` with `ResponsiveContainer`
- Two `Area` series: Ideal (dashed line), Actual (filled gradient)
- X-axis: dates (daily or weekly ticks)
- Y-axis: cumulative EUR
- Tooltip showing actual, ideal, variance

### Chart theming
Follow existing dark-theme conventions from other chart components:
```typescript
const chartTheme = {
  background: '#161b2e',
  grid: 'rgba(255,255,255,0.05)',
  axis: 'rgba(255,255,255,0.5)',
  tooltip: { background: '#1e293b', border: 'rgba(255,255,255,0.1)' },
};
```

---

## Wave 5 — Routing, Nav, Module Toggle, i18n

### Files to modify
- `src/App.tsx` — add `/budget` route with `ProtectedRoute` + lazy loading
- `src/components/layout/Layout.tsx` — add nav link for budget (conditionally shown)
- `src/pages/ConfigPage.tsx` — add budget toggle switch
- `src/store/types/finance.types.ts` — add `budgetTracking` to IAppModules
- `src/i18n/en.json` — budget namespace translations
- `src/i18n/it.json` — budget namespace translations

### Route definition
```typescript
const BudgetPage = React.lazy(() => import('../pages/BudgetPage'));

<Route path="/budget" element={
  <ProtectedRoute>
    <BudgetPage />
  </ProtectedRoute>
} />
```

### Nav link
```typescript
{enabledModules?.budgetTracking && (
  <ListItemButton component={Link} to="/budget">
    <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
    <ListItemText primary={t('nav.budget')} />
  </ListItemButton>
)}
```

### Module toggle
```typescript
// In IAppModules
interface IAppModules {
  // ... existing
  budgetTracking: boolean;
}
```

### i18n keys
```
budget:
  title: "Budget"
  savingsRate: "Savings Rate"
  totalBudgeted: "Total Budgeted"
  totalSpent: "Total Spent"
  remaining: "Remaining"
  targetVsActual: "Target vs Actual"
  burnUp: "Burn-up Trend"
  period: "Period"
  addBudget: "Add Budget Target"
  editBudget: "Edit Budget Target"
  deleteBudget: "Delete Budget Target"
  category: "Category"
  targetAmount: "Target Amount"
  periodMonthly: "Monthly"
  periodSemiannual: "Semiannual"
  periodAnnual: "Annual"
  safe: "On Track"
  warning: "Approaching Limit"
  breach: "Over Budget"
nav:
  budget: "Budget"
config:
  budgetTracking: "Budget Tracking"
```

---

## Wave 6 — Savings Rate → Investment Bridge

### Files to create/modify
- `src/components/budget/InvestmentBridgeCard.tsx` — surplus suggestion card
- `src/components/investment/` or `BudgetPage.tsx` — integration point

### InvestmentBridgeCard
- Displays on BudgetPage when surplus > 0
- Shows: "€X surplus this month — consider increasing your PAC"
- Quick-action button: "Apply to Investment" (prefills PAC amount in invest store)
- Links to `/invest` page

### Integration logic
```
surplus = totalIncome − totalExpenses (from PeriodSummary)
suggestedPacIncrease = surplus * 0.5  // 50% of surplus
currentPac = brokerConfig.monthlyPacAmount
newSuggestedPac = currentPac + suggestedPacIncrease
```

---

## Files: Complete Change List

### Create
| File | Wave |
|------|------|
| `src/store/types/budget.types.ts` | 1 |
| `src/store/useBudgetStore.ts` | 1 |
| `src/store/useBudgetSync.ts` | 1 |
| `src/lib/budgetEngine.ts` | 2 |
| `src/pages/BudgetPage.tsx` | 3 |
| `src/components/budget/SavingsRateGauge.tsx` | 3 |
| `src/components/budget/BudgetSummaryCards.tsx` | 3 |
| `src/components/budget/BulletChart.tsx` | 4 |
| `src/components/budget/ComparisonBarChart.tsx` | 4 |
| `src/components/budget/BurnUpLineChart.tsx` | 4 |
| `src/components/budget/InvestmentBridgeCard.tsx` | 6 |

### Modify
| File | Change | Wave |
|------|--------|------|
| `src/store/types/finance.types.ts` | Add `budgetTracking` to IAppModules | 1 |
| `src/store/types/index.ts` | Export budget types | 1 |
| `src/lib/converters.ts` | Add `budgetTargets` to UserDoc | 1 |
| `src/store/sync/index.ts` | Default budget config + sync hook | 1 |
| `firestore.rules` | Budget field access rules | 1 |
| `src/App.tsx` | Add `/budget` route | 5 |
| `src/components/layout/Layout.tsx` | Add budget nav link | 5 |
| `src/pages/ConfigPage.tsx` | Budget module toggle | 5 |
| `src/i18n/en.json` | Budget translations (EN) | 5 |
| `src/i18n/it.json` | Budget translations (IT) | 5 |

### Total: 11 new files, 10 modified files

## Verification

1. **TypeScript:** `npm run build` passes without type errors
2. **Lint:** `npm run lint` passes
3. **Firebase emulator:** Budget CRUD operations persist to Firestore correctly
4. **Edge cases:**
   - Budget with no transactions → 0% spent, all green
   - Budget heavily exceeded → 200%+ shows breach
   - Empty budget targets → page shows empty state with "Add Budget" CTA
   - Month boundary → correct date filtering
   - No income in period → savings rate = -infinity (handle division by zero)
5. **Cross-module:**
   - Adding a transaction in `/transactions` → budget progress updates on `/budget`
   - Toggling budget module off → nav link disappears, route redirects
   - Savings rate matches manual calculation

## Dependencies

- [[wiki/features/investment-tracking/investment-tracking]] — Investment pipeline (bridge target)
- [[wiki/features/financial-projections/financial-projections]] — Projections (future bridge)
- [[wiki/features/crud-etf-transactions/crud-etf-transactions]] — Transaction patterns reference
- [[wiki/architecture/budget-savings-architecture]] — Architecture & data flow
- [[wiki/architecture/investment-tracking-architecture]] — Existing store pattern reference
- [[wiki/architecture/financial-projections-architecture]] — Pure computation engine pattern
- [[wiki/architecture/system-architecture]] — Overall architecture
- [[wiki/architecture/tech-stack]] — Tech stack reference (Recharts, MUI)

## Related

- [[wiki/features/budget-savings-engine/budget-savings-engine]] — Feature description
- [[wiki/features/budget-savings-architecture/budget-savings-architecture]] — Architecture
- Source: [raw/100-budget-savings-engine/100-budget-savings-engine.md](raw/100-budget-savings-engine/100-budget-savings-engine.md)
