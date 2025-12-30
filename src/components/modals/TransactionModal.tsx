import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { Transaction } from '../../store/useFinanceStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import TransactionForm from '../forms/TransactionForm';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  transaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ open, onClose, type, transaction }) => {
  const { addTransaction, updateTransaction, accounts } = useFinanceStore();

  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    description: '',
    category: '',
    subcategory: '',
    amount: '',
    accountId: '',
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
          accountId: transaction.accountId,
        });
      } else {
        setFormData({
          date: dayjs().format('YYYY-MM-DD'),
          description: '',
          category: '',
          subcategory: '',
          amount: '',
          accountId: accounts.find(a => a.isDefault)?.id || accounts[0]?.id || '',
        });
      }
    }
  }, [open, transaction, accounts]);

  const handleSubmit = () => {
    if (transaction) {
      updateTransaction({
        ...transaction,
        ...formData,
        amount: Number(formData.amount),
        type,
        accountId: formData.accountId,
      });
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        ...formData,
        amount: Number(formData.amount),
        type,
        accountId: formData.accountId,
      };
      addTransaction(newTransaction);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, backgroundImage: 'none', background: '#1e293b' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {transaction ? 'Edit' : 'New'} {type === 'income' ? 'Income' : 'Expense'}
      </DialogTitle>
      <DialogContent>
        <TransactionForm
          type={type}
          formData={formData}
          setFormData={setFormData}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={type === 'income' ? 'success' : 'error'}
          disabled={!formData.amount || !formData.category || !formData.subcategory || !formData.accountId}
        >
          {transaction ? 'Update' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
        </Button>
      </DialogActions>
    </Dialog >
  );
};

export default TransactionModal;
