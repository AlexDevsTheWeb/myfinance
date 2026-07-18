import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts';
import type { ICategoryBreakdown } from '../types';

interface CategoryBarChartProps {
  data: ICategoryBreakdown[];
  title?: string;
}

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data, title }) => {
  const theme = useTheme();
  const chartData = data.map(d => ({
    name: d.category,
    amount: d.total,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 320, width: '100%' }}>
        <BarChart
          layout="horizontal"
          series={[
            { data: chartData.map(d => d.amount), label: 'Amount', color: theme.chart.primary },
          ]}
          xAxis={[{ scaleType: 'linear', disableLine: true, disableTicks: true }]}
          yAxis={[{ scaleType: 'band', data: chartData.map(d => d.name), disableLine: true, disableTicks: true }]}
          grid={{ vertical: true, horizontal: false }}
          height={320}
          margin={{ left: 100, right: 20 }}
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

export default CategoryBarChart;
