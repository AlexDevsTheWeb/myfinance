import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface AnalysisTablesProps {
  selectedYear: number;
}

const AnalysisTables: React.FC<AnalysisTablesProps> = ({ selectedYear }) => {
  const { transactions, initialBalance, balanceStartDate, categories, incomeCategories } = useFinanceStore();

  const monthNames = useMemo(() => Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM')), []);

  // Data for Table 1: Financial Summary (Income, Expense, Net, Balance)
  const summaryData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const allTransactions = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const startOfSelectedYear = dayjs(`${selectedYear}-01-01`);

    let runningBalance = initialBalance;
    allTransactions.forEach(t => {
      const tDate = dayjs(t.date);
      if (tDate.isBefore(startOfSelectedYear)) {
        const isAfterStart = tDate.isAfter(dayjs(balanceStartDate).subtract(1, 'day'));
        if (t.type === 'income' && isAfterStart) runningBalance += t.amount;
        else if (t.type === 'expense') runningBalance -= t.amount;
      }
    });

    const monthlyMetrics = months.map(m => {
      const monthTransactions = allTransactions.filter(t =>
        dayjs(t.date).year() === selectedYear && dayjs(t.date).month() === m
      );

      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const net = income - expense;

      monthTransactions.forEach(t => {
        const isAfterStart = dayjs(t.date).isAfter(dayjs(balanceStartDate).subtract(1, 'day'));
        if (t.type === 'income' && isAfterStart) runningBalance += t.amount;
        else if (t.type === 'expense') runningBalance -= t.amount;
      });

      return { income, expense, net, balance: runningBalance };
    });

    return monthlyMetrics;
  }, [transactions, selectedYear, initialBalance, balanceStartDate]);

  // Data for Table 2 & 3: Category Summaries
  const getCategoryData = (type: 'income' | 'expense') => {
    const cats = type === 'income' ? incomeCategories : categories;
    return cats.map(cat => {
      const monthlySums = Array.from({ length: 12 }, (_, m) => {
        return transactions
          .filter(t => t.type === type && t.category === cat.name && dayjs(t.date).year() === selectedYear && dayjs(t.date).month() === m)
          .reduce((sum, t) => sum + t.amount, 0);
      });
      const total = monthlySums.reduce((sum, val) => sum + val, 0);
      return { name: cat.name, monthlySums, total, average: total / 12 };
    }).filter(c => c.total > 0);
  };

  // const incomeCategoryData = useMemo(() => getCategoryData('income'), [incomeCategories, transactions, selectedYear]);
  // const expenseCategoryData = useMemo(() => getCategoryData('expense'), [categories, transactions, selectedYear]);

  const incomeCategoryData = getCategoryData('income');
  const expenseCategoryData = getCategoryData('expense');

  const renderTable = (title: string, data: any[], rows: { label: string; key: string, color?: string }[]) => (
    <Paper>
      <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: 'rgba(255,255,255,0.05)' }}>
              <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Metric</TableCell>
              {monthNames.map(m => <TableCell key={m} align="right" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{m}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => {
              if (row.key === 'separator') return <TableRow key={idx} sx={{ height: 10, background: 'rgba(255,255,255,0.02)' }}><TableCell colSpan={13} /></TableRow>;
              return (
                <TableRow key={row.key} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ fontWeight: 600, color: row.color || 'inherit' }}>{row.label}</TableCell>
                  {data.map((m, i) => (
                    <TableCell key={i} align="right" sx={{ color: row.color || 'inherit', fontWeight: row.key === 'balance' ? 700 : 400 }}>
                      € {m[row.key].toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>

  );

  const renderCategoryTable = (title: string, data: any[]) => (
    <Paper>
      <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: 'rgba(255,255,255,0.05)' }}>
              <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Category</TableCell>
              {monthNames.map(m => <TableCell key={m} align="right" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{m}</TableCell>)}
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>Avg</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(cat => (
              <TableRow key={cat.name} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                <TableCell sx={{ fontWeight: 600 }}>{cat.name}</TableCell>
                {cat.monthlySums.map((sum: number, i: number) => (
                  <TableCell key={i} align="right" sx={{ opacity: sum > 0 ? 1 : 0.3 }}>
                    € {sum.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.light' }}>
                  € {cat.average.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.light' }}>
                  € {cat.total.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {renderTable('Financial Summary', summaryData, [
        { label: 'Income', key: 'income', color: 'success.main' },
        { label: 'Expenses', key: 'expense', color: 'error.main' },
        { label: '', key: 'separator' },
        { label: 'Net Savings', key: 'net', color: 'warning.main' },
        { label: 'Final Balance', key: 'balance', color: 'primary.main' },
      ])}

      {/* <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          {renderCategoryTable('Income by Category', incomeCategoryData)}
          {renderCategoryTable('Expenses by Category', expenseCategoryData)}
        </Grid>
      </Grid> */}
      {renderCategoryTable('Income by Category', incomeCategoryData)}
      {renderCategoryTable('Expenses by Category', expenseCategoryData)}
    </Box>
  );
};

export default AnalysisTables;
