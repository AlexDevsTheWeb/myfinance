import { Box, Grid, Typography } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../store/useFinanceStore';
import AnalysisTables from '../components/analysis/AnalysisTables';
import FinancialTrendChart from '../components/analysis/FinancialTrendChart';
import { YearSelector } from '../components/common/YearSelector.component';
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

  const { transactions, categories } = useFinanceStore();
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map((t) => dayjs(t.date).year()));
    years.add(dayjs().year());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <BarChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            {t('insights.title')}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Deep dive into your financial performance and trends.
          </Typography>
        </Box>
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <AnalysisTables selectedYear={selectedYear} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <FinancialTrendChart selectedYear={selectedYear} />
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -1, mb: 1 }}>
          Charts
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
