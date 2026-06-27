import { Box, Paper, Typography } from '@mui/material';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { IMonthlyComparisonData } from '../types';

interface MonthlyComparisonChartProps {
  data: IMonthlyComparisonData;
  title?: string;
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ data, title }) => {
  const { t } = useTranslation();

  const chartData = [
    {
      name: t('dashboard.income'),
      current: data.current.income,
      previous: data.previousMonth.income,
      lastYear: data.lastYear.income,
    },
    {
      name: t('dashboard.expense'),
      current: data.current.expense,
      previous: data.previousMonth.expense,
      lastYear: data.lastYear.expense,
    },
    {
      name: t('insights.net'),
      current: data.current.net,
      previous: data.previousMonth.net,
      lastYear: data.lastYear.net,
    },
  ];

  const monthLabel = dayjs().month(data.month).format('MMM');

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Typography variant="body2" sx={{ opacity: 0.6, mb: 2 }}>
        {monthLabel} {data.year} {t('insights.vsPrevMonth')} vs {monthLabel} {data.year - 1}
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
              formatter={(value: any) => `€ ${Number(value || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar dataKey="current" name={`${monthLabel} ${data.year}`} fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="previous" name={t('insights.vsPrevMonth')} fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lastYear" name={`${monthLabel} ${data.year - 1}`} fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default MonthlyComparisonChart;
