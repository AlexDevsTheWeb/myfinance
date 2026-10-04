import dayjs from 'dayjs';
import type { ITransaction, BudgetTarget, BudgetProgressSnapshot, BudgetPeriodSummary, BurnUpPoint, HistoricalSavingsRate } from '../store/types';

type Status = 'safe' | 'warning' | 'breach';

function getPeriodDateRange(period: 'monthly' | 'semiannual' | 'annual', referenceDate?: string): { start: string; end: string } {
  const ref = referenceDate ? dayjs(referenceDate) : dayjs();
  if (period === 'monthly') {
    return {
      start: ref.startOf('month').format('YYYY-MM-DD'),
      end: ref.endOf('month').format('YYYY-MM-DD'),
    };
  }
  if (period === 'semiannual') {
    const halfStart = ref.month() < 6 ? ref.startOf('year') : ref.month(6).startOf('month');
    return {
      start: halfStart.format('YYYY-MM-DD'),
      end: halfStart.add(5, 'month').endOf('month').format('YYYY-MM-DD'),
    };
  }
  return {
    start: ref.startOf('year').format('YYYY-MM-DD'),
    end: ref.endOf('year').format('YYYY-MM-DD'),
  };
}

function sumExpensesByCategory(transactions: ITransaction[], dateRange: { start: string; end: string }): Map<string, number> {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    if (tx.date < dateRange.start || tx.date > dateRange.end) continue;
    const current = map.get(tx.category) ?? 0;
    map.set(tx.category, current + Math.abs(tx.amount));
  }
  return map;
}

export function computeBudgetProgress(
  transactions: ITransaction[],
  budgetTargets: BudgetTarget[],
  dateRange?: { start: string; end: string }
): { snapshots: BudgetProgressSnapshot[]; summary: BudgetPeriodSummary } {
  const categorySpent = sumExpensesByCategory(transactions, dateRange ?? {
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  const safeRange = dateRange ?? {
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().endOf('month').format('YYYY-MM-DD'),
  };

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income' && tx.date >= safeRange.start && tx.date <= safeRange.end)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense' && tx.date >= safeRange.start && tx.date <= safeRange.end)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  let totalBudgeted = 0;
  let totalSpent = 0;
  const snapshots: BudgetProgressSnapshot[] = [];

  for (const target of budgetTargets) {
    const actualSpent = categorySpent.get(target.category) ?? 0;
    const percentage = target.targetAmount > 0 ? (actualSpent / target.targetAmount) * 100 : 0;
    const remaining = target.targetAmount - actualSpent;
    let status: Status = 'safe';
    if (percentage >= 100) status = 'breach';
    else if (percentage >= 70) status = 'warning';

    totalBudgeted += target.targetAmount;
    totalSpent += actualSpent;

    snapshots.push({
      category: target.category,
      targetAmount: target.targetAmount,
      actualSpent,
      percentage,
      remaining,
      status,
      periodStart: safeRange.start,
      periodEnd: safeRange.end,
    });
  }

  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
  const surplus = totalBudgeted - totalSpent;

  const daysInPeriod = dayjs(safeRange.end).diff(dayjs(safeRange.start), 'day') || 1;
  const daysRemaining = Math.max(0, dayjs(safeRange.end).diff(dayjs(), 'day'));
  const dailyBurnRate = daysInPeriod > 0 ? totalSpent / daysInPeriod : 0;
  const projectedOvershoot = dailyBurnRate > 0 ? (dailyBurnRate * daysRemaining) - surplus : 0;

  return {
    snapshots,
    summary: {
      totalIncome,
      totalExpenses,
      savingsRate,
      totalBudgeted,
      totalSpent,
      surplus,
      dailyBurnRate,
      daysRemaining,
      projectedOvershoot,
    },
  };
}

export function computeSavingsRate(
  transactions: ITransaction[],
  dateRange: { start: string; end: string }
): number {
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income' && tx.date >= dateRange.start && tx.date <= dateRange.end)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense' && tx.date >= dateRange.start && tx.date <= dateRange.end)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
}

export function computeHistoricalSavingsRate(
  transactions: ITransaction[],
  months: number = 12
): HistoricalSavingsRate[] {
  const results: HistoricalSavingsRate[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const month = dayjs().subtract(i, 'month');
    const start = month.startOf('month').format('YYYY-MM-DD');
    const end = month.endOf('month').format('YYYY-MM-DD');
    const rate = computeSavingsRate(transactions, { start, end });
    results.push({ month: month.format('YYYY-MM'), rate });
  }
  return results;
}

export function computeBurnUpData(
  transactions: ITransaction[],
  budgetTargets: BudgetTarget[],
  dateRange: { start: string; end: string }
): BurnUpPoint[] {
  const totalBudget = budgetTargets.reduce((sum, t) => sum + t.targetAmount, 0);
  if (totalBudget === 0) return [];

  const daysInPeriod = dayjs(dateRange.end).diff(dayjs(dateRange.start), 'day') || 1;
  const dailyIdeal = totalBudget / daysInPeriod;

  const expenseDays = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    if (tx.date < dateRange.start || tx.date > dateRange.end) continue;
    const current = expenseDays.get(tx.date) ?? 0;
    expenseDays.set(tx.date, current + Math.abs(tx.amount));
  }

  const sortedDates = Array.from(expenseDays.keys()).sort();
  const points: BurnUpPoint[] = [];
  let cumulativeActual = 0;

  for (const date of sortedDates) {
    cumulativeActual += expenseDays.get(date) ?? 0;
    const dayIndex = dayjs(date).diff(dayjs(dateRange.start), 'day');
    const ideal = dailyIdeal * (dayIndex + 1);
    points.push({ date, actual: cumulativeActual, ideal });
  }

  return points;
}

export function getPeriodDateRangeFromTarget(target: BudgetTarget): { start: string; end: string } {
  return getPeriodDateRange(target.period);
}
