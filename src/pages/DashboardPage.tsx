import { DirectionsCar as CarIcon, TrendingUp, AccountBalance as BudgetIcon, Bolt as ElecIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
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

function StatCard({ icon, label, value, color, onClick }: { icon: React.ReactNode; label: string; value: React.ReactNode; color?: string; onClick?: () => void }) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? { borderColor: 'rgba(99, 102, 241, 0.5)', bgcolor: 'rgba(255,255,255,0.03)' } : undefined,
      }}
    >
      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${color}20`, color, display: 'flex' }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { enabledModules, carMileage, transactions, isLoading } = useFinanceStore();
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

  const monthlyUtilities = React.useMemo(() =>
    transactions
      .filter(t => t.type === 'expense' && (t.category === 'Bollette' || t.category === 'Bills') && t.date >= currentDateRange.start && t.date <= currentDateRange.end)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
  [transactions, currentDateRange]);

  const carLatestKm = carMileage.length > 0
    ? [...carMileage].sort((a, b) => b.year - a.year || b.month - a.month)[0].reading
    : null;

  const isFirstOfMonth = dayjs().date() === 1;
  const hasReadingThisMonth = carMileage.some(m => m.month === (dayjs().month() + 1) && m.year === dayjs().year());
  const showMileageReminder = enabledModules.carManagement && isFirstOfMonth && !hasReadingThisMonth;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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

      <Alert severity="warning" variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
        <AlertTitle sx={{ fontWeight: 700 }}>{t('dashboard.betaDisclaimer')}</AlertTitle>
        {t('dashboard.betaDisclaimerText')}
      </Alert>

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

      {/* Overview stat cards */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {enabledModules?.investmentTracking && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<TrendingUp fontSize="small" />}
              label={t('investment.title')}
              value={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  €{portfolio.currentValue.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                    <Typography component="span" variant="caption" sx={{ color: portfolio.isPositive ? 'success.main' : 'error.main', fontWeight: 700 }}>
                    {portfolio.totalReturnPercent >= 0 ? '+' : ''}{portfolio.totalReturnPercent.toFixed(1)}%
                  </Typography>
                </Box>
              }
              color="primary.main"
              onClick={() => navigate('/invest')}
            />
          </Grid>
        )}
        {enabledModules?.budgetTracking && budgetTargets.length > 0 && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<BudgetIcon fontSize="small" />}
              label={t('budget.title')}
              value={`${Math.round(budgetSummary.savingsRate * 100)}% ${t('budget.savingsRate').toLowerCase()}`}
              color={budgetSummary.savingsRate >= 0.2 ? 'success.main' : budgetSummary.savingsRate >= 0.1 ? 'warning.main' : 'error.main'}
              onClick={() => navigate('/budget')}
            />
          </Grid>
        )}
        {enabledModules?.carManagement && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<CarIcon fontSize="small" />}
              label={t('car.title')}
              value={carLatestKm !== null ? `${carLatestKm.toLocaleString()} km` : '—'}
              color="primary.main"
              onClick={() => navigate('/car')}
            />
          </Grid>
        )}
        {enabledModules?.utilityTracker && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<ElecIcon fontSize="small" />}
              label={t('utilities.title')}
              value={`€${monthlyUtilities.toLocaleString('it-IT', { minimumFractionDigits: 0 })}`}
              color="warning.main"
              onClick={() => navigate('/utilities')}
            />
          </Grid>
        )}
      </Grid>

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
