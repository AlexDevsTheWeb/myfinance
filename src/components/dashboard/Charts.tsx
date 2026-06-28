/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';

const Charts: React.FC = () => {
  const { transactions } = useFinanceStore();
  const emptyYear: Record<string, any> = {};

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

  const data = Object.values(groupedData).sort((a: any, b: any) =>
    a.dateKey.localeCompare(b.dateKey)
  );


  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Cash Flow Trend
      </Typography>
      <Box sx={{ height: 280, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="displayDate" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: any) => `€${v || 0}`} />
            <Tooltip
              contentStyle={{ background: '#161b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: any) => `€ ${Number(value || 0).toLocaleString()}`}
            />
            <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default Charts;
