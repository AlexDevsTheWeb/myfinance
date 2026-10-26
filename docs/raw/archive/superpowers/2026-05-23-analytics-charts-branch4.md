# Analytics Charts — Branch 4: Dashboard & Transactions Charts

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed analytics charts on the Dashboard (net worth + account breakdown) and Transactions page (compact spending pie chart)

**Architecture:** Modify `DashboardPage.tsx` to show NetWorthChart and AccountBreakdownChart in the right column. Modify `TransactionsPage.tsx` to show a compact CategoryPieChart above the transaction table, filtered by the selected date range.

**Depends on:** Branch 1 (`feat/37-analytics-layer`) — the shared analytics layer must be merged first.

**Branch:** `feat/37-dashboard-transactions`

---

### Task 1: Enhance Dashboard with net worth and account charts

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: Add imports**

Add at the top:
```tsx
import dayjs from 'dayjs';
import {
  NetWorthChart,
  AccountBreakdownChart,
  useNetWorth,
  useAccountBreakdown,
} from '../analytics';
```

- [ ] **Step 2: Add analytics data hooks inside the component**

After the `accountsDetail` useMemo, add:
```tsx
const dashboardDateRange = React.useMemo(() => ({
  startDate: dayjs(balanceStartDate).format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
}), [balanceStartDate]);

const netWorthData = useNetWorth(dashboardDateRange);
const accountData = useAccountBreakdown();
```

- [ ] **Step 3: Add chart components to the right column**

In the right column (`<Grid size={{ xs: 12, lg: 5 }}>`), after the account details section and before the `<Charts />` component, add:

```tsx
<Box sx={{ mb: 3 }}>
  <NetWorthChart
    data={netWorthData}
    title="Net Worth"
  />
</Box>
<Box sx={{ mb: 3 }}>
  <AccountBreakdownChart
    data={accountData}
    title="Accounts"
  />
</Box>
```

- [ ] **Step 4: Verify build and commit**

```bash
npm run build
git add src/pages/DashboardPage.tsx
git commit -m "feat(dashboard): add net worth and account breakdown charts"
```

---

### Task 2: Enhance Transactions page with spending pie chart

**Files:**
- Modify: `src/pages/TransactionsPage.tsx`

- [ ] **Step 1: Add imports**

Add at the top:
```tsx
import dayjs, { Dayjs } from 'dayjs';
import {
  CategoryPieChart,
  useCategoryBreakdown,
} from '../analytics';
```

- [ ] **Step 2: Add category breakdown hook**

After the `paginatedTransactions` useMemo, add:
```tsx
const txDateRange = React.useMemo(() => ({
  startDate: (startDate || dayjs().startOf('year')).format('YYYY-MM-DD'),
  endDate: (endDate || dayjs().endOf('year')).format('YYYY-MM-DD'),
}), [startDate, endDate]);

const txFilters = React.useMemo(() => ({
  dateRange: txDateRange,
  granularity: 'total' as const,
  category: category !== 'all' ? category : undefined,
}), [txDateRange, category]);

const categoryData = useCategoryBreakdown(txFilters);
```

- [ ] **Step 3: Add pie chart to the left column (filter card)**

In the left column (`<Grid size={{ xs: 12, lg: 4 }}>`), after the filter card and before closing the Grid, add:
```tsx
<Box sx={{ mt: 2 }}>
  <CategoryPieChart
    data={categoryData.breakdown}
    title="Spending by Category"
  />
</Box>
```

- [ ] **Step 4: Verify build and commit**

```bash
npm run build
git add src/pages/TransactionsPage.tsx
git commit -m "feat(transactions): add spending pie chart filtered by current filters"
```
