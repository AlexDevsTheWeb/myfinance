export interface IDateRange {
  startDate: string;
  endDate: string;
}

export type Granularity = 'monthly' | 'yearly' | 'total';

export interface ISubcategoryTotal {
  name: string;
  total: number;
}

export interface ICategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  subcategories: ISubcategoryTotal[];
}

export interface ICategoryBreakdownData {
  breakdown: ICategoryBreakdown[];
  totalExpense: number;
  totalIncome: number;
}

export interface IMonthlyTotals {
  income: number;
  expense: number;
  net: number;
}

export interface IMonthlyComparisonData {
  current: IMonthlyTotals;
  previousMonth: IMonthlyTotals;
  lastYear: IMonthlyTotals;
  month: number;
  year: number;
}

export interface INetWorthPoint {
  date: string;
  balance: number;
}

export interface IAccountBreakdown {
  accountId: string;
  accountName: string;
  balance: number;
  percentage: number;
}

export interface IAnalyticsFilters {
  dateRange: IDateRange;
  granularity: Granularity;
  category?: string;
}
