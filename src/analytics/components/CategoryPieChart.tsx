import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';
import type { ICategoryBreakdown } from '../types';

interface CategoryPieChartProps {
  data: ICategoryBreakdown[];
  title?: string;
}

const ITEMS_PER_ROW = 2;
const BASE_HEIGHT = 300;
const LEGEND_ROW_HEIGHT = 24;

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, title }) => {
  const theme = useTheme();
  const palette = theme.chart.palette;
  const chartData = data.map(d => ({
    name: d.category,
    value: d.total,
  }));

  const chartHeight = Math.max(
    BASE_HEIGHT,
    BASE_HEIGHT + Math.ceil(chartData.length / ITEMS_PER_ROW) * LEGEND_ROW_HEIGHT
  );

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: chartHeight, width: '100%' }}>
        <PieChart
          series={[
            {
              data: chartData.map((d, i) => ({
                id: d.name,
                label: d.name,
                value: d.value,
                color: palette[i % palette.length],
              })),
              innerRadius: 60,
              outerRadius: 110,
              paddingAngle: 2,
              highlightScope: { fade: 'global', highlight: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              highlighted: { additionalRadius: 10 },
            },
          ]}
          height={chartHeight}
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

export default CategoryPieChart;
