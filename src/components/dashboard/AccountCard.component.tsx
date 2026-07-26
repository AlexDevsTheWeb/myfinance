import { Box, Paper, Typography, useTheme } from '@mui/material';
import { ChartsDataProvider, ChartsSurface, ChartsWrapper } from '@mui/x-charts';
import { LinePlot } from '@mui/x-charts/LineChart';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import React from 'react';

interface AccountCardProps {
  name: string;
  currentBalance: number;
  initialBalance: number;
  history: { date: string; amount: number }[];
}

const AccountCard: React.FC<AccountCardProps> = ({ name, currentBalance, initialBalance, history }) => {
  const isPositive = currentBalance >= initialBalance;
  const diff = currentBalance - initialBalance;
  const theme = useTheme();
  const values = history.map(h => h.amount);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': { borderColor: 'rgba(67, 100, 247, 0.5)', bgcolor: 'rgba(255, 255, 255, 0.05)' }
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
        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(67, 100, 247, 0.1)', color: 'primary.main' }}>
          <Wallet size={20} />
        </Box>
      </Box>

      {/* Sparkline Chart */}
      <Box sx={{ height: 50, width: '100%', my: 1, '&, & *, & svg': { overflow: 'visible !important' } }}>
        <ChartsDataProvider
          series={[{
            id: 'sparkline',
            type: 'line',
            data: values,
            showMark: false,
            color: isPositive ? theme.chart.income : theme.chart.expense,
          }]}
          yAxis={[{ min: dataMin - 100, max: dataMax + 100 }]}
          xAxis={[{ scaleType: 'point', data: history.map((_, i) => i) }]}
          height={50}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <ChartsWrapper hideLegend>
            <ChartsSurface>
              <LinePlot />
              <ChartsAxis />
            </ChartsSurface>
          </ChartsWrapper>
        </ChartsDataProvider>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          Init: €{initialBalance.toLocaleString('it-IT')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: isPositive ? 'success.main' : 'error.main' }}>
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
