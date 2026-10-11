import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export interface DashboardMetrics {
  /** Sum of every account balance since the configured start date. */
  currentBalance: number;
  allTimeIncome: number;
  allTimeExpenses: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netDelta: number;
  /** netDelta / monthlyIncome, or null when there is no income this month. */
  savingsRate: number | null;
  incomeMovements: number;
  expenseMovements: number;
  /** Month-over-month change of the liquid balance, or null when not computable. */
  balanceChangePct: number | null;
}

export function useDashboardMetrics(): DashboardMetrics {
  const { transactions, accounts, balanceStartDate } = useFinanceStore();

  return useMemo(() => {
    const startDateStr = dayjs(balanceStartDate).format('YYYY-MM-DD');

    let allTimeIncome = 0;
    let allTimeExpenses = 0;
    let currentBalance = 0;

    for (const acc of accounts) {
      const period = transactions.filter(
        (t) => t.accountId === acc.id && dayjs(t.date).format('YYYY-MM-DD') >= startDateStr,
      );
      const income = period.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = period.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      allTimeIncome += income;
      allTimeExpenses += expense;
      currentBalance += acc.initialBalance + income - expense;
    }

    const now = dayjs();
    const monthly = transactions.filter((t) => dayjs(t.date).isSame(now, 'month'));
    const monthlyIncomeTx = monthly.filter((t) => t.type === 'income');
    const monthlyExpenseTx = monthly.filter((t) => t.type === 'expense');
    const monthlyIncome = monthlyIncomeTx.reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = monthlyExpenseTx.reduce((s, t) => s + t.amount, 0);
    const netDelta = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? netDelta / monthlyIncome : null;

    const previousBalance = currentBalance - netDelta;
    const balanceChangePct = previousBalance !== 0 ? (netDelta / Math.abs(previousBalance)) * 100 : null;

    return {
      currentBalance,
      allTimeIncome,
      allTimeExpenses,
      monthlyIncome,
      monthlyExpense,
      netDelta,
      savingsRate,
      incomeMovements: monthlyIncomeTx.length,
      expenseMovements: monthlyExpenseTx.length,
      balanceChangePct,
    };
  }, [transactions, accounts, balanceStartDate]);
}

export interface CardUtilization {
  id: string;
  name: string;
  type: 'credit' | 'debit';
  plafond: number;
  spent: number;
  available: number;
  usagePercent: number;
  /** Deterministic 4-digit suffix derived from the card id (design shows #NNNN). */
  last4: string;
}

function lastFour(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return String(hash % 10000).padStart(4, '0');
}

export function useCardUtilization(): { cards: CardUtilization[]; totalCommitted: number } {
  const { cards, transactions } = useFinanceStore();

  return useMemo(() => {
    const items = cards.map((card) => {
      const resetDay = card.billingDay;
      const now = dayjs();
      let periodStart: dayjs.Dayjs;
      let periodEnd: dayjs.Dayjs;

      if (now.date() >= resetDay) {
        periodStart = now.date(resetDay).startOf('day');
        periodEnd = now.add(1, 'month').date(resetDay).startOf('day');
      } else {
        periodStart = now.subtract(1, 'month').date(resetDay).startOf('day');
        periodEnd = now.date(resetDay).startOf('day');
      }

      const spent = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.cardId === card.id &&
            dayjs(t.date).valueOf() >= periodStart.valueOf() &&
            dayjs(t.date).valueOf() < periodEnd.valueOf(),
        )
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        id: card.id,
        name: card.name,
        type: card.type,
        plafond: card.plafond,
        spent,
        available: card.plafond - spent,
        usagePercent: card.plafond > 0 ? Math.min(spent / card.plafond, 1) : 0,
        last4: lastFour(card.id),
      };
    });

    return { cards: items, totalCommitted: items.reduce((s, c) => s + c.spent, 0) };
  }, [cards, transactions]);
}

export interface UtilitiesSummary {
  monthlySpend: number;
  yoyChangePct: number | null;
  electricityKwh: number;
  electricityUnitCost: number | null;
  gasSmc: number;
  gasUnitCost: number | null;
  nextBillDate: string | null;
}

const BILL_CATEGORIES = ['Bollette', 'Bills'];
const ELECTRICITY_SUBS = ['Elettricità', 'Electricity'];
const GAS_SUBS = ['Gas'];

export function useUtilitiesSummary(): UtilitiesSummary {
  const { transactions, recurringTransactions } = useFinanceStore();

  return useMemo(() => {
    const now = dayjs();
    const isBill = (t: (typeof transactions)[number]) => BILL_CATEGORIES.includes(t.category);

    const thisMonth = transactions.filter(
      (t) => t.type === 'expense' && isBill(t) && dayjs(t.date).isSame(now, 'month'),
    );
    const monthlySpend = thisMonth.reduce((s, t) => s + t.amount, 0);

    const lastYear = transactions.filter(
      (t) => t.type === 'expense' && isBill(t) && dayjs(t.date).isSame(now.subtract(1, 'year'), 'month'),
    );
    const lastYearSpend = lastYear.reduce((s, t) => s + t.amount, 0);
    const yoyChangePct = lastYearSpend > 0 ? ((monthlySpend - lastYearSpend) / lastYearSpend) * 100 : null;

    const electricityTx = thisMonth.filter((t) => ELECTRICITY_SUBS.includes(t.subcategory));
    const gasTx = thisMonth.filter((t) => GAS_SUBS.includes(t.subcategory));

    const electricityKwh = electricityTx.reduce((s, t) => s + (t.consumption ?? 0), 0);
    const gasSmc = gasTx.reduce((s, t) => s + (t.consumption ?? 0), 0);
    const electricityUnitCost = electricityKwh > 0
      ? electricityTx.reduce((s, t) => s + t.amount, 0) / electricityKwh
      : null;
    const gasUnitCost = gasSmc > 0
      ? gasTx.reduce((s, t) => s + t.amount, 0) / gasSmc
      : null;

    const billRecurring = recurringTransactions.filter((r) => BILL_CATEGORIES.includes(r.category));
    let nextBillDate: string | null = null;
    for (const r of billRecurring) {
      let candidate = now.date(r.dayOfMonth).startOf('day');
      if (candidate.isBefore(now, 'day')) candidate = candidate.add(1, 'month');
      const formatted = candidate.format('YYYY-MM-DD');
      if (!nextBillDate || formatted < nextBillDate) nextBillDate = formatted;
    }

    return {
      monthlySpend,
      yoyChangePct,
      electricityKwh,
      electricityUnitCost,
      gasSmc,
      gasUnitCost,
      nextBillDate,
    };
  }, [transactions, recurringTransactions]);
}
