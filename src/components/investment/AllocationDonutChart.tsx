import { Box, Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4',
  '#84cc16', '#d946ef',
];

interface AllocationDonutChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

const AllocationDonutChart: React.FC<AllocationDonutChartProps> = ({ data, title }) => {
  return (
    <Paper sx={{ p: 1.5 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 300, width: '100%' }}>
        {data.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>No holdings data</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#161b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}
                itemStyle={{ fontWeight: 600 }}
                formatter={(value: any) => `€${Number(value).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
              />
              <Legend verticalAlign="bottom" iconType="circle" formatter={(value: string) => (
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{value}</span>
              )} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
};

export default AllocationDonutChart;
