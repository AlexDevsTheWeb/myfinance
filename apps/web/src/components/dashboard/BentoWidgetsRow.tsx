import {
  Bolt as BoltIcon,
  DirectionsCar as CarIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import { useUtilitiesSummary } from '../../hooks/useDashboardMetrics';
import { usePortfolio } from '../../analytics/hooks/usePortfolio';
import { formatCurrency, formatNumber, formatPercent, formatSignedCurrency } from '../../utils/format.utils';

interface BentoWidgetProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  badge?: React.ReactNode;
  subtitle: string;
  subtitleSpacing?: number;
  value: React.ReactNode;
  metrics: React.ReactNode;
  footer: React.ReactNode;
}

const BentoWidget: React.FC<BentoWidgetProps> = ({
  icon,
  iconColor,
  title,
  badge,
  subtitle,
  subtitleSpacing = 0.5,
  value,
  metrics,
  footer,
}) => (
  <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box sx={{ color: iconColor, display: 'flex', flexShrink: 0, '& svg': { fontSize: 16 } }}>{icon}</Box>
          <Typography
            noWrap
            sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'common.white', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {title}
          </Typography>
        </Box>
        {badge}
      </Box>

      <Typography sx={{ fontSize: '0.75rem', color: 'colors.subtle', mb: subtitleSpacing }}>{subtitle}</Typography>
      <Box sx={{ mb: 2 }}>{value}</Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>{metrics}</Box>
    </Box>

    <Box
      sx={{
        mt: 2,
        pt: 1.5,
        borderTop: 1,
        borderColor: 'colors.border',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        fontSize: '0.6875rem',
        color: 'colors.subtle',
      }}
    >
      {footer}
    </Box>
  </Paper>
);

const MiniMetric: React.FC<{ label: string; dotColor?: string; children: React.ReactNode }> = ({ label, dotColor, children }) => (
  <Box sx={{ bgcolor: 'colors.surfaceNested', border: 1, borderColor: 'colors.border', borderRadius: 1, p: 1.25 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, gap: 0.5 }}>
      <Typography sx={{ fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 500, color: 'colors.muted', lineHeight: 1 }}>
        {label}
      </Typography>
      {dotColor ? <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dotColor, flexShrink: 0 }} /> : null}
    </Box>
    {children}
  </Box>
);

const ValueText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontFamily: (t) => t.colors.mono, fontSize: '0.75rem', fontWeight: 700, color: 'common.white' }}>
    {children}
  </Typography>
);

const Badge: React.FC<{ color: string; bg: string; children: React.ReactNode }> = ({ color, bg, children }) => (
  <Box
    sx={{
      fontFamily: (t) => t.colors.mono,
      fontSize: '0.625rem',
      color,
      bgcolor: bg,
      border: 1,
      borderColor: alpha(color, 0.3),
      px: 1,
      py: 0.25,
      borderRadius: 1,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}
  >
    {children}
  </Box>
);

const BentoWidgetsRow: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enabledModules, carMileage } = useFinanceStore();
  const { brokerAccounts, pacState } = useInvestmentStore();
  const portfolio = usePortfolio();
  const utilities = useUtilitiesSummary();

  const latestKm = React.useMemo(
    () =>
      carMileage.length > 0
        ? [...carMileage].sort((a, b) => b.year - a.year || b.month - a.month)[0].reading
        : null,
    [carMileage],
  );

  const monthlyPac = brokerAccounts.reduce((s, b) => s + (b.monthlyPacAmount || 0), 0);
  const nextPacDate = React.useMemo(() => {
    const pending = pacState?.pendingTransaction?.date;
    if (pending) return dayjs(pending);
    const today = dayjs();
    const candidate = today.date(1).startOf('day');
    return candidate.isBefore(today, 'day') ? candidate.add(1, 'month') : candidate;
  }, [pacState]);

  const topHolding = portfolio.holdings[0]?.ticker;
  const showFleet = enabledModules.carManagement;
  const showUtilities = enabledModules.utilityTracker;
  const showInvestments = enabledModules.investmentTracking;

  if (!showFleet && !showUtilities && !showInvestments) return null;

  const dateFmt = (value: string | dayjs.Dayjs | null) => (value ? dayjs(value).format('DD MMM YYYY') : '—');

  return (
    <Grid container spacing={2.5}>
      {showFleet && (
        <Grid size={{ xs: 12, lg: 4 }}>
          <BentoWidget
            icon={<CarIcon />}
            iconColor="colors.subtle"
            title={t('dashboard.fleet.title')}
            subtitle="—"
            subtitleSpacing={1.5}
            value={
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '1.5rem', fontWeight: 700, color: 'common.white' }}>
                  {latestKm !== null ? formatNumber(latestKm) : '—'}
                </Typography>
                <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '0.75rem', color: 'colors.subtle' }}>km</Typography>
              </Box>
            }
            metrics={
              <>
                <MiniMetric label={t('dashboard.fleet.avgConsumption')}>
                  <ValueText>—</ValueText>
                </MiniMetric>
                <MiniMetric label={t('dashboard.fleet.nextService')}>
                  <ValueText>—</ValueText>
                </MiniMetric>
              </>
            }
            footer={
              <>
                <Typography noWrap sx={{ fontSize: 'inherit', color: 'inherit' }}>
                  {t('dashboard.fleet.tirePressure')}:{' '}
                  <Box component="span" sx={{ color: 'colors.emerald', fontWeight: 500 }}>—</Box>
                </Typography>
                <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '0.625rem', flexShrink: 0 }}>—</Typography>
              </>
            }
          />
        </Grid>
      )}

      {showUtilities && (
        <Grid size={{ xs: 12, lg: 4 }}>
          <BentoWidget
            icon={<BoltIcon />}
            iconColor="colors.amber"
            title={t('dashboard.utilities.title')}
            badge={
              <Badge color={theme.colors.cyan} bg="rgba(8, 51, 68, 0.8)">
                {utilities.yoyChangePct === null ? '—' : `${formatPercent(utilities.yoyChangePct)} YoY`}
              </Badge>
            }
            subtitle={t('dashboard.utilities.fixedSpend')}
            value={
              <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '1.5rem', fontWeight: 700, color: 'common.white' }}>
                {formatCurrency(utilities.monthlySpend)}
              </Typography>
            }
            metrics={
              <>
                <MiniMetric label={t('dashboard.utilities.electricity')} dotColor="colors.cyan">
                  <ValueText>
                    {utilities.electricityKwh > 0 ? formatNumber(utilities.electricityKwh) : '—'}{' '}
                    <Box component="span" sx={{ fontSize: '0.625rem', fontWeight: 400, color: 'colors.subtle' }}>kWh</Box>
                  </ValueText>
                  <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '0.625rem', color: 'colors.muted', mt: 0.25 }}>
                    {utilities.electricityUnitCost !== null ? `€ ${utilities.electricityUnitCost.toFixed(2)} / kWh` : '—'}
                  </Typography>
                </MiniMetric>
                <MiniMetric label={t('dashboard.utilities.gas')} dotColor="colors.amber">
                  <ValueText>
                    {utilities.gasSmc > 0 ? formatNumber(utilities.gasSmc) : '—'}{' '}
                    <Box component="span" sx={{ fontSize: '0.625rem', fontWeight: 400, color: 'colors.subtle' }}>smc</Box>
                  </ValueText>
                  <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '0.625rem', color: 'colors.muted', mt: 0.25 }}>
                    {utilities.gasUnitCost !== null ? `€ ${utilities.gasUnitCost.toFixed(2)} / smc` : '—'}
                  </Typography>
                </MiniMetric>
              </>
            }
            footer={
              <>
                <Typography noWrap sx={{ fontSize: 'inherit', color: 'inherit' }}>{t('dashboard.utilities.nextBill')}</Typography>
                <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '0.6875rem', fontWeight: 500, color: '#E2E8F0', flexShrink: 0 }}>
                  {dateFmt(utilities.nextBillDate)}
                </Typography>
              </>
            }
          />
        </Grid>
      )}

      {showInvestments && (
        <Grid size={{ xs: 12, lg: 4 }}>
          <BentoWidget
            icon={<TrendIcon />}
            iconColor="colors.emerald"
            title={t('dashboard.investments.title')}
            badge={
              <Badge color={theme.colors.emerald} bg="rgba(2, 44, 34, 0.8)">
                {formatPercent(portfolio.totalReturnPercent)} {t('dashboard.investments.totalBadge')}
              </Badge>
            }
            subtitle={t('dashboard.investments.capitalInvested')}
            value={
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '1.5rem', fontWeight: 700, color: 'common.white' }}>
                  {formatCurrency(portfolio.currentValue)}
                </Typography>
                <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '0.75rem', fontWeight: 500, color: portfolio.isPositive ? 'colors.emerald' : 'colors.rose' }}>
                  {formatSignedCurrency(portfolio.totalReturn)}
                </Typography>
              </Box>
            }
            metrics={
              <>
                <MiniMetric label={t('dashboard.investments.monthlyPac')}>
                  <ValueText>
                    {formatCurrency(monthlyPac)}{' '}
                    <Box component="span" sx={{ fontSize: '0.625rem', fontWeight: 400, color: 'colors.subtle' }}>/mese</Box>
                  </ValueText>
                </MiniMetric>
                <MiniMetric label={t('dashboard.investments.nextPurchase')}>
                  <ValueText>
                    <Box component="span" sx={{ color: 'colors.cyan' }}>{dateFmt(nextPacDate)}</Box>
                  </ValueText>
                </MiniMetric>
              </>
            }
            footer={
              <>
                <Typography noWrap sx={{ fontSize: 'inherit', color: 'inherit' }}>
                  {t('dashboard.investments.instrument')}:{' '}
                  <Box component="span" sx={{ color: '#CBD5E1', fontWeight: 500 }}>{topHolding ?? '—'}</Box>
                </Typography>
                <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: 'inherit', fontWeight: 500, color: portfolio.isPositive ? 'colors.emerald' : 'colors.rose', flexShrink: 0 }}>
                  {portfolio.isPositive ? t('dashboard.investments.pnlGreen') : t('dashboard.investments.pnlRed')}
                </Typography>
              </>
            }
          />
        </Grid>
      )}
    </Grid>
  );
};

export default BentoWidgetsRow;
