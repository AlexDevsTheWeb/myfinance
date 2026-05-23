# Analytics Charts — Branch 1: Shared Analytics Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create shared analytics hooks and chart components that can be consumed by any page

**Architecture:** New `src/analytics/` directory with 4 data hooks (reading from `useFinanceStore`) and 6 chart components (rendering Recharts). Each hook accepts filter parameters and returns chart-ready data. Components are pure presentational.

**Tech Stack:** React, TypeScript, Recharts v3.8.x, MUI v9, dayjs

**Branch:** `feat/37-analytics-layer`

---

### Task 1: Create analytics types

**Files:**
- Create: `src/analytics/types.ts`

- [ ] **Step 1: Write the types file**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/types.ts
git commit -m "feat(analytics): add analytics types"
```

---

### Task 2: Create useCategoryBreakdown hook

**Files:**
- Create: `src/analytics/hooks/useCategoryBreakdown.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { CategoryBreakdownData, AnalyticsFilters } from '../types';

export function useCategoryBreakdown(filters: AnalyticsFilters): CategoryBreakdownData {
  const { transactions, categories } = useFinanceStore();

  return useMemo(() => {
    const { dateRange, granularity, category } = filters;
    const start = dayjs(dateRange.startDate);
    const end = dayjs(dateRange.endDate);

    let filtered = transactions.filter(t => {
      const d = dayjs(t.date);
      return d.isAfter(start.subtract(1, 'day')) && d.isBefore(end.add(1, 'day'));
    });

    // Only expenses for spending breakdown
    let expenseTransactions = filtered.filter(t => t.type === 'expense');
    const incomeTransactions = filtered.filter(t => t.type === 'income');

    // Optional category filter
    if (category) {
      expenseTransactions = expenseTransactions.filter(t => t.category === category);
    }

    // Group by category
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
  }, [transactions, filters, categories]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/hooks/useCategoryBreakdown.ts
git commit -m "feat(analytics): add useCategoryBreakdown hook"
```

---

### Task 3: Create useMonthlyComparison hook

**Files:**
- Create: `src/analytics/hooks/useMonthlyComparison.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { MonthlyComparisonData } from '../types';

export function useMonthlyComparison(month: number, year: number): MonthlyComparisonData {
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
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/hooks/useMonthlyComparison.ts
git commit -m "feat(analytics): add useMonthlyComparison hook"
```

---

### Task 4: Create useNetWorth hook

**Files:**
- Create: `src/analytics/hooks/useNetWorth.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { NetWorthPoint, DateRange } from '../types';

export function useNetWorth(dateRange: DateRange): NetWorthPoint[] {
  const { transactions, initialBalance, balanceStartDate } = useFinanceStore();

  return useMemo(() => {
    const start = dayjs(dateRange.startDate);
    const end = dayjs(dateRange.endDate);

    // Sort all transactions up to end date
    const allTx = [...transactions]
      .filter(t => dayjs(t.date).isBefore(end.add(1, 'day')))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate balance at start date
    let runningBalance = initialBalance;
    allTx.forEach(t => {
      const tDate = dayjs(t.date);
      if (tDate.isBefore(start)) {
        const isAfterBalanceStart = tDate.isAfter(dayjs(balanceStartDate).subtract(1, 'day'));
        if (t.type === 'income' && isAfterBalanceStart) runningBalance += t.amount;
        else if (t.type === 'expense') runningBalance -= t.amount;
      }
    });

    // Build monthly points
    const points: NetWorthPoint[] = [];
    let cursor = start.startOf('month');
    while (cursor.isBefore(end) || cursor.isSame(end, 'month')) {
      const monthEnd = cursor.endOf('month');
      const monthTx = allTx.filter(t => {
        const d = dayjs(t.date);
        return d.isAfter(start.subtract(1, 'day')) && d.isBefore(monthEnd.add(1, 'day'));
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
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/hooks/useNetWorth.ts
git commit -m "feat(analytics): add useNetWorth hook"
```

---

### Task 5: Create useAccountBreakdown hook

**Files:**
- Create: `src/analytics/hooks/useAccountBreakdown.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { AccountBreakdown } from '../types';

export function useAccountBreakdown(): AccountBreakdown[] {
  const { transactions, accounts, initialBalance, balanceStartDate } = useFinanceStore();

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
  }, [transactions, accounts, initialBalance, balanceStartDate]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/hooks/useAccountBreakdown.ts
git commit -m "feat(analytics): add useAccountBreakdown hook"
```

---

### Task 6: Create hooks barrel export

**Files:**
- Create: `src/analytics/hooks/index.ts`

- [ ] **Step 1: Write barrel export**

```ts
export { useCategoryBreakdown } from './useCategoryBreakdown';
export { useMonthlyComparison } from './useMonthlyComparison';
export { useNetWorth } from './useNetWorth';
export { useAccountBreakdown } from './useAccountBreakdown';
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/hooks/index.ts
git commit -m "chore(analytics): add hooks barrel export"
```

---

### Task 7: Create CategoryPieChart component

**Files:**
- Create: `src/analytics/components/CategoryPieChart.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Box, Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategoryBreakdown } from '../types';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4',
  '#84cc16', '#d946ef',
];

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
  title?: string;
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, title }) => {
  const chartData = data.map(d => ({
    name: d.category,
    value: d.total,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 320, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#161b2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
              }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: number) => `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: string) => (
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default CategoryPieChart;
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/components/CategoryPieChart.tsx
git commit -m "feat(analytics): add CategoryPieChart component"
```

---

### Task 8: Create CategoryBarChart component

**Files:**
- Create: `src/analytics/components/CategoryBarChart.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Box, Paper, Typography } from '@mui/material';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoryBreakdown } from '../types';

interface CategoryBarChartProps {
  data: CategoryBreakdown[];
  title?: string;
}

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data, title }) => {
  const chartData = data.map(d => ({
    name: d.category,
    amount: d.total,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 320, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `€${v.toLocaleString()}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#161b2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
              }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: number) => `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default CategoryBarChart;
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/components/CategoryBarChart.tsx
git commit -m "feat(analytics): add CategoryBarChart component"
```

---

### Task 9: Create MonthlyComparisonChart component

**Files:**
- Create: `src/analytics/components/MonthlyComparisonChart.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Box, Paper, Typography } from '@mui/material';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import type { MonthlyComparisonData } from '../types';

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonData;
  title?: string;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ data, title }) => {
  const chartData = [
    {
      name: 'Income',
      current: data.current.income,
      previous: data.previousMonth.income,
      lastYear: data.lastYear.income,
    },
    {
      name: 'Expense',
      current: data.current.expense,
      previous: data.previousMonth.expense,
      lastYear: data.lastYear.expense,
    },
    {
      name: 'Net',
      current: data.current.net,
      previous: data.previousMonth.net,
      lastYear: data.lastYear.net,
    },
  ];

  const monthLabel = months[data.month];

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Typography variant="body2" sx={{ opacity: 0.6, mb: 2 }}>
        {monthLabel} {data.year} vs Prev Month vs {monthLabel} {data.year - 1}
      </Typography>
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `€${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: '#161b2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
              }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: number) => `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar dataKey="current" name={`${monthLabel} ${data.year}`} fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="previous" name={`Prev Month`} fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lastYear" name={`${monthLabel} ${data.year - 1}`} fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default MonthlyComparisonChart;
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/components/MonthlyComparisonChart.tsx
git commit -m "feat(analytics): add MonthlyComparisonChart component"
```

---

### Task 10: Create NetWorthChart component

**Files:**
- Create: `src/analytics/components/NetWorthChart.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Box, Paper, Typography } from '@mui/material';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { NetWorthPoint } from '../types';

interface NetWorthChartProps {
  data: NetWorthPoint[];
  title?: string;
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ data, title }) => {
  const isPositive = data.length > 0 && data[data.length - 1].balance >= 0;

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `€${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: '#161b2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
              }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: number) => `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default NetWorthChart;
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/components/NetWorthChart.tsx
git commit -m "feat(analytics): add NetWorthChart component"
```

---

### Task 11: Create AccountBreakdownChart component

**Files:**
- Create: `src/analytics/components/AccountBreakdownChart.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Box, Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { AccountBreakdown } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

interface AccountBreakdownChartProps {
  data: AccountBreakdown[];
  title?: string;
}

const AccountBreakdownChart: React.FC<AccountBreakdownChartProps> = ({ data, title }) => {
  const chartData = data.map(d => ({
    name: d.accountName,
    value: d.balance,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#161b2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
              }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: number) => `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: string) => (
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default AccountBreakdownChart;
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/components/AccountBreakdownChart.tsx
git commit -m "feat(analytics): add AccountBreakdownChart component"
```

---

### Task 12: Create AnalyticsFilters component

**Files:**
- Create: `src/analytics/components/AnalyticsFilters.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Box, Button, FormControl, InputLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import type { Granularity } from '../types';

interface AnalyticsFiltersProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  granularity: Granularity;
  category?: string;
  categories?: string[];
  onStartDateChange: (d: Dayjs | null) => void;
  onEndDateChange: (d: Dayjs | null) => void;
  onGranularityChange: (g: Granularity) => void;
  onCategoryChange?: (c: string) => void;
  onClear?: () => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  startDate, endDate, granularity, category, categories,
  onStartDateChange, onEndDateChange, onGranularityChange,
  onCategoryChange, onClear,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
        <DatePicker
          label="From"
          value={startDate}
          onChange={(v) => onStartDateChange(v)}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
        />
        <DatePicker
          label="To"
          value={endDate}
          onChange={(v) => onEndDateChange(v)}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
        />

        <ToggleButtonGroup
          value={granularity}
          exclusive
          onChange={(_, val) => val && onGranularityChange(val)}
          size="small"
        >
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="yearly">Yearly</ToggleButton>
          <ToggleButton value="total">Total</ToggleButton>
        </ToggleButtonGroup>

        {categories && onCategoryChange && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category || 'all'}
              label="Category"
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {onClear && (
          <Button size="small" variant="outlined" onClick={onClear} sx={{ borderRadius: 2 }}>
            Clear
          </Button>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsFilters;
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/components/AnalyticsFilters.tsx
git commit -m "feat(analytics): add AnalyticsFilters component"
```

---

### Task 13: Create components barrel export

**Files:**
- Create: `src/analytics/components/index.ts`

- [ ] **Step 1: Write barrel export**

```ts
export { default as CategoryPieChart } from './CategoryPieChart';
export { default as CategoryBarChart } from './CategoryBarChart';
export { default as MonthlyComparisonChart } from './MonthlyComparisonChart';
export { default as NetWorthChart } from './NetWorthChart';
export { default as AccountBreakdownChart } from './AccountBreakdownChart';
export { default as AnalyticsFilters } from './AnalyticsFilters';
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/components/index.ts
git commit -m "chore(analytics): add components barrel export"
```

---

### Task 14: Create analytics barrel export

**Files:**
- Create: `src/analytics/index.ts`

- [ ] **Step 1: Write barrel export**

```ts
export * from './types';
export * from './hooks';
export * from './components';
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/index.ts
git commit -m "chore(analytics): add analytics barrel export"
```

---

### Task 15: Verify build

**Files:**
- None (verification)

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: If there are errors, fix them, then recommit**

```bash
git add -A
git commit -m "fix(analytics): resolve build issues"
```

---
