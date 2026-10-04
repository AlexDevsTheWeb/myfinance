import { Box, LinearProgress, Typography } from '@mui/material';
import type { BudgetProgressSnapshot } from '../../store/types';

interface Props {
  snapshots: BudgetProgressSnapshot[];
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'safe': return 'success.main';
    case 'warning': return 'warning.main';
    case 'breach': return 'error.main';
    default: return 'primary.main';
  }
}

function getStatusBg(status: string): string {
  switch (status) {
    case 'safe': return 'rgba(16,185,129,0.15)';
    case 'warning': return 'rgba(237,108,2,0.15)';
    case 'breach': return 'rgba(239,68,68,0.15)';
    default: return 'rgba(67,100,247,0.15)';
  }
}

export default function BulletChart({ snapshots }: Props) {
  if (snapshots.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {snapshots.map((s) => {
        const barColor = getStatusColor(s.status);
        const barBg = getStatusBg(s.status);

        return (
          <Box key={s.category}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {s.category}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                €{s.actualSpent.toLocaleString('it-IT')} / €{s.targetAmount.toLocaleString('it-IT')}
              </Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(s.percentage, 100)}
                sx={{
                  height: 10, borderRadius: 5,
                  bgcolor: barBg,
                  '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 5 },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute', right: 4, top: -2, fontWeight: 700, fontSize: 11,
                  color: s.percentage >= 100 ? 'error.main' : 'rgba(255,255,255,0.8)',
                }}
              >
                {Math.round(s.percentage)}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>
                {s.status === 'breach' ? `Over by €${Math.abs(s.remaining).toLocaleString('it-IT')}` : ''}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>
                {s.status === 'safe' ? `€${s.remaining.toLocaleString('it-IT')} left` : ''}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
