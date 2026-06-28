import { DirectionsCar as CarIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Grid, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AccountDetailDialog from '../components/dashboard/AccountDetailDialog';
import Charts from '../components/dashboard/Charts';
import RecapCards from '../components/dashboard/RecapCards';
import SavingsRateGauge from '../components/budget/SavingsRateGauge';
import BulletChart from '../components/budget/BulletChart';
import PortfolioLineChart from '../components/investment/PortfolioLineChart';
import { useFinanceStore } from '../store/useFinanceStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { usePortfolio } from '../analytics/hooks/usePortfolio';
import { computeBudgetProgress } from '../lib/budgetEngine';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { enabledModules, carMileage, transactions } = useFinanceStore();
  const { budgetTargets } = useBudgetStore();
  const { t } = useTranslation();
  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false);
  const [portfolioTimeRange, setPortfolioTimeRange] = React.useState('1Y');

  const portfolio = usePortfolio();

  const currentDateRange = React.useMemo(() => ({
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().endOf('month').format('YYYY-MM-DD'),
  }), []);

  const { snapshots: budgetSnapshots, summary: budgetSummary } = React.useMemo(
    () => computeBudgetProgress(transactions, budgetTargets, currentDateRange),
    [transactions, budgetTargets, currentDateRange],
  );

  const isFirstOfMonth = dayjs().date() === 1;
  const hasReadingThisMonth = carMileage.some(m => m.month === (dayjs().month() + 1) && m.year === dayjs().year());
  const showMileageReminder = enabledModules.carManagement && isFirstOfMonth && !hasReadingThisMonth;

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
          {t('dashboard.title')}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          {t('dashboard.welcome')}
        </Typography>
      </Box>

      {showMileageReminder && (
        <Alert
          severity="info"
          icon={<CarIcon fontSize="inherit" />}
          sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(2, 136, 209, 0.2)' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/car')}>
              {t('dashboard.goToCar')}
            </Button>
          }
        >
          <AlertTitle sx={{ fontWeight: 700 }}>{t('dashboard.mileageReminder')}</AlertTitle>
          {t('dashboard.mileageReminderText')}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <RecapCards onOpenAccountDialog={() => setAccountDialogOpen(true)} />

          {enabledModules?.investmentTracking && portfolio.chartData.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <PortfolioLineChart
                data={portfolio.chartData}
                timeRange={portfolioTimeRange}
                onTimeRangeChange={setPortfolioTimeRange}
              />
            </Box>
          )}

          {enabledModules?.budgetTracking && budgetTargets.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: { xs: 'none', sm: '0 0 auto' }, width: { xs: '100%', sm: 'auto' } }}>
                    <SavingsRateGauge rate={budgetSummary.savingsRate} />
                  </Box>
                  <Box sx={{ flex: 1, width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                      {t('budget.progressByCategory')}
                    </Typography>
                    <BulletChart snapshots={budgetSnapshots} />
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Charts />
        </Grid>
      </Grid>

      <AccountDetailDialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} />
    </Box>
  );
};

export default DashboardPage;
