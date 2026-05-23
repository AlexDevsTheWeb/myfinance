# Analytics Charts — Branch 3: Analysis Page Enhancements

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the existing Analysis page with spending by category charts and monthly comparison

**Architecture:** Modify `AnalysisPage.tsx` to add CategoryPieChart, CategoryBarChart, and MonthlyComparisonChart below the existing yearly analysis grid. Uses the same `AnalyticsFilters` component with a date range defaulting to the selected year.

**Depends on:** Branch 1 (`feat/37-analytics-layer`) — the shared analytics layer must be merged first.

**Branch:** `feat/37-analysis-enhance`

---

### Task 1: Enhance AnalysisPage with category charts

**Files:**
- Modify: `src/pages/AnalysisPage.tsx`

- [ ] **Step 1: Add imports**

Add at the top with existing imports:
```tsx
import dayjs, { Dayjs } from 'dayjs';
import { useState, useMemo } from 'react';
import {
  CategoryPieChart,
  CategoryBarChart,
  MonthlyComparisonChart,
  AnalyticsFilters,
  useCategoryBreakdown,
  useMonthlyComparison,
} from '../analytics';
```

Also import `BarChart as BarChartIcon` from `@mui/icons-material` (it's already imported).

- [ ] **Step 2: Add analytics state and hooks inside the component**

Before the return statement, add:
```tsx
const { categories } = useFinanceStore();

const [insightStartDate, setInsightStartDate] = useState<Dayjs | null>(dayjs(`${selectedYear}-01-01`));
const [insightEndDate, setInsightEndDate] = useState<Dayjs | null>(dayjs(`${selectedYear}-12-31`));
const [insightGranularity, setInsightGranularity] = useState<'monthly' | 'yearly' | 'total'>('monthly');
const [insightCategory, setInsightCategory] = useState<string>('all');

const allCategories = useMemo(() =>
  categories.map(c => c.name).sort(),
[categories]);

const insightDateRange = useMemo(() => ({
  startDate: (insightStartDate || dayjs(`${selectedYear}-01-01`)).format('YYYY-MM-DD'),
  endDate: (insightEndDate || dayjs(`${selectedYear}-12-31`)).format('YYYY-MM-DD'),
}), [insightStartDate, insightEndDate, selectedYear]);

const insightFilters = useMemo(() => ({
  dateRange: insightDateRange,
  granularity: insightGranularity,
  category: insightCategory !== 'all' ? insightCategory : undefined,
}), [insightDateRange, insightGranularity, insightCategory]);

const categoryData = useCategoryBreakdown(insightFilters);
const comparisonData = useMonthlyComparison(dayjs().month(), dayjs().year());

const handleClearInsight = () => {
  setInsightStartDate(dayjs(`${selectedYear}-01-01`));
  setInsightEndDate(dayjs(`${selectedYear}-12-31`));
  setInsightGranularity('monthly');
  setInsightCategory('all');
};
```

- [ ] **Step 3: Add analytics section after the existing grid**

After the closing `</Grid>` of the existing grid (line ~47), add:
```tsx
<Box sx={{ mt: 6 }}>
  <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -1, mb: 3 }}>
    Spending Insights
  </Typography>

  <AnalyticsFilters
    startDate={insightStartDate}
    endDate={insightEndDate}
    granularity={insightGranularity}
    category={insightCategory}
    categories={allCategories}
    onStartDateChange={setInsightStartDate}
    onEndDateChange={setInsightEndDate}
    onGranularityChange={setInsightGranularity}
    onCategoryChange={(c) => setInsightCategory(c)}
    onClear={handleClearInsight}
  />

  <Grid container spacing={3}>
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
    <Grid size={{ xs: 12 }}>
      <MonthlyComparisonChart
        data={comparisonData}
        title="Monthly Comparison"
      />
    </Grid>
  </Grid>
</Box>
```

- [ ] **Step 4: Verify build and commit**

```bash
npm run build
git add src/pages/AnalysisPage.tsx
git commit -m "feat(analysis): add spending insights charts to Analysis page"
```
