import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { BudgetProgressSnapshot } from '../../store/types';

interface Props {
  snapshots: BudgetProgressSnapshot[];
}

export default function ComparisonBarChart({ snapshots }: Props) {
  const data = snapshots.map((s) => ({
    name: s.category,
    Target: s.targetAmount,
    Actual: s.actualSpent,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          labelStyle={{ color: 'rgba(255,255,255,0.9)' }}
        />
        <Legend />
        <Bar dataKey="Target" fill="rgba(99,102,241,0.3)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
