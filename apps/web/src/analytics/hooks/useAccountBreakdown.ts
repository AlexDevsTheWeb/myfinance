import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { IAccountBreakdown } from '../types';

export function useAccountBreakdown(): IAccountBreakdown[] {
  const { transactions, accounts, balanceStartDate } = useFinanceStore();

  return useMemo(() => {
    const start = dayjs(balanceStartDate);

    const totalBalance = accounts.reduce((sum, acc) => {
      const accTx = transactions.filter(t => {
        const d = dayjs(t.date);
        return t.accountId === acc.id && d.isAfter(start.subtract(1, 'day'));
      });
      const income = accTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = accTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return sum + acc.initialBalance + income - expense;
    }, 0);

    return accounts.map(acc => {
      const accTx = transactions.filter(t => {
        const d = dayjs(t.date);
        return t.accountId === acc.id && d.isAfter(start.subtract(1, 'day'));
      });
      const income = accTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = accTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const balance = acc.initialBalance + income - expense;
      return {
        accountId: acc.id,
        accountName: acc.name,
        balance,
        percentage: totalBalance > 0 ? Math.round((balance / totalBalance) * 10000) / 100 : 0,
      };
    });
  }, [transactions, accounts, balanceStartDate]);
}
