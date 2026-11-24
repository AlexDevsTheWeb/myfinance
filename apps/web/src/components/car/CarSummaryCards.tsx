import { LocalGasStation, Paid, Speed, TrendingDown, TrendingUp } from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format.utils';
import type { CarTotals } from './car.utils';

interface CarSummaryCardsProps {
  totals: CarTotals;
  /** Spend change against the previous year, or null when incomparable. */
  spendDeltaPercent: number | null;
}

const SummaryCard: React.FC<{
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  value: React.ReactNode;
  footer: React.ReactNode;
}> = ({ label, icon, badge, value, footer }) => (
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
        color: positive ? 'colors.rose' : 'colors.emerald',
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

const CarSummaryCards: React.FC<CarSummaryCardsProps> = ({ totals, spendDeltaPercent }) => {
  const { t } = useTranslation();
  const fuelShare = totals.spend > 0 ? (totals.fuelSpend / totals.spend) * 100 : null;
  const otherShare = fuelShare === null ? null : 100 - fuelShare;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
      <SummaryCard
        label={t('car.kpi.spend.title')}
        icon={<Paid sx={{ fontSize: 16, color: 'colors.amber' }} />}
        badge={spendDeltaPercent === null ? undefined : <DeltaBadge percent={spendDeltaPercent} />}
        value={formatCurrency(totals.spend)}
        footer={
          fuelShare === null ? (
            <Caption>{t('car.kpi.noData')}</Caption>
          ) : (
            <>
              <Caption>{t('car.kpi.spend.fuelShare', { percent: formatNumber(fuelShare, 0) })}</Caption>
              <Dot />
              <Caption>{t('car.kpi.spend.otherShare', { percent: formatNumber(otherShare ?? 0, 0) })}</Caption>
            </>
          )
        }
      />

      <SummaryCard
        label={t('car.kpi.distance.title')}
        icon={<Speed sx={{ fontSize: 16, color: 'colors.emerald' }} />}
        value={`${formatNumber(totals.distanceKm)} km`}
        footer={
          totals.avgMonthlyKm === null ? (
            <Caption>{t('car.kpi.noData')}</Caption>
          ) : (
            <Caption>{t('car.kpi.distance.avgMonthly', { km: formatNumber(totals.avgMonthlyKm) })}</Caption>
          )
        }
      />

      <SummaryCard
        label={t('car.kpi.costPerKm.title')}
        icon={<Paid sx={{ fontSize: 16, color: 'colors.cyan' }} />}
        value={totals.costPerKm === null ? '—' : `${formatCurrency(totals.costPerKm, 3)} / km`}
        footer={
          totals.costPerKm === null ? (
            <Caption>{t('car.kpi.costPerKm.hint')}</Caption>
          ) : (
            <>
              <Caption color="colors.amber">
                {t('car.kpi.costPerKm.fuel', { value: formatCurrency(totals.fuelCostPerKm ?? 0, 3) })}
              </Caption>
              <Dot />
              <Caption color="colors.subtle">
                {t('car.kpi.costPerKm.other', { value: formatCurrency(totals.otherCostPerKm ?? 0, 3) })}
              </Caption>
            </>
          )
        }
      />

      <SummaryCard
        label={t('car.kpi.efficiency.title')}
        icon={<LocalGasStation sx={{ fontSize: 16, color: 'colors.amber' }} />}
        value={totals.kmPerLiter === null ? '—' : `${formatNumber(totals.kmPerLiter, 1)} km/L`}
        footer={
          totals.liters > 0 ? (
            <Caption>{t('car.kpi.efficiency.liters', { liters: formatNumber(totals.liters, 1) })}</Caption>
          ) : (
            <Caption>{t('car.kpi.efficiency.hint')}</Caption>
          )
        }
      />
    </Box>
  );
};

export default CarSummaryCards;
