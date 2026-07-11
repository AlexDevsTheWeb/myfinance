import { Box, Paper, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import type { IAccountBreakdown } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

interface AccountBreakdownChartProps {
  data: IAccountBreakdown[];
  title?: string;
}

const AccountBreakdownChart: React.FC<AccountBreakdownChartProps> = ({ data, title }) => {
  const chartData = data.map(d => ({
    name: d.accountName,
    value: d.balance,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 300, width: '100%' }}>
        <PieChart
          series={[
            {
              data: chartData.map((d, i) => ({
                id: d.name,
                label: d.name,
                value: d.value,
                color: COLORS[i % COLORS.length],
              })),
              innerRadius: 60,
              outerRadius: 100,
              paddingAngle: 2,
              highlightScope: { fade: 'global', highlight: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              highlighted: { additionalRadius: 10 },
            },
          ]}
          height={300}
          margin={{ bottom: 100 }}
          slotProps={{
            legend: {
              direction: 'horizontal',
              position: { vertical: 'bottom', horizontal: 'center' },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default AccountBreakdownChart;
