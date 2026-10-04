import { Grid, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { BudgetPeriodSummary } from '../../store/types';

interface Props {
  summary: BudgetPeriodSummary;
}

export default function BudgetSummaryCards({ summary }: Props) {
  const { t } = useTranslation();
  const savingsPercent = Math.round(summary.savingsRate * 100);

  const cards = [
    { label: t('budget.totalBudgeted'), value: `€${summary.totalBudgeted.toLocaleString('it-IT')}`, color: 'primary.main' },
    { label: t('budget.totalSpent'), value: `€${summary.totalSpent.toLocaleString('it-IT')}`, color: 'warning.main' },
    { label: t('budget.remaining'), value: `€${Math.max(0, summary.surplus).toLocaleString('it-IT')}`, color: 'success.main' },
    { label: t('budget.savingsRate'), value: `${savingsPercent}%`, color: savingsPercent >= 20 ? 'success.main' : savingsPercent >= 10 ? 'warning.main' : 'error.main', large: true },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid size={{ xs: 6, md: 3 }} key={card.label}>
          <Paper sx={{
            p: card.large ? 3 : 2, borderRadius: 3,
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
          }}>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>{card.label}</Typography>
            <Typography variant={card.large ? 'h4' : 'h6'} sx={{ fontWeight: 800, color: card.color, mt: 0.5 }}>
              {card.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
