import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { BudgetTarget } from '../../store/types';

const PERIOD_OPTIONS: { value: BudgetTarget['period']; labelKey: string }[] = [
  { value: 'monthly', labelKey: 'budget.periodMonthly' },
  { value: 'semiannual', labelKey: 'budget.periodSemiannual' },
  { value: 'annual', labelKey: 'budget.periodAnnual' },
];

const PRESET_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<BudgetTarget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editTarget?: BudgetTarget | null;
}

export default function BudgetTargetDialog({ open, onClose, onSave, editTarget }: Props) {
  const { t } = useTranslation();
  const { categories } = useFinanceStore();
  const [category, setCategory] = useState('');
  const [period, setPeriod] = useState<BudgetTarget['period']>('monthly');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (editTarget) {
      setCategory(editTarget.category);
      setPeriod(editTarget.period);
      setTargetAmount(editTarget.targetAmount);
      setColor(editTarget.color);
      setName(editTarget.name ?? '');
    } else {
      setCategory(categories[0]?.name ?? '');
      setPeriod('monthly');
      setTargetAmount(0);
      setColor(PRESET_COLORS[0]);
      setName('');
    }
  }, [editTarget, open, categories]);

  const handleSave = () => {
    if (!category || targetAmount <= 0) return;
    onSave({ category, period, targetAmount, color, name: name || undefined });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { background: '#1e293b', borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editTarget ? t('budget.editBudget') : t('budget.addBudget')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label={t('budget.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>{t('budget.category')}</InputLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} label={t('budget.category')}>
              {categories.map((c) => (
                <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>{t('budget.period')}</InputLabel>
            <Select value={period} onChange={(e) => setPeriod(e.target.value as BudgetTarget['period'])} label={t('budget.period')}>
              {PERIOD_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('budget.targetAmount')}
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(Number(e.target.value))}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0, step: 10 } }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {PRESET_COLORS.map((c) => (
              <Box key={c} onClick={() => setColor(c)} sx={{
                width: 28, height: 28, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                border: color === c ? '2px solid white' : '2px solid transparent',
                transition: 'border 0.2s',
              }} />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 1.5 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.6)' }}>{t('common.cancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={!category || targetAmount <= 0}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
