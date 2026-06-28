import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
  rate: number;
}

function getRateColor(rate: number): string {
  if (rate >= 0.2) return '#22c55e';
  if (rate >= 0.1) return '#f59e0b';
  return '#ef4444';
}

export default function SavingsRateGauge({ rate }: Props) {
  const { t } = useTranslation();
  const percent = Math.round(rate * 100);
  const color = getRateColor(rate);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1 }}>
        {t('budget.savingsRate')}
      </Typography>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={Math.min(percent, 100)}
          size={120}
          thickness={6}
          sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
        />
        <Box sx={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color }}>
            {percent}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
