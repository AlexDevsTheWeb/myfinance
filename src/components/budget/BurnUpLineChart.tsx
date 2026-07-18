import { Typography, Box, useTheme } from '@mui/material';
import { ChartsDataProvider, ChartsSurface, ChartsWrapper, ChartsTooltip } from '@mui/x-charts';
import { AreaPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { useTranslation } from 'react-i18next';
import type { ITransaction, BudgetTarget } from '../../store/types';
import { computeBurnUpData } from '../../lib/budgetEngine';

interface Props {
  transactions: ITransaction[];
  budgetTargets: BudgetTarget[];
  dateRange: { start: string; end: string };
}

export default function BurnUpLineChart({ transactions, budgetTargets, dateRange }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const data = computeBurnUpData(transactions, budgetTargets, dateRange);

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
        <Typography variant="body2">{t('budget.noBurnUpData')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 300, width: '100%' }}>
      <ChartsDataProvider
        series={[
          {
            id: 'ideal',
            type: 'line',
            data: data.map(d => d.ideal),
            label: t('budget.idealBurnRate'),
            color: 'rgba(255,255,255,0.3)',
            showMark: false,
          },
          {
            id: 'actual',
            type: 'line',
            data: data.map(d => d.actual),
            label: t('budget.actualSpend'),
            color: theme.palette.primary.main,
            showMark: false,
            area: true,
          },
        ]}
        xAxis={[{ scaleType: 'band', data: data.map(d => d.date), disableLine: true, disableTicks: true }]}
        yAxis={[{ disableLine: true, disableTicks: true }]}
        height={300}
        margin={{ top: 10, right: 10, bottom: 30, left: 50 }}
      >
        <ChartsWrapper>
          <ChartsSurface>
            <defs>
              <linearGradient id="actualGradient-burnup" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <ChartsGrid vertical={false} horizontal />
            <AreaPlot
              slotProps={{
                area: ({ seriesId }) => ({
                  fill: seriesId === 'actual' ? 'url(#actualGradient-burnup)' : undefined,
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
  );
}
