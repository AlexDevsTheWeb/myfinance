import { Box, Paper, Typography } from '@mui/material';
import {
  ChartsDataProvider,
  ChartsSurface,
  ChartsWrapper,
  ChartsTooltip,
} from '@mui/x-charts';
import { BarPlot } from '@mui/x-charts/BarChart';
import { LinePlot } from '@mui/x-charts/LineChart';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber } from '../../utils/format.utils';
import type { CarBucket, CarYoYPoint } from './car.utils';
import { CAR_COLORS } from './types';

interface CarAnalyticsChartsProps {
  buckets: CarBucket[];
  yoy: CarYoYPoint[];
  year: number;
  hasSpend: boolean;
  hasDistance: boolean;
  /** The distance came from the manual mileage log, not transaction odometers. */
  legacyDistance?: boolean;
}

const chartSx = { '&, & *, & svg': { overflow: 'visible !important' } };
const monthLabel = (month: number): string => dayjs().month(month - 1).format('MMM');

const CarAnalyticsCharts: React.FC<CarAnalyticsChartsProps> = ({
  buckets,
  yoy,
  year,
  hasSpend,
  hasDistance,
  legacyDistance = false,
}) => {
  const { t } = useTranslation();
  const labels = buckets.map((bucket) => monthLabel(bucket.month));
  const hasYoY = hasDistance && yoy.some((point) => point.current !== null || point.previous !== null);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 2 }}>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
          {t('car.charts.spendTitle')}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'colors.subtle' }}>
          {t('car.charts.spendCaption')}
        </Typography>
        {legacyDistance && (
          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'colors.amber' }}>
            {t('car.charts.legacyNote')}
          </Typography>
        )}

        {hasSpend ? (
          <Box sx={{ height: 320, ...chartSx }}>
            <ChartsDataProvider
              height={320}
              series={[
                {
                  id: 'fuel',
                  type: 'bar',
                  data: buckets.map((bucket) => Number(bucket.fuelSpend.toFixed(2))),
                  label: t('car.charts.fuel'),
                  color: CAR_COLORS.fuel,
                  stack: 'spend',
                  yAxisId: 'spend',
                },
                {
                  id: 'other',
                  type: 'bar',
                  data: buckets.map((bucket) => Number(bucket.otherSpend.toFixed(2))),
                  label: t('car.charts.other'),
                  color: CAR_COLORS.other,
                  stack: 'spend',
                  yAxisId: 'spend',
                },
                {
                  id: 'rate',
                  type: 'line',
                  data: buckets.map((bucket) => (bucket.costPerKm === null ? null : Number(bucket.costPerKm.toFixed(3)))),
                  label: t('car.charts.rate'),
                  color: CAR_COLORS.rate,
                  yAxisId: 'rate',
                  showMark: false,
                  curve: 'monotoneX',
                  connectNulls: true,
                },
              ]}
              xAxis={[{ scaleType: 'band', data: labels, disableLine: true, disableTicks: true }]}
              yAxis={[
                {
                  id: 'spend',
                  disableLine: true,
                  disableTicks: true,
                  valueFormatter: (value: number) => formatCurrency(value, 0),
                },
                {
                  id: 'rate',
                  position: 'right',
                  disableLine: true,
                  disableTicks: true,
                  valueFormatter: (value: number) => formatNumber(value, 2),
                },
              ]}
              margin={{ top: 10, right: 24, bottom: 30, left: 48 }}
            >
              <ChartsWrapper>
                <ChartsLegend />
                <ChartsSurface>
                  <ChartsGrid vertical={false} horizontal />
                  <BarPlot />
                  <LinePlot />
                  <ChartsAxis />
                </ChartsSurface>
              </ChartsWrapper>
              <ChartsTooltip trigger="axis" />
            </ChartsDataProvider>
          </Box>
        ) : (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'colors.subtle' }}>
              {t('car.charts.noData')}
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
          {t('car.charts.yoyTitle')}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'colors.subtle' }}>
          {t('car.charts.yoyCaption', { year, previous: year - 1 })}
        </Typography>
        {legacyDistance && (
          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'colors.amber' }}>
            {t('car.charts.legacyNote')}
          </Typography>
        )}

        {hasYoY ? (
          <Box
            sx={{
              height: 320,
              ...chartSx,
              // MUI X v9 has no dash pattern on line series; the previous year is
              // also muted, so the dash is a visual bonus, not the only cue.
              '& .MuiLineElement-root[data-series="previous"]': { strokeDasharray: '5 4' },
            }}
          >
            <ChartsDataProvider
              height={320}
              series={[
                {
                  id: 'current',
                  type: 'line',
                  data: yoy.map((point) => point.current),
                  label: String(year),
                  color: CAR_COLORS.distance,
                  showMark: true,
                  curve: 'monotoneX',
                  connectNulls: true,
                },
                {
                  id: 'previous',
                  type: 'line',
                  data: yoy.map((point) => point.previous),
                  label: String(year - 1),
                  color: CAR_COLORS.previous,
                  showMark: false,
                  curve: 'monotoneX',
                  connectNulls: true,
                },
              ]}
              xAxis={[{ scaleType: 'point', data: labels, disableLine: true, disableTicks: true }]}
              yAxis={[
                {
                  disableLine: true,
                  disableTicks: true,
                  valueFormatter: (value: number) => `${formatNumber(value)} km`,
                },
              ]}
              margin={{ top: 10, right: 16, bottom: 30, left: 48 }}
            >
              <ChartsWrapper>
                <ChartsLegend />
                <ChartsSurface>
                  <ChartsGrid vertical={false} horizontal />
                  <LinePlot />
                  <ChartsAxis />
                </ChartsSurface>
              </ChartsWrapper>
              <ChartsTooltip trigger="axis" />
            </ChartsDataProvider>
          </Box>
        ) : (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'colors.subtle' }}>
              {t('car.charts.noYoY')}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CarAnalyticsCharts;
