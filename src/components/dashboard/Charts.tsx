/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';

const Charts: React.FC = () => {
  const { transactions } = useFinanceStore();

  const currentYear = dayjs().year();
  const emptyYear: Record<string, any> = {};

  for (let i = 0; i < 12; i++) {
    const monthDate = dayjs().year(currentYear).month(i).startOf('month');
    const dateKey = monthDate.format('YYYY-MM'); // Chiave univoca per ordinamento
    const displayDate = monthDate.format('MMM YYYY');

    emptyYear[dateKey] = {
      dateKey,
      displayDate,
      income: 0,
      expense: 0
    };
  }
  const groupedData = transactions
    .filter(t => dayjs(t.date).year() === currentYear)
    .reduce((acc, t) => {
      const dateKey = dayjs(t.date).format('YYYY-MM');
      if (acc[dateKey]) {
        if (t.type === 'income') acc[dateKey].income += t.amount;
        else acc[dateKey].expense += t.amount;
      }
      return acc;
    }, { ...emptyYear }); // Partiamo dallo scheletro vuoto

  const data = Object.values(groupedData).sort((a: any, b: any) =>
    a.dateKey.localeCompare(b.dateKey)
  );

  // TODO: vechio codice
  // const groupedData = transactions.filter(t => dayjs(t.date).year() === dayjs().year()).reduce((acc: any, t) => {
  //   const dateKey = t.date;
  //   const displayDate = dayjs(t.date).format('MM YYYY');
  //   if (!acc[dateKey]) {
  //     acc[dateKey] = { dateKey, displayDate, income: 0, expense: 0 };
  //   }
  //   if (t.type === 'income') acc[dateKey].income += t.amount;
  //   else acc[dateKey].expense += t.amount;
  //   return acc;
  // }, {});

  // const data = Object.values(groupedData).sort((a: any, b: any) => a.dateKey.localeCompare(b.dateKey));
  // TODO: vechio codice

  return (
    <Paper sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        Cash Flow Trend
      </Typography>
      <Box sx={{ height: 350, width: '100%' }}>
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
            <XAxis dataKey="displayDate" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `€${v}`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default Charts;
