import { Box, Paper, Typography, useTheme } from '@mui/material';
import { ChartsDataProvider, ChartsSurface, ChartsWrapper, ChartsTooltip } from '@mui/x-charts';
import { AreaPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import type { INetWorthPoint } from '../types';

interface NetWorthChartProps {
  data: INetWorthPoint[];
  title?: string;
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ data, title }) => {
  const theme = useTheme();
  const isPositive = data.length > 0 && data[data.length - 1].balance >= 0;
  const color = isPositive ? theme.chart.income : theme.chart.expense;
  const gradientId = `netWorth-${color.replace('#', '')}`;

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 300, width: '100%', '&, & *, & svg': { overflow: 'visible !important' } }}>
        <ChartsDataProvider
          series={[
            {
              id: 'netWorth',
              type: 'line',
              data: data.map(d => d.balance),
              label: 'Balance',
              color,
              showMark: false,
              area: true,
            },
          ]}
          xAxis={[{ scaleType: 'point', data: data.map(d => d.date), disableLine: true, disableTicks: true }]}
          yAxis={[{ disableLine: true, disableTicks: true }]}
          height={300}
          margin={{ top: 10, right: 10, bottom: 20, left: 30 }}
        >
          <ChartsWrapper>
            <ChartsSurface>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <ChartsGrid vertical={false} horizontal />
              <AreaPlot
                slotProps={{
                  area: () => ({
                    fill: `url(#${gradientId})`,
                  }),
                }}
              />
              <LinePlot />
              <ChartsAxis />
            </ChartsSurface>
          </ChartsWrapper>
          <ChartsTooltip />
        </ChartsDataProvider>
      </Box>
    </Paper>
  );
};

export default NetWorthChart;
