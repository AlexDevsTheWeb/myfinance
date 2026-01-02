import { BarChart as BarChartIcon } from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';

interface FinancialTrendChartProps {
  selectedYear: number;
}

const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({ selectedYear }) => {
  const { transactions, initialBalance, balanceStartDate } = useFinanceStore();

  const chartData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);

    // Sort transactions by date for cumulative balance calculation
    const allTransactions = [...transactions]
      .sort((a, b) => a.date.localeCompare(b.date));

    // Base date for balance tracking
    const startOfSelectedYear = dayjs(`${selectedYear}-01-01`);

    // Calculate balance at the start of the selected year
    let runningBalance = initialBalance;
    allTransactions.forEach(t => {
      const tDate = dayjs(t.date);
      // Only process transactions before the start of the selected year for the starting balance
      if (tDate.isBefore(startOfSelectedYear)) {
        // Check if transaction is after balanceStartDate (for income)
        // or always (for expense) as per existing logic in RecapCards
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

      // Update running balance for this month
      // Applying the same logic: Income only if after balanceStartDate
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
        <BarChartIcon /> Yearly Financial Trend ({selectedYear})
      </Typography>
      <Box sx={{ height: 400, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
              }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: number) => `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="none"
              fillOpacity={1}
              fill="url(#colorBalance)"
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="income"
              name="Total Income"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Total Expenses"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="netGain"
              name="Net Earnings"
              stroke="#f59e0b"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Account Balance"
              stroke="#6366f1"
              strokeWidth={4}
              dot={{ r: 5, strokeWidth: 2, fill: '#1e293b' }}
              activeDot={{ r: 7, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>

    </Paper>
  );
};

export default FinancialTrendChart;
