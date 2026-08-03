/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { validateEtfTransaction } from '../../store/validation';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import EtfTransactionForm from './EtfTransactionForm';
import type { EtfTransactionFormData } from './EtfTransactionForm';
import type { IETFTransaction } from '../../store/types';

interface EtfTransactionModalProps {
  open: boolean;
  onClose: () => void;
  editTransaction?: IETFTransaction | null;
  defaultBrokerId?: string;
}

const EtfTransactionModal: React.FC<EtfTransactionModalProps> = ({ open, onClose, editTransaction, defaultBrokerId }) => {
  const { accounts } = useFinanceStore();
  const { addEtfTransaction, updateEtfTransaction } = useInvestmentStore();
  const defaultAccountId = accounts.find(a => a.isDefault)?.id || accounts[0]?.id || '';
  const isEditMode = !!editTransaction;

  const [formData, setFormData] = useState<EtfTransactionFormData>({
    ticker: '',
    type: 'buy',
    units: '',
    price: '',
    totalAmount: '',
    date: dayjs().format('YYYY-MM-DD'),
    accountId: defaultAccountId,
    brokerId: defaultBrokerId ?? '',
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editTransaction) {
        setFormData({
          ticker: editTransaction.ticker,
          type: editTransaction.type,
          units: editTransaction.units.toString(),
          price: editTransaction.price.toString(),
          totalAmount: editTransaction.totalAmount.toString(),
          date: editTransaction.date,
          accountId: editTransaction.accountId,
          brokerId: editTransaction.brokerId ?? '',
          description: editTransaction.description,
          notes: editTransaction.notes || '',
        });
      } else {
        setFormData({
          ticker: '',
          type: 'buy',
          units: '',
          price: '',
          totalAmount: '',
          date: dayjs().format('YYYY-MM-DD'),
          accountId: defaultAccountId,
          brokerId: defaultBrokerId ?? '',
          description: '',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [open, editTransaction, defaultAccountId, defaultBrokerId]);

  const handleSubmit = async () => {
    const units = Number(formData.units) || 0;
    const price = Number(formData.price) || 0;
    const autoTotal = units * price;

    const tx: Omit<IETFTransaction, 'id'> = {
      ticker: formData.ticker.trim().toUpperCase(),
      type: formData.type,
      units,
      price,
      totalAmount: Number(formData.totalAmount) || autoTotal,
      date: formData.date,
      accountId: formData.accountId,
      brokerId: formData.brokerId || undefined,
      description: formData.description,
      notes: formData.notes || undefined,
    };

    const validation = validateEtfTransaction(tx as IETFTransaction);
    if (!validation.valid) {
      setErrors({ form: validation.error || 'Invalid input' });
      return;
    }

    setErrors({});
    if (editTransaction) {
      await updateEtfTransaction({ ...tx, id: editTransaction.id });
    } else {
      await addEtfTransaction({ ...tx, id: crypto.randomUUID() });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2, backgroundImage: 'none', background: 'background.paper' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{isEditMode ? 'Edit ETF Transaction' : 'Add ETF Transaction'}</DialogTitle>
      <DialogContent>
        <EtfTransactionForm formData={formData} setFormData={setFormData} errors={errors} />
      </DialogContent>
      <DialogActions sx={{ p: 1.5 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EtfTransactionModal;
