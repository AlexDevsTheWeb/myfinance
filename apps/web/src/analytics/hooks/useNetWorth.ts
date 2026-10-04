import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { INetWorthPoint, IDateRange } from '../types';

export function useNetWorth(dateRange: IDateRange): INetWorthPoint[] {
  const { transactions, initialBalance, balanceStartDate } = useFinanceStore();

  return useMemo(() => {
    const start = dayjs(dateRange.startDate);
    const end = dayjs(dateRange.endDate);

    const allTx = [...transactions]
      .filter(t => dayjs(t.date).isBefore(end.add(1, 'day')))
      .sort((a, b) => a.date.localeCompare(b.date));

    let runningBalance = initialBalance;
    allTx.forEach(t => {
      const tDate = dayjs(t.date);
      if (tDate.isBefore(start)) {
        const isAfterBalanceStart = tDate.isAfter(dayjs(balanceStartDate).subtract(1, 'day'));
        if (t.type === 'income' && isAfterBalanceStart) runningBalance += t.amount;
        else if (t.type === 'expense') runningBalance -= t.amount;
      }
    });

    const points: INetWorthPoint[] = [];
    let cursor = start.startOf('month');
    while (cursor.isBefore(end) || cursor.isSame(end, 'month')) {
      const monthEnd = cursor.endOf('month');
      const monthTx = allTx.filter(t => {
        const d = dayjs(t.date);
        return d.isAfter(cursor.subtract(1, 'day')) && d.isBefore(monthEnd.add(1, 'day'));
      });
      monthTx.forEach(t => {
        const isAfterBalanceStart = dayjs(t.date).isAfter(dayjs(balanceStartDate).subtract(1, 'day'));
        if (t.type === 'income' && isAfterBalanceStart) runningBalance += t.amount;
        else if (t.type === 'expense') runningBalance -= t.amount;
      });
      points.push({ date: cursor.format('YYYY-MM'), balance: runningBalance });
      cursor = cursor.add(1, 'month');
    }

    return points;
  }, [transactions, initialBalance, balanceStartDate, dateRange]);
}
