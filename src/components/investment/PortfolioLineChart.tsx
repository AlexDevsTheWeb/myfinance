import { Box, Button, Paper, Typography } from '@mui/material';
import { ChartsDataProvider, ChartsSurface, ChartsWrapper, ChartsTooltip } from '@mui/x-charts';
import { AreaPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import dayjs from 'dayjs';

interface PortfolioLineChartProps {
  data: { date: string; value: number; invested: number }[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const TIME_RANGES = ['1M', '6M', '1Y', 'ALL'];

const PortfolioLineChart: React.FC<PortfolioLineChartProps> = ({ data, timeRange, onTimeRangeChange }) => {
  const filtered = timeRange === 'ALL' ? data : (() => {
    const cutoff = timeRange === '1M' ? dayjs().subtract(30, 'day')
      : timeRange === '6M' ? dayjs().subtract(6, 'month')
      : dayjs().subtract(1, 'year');
    return data.filter(d => dayjs(d.date).isAfter(cutoff));
  })();

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Portfolio Value</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {TIME_RANGES.map(r => (
            <Button
              key={r}
              size="small"
              variant={timeRange === r ? 'contained' : 'outlined'}
              onClick={() => onTimeRangeChange(r)}
              sx={{ minWidth: 36 }}
            >
              {r}
            </Button>
          ))}
        </Box>
      </Box>
      <Box sx={{ height: 300, width: '100%' }}>
        <ChartsDataProvider
          series={[
            {
              id: 'portfolio',
              type: 'line',
              data: filtered.map(d => d.value),
              label: 'Portfolio Value',
              color: '#5b6cb8',
              area: true,
              showMark: false,
            },
            {
              id: 'invested',
              type: 'line',
              data: filtered.map(d => d.invested),
              label: 'Invested',
              color: '#10b981',
              showMark: false,
            },
          ]}
          xAxis={[{ scaleType: 'point', data: filtered.map(d => d.date), disableLine: true, disableTicks: true }]}
          yAxis={[{ disableLine: true, disableTicks: true }]}
          height={300}
          margin={{ top: 10, right: 10, bottom: 30, left: 50 }}
        >
          <ChartsWrapper>
            <ChartsLegend />
            <ChartsSurface>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b6cb8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5b6cb8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <ChartsGrid vertical={false} horizontal />
              <AreaPlot
                slotProps={{
                  area: ({ seriesId }) => ({
                    fill: seriesId === 'portfolio' ? 'url(#portfolioGradient)' : undefined,
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

export default PortfolioLineChart;
