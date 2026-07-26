import { BarChart as BarChartIcon } from '@mui/icons-material';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { ChartsDataProvider, ChartsSurface, ChartsWrapper, ChartsTooltip } from '@mui/x-charts';
import { AreaPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../../store/useFinanceStore';

interface FinancialTrendChartProps {
  selectedYear: number;
}

const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({ selectedYear }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { transactions, initialBalance, balanceStartDate } = useFinanceStore();

  const chartData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);

    const allTransactions = [...transactions]
      .sort((a, b) => a.date.localeCompare(b.date));

    const startOfSelectedYear = dayjs(`${selectedYear}-01-01`);

    let runningBalance = initialBalance;
    allTransactions.forEach(t => {
      const tDate = dayjs(t.date);
      if (tDate.isBefore(startOfSelectedYear)) {
        const isAfterStart = tDate.isAfter(dayjs(balanceStartDate).subtract(1, 'day'));
        if (t.type === 'income' && isAfterStart) {
          runningBalance += t.amount;
        } else if (t.type === 'expense') {
          runningBalance -= t.amount;
        }
      }
    });

    return months.map(m => {
      const monthDate = dayjs(`${selectedYear}-${m + 1}-01`);
      const monthTransactions = allTransactions.filter(t =>
        dayjs(t.date).year() === selectedYear &&
        dayjs(t.date).month() === m
      );

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netGain = income - expense;

      monthTransactions.forEach(t => {
        const isAfterStart = dayjs(t.date).isAfter(dayjs(balanceStartDate).subtract(1, 'day'));
        if (t.type === 'income' && isAfterStart) {
          runningBalance += t.amount;
        } else if (t.type === 'expense') {
          runningBalance -= t.amount;
        }
      });

      return {
        month: monthDate.format('MMM'),
        income,
        expense,
        netGain,
        balance: runningBalance,
      };
    });
  }, [transactions, selectedYear, initialBalance, balanceStartDate]);

  return (
    <Paper>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BarChartIcon /> {t('insights.financialTrendTitle', { year: selectedYear })}
      </Typography>
      <Box sx={{ height: 400, mt: 2, '&, & *, & svg': { overflow: 'visible !important' } }}>
        <ChartsDataProvider
          series={[
            {
              id: 'balance',
              type: 'line',
              data: chartData.map(d => d.balance),
              label: t('insights.accountBalance'),
              color: theme.chart.primary,
              area: true,
              showMark: false,
            },
            {
              id: 'income',
              type: 'line',
              data: chartData.map(d => d.income),
              label: t('insights.totalIncome'),
              color: theme.chart.income,
              showMark: true,
            },
            {
              id: 'expense',
              type: 'line',
              data: chartData.map(d => d.expense),
              label: t('insights.totalExpenses'),
              color: theme.chart.expense,
              showMark: true,
            },
            {
              id: 'netGain',
              type: 'line',
              data: chartData.map(d => d.netGain),
              label: t('insights.netEarnings'),
              color: theme.palette.warning.main,
              showMark: true,
            },
          ]}
          xAxis={[{ scaleType: 'band', data: chartData.map(d => d.month), disableLine: true, disableTicks: true }]}
          yAxis={[{ disableLine: true, disableTicks: true }]}
          height={400}
          margin={{ top: 10, right: 20, bottom: 50, left: 35 }}
        >
          <ChartsWrapper>
            <ChartsLegend />
            <ChartsSurface>
              <defs>
                <linearGradient id="balanceGradient-financial" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.chart.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={theme.chart.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <ChartsGrid vertical={false} horizontal />
              <AreaPlot
                slotProps={{
                  area: ({ seriesId }) => ({
                    fill: seriesId === 'balance' ? 'url(#balanceGradient-financial)' : undefined,
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

export default FinancialTrendChart;
