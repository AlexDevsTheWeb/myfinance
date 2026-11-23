import { Bolt, LocalFireDepartment, TrendingDown, TrendingUp, WaterDrop } from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format.utils';
import type { UtilityTotals } from './utilities.utils';
import type { UtilitiesPeriod } from './types';

interface UtilitiesSummaryCardsProps {
  total: UtilityTotals;
  electricity: UtilityTotals;
  gas: UtilityTotals;
  water: UtilityTotals;
  /** Total spend change against the previous year, or null when incomparable. */
  spendDeltaPercent: number | null;
  period: UtilitiesPeriod;
}

const SummaryCard: React.FC<{
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  value: React.ReactNode;
  volume?: React.ReactNode;
  footer: React.ReactNode;
}> = ({ label, icon, badge, value, volume, footer }) => (
  <Paper sx={{ p: 2, borderRadius: 3, minWidth: 0 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
        {icon}
        <Typography
          noWrap
          variant="caption"
          sx={{ color: 'colors.subtle', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}
        >
          {label}
        </Typography>
      </Box>
      {badge}
    </Box>

    <Typography
      noWrap
      sx={{ fontFamily: (theme) => theme.colors.mono, fontVariantNumeric: 'tabular-nums', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 }}
    >
      {value}
    </Typography>

    {volume && <Box sx={{ mt: 0.25, minHeight: 20 }}>{volume}</Box>}

    <Box sx={{ mt: 1.25, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, minHeight: 20 }}>{footer}</Box>
  </Paper>
);

const Caption: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <Typography variant="caption" noWrap sx={{ color: color ?? 'colors.subtle' }}>
    {children}
  </Typography>
);

const Dot: React.FC = () => (
  <Box component="span" sx={{ color: 'colors.border', mx: 0.5 }}>
    •
  </Box>
);

const DeltaBadge: React.FC<{ percent: number }> = ({ percent }) => {
  const positive = percent >= 0;
  const color = positive ? 'colors.rose' : 'colors.emerald';
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.4,
        px: 0.75,
        py: 0.15,
        borderRadius: 1,
        border: '1px solid',
        borderColor: positive ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)',
        bgcolor: positive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
        color,
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 12 }} />
      <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: (theme) => theme.colors.mono }}>
        {formatPercent(percent)}
      </Typography>
    </Box>
  );
};

const SplitFooter: React.FC<{ totals: UtilityTotals }> = ({ totals }) => {
  const { t } = useTranslation();
  if (totals.fixedSharePercent === null) {
    return <Caption>{t('utilities.kpi.noSplit')}</Caption>;
  }
  return (
    <>
      <Caption>{t('utilities.kpi.fixedShare', { percent: formatNumber(totals.fixedSharePercent, 0) })}</Caption>
      <Dot />
      <Caption>{t('utilities.kpi.energyShare', { percent: formatNumber(100 - totals.fixedSharePercent, 0) })}</Caption>
    </>
  );
};

const UtilitiesSummaryCards: React.FC<UtilitiesSummaryCardsProps> = ({
  total,
  electricity,
  gas,
  water,
  spendDeltaPercent,
  period,
}) => {
  const { t } = useTranslation();

  const meteredCard = (
    label: string,
    icon: React.ReactNode,
    totals: UtilityTotals,
    unit: string,
    color: string,
  ) => (
    <SummaryCard
      label={label}
      icon={icon}
      value={<Box component="span" sx={{ color }}>{formatCurrency(totals.spend)}</Box>}
      volume={
        <Caption>
          {t('utilities.kpi.volume', { value: formatNumber(totals.volume, 1), unit })}
        </Caption>
      }
      footer={
        <>
          <Caption color={color}>
            {totals.unitRate === null
              ? t('utilities.kpi.rateUnavailable')
              : `${formatNumber(totals.unitRate, 4)} €/${unit}`}
          </Caption>
          <Dot />
          <SplitFooter totals={totals} />
        </>
      }
    />
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      <SummaryCard
        label={t('utilities.kpi.totalSpend')}
        icon={<TrendingUp sx={{ fontSize: 14, color: 'colors.subtle' }} />}
        badge={spendDeltaPercent === null ? undefined : <DeltaBadge percent={spendDeltaPercent} />}
        value={formatCurrency(total.spend)}
        volume={
          <Caption>
            {t('utilities.kpi.billCount', { count: formatNumber(total.count) })}
          </Caption>
        }
        footer={
          <Caption>
            {period === 'all' ? t('utilities.kpi.allYears') : t('utilities.kpi.vsPreviousYear')}
          </Caption>
        }
      />

      {meteredCard(
        t('utilities.types.electricity'),
        <Bolt sx={{ fontSize: 14, color: 'colors.amber' }} />,
        electricity,
        'kWh',
        'colors.amber',
      )}

      {meteredCard(
        t('utilities.types.gas'),
        <LocalFireDepartment sx={{ fontSize: 14, color: 'colors.rose' }} />,
        gas,
        'SMC',
        'colors.rose',
      )}

      {meteredCard(
        t('utilities.types.water'),
        <WaterDrop sx={{ fontSize: 14, color: 'colors.cyan' }} />,
        water,
        'm³',
        'colors.cyan',
      )}
    </Box>
  );
};

export default UtilitiesSummaryCards;
