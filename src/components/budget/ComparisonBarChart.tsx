import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts';
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
    <BarChart
      series={[
        { data: data.map(d => d.Target), label: 'Target', color: 'rgba(99,102,241,0.3)' },
        { data: data.map(d => d.Actual), label: 'Actual', color: '#6366f1' },
      ]}
      xAxis={[{ scaleType: 'band', data: data.map(d => d.name), disableLine: true, disableTicks: true }]}
      yAxis={[{ disableLine: true, disableTicks: true }]}
      grid={{ vertical: false, horizontal: true }}
      height={300}
      margin={{ top: 10, right: 10, bottom: 30, left: 50 }}
      sx={{
        [`.${axisClasses.tickLabel}`]: {
          fill: 'rgba(255,255,255,0.5)',
          fontSize: 12,
        },
      }}
    />
  );
}
