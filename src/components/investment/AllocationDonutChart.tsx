import { Box, Paper, Typography, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import LegendWithTooltip from '../charts/LegendWithTooltip';

interface AllocationDonutChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

const AllocationDonutChart: React.FC<AllocationDonutChartProps> = ({ data, title }) => {
  const theme = useTheme();

  const chartHeight = Math.max(300, Math.ceil(data.length / 2) * 32);

  return (
    <Paper sx={{ p: 1.5 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: chartHeight, width: '100%', '&, & *, & svg': { overflow: 'visible !important' } }}>
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
              innerRadius: '48%',
              outerRadius: '100%',
                paddingAngle: 2,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                highlighted: { additionalRadius: 10 },
              },
            ]}
            height={chartHeight}
            margin={{ right: 120, top: 10, bottom: 10, left: 10 }}
            slots={{ legend: LegendWithTooltip }}
          slotProps={{
              legend: {
                position: { vertical: 'middle', horizontal: 'end' },
              },
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default AllocationDonutChart;
