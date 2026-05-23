import { DirectionsCar as CarIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Grid, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Charts from '../components/dashboard/Charts';
import RecapCards from '../components/dashboard/RecapCards';
import TransactionTable from '../components/dashboard/TransactionTable';
import TransactionModal from '../components/modals/TransactionModal';
import AccountCard from '../components/dashboard/AccountCard.component';
import { useFinanceStore, type Transaction } from '../store/useFinanceStore';
import {
  NetWorthChart,
  AccountBreakdownChart,
  useNetWorth,
  useAccountBreakdown,
} from '../analytics';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { enabledModules, carMileage, transactions, accounts, balanceStartDate } = useFinanceStore();
  const [accountDetails, setAccountDetails] = React.useState(false);
  const { t } = useTranslation();

  const accountsDetail = React.useMemo(() => {
    const startDateStr = dayjs(balanceStartDate).format('YYYY-MM-DD');

    return accounts.map(acc => {
      const periodTransactions = transactions
        .filter(t => t.accountId === acc.id && dayjs(t.date).format('YYYY-MM-DD') >= startDateStr)
        .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      const income = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      let runningBalance = acc.initialBalance;
      const history = [{ date: startDateStr, amount: runningBalance }, ...periodTransactions.map(t => {
        runningBalance += (t.type === 'income' ? t.amount : -t.amount);
        return { date: t.date, amount: runningBalance };
      })];

      return {
        ...acc,
        currentBalance: acc.initialBalance + income - expense,
        periodIncome: income,
        periodExpense: expense,
        history
      };
    });
  }, [transactions, accounts, balanceStartDate]);

  const dashboardDateRange = React.useMemo(() => ({
    startDate: dayjs(balanceStartDate).format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  }), [balanceStartDate]);

  const netWorthData = useNetWorth(dashboardDateRange);
  const accountData = useAccountBreakdown();

  const isFirstOfMonth = dayjs().date() === 1;
  const hasReadingThisMonth = carMileage.some(m => m.month === (dayjs().month() + 1) && m.year === dayjs().year());
  const showMileageReminder = enabledModules.carManagement && isFirstOfMonth && !hasReadingThisMonth;

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editTransaction, setEditTransaction] = React.useState<Transaction | null>(null);
  const [editType, setEditType] = React.useState<'income' | 'expense'>('expense');

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setEditType(transaction.type);
    setEditModalOpen(true);
  };

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
          <RecapCards onToggleAccountDetails={() => setAccountDetails(!accountDetails)} accountDetails={accountDetails} accountsDetail={accountsDetail} hideAccountDetails />
          <Box sx={{ mt: 3 }}>
            <TransactionTable onEdit={handleEditTransaction} limit={8} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          {accountDetails && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Accounts Detail</Typography>
              <Grid container spacing={2}>
                {accountsDetail.map(acc => (
                  <Grid size={{ xs: 12, sm: 6 }} key={acc.id}>
                    <AccountCard
                      name={acc.name}
                      currentBalance={acc.currentBalance}
                      initialBalance={acc.initialBalance}
                      history={acc.history}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <NetWorthChart
                data={netWorthData}
                title="Net Worth"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <AccountBreakdownChart
                data={accountData}
                title="Accounts"
              />
            </Grid>
          </Grid>
          <Charts />
        </Grid>
      </Grid>

      <TransactionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        type={editType}
        transaction={editTransaction}
      />
    </Box>
  );
};

export default DashboardPage;
