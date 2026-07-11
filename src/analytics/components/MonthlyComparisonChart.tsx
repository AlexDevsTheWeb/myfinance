import { Box, Paper, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { IMonthlyComparisonData } from '../types';

interface MonthlyComparisonChartProps {
  data: IMonthlyComparisonData;
  title?: string;
}

const formatEuro = (v: number | null) => v === null ? '' : `€ ${v.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;

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
        <BarChart
          series={[
            { data: chartData.map(d => d.current), label: `${monthLabel} ${data.year}`, color: '#6366f1', valueFormatter: formatEuro },
            { data: chartData.map(d => d.previous), label: t('insights.vsPrevMonth'), color: '#10b981', valueFormatter: formatEuro },
            { data: chartData.map(d => d.lastYear), label: `${monthLabel} ${data.year - 1}`, color: '#f59e0b', valueFormatter: formatEuro },
          ]}
          xAxis={[{ scaleType: 'band', data: chartData.map(d => d.name), disableLine: true, disableTicks: true }]}
          yAxis={[{ disableLine: true, disableTicks: true }]}
          grid={{ vertical: false, horizontal: true }}
          height={300}
          margin={{ top: 10, right: 10, bottom: 30, left: 50 }}
          sx={{
            [`.${axisClasses.tickLabel}`]: {
              fill: 'rgba(255,255,255,0.5)',
              fontSize: 12,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default MonthlyComparisonChart;
