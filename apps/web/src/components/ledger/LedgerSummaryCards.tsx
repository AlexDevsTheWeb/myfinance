import { Schedule, TrendingUp } from '@mui/icons-material';
import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatSignedCurrency } from '../../utils/format.utils';

export interface LedgerSummaryProps {
  inflow: number;
  outflow: number;
  inflowCount: number;
  outflowCount: number;
  /** Percentage change of inflow against the previous equivalent period, or null when incomparable. */
  inflowDeltaPercent: number | null;
  /** Share of the monthly budget already spent (0-100), or null when no budget is configured. */
  budgetPercent: number | null;
  /** Monthly-equivalent total of active recurring expenses. */
  recurringMonthly: number;
  recurringCount: number;
  /** ISO date of the next recurring charge, or null when there are none. */
  nextRecurringDate: string | null;
}

interface SummaryCardProps {
  label: string;
  badge: React.ReactNode;
  value: React.ReactNode;
  footer: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, badge, value, footer }) => (
  <Paper sx={{ p: 2.5, borderRadius: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
      <Typography
        variant="caption"
        noWrap
        sx={{ color: 'colors.subtle', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}
      >
        {label}
      </Typography>
      {badge}
    </Box>

    <Typography
      noWrap
      sx={{
        fontFamily: (t) => t.colors.mono,
        fontVariantNumeric: 'tabular-nums',
        fontSize: '1.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      }}
    >
      {value}
    </Typography>

    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, minHeight: 20 }}>{footer}</Box>
  </Paper>
);

const FooterText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography noWrap variant="caption" sx={{ color: 'colors.subtle' }}>
    {children}
  </Typography>
);

const Dot: React.FC = () => (
  <Box component="span" sx={{ color: 'colors.border', mx: 0.75 }}>
    •
  </Box>
);

const LedgerSummaryCards: React.FC<LedgerSummaryProps> = ({
  inflow,
  outflow,
  inflowCount,
  outflowCount,
  inflowDeltaPercent,
  budgetPercent,
  recurringMonthly,
  recurringCount,
  nextRecurringDate,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      <SummaryCard
        label={t('transactions.ledger.summary.inflow')}
        badge={
          inflowDeltaPercent === null ? null : (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'rgba(16,185,129,0.25)',
                bgcolor: 'rgba(16,185,129,0.1)',
                color: 'colors.emerald',
              }}
            >
              <TrendingUp sx={{ fontSize: 12 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: (th) => th.colors.mono }}>
                {`${inflowDeltaPercent >= 0 ? '+' : ''}${inflowDeltaPercent.toFixed(1).replace('.', ',')}%`}
              </Typography>
            </Box>
          )
        }
        value={
          <Box component="span" sx={{ color: 'colors.emerald' }}>
            {formatSignedCurrency(inflow)}
          </Box>
        }
        footer={
          <>
            <FooterText>{t('transactions.ledger.summary.inflowFooter', { count: formatNumber(inflowCount) })}</FooterText>
            <Dot />
            <FooterText>{t('transactions.ledger.summary.vsPrevious')}</FooterText>
          </>
        }
      />

      <SummaryCard
        label={t('transactions.ledger.summary.outflow')}
        badge={
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'colors.border',
              bgcolor: 'colors.surfaceNested',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'colors.subtle' }}>
              {t('transactions.ledger.summary.outflowBadge')}
            </Typography>
          </Box>
        }
        value={
          <Box component="span" sx={{ color: 'colors.rose' }}>
            {formatSignedCurrency(-outflow)}
          </Box>
        }
        footer={
          budgetPercent === null ? (
            <FooterText>{t('transactions.ledger.summary.outflowFooter', { count: formatNumber(outflowCount) })}</FooterText>
          ) : (
            <>
              <FooterText>
                {t('transactions.ledger.summary.budgetProgress', {
                  percent: formatNumber(Math.round(budgetPercent)),
                })}
              </FooterText>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, budgetPercent))}
                sx={{
                  width: 64,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'colors.surfaceNested',
                  '& .MuiLinearProgress-bar': { bgcolor: 'colors.rose', borderRadius: 3 },
                }}
              />
            </>
          )
        }
      />

      <SummaryCard
        label={t('transactions.ledger.summary.recurring')}
        badge={
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'rgba(245,158,11,0.25)',
              bgcolor: 'rgba(245,158,11,0.1)',
              color: 'colors.amber',
            }}
          >
            <Schedule sx={{ fontSize: 12 }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {t('transactions.ledger.summary.recurringBadge')}
            </Typography>
          </Box>
        }
        value={
          <Box component="span" sx={{ color: 'colors.amber' }}>
            {formatSignedCurrency(-recurringMonthly)}
            <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'colors.subtle', fontFamily: 'inherit' }}>
              {t('transactions.ledger.summary.perMonth')}
            </Typography>
          </Box>
        }
        footer={
          <>
            <FooterText>
              {t('transactions.ledger.summary.recurringFooter', { count: formatNumber(recurringCount) })}
            </FooterText>
            {nextRecurringDate && (
              <>
                <Dot />
                <FooterText>
                  {t('transactions.ledger.summary.next', {
                    date: dayjs(nextRecurringDate).format('DD MMM'),
                  })}
                </FooterText>
              </>
            )}
          </>
        }
      />
    </Box>
  );
};

export default LedgerSummaryCards;
