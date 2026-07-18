import { Chip } from '@mui/material';

interface DividendBadgeProps {
  totalDividends: number;
}

const formatEur = (v: number) => `€${v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DividendBadge: React.FC<DividendBadgeProps> = ({ totalDividends }) => {
  if (totalDividends <= 0) return null;

  return (
    <Chip
      label={`+${formatEur(totalDividends)} this month`}
      size="small"
      sx={{
        background: 'rgba(16, 185, 129, 0.2)',
        color: 'success.main',
        fontWeight: 700,
      }}
    />
  );
};

export default DividendBadge;
