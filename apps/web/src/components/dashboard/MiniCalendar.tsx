import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import React from 'react';

export interface DayIndicator {
  income: boolean;
  expense: boolean;
  transfer: boolean;
}

interface MiniCalendarProps {
  /** Selected day as YYYY-MM-DD. */
  value: string;
  onChange: (date: string) => void;
  indicators: Record<string, DayIndicator>;
  title: string;
}

const WEEK_LENGTH = 7;

/** Monday-first start of the week (dayjs default week can vary by locale). */
function startOfWeekMonday(date: Dayjs): Dayjs {
  const day = date.day();
  const diff = (day + 6) % 7;
  return date.subtract(diff, 'day').startOf('day');
}

function dotsFor(info: DayIndicator | undefined): string[] {
  if (!info) return [];
  const dots: string[] = [];
  if (info.income) dots.push('#10B981');
  if (info.expense) dots.push('#EF4444');
  if (info.transfer) dots.push('#06B6D4');
  return dots;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ value, onChange, indicators, title }) => {
  const selected = dayjs(value);
  const [month, setMonth] = React.useState<Dayjs>(() => dayjs(value).startOf('month'));
  const [prevValue, setPrevValue] = React.useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setMonth(dayjs(value).startOf('month'));
  }

  const gridStart = startOfWeekMonday(month.startOf('month'));

  const cells = React.useMemo(() => {
    const days: Dayjs[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(gridStart.add(i, 'day'));
    }
    while (
      days.length > 7 &&
      days[days.length - 1].month() !== month.month() &&
      days[days.length - 8].month() !== month.month()
    ) {
      days.splice(days.length - 7, 7);
    }
    return days;
  }, [gridStart, month]);

  const weekdays = React.useMemo(
    () => Array.from({ length: WEEK_LENGTH }, (_, i) => gridStart.add(i, 'day').format('ddd').toUpperCase().slice(0, 3)),
    [gridStart],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography
          sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'common.white', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'colors.surfaceNested',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            border: 1,
            borderColor: 'colors.border',
          }}
        >
          <Typography sx={{ fontFamily: (t) => t.colors.mono, fontSize: '0.6875rem', color: '#CBD5E1' }}>
            {month.format('MMMM YYYY').toUpperCase()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'colors.subtle' }}>
            <IconButton size="small" onClick={() => setMonth((m) => m.subtract(1, 'month'))} sx={{ p: 0, color: 'inherit', '&:hover': { color: 'common.white' } }}>
              <ChevronLeft sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small" onClick={() => setMonth((m) => m.add(1, 'month'))} sx={{ p: 0, color: 'inherit', '&:hover': { color: 'common.white' } }}>
              <ChevronRight sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 0.5 }}>
        {weekdays.map((day, i) => (
          <Typography key={`${day}-${i}`} sx={{ fontSize: '0.625rem', fontWeight: 600, color: 'colors.muted' }}>
            {day}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '6px', textAlign: 'center' }}>
        {cells.map((day) => {
          const key = day.format('YYYY-MM-DD');
          const inMonth = day.month() === month.month();
          const isSelected = day.isSame(selected, 'day');
          const dots = inMonth ? dotsFor(indicators[key]) : [];

          const color = !inMonth ? '#475569' : dots.length > 0 ? '#CBD5E1' : 'colors.subtle';

          return (
            <Box
              key={key}
              onClick={() => onChange(key)}
              sx={{ position: 'relative', py: 0.5, cursor: 'pointer', '&:hover': { color: 'common.white' } }}
            >
              {isSelected ? (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    mx: 'auto',
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: 'colors.cyan',
                    color: 'colors.cyan',
                    bgcolor: 'rgba(8, 51, 68, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  <Typography sx={{ fontFamily: (t) => t.colors.mono, fontSize: '0.75rem', fontWeight: 700, lineHeight: 1, color: 'inherit' }}>
                    {day.date()}
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ fontFamily: (t) => t.colors.mono, fontSize: '0.75rem', lineHeight: '24px', color }}>
                  {day.date()}
                </Typography>
              )}
              {dots.length > 0 && !isSelected ? (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {dots.map((dot, i) => (
                    <Box key={i} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: dot }} />
                  ))}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MiniCalendar;
