# Analytics Charts — Branch 2: Insights Page

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new dedicated Insights page (`/insights`) that displays all analytics charts with a shared filter bar

**Architecture:** New page component `InsightsPage.tsx` that imports chart components and hooks from `src/analytics/`. Page uses a grid layout with the AnalyticsFilters at the top. Route added to `App.tsx`, nav link added to `Layout.tsx`.

**Depends on:** Branch 1 (`feat/37-analytics-layer`) — the shared analytics layer must be merged first.

**Branch:** `feat/37-insights-page`

---

### Task 1: Create InsightsPage

**Files:**
- Create: `src/pages/InsightsPage.tsx`

- [ ] **Step 1: Write the InsightsPage component**

```tsx
import { Box, Grid, Typography } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  CategoryPieChart,
  CategoryBarChart,
  MonthlyComparisonChart,
  NetWorthChart,
  AccountBreakdownChart,
  AnalyticsFilters,
  useCategoryBreakdown,
  useMonthlyComparison,
  useNetWorth,
  useAccountBreakdown,
} from '../analytics';

const InsightsPage: React.FC = () => {
  const { t } = useTranslation();
  const { categories } = useFinanceStore();

  const allCategories = useMemo(() =>
    categories.map(c => c.name).sort(),
  [categories]);

  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('year'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf('year'));
  const [granularity, setGranularity] = useState<'monthly' | 'yearly' | 'total'>('monthly');
  const [category, setCategory] = useState<string>('all');

  const dateRange = useMemo(() => ({
    startDate: (startDate || dayjs().startOf('year')).format('YYYY-MM-DD'),
    endDate: (endDate || dayjs().endOf('year')).format('YYYY-MM-DD'),
  }), [startDate, endDate]);

  const filters = useMemo(() => ({
    dateRange,
    granularity,
    category: category !== 'all' ? category : undefined,
  }), [dateRange, granularity, category]);

  const categoryData = useCategoryBreakdown(filters);

  // Net worth uses full dateRange
  const netWorthData = useNetWorth(dateRange);

  // Account breakdown (no filters needed)
  const accountData = useAccountBreakdown();

  // Monthly comparison uses the latest available month in data
  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();
  const comparisonData = useMonthlyComparison(currentMonth, currentYear);

  const handleClear = () => {
    setStartDate(dayjs().startOf('year'));
    setEndDate(dayjs().endOf('year'));
    setGranularity('monthly');
    setCategory('all');
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <BarChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Insights
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.6 }}>
          Deep analytics and visualizations of your financial data.
        </Typography>
      </Box>

      <AnalyticsFilters
        startDate={startDate}
        endDate={endDate}
        granularity={granularity}
        category={category}
        categories={allCategories}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onGranularityChange={setGranularity}
        onCategoryChange={(c) => setCategory(c)}
        onClear={handleClear}
      />

      <Grid container spacing={3}>
        {/* Row 1: Spending by Category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CategoryPieChart
            data={categoryData.breakdown}
            title="Spending by Category"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CategoryBarChart
            data={categoryData.breakdown}
            title="Category Totals"
          />
        </Grid>

        {/* Row 2: Monthly Comparison */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MonthlyComparisonChart
            data={comparisonData}
            title="Monthly Comparison"
          />
        </Grid>

        {/* Row 3: Net Worth */}
        <Grid size={{ xs: 12, md: 8 }}>
          <NetWorthChart
            data={netWorthData}
            title="Net Worth Over Time"
          />
        </Grid>

        {/* Row 4: Account Breakdown */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AccountBreakdownChart
            data={accountData}
            title="Account Breakdown"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InsightsPage;
```

- [ ] **Step 2: Add i18n entries**

Add to `src/locales/en.json`:
```json
"insights": {
  "title": "Insights",
  "spendingByCategory": "Spending by Category",
  "categoryTotals": "Category Totals",
  "monthlyComparison": "Monthly Comparison",
  "netWorth": "Net Worth Over Time",
  "accountBreakdown": "Account Breakdown"
}
```

Add to `src/locales/it.json`:
```json
"insights": {
  "title": "Analisi",
  "spendingByCategory": "Spese per Categoria",
  "categoryTotals": "Totali per Categoria",
  "monthlyComparison": "Confronto Mensile",
  "netWorth": "Patrimonio Netto",
  "accountBreakdown": "Distribuzione Conti"
}
```

- [ ] **Step 3: Verify build and commit**

```bash
git add src/pages/InsightsPage.tsx src/locales/en.json src/locales/it.json
git commit -m "feat(insights): add Insights page with all analytics charts"
```

---

### Task 2: Add route to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add import and route**

Add import near the other page imports:
```tsx
import InsightsPage from './pages/InsightsPage';
```

Add route after the `/analysis` route block:
```tsx
<Route path="/insights" element={
  <ProtectedRoute>
    <InsightsPage />
  </ProtectedRoute>
} />
```

- [ ] **Step 2: Verify build and commit**

```bash
git add src/App.tsx
git commit -m "feat(insights): add /insights route"
```

---

### Task 3: Add navigation link to Layout

**Files:**
- Modify: `src/components/layout/Layout.tsx`

- [ ] **Step 1: Add nav link in drawer**

After the `/analysis` nav item (around line 98), add:
```tsx
<ListItemButton onClick={() => { navigate('/insights'); }}>
  <ListItemIcon><BarChartIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
  <ListItemText primary="Insights" sx={{ color: 'white' }} />
</ListItemButton>
```

- [ ] **Step 2: Add to Finance dropdown menu**

After the `/analysis` menu item in the Finance dropdown, add:
```tsx
<MenuItem onClick={() => { navigate('/insights'); handleCloseFinance(); }}>
  <BarChartIcon sx={{ mr: 1.5, fontSize: 20, opacity: 0.7 }} /> Insights
</MenuItem>
```

- [ ] **Step 3: Add breadcrumb mapping**

Add to the `breadcrumbNameMap`:
```ts
'insights': 'Insights',
```

- [ ] **Step 4: Verify build and commit**

```bash
git add src/components/layout/Layout.tsx
git commit -m "feat(insights): add Insights nav link to drawer and dropdown"
```

---

### Task 4: Verify build

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 2: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix(insights): resolve build issues"
```
