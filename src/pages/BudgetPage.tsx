import { useMemo, useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useBudgetStore } from '../store/useBudgetStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { computeBudgetProgress } from '../lib/budgetEngine';
import SavingsRateGauge from '../components/budget/SavingsRateGauge';
import BudgetSummaryCards from '../components/budget/BudgetSummaryCards';
import BulletChart from '../components/budget/BulletChart';
import ComparisonBarChart from '../components/budget/ComparisonBarChart';
import BurnUpLineChart from '../components/budget/BurnUpLineChart';
import BudgetTargetDialog from '../components/budget/BudgetTargetDialog';
import type { BudgetTarget } from '../store/types';

const PERIOD_PRESETS = [
  { labelKey: 'budget.periodMonthly', value: 'monthly' },
  { labelKey: 'budget.periodSemiannual', value: 'semiannual' },
  { labelKey: 'budget.periodAnnual', value: 'annual' },
];

function getDateRange(period: string): { start: string; end: string } {
  const now = dayjs();
  if (period === 'monthly') {
    return { start: now.startOf('month').format('YYYY-MM-DD'), end: now.endOf('month').format('YYYY-MM-DD') };
  }
  if (period === 'semiannual') {
    const halfStart = now.month() < 6 ? now.startOf('year') : now.month(6).startOf('month');
    return { start: halfStart.format('YYYY-MM-DD'), end: halfStart.add(5, 'month').endOf('month').format('YYYY-MM-DD') };
  }
  return { start: now.startOf('year').format('YYYY-MM-DD'), end: now.endOf('year').format('YYYY-MM-DD') };
}

export default function BudgetPage() {
  const { t } = useTranslation();
  const { budgetTargets, addBudgetTarget, updateBudgetTarget, deleteBudgetTarget } = useBudgetStore();
  const { transactions } = useFinanceStore();
  const [periodView, setPeriodView] = useState('monthly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<BudgetTarget | null>(null);

  const dateRange = getDateRange(periodView);

  const { snapshots, summary } = useMemo(
    () => computeBudgetProgress(transactions, budgetTargets, dateRange),
    [transactions, budgetTargets, dateRange],
  );

  const handleSaveTarget = (data: Omit<BudgetTarget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTarget) {
      updateBudgetTarget(editingTarget.id, data);
    } else {
      addBudgetTarget(data);
    }
    setEditingTarget(null);
  };

  const handleEdit = (target: BudgetTarget) => {
    setEditingTarget(target);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{t('budget.title')}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>{t('budget.subtitle')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>{t('budget.period')}</InputLabel>
            <Select value={periodView} onChange={(e) => setPeriodView(e.target.value)} label={t('budget.period')}>
              {PERIOD_PRESETS.map((p) => (
                <MenuItem key={p.value} value={p.value}>{t(p.labelKey)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingTarget(null); setDialogOpen(true); }}>
            {t('budget.addBudget')}
          </Button>
        </Box>
      </Box>

      <SavingsRateGauge rate={summary.savingsRate} />
      <BudgetSummaryCards summary={summary} />

      {budgetTargets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ opacity: 0.6 }}>{t('budget.noTargets')}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.4, mb: 2 }}>{t('budget.noTargetsDescription')}</Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setEditingTarget(null); setDialogOpen(true); }}>
            {t('budget.addFirst')}
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('budget.progressByCategory')}</Typography>
            <BulletChart snapshots={snapshots} />
          </Paper>

          <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('budget.targetVsActual')}</Typography>
            <ComparisonBarChart snapshots={snapshots} />
          </Paper>

          <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('budget.burnUp')}</Typography>
            <BurnUpLineChart transactions={transactions} budgetTargets={budgetTargets} dateRange={dateRange} />
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('budget.budgetTargets')}</Typography>
            {budgetTargets.map((target) => (
              <Box key={target.id} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                p: 1.5, mb: 1, borderRadius: 2,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: target.color }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{target.name || target.category}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>
                      {t(`budget.period${target.period.charAt(0).toUpperCase() + target.period.slice(1)}`)} — €{target.targetAmount.toLocaleString('it-IT')}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="text" onClick={() => handleEdit(target)}>
                    {t('common.edit')}
                  </Button>
                  <Button size="small" variant="text" color="error" onClick={() => deleteBudgetTarget(target.id)}>
                    {t('common.delete')}
                  </Button>
                </Box>
              </Box>
            ))}
          </Paper>
        </>
      )}

      <BudgetTargetDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingTarget(null); }}
        onSave={handleSaveTarget}
        editTarget={editingTarget}
      />
    </Box>
  );
}
