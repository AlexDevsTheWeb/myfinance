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
  const netWorthData = useNetWorth(dateRange);
  const accountData = useAccountBreakdown();

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
          {t('insights.title')}
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
        <Grid size={{ xs: 12, md: 4 }}>
          <CategoryPieChart
            data={categoryData.breakdown}
            title={t('insights.spendingByCategory')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CategoryBarChart
            data={categoryData.breakdown}
            title={t('insights.categoryTotals')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MonthlyComparisonChart
            data={comparisonData}
            title={t('insights.monthlyComparison')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <NetWorthChart
            data={netWorthData}
            title={t('insights.netWorth')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AccountBreakdownChart
            data={accountData}
            title={t('insights.accountBreakdown')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InsightsPage;
