import { Box, Paper, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4',
  '#84cc16', '#d946ef',
];

interface AllocationDonutChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

const AllocationDonutChart: React.FC<AllocationDonutChartProps> = ({ data, title }) => {
  return (
    <Paper sx={{ p: 1.5 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 300, width: '100%' }}>
        {data.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>No holdings data</Typography>
          </Box>
        ) : (
          <PieChart
            series={[
              {
                data: data.map((d, i) => ({
                  id: d.name,
                  label: d.name,
                  value: d.value,
                  color: COLORS[i % COLORS.length],
                })),
                innerRadius: 60,
                outerRadius: 110,
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
        )}
      </Box>
    </Paper>
  );
};

export default AllocationDonutChart;
