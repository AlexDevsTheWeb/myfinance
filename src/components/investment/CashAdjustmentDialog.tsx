import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText, Grid, MenuItem, TextField } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import { validateCashAdjustment } from '../../store/validation';
import type { CashAdjustment } from '../../store/types';

interface CashAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  defaultBrokerId?: string;
}

const CashAdjustmentDialog: React.FC<CashAdjustmentDialogProps> = ({ open, onClose, defaultBrokerId }) => {
  const { t } = useTranslation();
  const { brokerAccounts, addCashAdjustment } = useInvestmentStore();
  const [formData, setFormData] = useState({
    brokerId: defaultBrokerId ?? '',
    amount: '',
    date: dayjs().format('YYYY-MM-DD'),
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        brokerId: defaultBrokerId ?? '',
        amount: '',
        date: dayjs().format('YYYY-MM-DD'),
        notes: '',
      });
      setErrors({});
    }
  }, [open, defaultBrokerId]);

  const handleSubmit = async () => {
    const amount = Number(formData.amount) || 0;
    const adj: CashAdjustment = {
      id: crypto.randomUUID(),
      brokerId: formData.brokerId,
      amount,
      date: formData.date,
      notes: formData.notes || undefined,
    };

    const validation = validateCashAdjustment(adj);
    if (!validation.valid) {
      setErrors({ form: validation.error || 'Invalid input' });
      return;
    }

    setErrors({});
    await addCashAdjustment(adj);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2, backgroundImage: 'none', background: '#1e293b' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('investment.addCashAdjustment')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              select
              label={t('investment.brokerName')}
              variant="filled"
              value={formData.brokerId}
              onChange={(e) => setFormData({ ...formData, brokerId: e.target.value })}
              error={!!errors.brokerId}
            >
              {brokerAccounts.map((ba) => (
                <MenuItem key={ba.id} value={ba.id}>{ba.name}</MenuItem>
              ))}
            </TextField>
            {errors.brokerId && <FormHelperText error>{errors.brokerId}</FormHelperText>}
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label={t('investment.cashAdjustmentAmount')}
              type="number"
              variant="filled"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              slotProps={{ htmlInput: { step: 0.01 } }}
              error={!!errors.amount}
            />
            {errors.amount && <FormHelperText error>{errors.amount}</FormHelperText>}
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label={t('common.date') || 'Date'}
              type="date"
              variant="filled"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.date}
            />
            {errors.date && <FormHelperText error>{errors.date}</FormHelperText>}
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label={t('investment.notes') || 'Notes (optional)'}
              variant="filled"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">{t('common.cancel') || 'Cancel'}</Button>
        <Button onClick={handleSubmit} variant="contained">{t('common.submit') || 'Submit'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CashAdjustmentDialog;
