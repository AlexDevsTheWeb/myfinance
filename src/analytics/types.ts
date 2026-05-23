export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export type Granularity = 'monthly' | 'yearly' | 'total';

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  subcategories: { name: string; total: number }[];
}

export interface CategoryBreakdownData {
  breakdown: CategoryBreakdown[];
  totalExpense: number;
  totalIncome: number;
}

export interface MonthlyComparisonData {
  current: { income: number; expense: number; net: number };
  previousMonth: { income: number; expense: number; net: number };
  lastYear: { income: number; expense: number; net: number };
  month: number;
  year: number;
}

export interface NetWorthPoint {
  date: string;
  balance: number;
}

export interface AccountBreakdown {
  accountId: string;
  accountName: string;
  balance: number;
  percentage: number;
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  granularity: Granularity;
  category?: string;
}
