export interface BudgetTarget {
  id: string;
  category: string;
  period: 'monthly' | 'semiannual' | 'annual';
  targetAmount: number;
  color: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgressSnapshot {
  category: string;
  targetAmount: number;
  actualSpent: number;
  percentage: number;
  remaining: number;
  status: 'safe' | 'warning' | 'breach';
  periodStart: string;
  periodEnd: string;
}

export interface BudgetPeriodSummary {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  totalBudgeted: number;
  totalSpent: number;
  surplus: number;
  dailyBurnRate: number;
  daysRemaining: number;
  projectedOvershoot: number;
}

export interface BurnUpPoint {
  date: string;
  actual: number;
  ideal: number;
}

export interface HistoricalSavingsRate {
  month: string;
  rate: number;
}
