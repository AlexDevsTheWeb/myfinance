import {
  AccessTime as ClockIcon,
  ArrowDownward,
  ArrowUpward,
  SwapHoriz,
} from '@mui/icons-material';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCardUtilization } from '../../hooks/useDashboardMetrics';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUiStore } from '../../store/useUiStore';
import { formatCurrency, formatNumber, formatSignedCurrency } from '../../utils/format.utils';
import MiniCalendar, { type DayIndicator } from './MiniCalendar';

const BILL_CATEGORY_HINT = ['Bollette', 'Bills'];

const CalendarMasterDetailSection: React.FC = () => {
  const { t } = useTranslation();
  const { transactions, accounts } = useFinanceStore();
  const selectedDate = useUiStore((s) => s.selectedDate);
  const setSelectedDate = useUiStore((s) => s.setSelectedDate);
  const { cards: cardUtilization, totalCommitted } = useCardUtilization();

  const accountName = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const acc of accounts) map[acc.id] = acc.name;
    return map;
  }, [accounts]);

  const indicators = React.useMemo(() => {
    const map: Record<string, DayIndicator> = {};
    for (const tx of transactions) {
      const entry = map[tx.date] ?? (map[tx.date] = { income: false, expense: false, transfer: false });
      if (tx.type === 'income') entry.income = true;
      else if (tx.type === 'expense') entry.expense = true;
      else entry.transfer = true;
    }
    return map;
  }, [transactions]);

  const dayTransactions = React.useMemo(
    () =>
      transactions
        .filter((tx) => tx.date === selectedDate)
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
    [transactions, selectedDate],
  );

  const dayIncome = dayTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const dayExpense = dayTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const dayNet = dayIncome - dayExpense;

  const typeMeta = (type: string) => {
    if (type === 'income') return { color: '#10B981', icon: <ArrowDownward sx={{ fontSize: 14 }} />, label: t('dashboard.income') };
    if (type === 'expense') return { color: '#EF4444', icon: <ArrowUpward sx={{ fontSize: 14 }} />, label: t('dashboard.expense') };
    return { color: '#06B6D4', icon: <SwapHoriz sx={{ fontSize: 14 }} />, label: t('transactions.transfer') };
  };

  return (
    <Grid container spacing={2.5}>
      {/* Unified master-detail card */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper
          sx={{
            p: 0,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Master: calendar */}
          <Box
            sx={{
              width: { xs: '100%', md: '41.6667%' },
              p: 2,
              borderColor: 'colors.border',
              borderStyle: { xs: 'none none solid none', md: 'none solid none none' },
              borderWidth: { xs: '0 0 1px 0', md: '0 1px 0 0' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <MiniCalendar
              title={t('dashboard.calendar.title')}
              value={selectedDate}
              onChange={setSelectedDate}
              indicators={indicators}
            />

            <Box
              sx={{
                mt: 2,
                pt: 1.5,
                borderTop: 1,
                borderColor: 'colors.border',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {[
                { color: 'colors.emerald', label: t('dashboard.income') },
                { color: 'colors.rose', label: t('dashboard.expense') },
                { color: 'colors.cyan', label: t('dashboard.today') },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                  <Typography sx={{ fontSize: '0.6875rem', color: 'colors.subtle' }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Detail: selected day transactions */}
          <Box
            sx={{
              width: { xs: '100%', md: '58.3333%' },
              p: 2,
              bgcolor: 'rgba(17, 24, 39, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
                <Typography
                  sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'common.white', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {t('dashboard.calendar.movements')}
                </Typography>
                <Box
                  sx={{
                    fontFamily: (t2) => t2.colors.mono,
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    color: 'colors.cyan',
                    bgcolor: 'colors.active',
                    border: 1,
                    borderColor: 'rgba(6, 182, 212, 0.3)',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                  }}
                >
                  {dayjs(selectedDate).format('DD MMM YYYY').toUpperCase()} • {dayTransactions.length}{' '}
                  {t('dashboard.calendar.items')}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, maxHeight: 300, overflowY: 'auto' }}>
                {dayTransactions.length === 0 ? (
                  <Typography sx={{ fontSize: '0.75rem', color: 'colors.muted', py: 4, textAlign: 'center' }}>
                    {t('dashboard.calendar.noTransactions')}
                  </Typography>
                ) : (
                  dayTransactions.map((tx) => {
                    const meta = typeMeta(tx.type);
                    const isBill = BILL_CATEGORY_HINT.includes(tx.category);
                    return (
                      <Box
                        key={tx.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 1,
                          bgcolor: 'colors.surface',
                          border: 1,
                          borderColor: 'colors.border',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 0.5,
                              bgcolor: alpha(meta.color, 0.15),
                              border: 1,
                              borderColor: alpha(meta.color, 0.3),
                              color: meta.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {meta.icon}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography noWrap sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'common.white' }}>
                              {tx.description}
                            </Typography>
                            <Typography noWrap sx={{ fontSize: '0.625rem', color: 'colors.subtle' }}>
                              {[accountName[tx.accountId], tx.category].filter(Boolean).join(' • ')}
                              {isBill && tx.consumption ? ` • ${formatNumber(tx.consumption)}` : ''}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography
                            sx={{
                              fontFamily: (t2) => t2.colors.mono,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: meta.color,
                            }}
                          >
                            {tx.type === 'transfer' ? formatCurrency(tx.amount) : formatSignedCurrency(tx.type === 'expense' ? -tx.amount : tx.amount)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.05em', color: 'colors.muted', textTransform: 'uppercase' }}>
                            {meta.label}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>

            <Box sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'colors.border', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'colors.subtle' }}>
                {t('dashboard.calendar.netDayBalance')}:
              </Typography>
              <Typography
                sx={{
                  fontFamily: (t2) => t2.colors.mono,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: dayNet >= 0 ? 'colors.emerald' : 'colors.rose',
                }}
              >
                {formatSignedCurrency(dayNet)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Card plafond & direct debits */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'common.white', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2 }}
            >
              {t('dashboard.plafond.title')}
            </Typography>

            {cardUtilization.length === 0 ? (
              <Typography sx={{ fontSize: '0.75rem', color: 'colors.muted', py: 4, textAlign: 'center' }}>
                {t('dashboard.plafond.empty')}
              </Typography>
            ) : (
              cardUtilization.map((card, index) => {
                const barColor = card.usagePercent > 0.8 ? 'colors.rose' : card.type === 'credit' ? 'colors.cyan' : 'colors.emerald';
                return (
                  <Box key={card.id} sx={{ mb: index === cardUtilization.length - 1 ? 0 : 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography component="span" noWrap sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'common.white' }}>
                        {card.name}{' '}
                        <Box component="span" sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '0.625rem', color: 'colors.subtle' }}>
                          #{card.last4}
                        </Box>
                      </Typography>
                      <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', flexShrink: 0 }}>
                        {formatCurrency(card.spent)}{' '}
                        <Box component="span" sx={{ color: 'colors.muted', fontWeight: 400 }}>/ {formatCurrency(card.plafond, 0)}</Box>
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        mt: 0.75,
                        width: '100%',
                        bgcolor: 'colors.surfaceNested',
                        height: 8,
                        borderRadius: '9999px',
                        overflow: 'hidden',
                        border: 1,
                        borderColor: 'colors.border',
                      }}
                    >
                      <Box sx={{ bgcolor: barColor, height: '100%', borderRadius: '9999px', width: `${Math.min(card.usagePercent * 100, 100)}%` }} />
                    </Box>
                    <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'colors.subtle' }}>
                      <Typography component="span" sx={{ fontSize: 'inherit', color: 'inherit' }}>
                        {t('dashboard.plafond.freeMargin')}:{' '}
                        <Box component="span" sx={{ fontFamily: (t2) => t2.colors.mono, color: 'colors.emerald', fontWeight: 500 }}>
                          {formatCurrency(Math.max(card.available, 0))}
                        </Box>
                      </Typography>
                      <Typography component="span" sx={{ fontSize: 'inherit', color: 'inherit' }}>
                        {t('dashboard.plafond.usage')}{' '}
                        <Box component="span" sx={{ fontFamily: (t2) => t2.colors.mono }}>{(card.usagePercent * 100).toFixed(1)}%</Box>
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          <Box sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'colors.border', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <ClockIcon sx={{ fontSize: 14, color: 'colors.cyan' }} />
              <Typography noWrap sx={{ fontSize: '0.6875rem', color: 'colors.subtle' }}>
                {t('dashboard.plafond.debitNote')}
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: (t2) => t2.colors.mono, fontSize: '0.6875rem', fontWeight: 500, color: '#E2E8F0', flexShrink: 0 }}>
              {t('dashboard.plafond.totalCommitted')} {formatCurrency(totalCommitted)}
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CalendarMasterDetailSection;
