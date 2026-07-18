import { Box, Paper, Typography, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

interface AllocationDonutChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

const AllocationDonutChart: React.FC<AllocationDonutChartProps> = ({ data, title }) => {
  const theme = useTheme();
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
                  color: theme.chart.palette[i % theme.chart.palette.length],
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
