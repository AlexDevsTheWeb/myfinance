import { Box, Grid, Paper, Typography } from '@mui/material';
import { TrendingUp, AccountBalance, Receipt } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ProjectionSummaryProps {
  finalCapital: number | null;
  totalInterests: number | null;
  estimatedTaxes: number | null;
  showRealValue?: boolean;
  realFinalCapital?: number | null;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v);

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 800, color }}>
      {value}
    </Typography>
  </Paper>
);

const ProjectionSummary: React.FC<ProjectionSummaryProps> = ({
  finalCapital,
  totalInterests,
  estimatedTaxes,
  showRealValue,
  realFinalCapital,
}) => {
  const { t } = useTranslation();
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MetricCard
          icon={<AccountBalance />}
          label={t('projections.finalCapital')}
          value={finalCapital !== null ? formatCurrency(finalCapital) : '\u2014'}
          color="#5b6cb8"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MetricCard
          icon={<TrendingUp />}
          label={t('projections.totalInterests')}
          value={totalInterests !== null ? formatCurrency(totalInterests) : '\u2014'}
          color={totalInterests && totalInterests > 0 ? '#10b981' : 'inherit'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MetricCard
          icon={<Receipt />}
          label={t('projections.estimatedTaxes')}
          value={estimatedTaxes !== null ? formatCurrency(estimatedTaxes) : '\u2014'}
          color="#ef4444"
        />
      </Grid>
      {showRealValue && realFinalCapital != null && (
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            icon={<AccountBalance />}
            label={t('projections.realFinalCapital')}
            value={formatCurrency(realFinalCapital!)}
            color="#ef4444"
          />
        </Grid>
      )}
    </Grid>
  );
};

export default ProjectionSummary;
