import { Box, Grid, Typography } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import AnalysisTables from '../components/analysis/AnalysisTables';
import FinancialTrendChart from '../components/analysis/FinancialTrendChart';
import { YearSelector } from '../components/common/YearSelector.component';

import { useFinanceStore } from '../store/useFinanceStore';
import {
  CategoryPieChart,
  CategoryBarChart,
  MonthlyComparisonChart,
  AnalyticsFilters,
  useCategoryBreakdown,
  useMonthlyComparison,
} from '../analytics';

const AnalysisPage: React.FC = () => {
  const { transactions } = useFinanceStore();
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map((t) => dayjs(t.date).year()));
    years.add(dayjs().year());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

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

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
            Financial Analysis
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Deep dive into your financial performance.
          </Typography>
        </Box>
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <AnalysisTables selectedYear={selectedYear} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <FinancialTrendChart selectedYear={selectedYear} />
        </Grid>
      </Grid>

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
    </Box>
  );
};

export default AnalysisPage;
