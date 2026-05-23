import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { ICategoryBreakdownData, IAnalyticsFilters } from '../types';

export function useCategoryBreakdown(filters: IAnalyticsFilters): ICategoryBreakdownData {
  const { transactions } = useFinanceStore();

  return useMemo(() => {
    const { dateRange, category } = filters;
    const start = dayjs(dateRange.startDate);
    const end = dayjs(dateRange.endDate);

    const filtered = transactions.filter(t => {
      const d = dayjs(t.date);
      return d.isAfter(start.subtract(1, 'day')) && d.isBefore(end.add(1, 'day'));
    });

    let expenseTransactions = filtered.filter(t => t.type === 'expense');
    const incomeTransactions = filtered.filter(t => t.type === 'income');

    if (category) {
      expenseTransactions = expenseTransactions.filter(t => t.category === category);
    }

    const categoryMap = new Map<string, { total: number; subcategories: Map<string, number> }>();
    expenseTransactions.forEach(t => {
      const existing = categoryMap.get(t.category) || { total: 0, subcategories: new Map() };
      existing.total += t.amount;
      const subTotal = existing.subcategories.get(t.subcategory) || 0;
      existing.subcategories.set(t.subcategory, subTotal + t.amount);
      categoryMap.set(t.category, existing);
    });

    const totalExpense = expenseTransactions.reduce((s, t) => s + t.amount, 0);
    const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);

    const breakdown = Array.from(categoryMap.entries())
      .map(([cat, data]) => ({
        category: cat,
        total: data.total,
        percentage: totalExpense > 0 ? Math.round((data.total / totalExpense) * 10000) / 100 : 0,
        subcategories: Array.from(data.subcategories.entries())
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total),
      }))
      .sort((a, b) => b.total - a.total);

    return { breakdown, totalExpense, totalIncome };
  }, [transactions, filters]);
}
