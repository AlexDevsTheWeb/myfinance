import { BarChart as BarChartIcon, OpenInFull } from '@mui/icons-material';
import { Box, Button, Grid, Typography, useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import AnalysisTables from '../components/analysis/AnalysisTables';
import FinancialTrendChart from '../components/analysis/FinancialTrendChart';
import { YearSelector } from '../components/common/YearSelector.component';
import InsightsChartsDialog from '../components/insights/InsightsChartsDialog';
import {
  CategoryBarChart,
  CategoryPieChart,
  MonthlyComparisonChart,
  NetWorthChart,
  AccountBreakdownChart,
  useAccountBreakdown,
  useCategoryBreakdown,
  useMonthlyComparison,
  useNetWorth,
} from '../analytics';

const InsightsPage: React.FC = () => {
  const { transactions } = useFinanceStore();
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const isLargeViewport = useMediaQuery('(min-width: 2000px)');

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map((t) => dayjs(t.date).year()));
    years.add(dayjs().year());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const filters = useMemo(() => ({
    dateRange: {
      startDate: dayjs().year(selectedYear).startOf('year').format('YYYY-MM-DD'),
      endDate: dayjs().year(selectedYear).endOf('year').format('YYYY-MM-DD'),
    },
    granularity: 'monthly' as const,
  }), [selectedYear]);

  const categoryData = useCategoryBreakdown(filters);
  const netWorthData = useNetWorth(filters.dateRange);
  const accountData = useAccountBreakdown();
  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();
  const comparisonData = useMonthlyComparison(currentMonth, currentYear);

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <BarChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            Insights
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

      {isLargeViewport ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <AnalysisTables selectedYear={selectedYear} />
            <Box sx={{ mt: 3 }}>
              <FinancialTrendChart selectedYear={selectedYear} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CategoryPieChart
                  data={categoryData.breakdown}
                  title="Spending by Category"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CategoryBarChart
                  data={categoryData.breakdown}
                  title="Category Totals"
                />
              </Grid>
            </Grid>
            <Box sx={{ mb: 2 }}>
              <MonthlyComparisonChart
                data={comparisonData}
                title="Monthly Comparison"
              />
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <NetWorthChart
                  data={netWorthData}
                  title="Net Worth"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <AccountBreakdownChart
                  data={accountData}
                  title="Account Breakdown"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInFull />}
                  onClick={() => setChartDialogOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Charts
                </Button>
              </Box>
              <AnalysisTables selectedYear={selectedYear} />
            </Grid>
          </Grid>
          <InsightsChartsDialog
            open={chartDialogOpen}
            onClose={() => setChartDialogOpen(false)}
            selectedYear={selectedYear}
            categoryBreakdown={categoryData.breakdown}
            comparisonData={comparisonData}
            netWorthData={netWorthData}
            accountData={accountData}
          />
        </>
      )}
    </Box>
  );
};

export default InsightsPage;
