import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { IMonthlyComparisonData } from '../types';

export function useMonthlyComparison(month: number, year: number): IMonthlyComparisonData {
  const { transactions } = useFinanceStore();

  return useMemo(() => {
    const aggregate = (targetMonth: number, targetYear: number) => {
      const filtered = transactions.filter(t => {
        const d = dayjs(t.date);
        return d.month() === targetMonth && d.year() === targetYear;
      });
      const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { income, expense, net: income - expense };
    };

    const prevMonth = month === 0 ? { month: 11, year: year - 1 } : { month: month - 1, year };
    const lastYear = { month, year: year - 1 };

    return {
      current: aggregate(month, year),
      previousMonth: aggregate(prevMonth.month, prevMonth.year),
      lastYear: aggregate(lastYear.month, lastYear.year),
      month,
      year,
    };
  }, [transactions, month, year]);
}
