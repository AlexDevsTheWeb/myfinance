# Analytics Charts Design

**Date:** 2026-05-23
**Issue:** [#37 — add more charts based on analysis](https://github.com/AlexDevsTheWeb/myfinance/issues/37)
**Status:** Design approved, ready for implementation

---

## Overview

Add 4 new chart types to MyFinance using a shared analytics data layer. Charts are rendered on a new dedicated Insights page, plus selectively embedded on existing pages (Analysis, Dashboard, Transactions).

Budget vs Actual is deferred to a separate issue (future work).

---

## Architecture

### New directory: `src/analytics/`

```
src/analytics/
├── hooks/
│   ├── useCategoryBreakdown.ts
│   ├── useMonthlyComparison.ts
│   ├── useNetWorth.ts
│   └── useAccountBreakdown.ts
└── components/
    ├── CategoryPieChart.tsx
    ├── CategoryBarChart.tsx
    ├── MonthlyComparisonChart.tsx
    ├── NetWorthChart.tsx
    ├── AccountBreakdownChart.tsx
    └── AnalyticsFilters.tsx
```

Each hook reads from `useFinanceStore`, accepts a filter object (date range, granularity), and returns chart-ready data. Components are pure presentational — they receive processed data and render Recharts visualizations.

### Filters (`AnalyticsFilters.tsx`)

Shared filter bar with:
- Date range presets: "This month", "Last month", "This year", "Last year", "Custom"
- Granularity toggle: Monthly / Yearly / Total
- Optional category filter for drill-down

---

## Chart Specifications

### 1. Spending by Category

**Hooks:**
- `useCategoryBreakdown(dateRange, granularity)` → grouped by category, with totals and percentages

**Components:**
- `CategoryPieChart` — PieChart with colored slices per category, tooltip shows breakdown by subcategory
- `CategoryBarChart` — Horizontal BarChart, one bar per category; if range > 1 month, bars grouped by month

**Placement:**
- Insights page (pie + bar side by side)
- Analysis page (alongside existing yearly tables)
- Transactions page (compact version filtered to current view)

### 2. Monthly Comparison

**Hook:**
- `useMonthlyComparison(month, year)` → `{ current: { income, expense, net }, prevMonth: {...}, lastYear: {...} }`

**Component:**
- `MonthlyComparisonChart` — Grouped BarChart with 3 bars per metric: current month, previous month, same month last year

**Placement:**
- Insights page
- Analysis page (additional chart section)

### 3. Net Worth Over Time

**Hook:**
- `useNetWorth(dateRange)` → array of `{ date, balance }` points computed from initial balance + all transaction history

**Component:**
- `NetWorthChart` — AreaChart with gradient fill showing running balance over time

**Placement:**
- Insights page (full width)
- Dashboard (optional, could supplement/replace cash flow trend)

### 4. Account Breakdown

**Hook:**
- `useAccountBreakdown()` → `[{ account, balance, percentage }]` computed per-account balance

**Component:**
- `AccountBreakdownChart` — PieChart showing balance distribution across accounts with euro labels

**Placement:**
- Insights page
- Dashboard (compact card)

---

## Page Integration

| Page | Charts Added | Type |
|------|-------------|------|
| **Insights** (new) | All 4 chart types + AnalyticsFilters | Full page |
| **Analysis** | CategoryPieChart, CategoryBarChart, MonthlyComparisonChart | Enhanced existing |
| **Dashboard** | NetWorthChart, AccountBreakdownChart | Enhanced existing |
| **Transactions** | CategoryPieChart (compact) | Enhanced existing |

Route for new page: `/insights` (protected, wrapped in Layout).

---

## Design System

All charts follow existing MyFinance conventions:
- Recharts v3.8.x
- Dark theme backgrounds (`#161b2e` / `#1e293b`)
- Euro formatting with `€` prefix
- Italian locale (`it-IT`) for number formatting
- Consistent `CartesianGrid`, `XAxis`, `YAxis` styling
- Inter font family

---

## Implementation Branches

| Order | Branch | Scope | 
|-------|--------|-------|
| 1 | `feat/37-analytics-layer` | Hooks + chart components + AnalyticsFilters |
| 2 | `feat/37-insights-page` | New `/insights` page, route, nav link |
| 3 | `feat/37-analysis-enhance` | Spending + comparison charts on AnalysisPage |
| 4 | `feat/37-dashboard-transactions` | Net worth/account on Dashboard, spending on Transactions |

Branch 1 is the foundation. Branches 2–4 build on it and can run in parallel after merge.

---

## Deferred

- **Budget vs Actual** — requires building a budget creation/management feature first. Tracked in a separate issue.

---

## Acceptance Criteria

- [ ] Spending by Category shown as pie + bar, filterable by month/year/range
- [ ] Monthly Comparison shows current vs previous vs same month last year
- [ ] Net Worth Over Time chart renders running balance trend
- [ ] Account Breakdown chart shows balance per account
- [ ] Dedicated Insights page at `/insights` with all charts + filter bar
- [ ] Analysis page enhanced with spending charts
- [ ] Dashboard optionally shows net worth / account breakdown
- [ ] All charts follow existing dark theme and formatting
- [ ] Build passes for each branch
