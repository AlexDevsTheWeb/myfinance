import { Box, Paper, Typography, useTheme } from '@mui/material';
import { ChartsDataProvider, ChartsSurface, ChartsWrapper, ChartsTooltip } from '@mui/x-charts';
import { AreaPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { useTranslation } from 'react-i18next';

interface ChartDataPoint {
  label: string;
  netWorth: number;
  totalInvested: number;
  nominalValue?: number;
}

interface ProjectionChartProps {
  data: ChartDataPoint[];
  showRealValue?: boolean;
}

const formatEuro = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}k`;
  return `€${v}`;
};

const ProjectionChart: React.FC<ProjectionChartProps> = ({ data, showRealValue }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const series = [
    {
      id: 'netWorth',
      type: 'line' as const,
      data: data.map(d => d.netWorth),
      label: t('projections.seriesNetWorth'),
      color: theme.chart.primary,
      area: true,
      showMark: false,
    },
    {
      id: 'totalInvested',
      type: 'line' as const,
      data: data.map(d => d.totalInvested),
      label: t('projections.seriesInvested'),
      color: theme.chart.income,
      area: true,
      showMark: false,
    },
    ...(showRealValue ? [{
      id: 'nominalValue',
      type: 'line' as const,
      data: data.map(d => d.nominalValue ?? 0),
      label: t('projections.seriesNominalValue'),
      color: theme.chart.expense,
      showMark: false,
    }] : []),
  ];

  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {t('projections.chartTitle')}
      </Typography>
      <Box sx={{ height: 400, width: '100%', '&, & *, & svg': { overflow: 'visible !important' } }}>
        <ChartsDataProvider
          series={series}
          xAxis={[{ scaleType: 'band', data: data.map(d => d.label), disableLine: true, disableTicks: true }]}
          yAxis={[{ disableLine: true, disableTicks: true, valueFormatter: formatEuro }]}
          height={400}
          margin={{ top: 10, right: 20, bottom: 50, left: 20 }}
        >
          <ChartsWrapper>
            <ChartsLegend />
            <ChartsSurface>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.chart.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={theme.chart.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="totalInvestedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.chart.income} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={theme.chart.income} stopOpacity={0} />
                </linearGradient>
              </defs>
              <ChartsGrid vertical={false} horizontal />
              <AreaPlot
                slotProps={{
                  area: ({ seriesId }) => {
                    if (seriesId === 'netWorth') return { fill: 'url(#netWorthGradient)' };
                    if (seriesId === 'totalInvested') return { fill: 'url(#totalInvestedGradient)' };
                    return {};
                  },
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

export default ProjectionChart;
