import { Card, CardContent, Grid, Typography } from '@mui/material';

interface PortfolioStatsProps {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  isPositive: boolean;
}

const formatEur = (v: number) => `€${v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PortfolioStats: React.FC<PortfolioStatsProps> = ({ totalInvested, currentValue, totalReturn, totalReturnPercent, isPositive }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>Total Invested</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>{formatEur(totalInvested)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #5b6cb8 0%, #3b4fa0 100%)', borderRadius: 4, boxShadow: '0 8px 32px rgba(91, 108, 184, 0.3)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>Current Value</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>{formatEur(currentValue)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>Total Return</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: isPositive ? '#10b981' : '#ef4444' }}>
              {isPositive ? '+' : ''}{formatEur(totalReturn)} ({isPositive ? '+' : ''}{totalReturnPercent.toFixed(1)}%)
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PortfolioStats;
