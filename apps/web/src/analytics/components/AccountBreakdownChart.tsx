import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';
import LegendWithTooltip from '../../components/charts/LegendWithTooltip';
import type { IAccountBreakdown } from '../types';

interface AccountBreakdownChartProps {
  data: IAccountBreakdown[];
  title?: string;
}

const AccountBreakdownChart: React.FC<AccountBreakdownChartProps> = ({ data, title }) => {
  const theme = useTheme();
  const palette = theme.chart.palette.slice(0, 6);
  const chartData = data.map(d => ({
    name: d.accountName,
    value: d.balance,
  }));

  const chartHeight = Math.max(300, Math.ceil(chartData.length / 2) * 32);

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: chartHeight, width: '100%', '&, & *, & svg': { overflow: 'visible !important' } }}>
        <PieChart
          series={[
            {
              data: chartData.map((d, i) => ({
                id: d.name,
                label: d.name,
                value: d.value,
                color: palette[i % palette.length],
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
      </Box>
    </Paper>
  );
};

export default AccountBreakdownChart;
