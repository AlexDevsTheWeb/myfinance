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
  defaultBrokerId?: string;
}

const EtfTransactionModal: React.FC<EtfTransactionModalProps> = ({ open, onClose }) => {
  const { accounts } = useFinanceStore();
  const { addEtfTransaction } = useInvestmentStore();
  const defaultAccountId = accounts.find(a => a.isDefault)?.id || accounts[0]?.id || '';

  const [formData, setFormData] = useState<EtfTransactionFormData>({
    ticker: '',
    type: 'buy',
    units: '',
    price: '',
    totalAmount: '',
    date: dayjs().format('YYYY-MM-DD'),
    accountId: defaultAccountId,
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        ticker: '',
        type: 'buy',
        units: '',
        price: '',
        totalAmount: '',
        date: dayjs().format('YYYY-MM-DD'),
        accountId: defaultAccountId,
        description: '',
        notes: '',
      });
      setErrors({});
    }
  }, [open, defaultAccountId]);

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
      description: formData.description,
      notes: formData.notes || undefined,
    };

    const validation = validateEtfTransaction(tx as IETFTransaction);
    if (!validation.valid) {
      setErrors({ form: validation.error || 'Invalid input' });
      return;
    }

    setErrors({});
    await addEtfTransaction({ ...tx, id: crypto.randomUUID() });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2, backgroundImage: 'none', background: '#1e293b' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Add ETF Transaction</DialogTitle>
      <DialogContent>
        <EtfTransactionForm formData={formData} setFormData={setFormData} errors={errors} />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EtfTransactionModal;
