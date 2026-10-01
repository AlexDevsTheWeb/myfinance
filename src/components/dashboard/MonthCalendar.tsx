import { ArrowDownward, ArrowUpward, SwapHoriz } from '@mui/icons-material';
import { Box, Chip, Divider, Paper, Typography } from '@mui/material';
import { DateCalendar, PickerDay } from '@mui/x-date-pickers';
import type { PickerDayProps } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../../store/useFinanceStore';

interface DayTotals {
  income: number;
  expense: number;
  count: number;
  hasTransfer: boolean;
}

const DayTotalsContext = React.createContext<Record<string, DayTotals>>({});

const CalendarDay: React.FC<PickerDayProps> = (props) => {
  const totals = React.useContext(DayTotalsContext);
  const key = dayjs(props.day as Dayjs).format('YYYY-MM-DD');
  const info = totals[key];

  const dot = (color: string) => (
    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: color }} />
  );

  return (
    <PickerDay {...props}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
        <Typography component="span" variant="caption" sx={{ lineHeight: 1 }}>
          {dayjs(props.day as Dayjs).date()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.25, height: 4, alignItems: 'center' }}>
          {info?.income ? dot('success.main') : null}
          {info?.expense ? dot('error.main') : null}
          {info?.hasTransfer ? dot('info.main') : null}
        </Box>
      </Box>
    </PickerDay>
  );
};

const formatAmount = (amount: number) =>
  `€ ${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const MonthCalendar: React.FC = () => {
  const { t } = useTranslation();
  const { transactions } = useFinanceStore();
  const [selectedDay, setSelectedDay] = React.useState<Dayjs>(() => dayjs());

  const totalsByDay = React.useMemo(() => {
    const map: Record<string, DayTotals> = {};
    for (const tx of transactions) {
      const entry = map[tx.date] ?? (map[tx.date] = { income: 0, expense: 0, count: 0, hasTransfer: false });
      entry.count += 1;
      if (tx.type === 'income') entry.income += tx.amount;
      else if (tx.type === 'expense') entry.expense += Math.abs(tx.amount);
      else entry.hasTransfer = true;
    }
    return map;
  }, [transactions]);

  const selectedKey = selectedDay.format('YYYY-MM-DD');
  const dayInfo = totalsByDay[selectedKey];

  const dayTransactions = React.useMemo(
    () => transactions.filter((tx) => tx.date === selectedKey),
    [transactions, selectedKey],
  );

  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {t('dashboard.calendar.title')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box>
          <DayTotalsContext.Provider value={totalsByDay}>
            <DateCalendar
              value={selectedDay}
              onChange={(value) => {
                if (value) setSelectedDay(value as Dayjs);
              }}
              slots={{ day: CalendarDay }}
              showDaysOutsideCurrentMonth={false}
            />
          </DayTotalsContext.Provider>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 0.5 }}>
            <Chip
              size="small"
              variant="outlined"
              label={t('dashboard.income')}
              icon={<ArrowDownward sx={{ fontSize: 14 }} />}
              sx={{ height: 22, '& .MuiChip-label': { fontSize: '0.7rem' } }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={t('dashboard.expense')}
              icon={<ArrowUpward sx={{ fontSize: 14 }} />}
              sx={{ height: 22, '& .MuiChip-label': { fontSize: '0.7rem' } }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={t('transactions.transfer')}
              icon={<SwapHoriz sx={{ fontSize: 14 }} />}
              sx={{ height: 22, '& .MuiChip-label': { fontSize: '0.7rem' } }}
            />
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {selectedDay.format('dddd D MMMM YYYY')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                + {formatAmount(dayInfo?.income ?? 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                − {formatAmount(dayInfo?.expense ?? 0)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
            {dayTransactions.length === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.5, py: 2, textAlign: 'center' }}>
                {t('dashboard.calendar.noTransactions')}
              </Typography>
            ) : (
              dayTransactions.map((tx) => {
                const color =
                  tx.type === 'income' ? 'success.main' : tx.type === 'expense' ? 'error.main' : 'info.main';
                const Icon = tx.type === 'income' ? ArrowDownward : tx.type === 'expense' ? ArrowUpward : SwapHoriz;
                return (
                  <Box key={tx.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
                    <Box sx={{ p: 0.75, borderRadius: 1, bgcolor: `${color}20`, color, display: 'flex' }}>
                      <Icon sx={{ fontSize: 16 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                        {tx.description}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>
                        {[tx.category, tx.subcategory].filter(Boolean).join(' · ')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color, whiteSpace: 'nowrap' }}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''} {formatAmount(tx.amount)}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default MonthCalendar;
