import { Card, CardContent, Chip, Typography } from '@mui/material';

interface CashInterestCardProps {
  cashBalance: number;
  interestRate: number;
  accruedInterest: number;
  brokerName: string;
}

const formatEur = (v: number) => `€${v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CashInterestCard: React.FC<CashInterestCardProps> = ({ cashBalance, interestRate, accruedInterest, brokerName }) => {
  return (
    <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
          Cash Balance
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.5, mb: 2 }}>
          {brokerName}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
          {formatEur(cashBalance)}
        </Typography>
        {interestRate > 0 && (
          <>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
              Accrued Interest: <strong>{formatEur(accruedInterest)}/month</strong>
            </Typography>
            <Chip label={`APY ${interestRate}%`} size="small" sx={{ background: 'rgba(16, 185, 129, 0.2)', color: 'success.main', fontWeight: 700 }} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CashInterestCard;
