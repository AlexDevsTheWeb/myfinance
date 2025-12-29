import { Box, Grid, Paper, Typography } from '@mui/material';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';

const RecapCards: React.FC = () => {
  const { transactions, initialBalance } = useFinanceStore();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = initialBalance + totalIncome - totalExpenses;

  const cardData = [
    {
      title: 'Current Balance',
      amount: currentBalance,
      icon: <Wallet size={24} />,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      title: 'Total Income',
      amount: totalIncome,
      icon: <TrendingUp size={24} />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Total Expenses',
      amount: totalExpenses,
      icon: <TrendingDown size={24} />,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cardData.map((card) => (
        <Grid size={{ xs: 12, md: 4 }} key={card.title}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: card.bg,
              border: `1px solid ${card.color}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ p: 1.5, borderRadius: 3, background: card.color, color: '#fff', display: 'flex' }}>
              {card.icon}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, color: card.color, fontWeight: 600 }}>
                {card.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                € {card.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default RecapCards;
