import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import type { Transaction } from '../../store/useFinanceStore';
import { useFinanceStore } from '../../store/useFinanceStore';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  transaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ open, onClose, type, transaction }) => {
  const { categories, incomeCategories, addTransaction, updateTransaction, transactions } = useFinanceStore();

  const currentCategories = type === 'income' ? incomeCategories : categories;

  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    description: '',
    category: '',
    subcategory: '',
    amount: '',
  });

  // Unique descriptions for suggestions based on current type
  const descriptionOptions = useMemo(() => {
    const unique = new Set(
      transactions
        .filter(t => t.type === type)
        .map(t => t.description)
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [transactions, type]);

  // Flat list of subcategories with their parent category
  const subcategoryOptions = useMemo(() => {
    const options: { subcategory: string; category: string }[] = [];
    currentCategories.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        options.push({ subcategory: sub, category: cat.name });
      });
    });
    return options.sort((a, b) => a.subcategory.localeCompare(b.subcategory));
  }, [currentCategories]);

  // Reset or populate form data when the modal opens or transaction changes
  useEffect(() => {
    if (open) {
      if (transaction) {
        setFormData({
          date: transaction.date,
          description: transaction.description,
          category: transaction.category,
          subcategory: transaction.subcategory,
          amount: transaction.amount.toString(),
        });
      } else {
        setFormData({
          date: dayjs().format('YYYY-MM-DD'),
          description: '',
          category: '',
          subcategory: '',
          amount: '',
        });
      }
    }
  }, [open, transaction]);

  const handleSubmit = () => {
    if (transaction) {
      updateTransaction({
        ...transaction,
        ...formData,
        amount: Number(formData.amount),
        type,
      });
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        ...formData,
        amount: Number(formData.amount),
        type,
      };
      addTransaction(newTransaction);
    }
    onClose();
  };

  const selectedOption = subcategoryOptions.find(
    (opt) => opt.subcategory === formData.subcategory && opt.category === formData.category
  ) || null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, backgroundImage: 'none', background: '#1e293b' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {transaction ? 'Edit' : 'New'} {type === 'income' ? 'Income' : 'Expense'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                fullWidth
                freeSolo
                options={descriptionOptions}
                value={formData.description}
                onInputChange={(_, newInputValue) => {
                  setFormData({ ...formData, description: newInputValue });
                }}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue === 'string') {
                    // Try to find the most recent transaction with this description to auto-fill category/subcategory
                    const matchingTx = [...transactions]
                      .filter(t => t.type === type && t.description === newValue)
                      .sort((a, b) => b.date.localeCompare(a.date))[0];

                    if (matchingTx) {
                      setFormData({
                        ...formData,
                        description: newValue,
                        category: matchingTx.category,
                        subcategory: matchingTx.subcategory,
                      });
                    }
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Description"
                    placeholder="e.g. Salary, Rent, Grocery"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 7 }}>
              <Autocomplete
                options={subcategoryOptions}
                getOptionLabel={(option) => option.subcategory}
                value={selectedOption}
                onChange={(_, newValue) => {
                  if (newValue) {
                    setFormData({ ...formData, subcategory: newValue.subcategory, category: newValue.category });
                  } else {
                    setFormData({ ...formData, subcategory: '', category: '' });
                  }
                }}
                groupBy={(option) => option.category}
                renderInput={(params) => (
                  <TextField {...params} label="Search Subcategory" placeholder="Type to search..." />
                )}
                renderOption={(props, option) => {
                  const { key, ...rest } = props as any;
                  return (
                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="body1">{option.subcategory}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.5 }}>{option.category}</Typography>
                    </Box>
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 5 }}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input.Mui-readOnly': { opacity: 0.7 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>€</Typography> }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={type === 'income' ? 'success' : 'error'}
          disabled={!formData.amount || !formData.category || !formData.subcategory}
        >
          {transaction ? 'Update' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionModal;
