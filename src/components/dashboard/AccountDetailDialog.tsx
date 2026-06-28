import { Close as CloseIcon } from '@mui/icons-material';
import { AppBar, Box, Dialog, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AccountBreakdownChart, NetWorthChart, useAccountBreakdown, useNetWorth } from '../../analytics';
import { useFinanceStore } from '../../store/useFinanceStore';
import AccountCard from './AccountCard.component';

interface AccountDetailDialogProps {
  open: boolean;
  onClose: () => void;
}

const AccountDetailDialog: React.FC<AccountDetailDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { transactions, accounts, balanceStartDate } = useFinanceStore();

  const dashboardDateRange = React.useMemo(() => ({
    startDate: dayjs(balanceStartDate).format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  }), [balanceStartDate]);

  const netWorthData = useNetWorth(dashboardDateRange);
  const accountData = useAccountBreakdown();

  const accountsDetail = React.useMemo(() => {
    const startDateStr = dayjs(balanceStartDate).format('YYYY-MM-DD');

    return accounts.map((acc) => {
      const periodTransactions = transactions
        .filter(t => t.accountId === acc.id && dayjs(t.date).format('YYYY-MM-DD') >= startDateStr)
        .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      const income = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      let runningBalance = acc.initialBalance;
      const history = [
        { date: startDateStr, amount: runningBalance },
        ...periodTransactions.map((t) => {
          runningBalance += (t.type === 'income' ? t.amount : -t.amount);
          return { date: t.date, amount: runningBalance };
        }),
      ];

      return {
        ...acc,
        currentBalance: acc.initialBalance + income - expense,
        periodIncome: income,
        periodExpense: expense,
        history,
      };
    });
  }, [transactions, accounts, balanceStartDate]);

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {t('dashboard.accountsDetail')}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              {accountsDetail.map(acc => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={acc.id}>
                  <AccountCard
                    name={acc.name}
                    currentBalance={acc.currentBalance}
                    initialBalance={acc.initialBalance}
                    history={acc.history}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <NetWorthChart data={netWorthData} title={t('insights.netWorth')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <AccountBreakdownChart data={accountData} title={t('insights.accountBreakdown')} />
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
};

export default AccountDetailDialog;
