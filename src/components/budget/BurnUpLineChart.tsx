import { Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { ITransaction, BudgetTarget } from '../../store/types';
import { computeBurnUpData } from '../../lib/budgetEngine';

interface Props {
  transactions: ITransaction[];
  budgetTargets: BudgetTarget[];
  dateRange: { start: string; end: string };
}

export default function BurnUpLineChart({ transactions, budgetTargets, dateRange }: Props) {
  const { t } = useTranslation();

  const data = computeBurnUpData(transactions, budgetTargets, dateRange);

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
        <Typography variant="body2">{t('budget.noBurnUpData')}</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          axisLine={false} tickLine={false}
        />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          labelStyle={{ color: 'rgba(255,255,255,0.9)' }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="ideal"
          name={t('budget.idealBurnRate')}
          stroke="rgba(255,255,255,0.3)"
          strokeDasharray="5 5"
          fill="none"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="actual"
          name={t('budget.actualSpend')}
          stroke="#6366f1"
          fill="url(#actualGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
