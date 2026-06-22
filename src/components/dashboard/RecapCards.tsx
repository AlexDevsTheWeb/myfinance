import { Box, Grid, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../../store/useFinanceStore';
import AccountCard from './AccountCard.component';

interface AccountDetail {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  periodIncome: number;
  periodExpense: number;
  history: Array<{ date: string; amount: number }>;
}

interface RecapCardsProps {
  onToggleAccountDetails?: () => void;
  accountDetails?: boolean;
  accountsDetail?: AccountDetail[];
  hideAccountDetails?: boolean;
}

const RecapCards: React.FC<RecapCardsProps> = ({ onToggleAccountDetails, accountDetails: externalAccountDetails, accountsDetail: externalAccountsDetail, hideAccountDetails }) => {
  const { t } = useTranslation();
  const { transactions, accounts, balanceStartDate } = useFinanceStore();
  const [internalAccountDetails, setInternalAccountDetails] = React.useState<boolean>(false);

  const isExternal = externalAccountDetails !== undefined;
  const showAccountDetails = isExternal ? externalAccountDetails : internalAccountDetails;
  const shouldHide = hideAccountDetails && isExternal;

  const handleToggle = () => {
    if (onToggleAccountDetails) {
      onToggleAccountDetails();
    } else {
      setInternalAccountDetails(!internalAccountDetails);
    }
  };

  const accountsDetail = React.useMemo(() => {
    if (externalAccountsDetail) return externalAccountsDetail;

    const startDateStr = dayjs(balanceStartDate).format('YYYY-MM-DD');

    return accounts.map(acc => {
      const periodTransactions = transactions
        .filter(t => t.accountId === acc.id && dayjs(t.date).format('YYYY-MM-DD') >= startDateStr)
        .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      const income = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      // Creazione history per lo Sparkline (Saldo progressivo)
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




  const totalIncome = accountsDetail.reduce((sum, acc) => sum + acc.periodIncome, 0);
  const totalExpenses = accountsDetail.reduce((sum, acc) => sum + acc.periodExpense, 0);
  const currentBalance = accountsDetail.reduce((sum, acc) => sum + acc.currentBalance, 0);

  const monthlyStats = React.useMemo(() => {
    const monthlyTransactions = transactions.filter(t => dayjs(t.date).isSame(dayjs(), 'month'));

    const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const delta = income - expense;

    return { income, expense, delta };
  }, [transactions]);


  const cardData = [
    {
      id: 'currentBalance',
      title: t('dashboard.currentBalance'),
      amount: currentBalance,
      icon: <Wallet size={24} />,
      color: '#5b6cb8',
    },
    {
      id: 'totalIncome',
      title: t('dashboard.totalIncome'),
      amount: totalIncome,
      icon: <TrendingUp size={24} />,
      color: '#10b981',
    },
    {
      id: 'totalExpenses',
      title: t('dashboard.totalExpenses'),
      amount: totalExpenses,
      icon: <TrendingDown size={24} />,
      color: '#ef4444',
    },
  ];

  const monthlyCardData = [
    {
      id: 'incomeMonth',
      title: t('dashboard.incomeMonth'),
      amount: monthlyStats.income,
      color: '#10b981',
    },
    {
      id: 'expensesMonth',
      title: t('dashboard.expensesMonth'),
      amount: monthlyStats.expense,
      color: '#ef4444',
    },
    {
      id: 'netDeltaMonth',
      title: t('dashboard.netDeltaMonth'),
      amount: monthlyStats.delta,
      color: monthlyStats.delta >= 0 ? '#10b981' : '#ef4444',
    },
  ];

  return (
    <Grid container spacing={3}>

      {cardData.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.title}>
          <Paper
            onClick={() => card.id === 'currentBalance' && handleToggle()}
            sx={{
              p: 1.5,
              background: '#161b2e',
              border: `1px solid ${card.color}30`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: card.id === 'currentBalance' ? 'pointer' : 'default',
            }}
          >
            <Box sx={{ p: 1, background: card.color, color: '#fff', display: 'flex' }}>
              {card.icon}
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: card.color, opacity: 0.9, textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem' }}>
                {card.title}
              </Typography>
<Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                 € {card.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
               </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}

      {monthlyCardData.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.title}>
          <Paper
            sx={{
              p: 1.5,
              background: '#161b2e',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', mb: 0.5 }}>
              {card.title}
            </Typography>
<Typography variant="h6" sx={{ color: card.color, fontWeight: 800, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
               € {card.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
             </Typography>
          </Paper>
        </Grid>
      ))}

      {showAccountDetails && !shouldHide && (
        <Box sx={{ mt: 1, width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{t('dashboard.accountsDetail')}</Typography>
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

      {/* {accountDetails && (
        <Box sx={{ width: '100%', mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, letterSpacing: 0.5 }}>
            Accounts Detail
          </Typography>
          <Grid container spacing={3}>
            {accountsDetail.map((acc) => {
              const isPositive = acc.currentBalance >= acc.initialBalance;

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={acc.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'transform 0.2s, border-color 0.2s',
                      '&:hover': {
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        transform: 'translateY(-4px)',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                        {acc.name}
                      </Typography>
                      <Wallet size={20} color="#6366f1" style={{ opacity: 0.8 }} />
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      € {acc.currentBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.5, textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>
                          Initial Balance
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          € {acc.initialBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>

                      <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 700,
                            bgcolor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isPositive ? '#10b981' : '#ef4444'
                          }}
                        >
                          {isPositive ? '+' : ''}
                          {((acc.currentBalance - acc.initialBalance)).toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )} */}
    </Grid>
  );
};

export default RecapCards;
