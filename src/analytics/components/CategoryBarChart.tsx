import { Box, Paper, Typography } from '@mui/material';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ICategoryBreakdown } from '../types';

interface CategoryBarChartProps {
  data: ICategoryBreakdown[];
  title?: string;
}

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data, title }) => {
  const chartData = data.map(d => ({
    name: d.category,
    amount: d.total,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: 320, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `€${v.toLocaleString()}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#161b2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
              }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: any) => `€ ${Number(value || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default CategoryBarChart;
