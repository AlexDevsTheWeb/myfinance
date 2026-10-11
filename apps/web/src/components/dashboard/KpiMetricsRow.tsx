import {
  AccountBalanceWallet as WalletIcon,
  ArrowDownward,
  ArrowUpward,
  TrendingUp,
} from '@mui/icons-material';
import { Box, Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { formatNumber, formatPercent, formatSignedCurrency } from '../../utils/format.utils';

interface KpiMetricsRowProps {
  onOpenAccountDetail?: () => void;
}

interface KpiCardProps {
  label: string;
  value: string;
  valueColor: string;
  icon: React.ReactNode;
  iconColor: string;
  footer: React.ReactNode;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, valueColor, icon, iconColor, footer, onClick }) => (
  <Paper
    onClick={onClick}
    sx={{
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.2s ease',
      '&:hover': onClick ? { borderColor: 'colors.borderLight' } : undefined,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ color: iconColor, display: 'flex', flexShrink: 0, '& svg': { fontSize: 16 } }}>{icon}</Box>
      <Typography
        variant="caption"
        noWrap
        sx={{ color: 'colors.subtle', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}
      >
        {label}
      </Typography>
    </Box>

    <Box sx={{ my: 1 }}>
      <Typography
        sx={{
          fontFamily: (t) => t.colors.mono,
          fontVariantNumeric: 'tabular-nums',
          fontSize: '1.5rem',
          fontWeight: 700,
          lineHeight: 1.2,
          color: valueColor,
        }}
      >
        {value}
      </Typography>
    </Box>
    <Box>{footer}</Box>
  </Paper>
);

const KpiMetricsRow: React.FC<KpiMetricsRowProps> = ({ onOpenAccountDetail }) => {
  const { t } = useTranslation();
  const metrics = useDashboardMetrics();

  const neutral = 'text.primary';
  const positive = metrics.balanceChangePct !== null && metrics.balanceChangePct >= 0;

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          label={t('dashboard.liquidBalance')}
          value={formatSignedCurrency(metrics.currentBalance).replace('+', '')}
          valueColor={neutral}
          icon={<WalletIcon fontSize="small" />}
          iconColor="colors.subtle"
          onClick={onOpenAccountDetail}
          footer={
            metrics.balanceChangePct === null ? (
              <Typography variant="caption" sx={{ color: 'colors.muted' }}>—</Typography>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: (th) => th.colors.mono,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: positive ? 'colors.emerald' : 'colors.rose',
                  }}
                >
                  {formatPercent(metrics.balanceChangePct)}
                </Typography>
                <Typography component="span" sx={{ fontSize: '0.75rem', color: 'colors.subtle' }}>
                  {t('dashboard.vsPreviousMonth')}
                </Typography>
              </Box>
            )
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          label={t('dashboard.incomeMonth')}
          value={formatSignedCurrency(metrics.monthlyIncome)}
          valueColor="colors.emerald"
          icon={<ArrowDownward fontSize="small" />}
          iconColor="colors.emerald"
          footer={
            <Typography noWrap sx={{ fontSize: '0.75rem', color: 'colors.subtle' }}>
              {formatNumber(metrics.incomeMovements)} {t('dashboard.movementsRegistered')}
            </Typography>
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          label={t('dashboard.expensesMonth')}
          value={formatSignedCurrency(-metrics.monthlyExpense)}
          valueColor="colors.rose"
          icon={<ArrowUpward fontSize="small" />}
          iconColor="colors.rose"
          footer={
            <Typography noWrap sx={{ fontSize: '0.75rem', color: 'colors.subtle' }}>
              {formatNumber(metrics.expenseMovements)} {t('dashboard.movementsRegistered')}
            </Typography>
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          label={t('dashboard.netDeltaMonth')}
          value={formatSignedCurrency(metrics.netDelta)}
          valueColor="colors.cyan"
          icon={<TrendingUp fontSize="small" />}
          iconColor="colors.cyan"
          footer={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography component="span" sx={{ fontSize: '0.75rem', color: 'colors.subtle' }}>
                {t('dashboard.savingsRate')}:
              </Typography>
              <Typography
                component="span"
                sx={{ fontFamily: (th) => th.colors.mono, fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}
              >
                {metrics.savingsRate === null ? '—' : `${(metrics.savingsRate * 100).toFixed(1)}%`}
              </Typography>
            </Box>
          }
        />
      </Grid>
    </Grid>
  );
};

export default KpiMetricsRow;
