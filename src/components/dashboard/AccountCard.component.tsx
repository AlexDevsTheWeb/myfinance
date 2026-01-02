import { Box, Paper, Typography } from '@mui/material';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import React from 'react';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

interface AccountCardProps {
  name: string;
  currentBalance: number;
  initialBalance: number;
  history: { date: string; amount: number }[];
}

const AccountCard: React.FC<AccountCardProps> = ({ name, currentBalance, initialBalance, history }) => {
  const isPositive = currentBalance >= initialBalance;
  const diff = currentBalance - initialBalance;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': { borderColor: 'rgba(99, 102, 241, 0.5)', bgcolor: 'rgba(255, 255, 255, 0.05)' }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>
            {name}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
            € {currentBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
          <Wallet size={20} />
        </Box>
      </Box>

      {/* Sparkline Chart */}
      <Box sx={{ height: 50, width: '100%', my: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          Init: €{initialBalance.toLocaleString('it-IT')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: isPositive ? '#10b981' : '#ef4444' }}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <Typography variant="caption" sx={{ fontWeight: 700, ml: 0.5 }}>
            {diff > 0 ? '+' : ''}{diff.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AccountCard;