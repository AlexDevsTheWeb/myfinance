import { Box, Paper, Typography } from '@mui/material';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import type { IMonthlyComparisonData } from '../types';

interface MonthlyComparisonChartProps {
  data: IMonthlyComparisonData;
  title?: string;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ data, title }) => {
  const chartData = [
    {
      name: 'Income',
      current: data.current.income,
      previous: data.previousMonth.income,
      lastYear: data.lastYear.income,
    },
    {
      name: 'Expense',
      current: data.current.expense,
      previous: data.previousMonth.expense,
      lastYear: data.lastYear.expense,
    },
    {
      name: 'Net',
      current: data.current.net,
      previous: data.previousMonth.net,
      lastYear: data.lastYear.net,
    },
  ];

  const monthLabel = months[data.month];

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Typography variant="body2" sx={{ opacity: 0.6, mb: 2 }}>
        {monthLabel} {data.year} vs Prev Month vs {monthLabel} {data.year - 1}
      </Typography>
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
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
              tickFormatter={(v: number) => `€${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: '#161b2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
              }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: number) => `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar dataKey="current" name={`${monthLabel} ${data.year}`} fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="previous" name="Prev Month" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lastYear" name={`${monthLabel} ${data.year - 1}`} fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default MonthlyComparisonChart;
