import { ArrowDownward, ArrowUpward, FilterList, ReceiptLong, Search } from '@mui/icons-material';
import { Box, Button, Card, CardContent, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import TransactionTable from '../components/dashboard/TransactionTable';
import TransactionModal from '../components/modals/TransactionModal';
import { useFinanceStore, type Transaction } from '../store/useFinanceStore';

const TransactionsPage: React.FC = () => {
  const { transactions, categories, incomeCategories } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [subcategory, setSubcategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

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
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ pb: 6 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ReceiptLong sx={{ fontSize: 40, color: 'primary.main' }} />
              Transactions
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.6 }}>
              Browse and filter your entire transaction history.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<FilterList />} onClick={handleClearFilters} sx={{ borderRadius: 2 }}>
            Clear Filters
          </Button>
        </Box>

        <Card sx={{ mb: 4, borderRadius: 4, background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Search Description"
                  variant="outlined"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ opacity: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <DatePicker
                  label="From"
                  value={startDate}
                  onChange={(newValue: Dayjs | null) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <DatePicker
                  label="To"
                  value={endDate}
                  onChange={(newValue: Dayjs | null) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubcategory('all');
                    }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {allCategories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth disabled={category === 'all'}>
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    value={subcategory}
                    label="Subcategory"
                    onChange={(e) => setSubcategory(e.target.value)}
                  >
                    <MenuItem value="all">All Subcategories</MenuItem>
                    {availableSubcategories.map(sub => (
                      <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1, opacity: 0.5 }}>Sort by:</Typography>
                  {[
                    { val: 'date-desc', label: 'Date', icon: <ArrowDownward sx={{ fontSize: 16 }} /> },
                    { val: 'date-asc', label: 'Date', icon: <ArrowUpward sx={{ fontSize: 16 }} /> },
                    { val: 'amount-desc', label: 'Amount', icon: <ArrowDownward sx={{ fontSize: 16 }} /> },
                    { val: 'amount-asc', label: 'Amount', icon: <ArrowUpward sx={{ fontSize: 16 }} /> },
                    { val: 'category-asc', label: 'Category', icon: <ArrowUpward sx={{ fontSize: 16 }} /> },
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

        {/* We use a slightly modified version of the table or just wrap it */}
        <Box sx={{ mt: 2 }}>
          {/* Overriding the store usage in TransactionTable via local filtration */}
          {/* For simplicity, let's keep it as is and I might need to make TransactionTable more generic if I want to pass filtered data */}
          {/* Actually, let's update TransactionTable to accept data as prop optionally */}
          <TransactionTable onEdit={handleEditTransaction} customData={filteredTransactions} />
        </Box>

        <TransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          transaction={transactionToEdit}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default TransactionsPage;
