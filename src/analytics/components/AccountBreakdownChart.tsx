import { Box, Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { IAccountBreakdown } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

interface AccountBreakdownChartProps {
  data: IAccountBreakdown[];
  title?: string;
}

const AccountBreakdownChart: React.FC<AccountBreakdownChartProps> = ({ data, title }) => {
  const chartData = data.map(d => ({
    name: d.accountName,
    value: d.balance,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#161b2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
              }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value) => `€ ${Number(value || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: string) => (
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default AccountBreakdownChart;
