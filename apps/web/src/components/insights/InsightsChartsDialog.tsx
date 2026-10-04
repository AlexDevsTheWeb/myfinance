import { Close as CloseIcon, BarChart as BarChartIcon } from '@mui/icons-material';
import { AppBar, Box, Dialog, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccountBreakdownChart,
  CategoryBarChart,
  CategoryPieChart,
  MonthlyComparisonChart,
  NetWorthChart,
} from '../../analytics';
import FinancialTrendChart from '../analysis/FinancialTrendChart';
import type { IAccountBreakdown, ICategoryBreakdown, IMonthlyComparisonData, INetWorthPoint } from '../../analytics/types';

interface InsightsChartsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedYear: number;
  categoryBreakdown: ICategoryBreakdown[];
  comparisonData: IMonthlyComparisonData;
  netWorthData: INetWorthPoint[];
  accountData: IAccountBreakdown[];
}

const InsightsChartsDialog: React.FC<InsightsChartsDialogProps> = ({
  open, onClose, selectedYear, categoryBreakdown, comparisonData, netWorthData, accountData,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Toolbar>
          <BarChartIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {t('insights.title')}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <FinancialTrendChart selectedYear={selectedYear} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CategoryPieChart
              data={categoryBreakdown}
              title={t('insights.spendingByCategory')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CategoryBarChart
              data={categoryBreakdown}
              title={t('insights.categoryTotals')}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MonthlyComparisonChart
              data={comparisonData}
              title={t('insights.monthlyComparison')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <NetWorthChart
              data={netWorthData}
              title={t('insights.netWorth')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <AccountBreakdownChart
              data={accountData}
              title={t('insights.accountBreakdown')}
            />
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
};

export default InsightsChartsDialog;
