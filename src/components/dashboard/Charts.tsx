import { Box, Paper, Typography } from '@mui/material';
import { ChartsDataProvider, ChartsSurface, ChartsWrapper, ChartsTooltip } from '@mui/x-charts';
import { AreaPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import dayjs from 'dayjs';
import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';

const Charts: React.FC = () => {
  const { transactions } = useFinanceStore();
  const emptyYear: Record<string, { dateKey: string; displayDate: string; income: number; expense: number }> = {};

  for (let i = 11; i >= 0; i--) {
    const monthDate = dayjs().subtract(i, 'month').startOf('month');
    const dateKey = monthDate.format('YYYY-MM');
    const displayDate = monthDate.format('MMM YYYY');

    emptyYear[dateKey] = {
      dateKey,
      displayDate,
      income: 0,
      expense: 0
    };
  }

  const startDate = dayjs().subtract(11, 'month').startOf('month');

  const groupedData = transactions
    .filter(t => dayjs(t.date).isAfter(startDate) || dayjs(t.date).isSame(startDate, 'month'))
    .reduce((acc, t) => {
      const dateKey = dayjs(t.date).format('YYYY-MM');
      if (acc[dateKey]) {
        if (t.type === 'income') acc[dateKey].income += t.amount;
        else acc[dateKey].expense += t.amount;
      }
      return acc;
    }, { ...emptyYear });

  const data = Object.values(groupedData).sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey)
  );

  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Cash Flow Trend
      </Typography>
      <Box sx={{ height: 280, width: '100%' }}>
        <ChartsDataProvider
          series={[
            { type: 'line', id: 'income', data: data.map(d => d.income), label: 'Income', color: '#10b981', area: true, showMark: false },
            { type: 'line', id: 'expense', data: data.map(d => d.expense), label: 'Expense', color: '#ef4444', area: true, showMark: false },
          ]}
          xAxis={[{ scaleType: 'band', data: data.map(d => d.displayDate), id: 'x', disableLine: true, disableTicks: true }]}
          yAxis={[{ id: 'y', disableLine: true, disableTicks: true }]}
          height={280}
          margin={{ top: 10, right: 10, bottom: 30, left: 50 }}
        >
          <ChartsWrapper legendDirection="horizontal" legendPosition={{ vertical: 'bottom', horizontal: 'center' }}>
            <ChartsLegend direction="horizontal" />
            <ChartsSurface>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <ChartsGrid vertical={false} horizontal />
              <AreaPlot
                slotProps={{
                  area: ({ seriesId }) => ({
                    fill: seriesId === 'income' ? 'url(#incomeGradient)' : 'url(#expenseGradient)',
                  }),
                }}
              />
              <LinePlot />
              <ChartsAxis />
            </ChartsSurface>
          </ChartsWrapper>
          <ChartsTooltip />
        </ChartsDataProvider>
      </Box>
    </Paper>
  );
};

export default Charts;
