import { ArrowDownward, ArrowUpward, FilterList, ReceiptLong, Search } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CircularProgress, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionTable from '../components/dashboard/TransactionTable';
import TransactionModal from '../components/modals/TransactionModal';
import { useFinanceStore, type Transaction } from '../store/useFinanceStore';
import {
  CategoryPieChart,
  useCategoryBreakdown,
} from '../analytics';

const TransactionsPage: React.FC = () => {
  const { transactions, categories, incomeCategories, isLoading } = useFinanceStore();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [subcategory, setSubcategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const allCategories = useMemo(() => {
    const unique = new Set([...categories.map(c => c.name), ...incomeCategories.map(c => c.name)]);
    return Array.from(unique).sort();
  }, [categories, incomeCategories]);

  const availableSubcategories = useMemo(() => {
    if (category === 'all') return [];
    const catObj = [...categories, ...incomeCategories].find(c => c.name === category);
    return catObj ? catObj.subcategories.sort() : [];
  }, [category, categories, incomeCategories]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search
    if (search) {
      result = result.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
    }

    // Date Range
    if (startDate) {
      result = result.filter(t => dayjs(t.date).isAfter(startDate.subtract(1, 'day')));
    }
    if (endDate) {
      result = result.filter(t => dayjs(t.date).isBefore(endDate.add(1, 'day')));
    }

    // Category
    if (category !== 'all') {
      result = result.filter(t => t.category === category);
    }

    // Subcategory
    if (subcategory !== 'all') {
      result = result.filter(t => t.subcategory === subcategory);
    }

    // Sorting
    result.sort((a, b) => {
      const [field, direction] = sortBy.split('-');
      const isAsc = direction === 'asc';

      if (field === 'date') {
        const dateA = dayjs(a.date).valueOf();
        const dateB = dayjs(b.date).valueOf();
        return isAsc ? dateA - dateB : dateB - dateA;
      }

      if (field === 'category') {
        return isAsc ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
      }

      if (field === 'subcategory') {
        return isAsc ? a.subcategory.localeCompare(b.subcategory) : b.subcategory.localeCompare(a.subcategory);
      }

      if (field === 'amount') {
        return isAsc ? a.amount - b.amount : b.amount - a.amount;
      }

      return 0;
    });

    return result;
  }, [transactions, search, startDate, endDate, category, subcategory, sortBy]);

  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setModalType(transaction.type);
    setModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStartDate(null);
    setEndDate(null);
    setCategory('all');
    setSubcategory('all');
    setSortBy('date-desc');
    setPage(0);
  };

  const transactionDateRange = React.useMemo(() => ({
    startDate: transactions.length > 0
      ? dayjs(Math.min(...transactions.map(t => new Date(t.date).getTime()))).format('YYYY-MM-DD')
      : dayjs().startOf('year').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  }), [transactions]);

  const transactionFilters = React.useMemo(() => ({
    dateRange: transactionDateRange,
    granularity: 'total' as const,
  }), [transactionDateRange]);

  const spendingData = useCategoryBreakdown(transactionFilters);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
      <Box sx={{ pb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <ReceiptLong sx={{ fontSize: 40, color: 'primary.main' }} />
            Transactions
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Browse and filter your entire transaction history.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 0, background: 'rgba(17, 24, 39, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('transactions.filters.title')}</Typography>
                  <Button size="small" variant="outlined" startIcon={<FilterList />} onClick={handleClearFilters} sx={{ borderRadius: 2 }}>
                    Clear
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Search Description"
                      variant="outlined"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search sx={{ opacity: 0.5 }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                      label="From"
                      value={startDate}
                      onChange={(newValue: Dayjs | null) => setStartDate(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                      label="To"
                      value={endDate}
                      onChange={(newValue: Dayjs | null) => setEndDate(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>{t('transactions.filters.category')}</InputLabel>
                      <Select
                        value={category}
                        label={t('transactions.filters.category')}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setSubcategory('all');
                        }}
                      >
                        <MenuItem value="all">{t('transactions.filters.allCategories')}</MenuItem>
                        {allCategories.map(cat => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth disabled={category === 'all'}>
                      <InputLabel>{t('transactions.filters.subcategory')}</InputLabel>
                      <Select
                        value={subcategory}
                        label={t('transactions.filters.subcategory')}
                        onChange={(e) => setSubcategory(e.target.value)}
                      >
                        <MenuItem value="all">{t('transactions.filters.allSubcategories')}</MenuItem>
                        {availableSubcategories.map(sub => (
                          <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1, opacity: 0.5 }}>{t('transactions.filters.sortBy')}</Typography>
                      {[
                        { val: 'date-desc', label: 'Date', icon: <ArrowDownward sx={{ fontSize: 16 }} /> },
                        { val: 'date-asc', label: 'Date', icon: <ArrowUpward sx={{ fontSize: 16 }} /> },
                        { val: 'amount-desc', label: 'Amount', icon: <ArrowDownward sx={{ fontSize: 16 }} /> },
                        { val: 'amount-asc', label: 'Amount', icon: <ArrowUpward sx={{ fontSize: 16 }} /> },
                      ].map((s) => (
                        <Button
                          key={s.val}
                          size="small"
                          variant={sortBy === s.val ? 'contained' : 'outlined'}
                          onClick={() => setSortBy(s.val)}
                          startIcon={s.icon}
                          sx={{ borderRadius: 4, textTransform: 'none' }}
                        >
                          {s.label}
                        </Button>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ mt: 3 }}>
              <CategoryPieChart
                data={spendingData.breakdown}
                title="Spending by Category"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <TransactionTable
              onEdit={handleEditTransaction}
              customData={paginatedTransactions}
              limit={'no'}
              count={filteredTransactions.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
            />
          </Grid>
        </Grid>

        <TransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          transaction={transactionToEdit}
        />
      </Box>
  );
};

export default TransactionsPage;
