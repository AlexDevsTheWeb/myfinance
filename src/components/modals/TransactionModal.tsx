import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { Transaction } from '../../store/useFinanceStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import TransactionForm from '../forms/TransactionForm';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  type: 'income' | 'expense' | 'transfer';
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
    consumption: '',
    readingDateStart: '',
    readingDateEnd: '',
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
          consumption: transaction.consumption?.toString() || '',
          readingDateStart: transaction.readingDateStart || '',
          readingDateEnd: transaction.readingDateEnd || '',
        });
      } else {
        setFormData({
          date: dayjs().format('YYYY-MM-DD'),
          description: '',
          category: '',
          subcategory: '',
          amount: '',
          accountId: accounts.find(a => a.isDefault)?.id || accounts[0]?.id || '',
          consumption: '',
          readingDateStart: '',
          readingDateEnd: '',
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
        consumption: formData.consumption !== '' ? Number(formData.consumption) : undefined,
        readingDateStart: formData.readingDateStart || undefined,
        readingDateEnd: formData.readingDateEnd || undefined,
      });
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        ...formData,
        amount: Number(formData.amount),
        type,
        accountId: formData.accountId,
        consumption: formData.consumption !== '' ? Number(formData.consumption) : undefined,
        readingDateStart: formData.readingDateStart || undefined,
        readingDateEnd: formData.readingDateEnd || undefined,
      };
      addTransaction(newTransaction);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2, backgroundImage: 'none', background: 'background.paper' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {transaction ? 'Edit' : 'New'} {type === 'income' ? 'Income' : type === 'transfer' ? 'Transfer' : 'Expense'}
      </DialogTitle>
      <DialogContent>
        <TransactionForm
          type={type}
          formData={formData}
          setFormData={setFormData}
        />
      </DialogContent>
      <DialogActions sx={{ p: 1.5 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={type === 'income' ? 'success' : type === 'transfer' ? 'info' : 'error'}
          disabled={!formData.amount || !formData.category || !formData.subcategory || !formData.accountId}
        >
          {transaction ? 'Update' : 'Add'} {type === 'income' ? 'Income' : type === 'transfer' ? 'Transfer' : 'Expense'}
        </Button>
      </DialogActions>
    </Dialog >
  );
};

export default TransactionModal;
