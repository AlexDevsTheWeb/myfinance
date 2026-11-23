import { Box, Paper, Typography } from '@mui/material';
import {
  ChartsDataProvider,
  ChartsSurface,
  ChartsWrapper,
  ChartsTooltipContainer,
  useAxesTooltip,
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
import { FIXED_QUOTA_COLOR } from './types';
import type { SpendBucket, YearOverYearPoint } from './utilities.utils';

interface UtilitiesAnalyticsChartsProps {
  buckets: SpendBucket[];
  /** Monthly consumption for the selected year and the one before, or null. */
  yoy: YearOverYearPoint[] | null;
  yoyYear: number | null;
  /** Physical unit of the selected utility; null when the view mixes types. */
  unit: string | null;
  /** Accent of the selected utility (energy quota bars, YoY current line). */
  accent: string;
}

const chartSx = { '&, & *, & svg': { overflow: 'visible !important' } };

const bucketLabel = (bucket: SpendBucket): string =>
  bucket.month === null ? String(bucket.year) : dayjs().month(bucket.month).format('MMM');

/**
 * Axis tooltip for the spend chart.
 *
 * The default tooltip lists series one by one; a bill is easier to read as a
 * single block: total, fixed quota, energy quota, volume and the effective
 * price per unit.
 */
const SpendTooltip: React.FC<{
  buckets: SpendBucket[];
  labels: string[];
  unit: string | null;
  accent: string;
}> = ({ buckets, labels, unit, accent }) => {
  const tooltips = useAxesTooltip();
  if (!tooltips || tooltips.length === 0) return null;

  const bucket = buckets[tooltips[0].dataIndex];
  if (!bucket) return null;

  const rate = unit && bucket.volume > 0 ? bucket.spend / bucket.volume : null;

  const row = (label: string, value: string, color?: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {color && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color }} />}
        <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ fontFamily: (theme) => theme.colors.mono, fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Paper sx={{ px: 1.5, py: 1.25, minWidth: 210, borderRadius: 2, boxShadow: 6 }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.75, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {labels[tooltips[0].dataIndex]}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        {row('Totale bolletta', formatCurrency(bucket.spend))}
        {row('Quota fissa', formatCurrency(bucket.fixed), FIXED_QUOTA_COLOR)}
        {row('Quota energia', formatCurrency(bucket.energy), accent)}
        {unit && row('Consumo', `${formatNumber(bucket.volume, 1)} ${unit}`)}
        {unit && rate !== null && row('Costo unitario', `${formatNumber(rate, 4)} €/${unit}`)}
      </Box>
    </Paper>
  );
};

const UtilitiesAnalyticsCharts: React.FC<UtilitiesAnalyticsChartsProps> = ({ buckets, yoy, yoyYear, unit, accent }) => {
  const { t } = useTranslation();

  const labels = buckets.map(bucketLabel);
  const hasSpend = buckets.some((bucket) => bucket.spend > 0);
  const hasVolume = unit !== null && buckets.some((bucket) => bucket.volume > 0);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: yoy ? '3fr 2fr' : '1fr' }, gap: 2 }}>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
          {t('utilities.charts.spendTitle')}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'colors.subtle' }}>
          {unit ? t('utilities.charts.spendCaptionWithUnit', { unit }) : t('utilities.charts.spendCaptionMixed')}
        </Typography>

        {hasSpend ? (
          <Box sx={{ height: 340, ...chartSx }}>
            <ChartsDataProvider
              height={340}
              series={[
                {
                  id: 'fixed',
                  type: 'bar',
                  data: buckets.map((bucket) => Number(bucket.fixed.toFixed(2))),
                  label: t('utilities.charts.fixedQuota'),
                  color: FIXED_QUOTA_COLOR,
                  stack: 'spend',
                  yAxisId: 'spend',
                },
                {
                  id: 'energy',
                  type: 'bar',
                  data: buckets.map((bucket) => Number(bucket.energy.toFixed(2))),
                  label: t('utilities.charts.energyQuota'),
                  color: accent,
                  stack: 'spend',
                  yAxisId: 'spend',
                },
                ...(hasVolume
                  ? [
                      {
                        id: 'volume',
                        type: 'line' as const,
                        data: buckets.map((bucket) => bucket.volume),
                        label: t('utilities.charts.volume'),
                        color: '#E2E8F0',
                        yAxisId: 'volume',
                        showMark: false,
                        curve: 'monotoneX' as const,
                      },
                    ]
                  : []),
              ]}
              xAxis={[{ scaleType: 'band', data: labels, disableLine: true, disableTicks: true }]}
              yAxis={[
                { id: 'spend', disableLine: true, disableTicks: true },
                ...(hasVolume
                  ? [{ id: 'volume', position: 'right' as const, disableLine: true, disableTicks: true }]
                  : []),
              ]}
              margin={{ top: 10, right: hasVolume ? 24 : 12, bottom: 30, left: 44 }}
            >
              <ChartsWrapper>
                <ChartsLegend />
                <ChartsSurface>
                  <ChartsGrid vertical={false} horizontal />
                  <BarPlot />
                  {hasVolume && <LinePlot />}
                  <ChartsAxis />
                </ChartsSurface>
              </ChartsWrapper>
              <ChartsTooltipContainer trigger="axis" anchor="chart">
                <SpendTooltip buckets={buckets} labels={labels} unit={unit} accent={accent} />
              </ChartsTooltipContainer>
            </ChartsDataProvider>
          </Box>
        ) : (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'colors.subtle' }}>
              {t('utilities.charts.noData')}
            </Typography>
          </Box>
        )}
      </Paper>

      {yoy && yoyYear !== null && (
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
            {t('utilities.charts.yoyTitle')}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'colors.subtle' }}>
            {t('utilities.charts.yoyCaption', { year: yoyYear, previous: yoyYear - 1, unit: unit ?? '' })}
          </Typography>

          <Box sx={{ height: 340, ...chartSx }}>
            <ChartsDataProvider
              height={340}
              series={[
                {
                  id: 'current',
                  type: 'line',
                  data: yoy.map((point) => point.current),
                  label: String(yoyYear),
                  color: accent,
                  showMark: true,
                  curve: 'monotoneX',
                },
                {
                  id: 'previous',
                  type: 'line',
                  data: yoy.map((point) => point.previous),
                  label: String(yoyYear - 1),
                  color: '#64748B',
                  showMark: false,
                  curve: 'monotoneX',
                },
              ]}
              xAxis={[
                {
                  scaleType: 'point',
                  data: yoy.map((point) => dayjs().month(point.month).format('MMM')),
                  disableLine: true,
                  disableTicks: true,
                },
              ]}
              yAxis={[{ disableLine: true, disableTicks: true }]}
              margin={{ top: 10, right: 16, bottom: 30, left: 44 }}
            >
              <ChartsWrapper>
                <ChartsLegend />
                <ChartsSurface>
                  <ChartsGrid vertical={false} horizontal />
                  <LinePlot />
                  <ChartsAxis />
                </ChartsSurface>
              </ChartsWrapper>
            </ChartsDataProvider>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default UtilitiesAnalyticsCharts;
