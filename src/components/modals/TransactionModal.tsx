import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { Transaction } from '../../store/useFinanceStore';
import { useFinanceStore } from '../../store/useFinanceStore';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  transaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ open, onClose, type, transaction }) => {
  const { categories, incomeCategories, addTransaction, updateTransaction } = useFinanceStore();

  const currentCategories = type === 'income' ? incomeCategories : categories;

  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    description: '',
    category: '',
    subcategory: '',
    amount: '',
  });

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

  const selectedCategoryObj = currentCategories.find(c => c.name === formData.category);

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
              <TextField
                fullWidth
                label="Description"
                placeholder="e.g. Salary, Rent, Grocery"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
              >
                {(currentCategories || []).map((cat) => (
                  <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                select
                label="Subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                disabled={!formData.category}
              >
                {(selectedCategoryObj?.subcategories || []).map((sub) => (
                  <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                ))}
              </TextField>
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
