import { Box, Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ICategoryBreakdown } from '../types';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4',
  '#84cc16', '#d946ef',
];

interface CategoryPieChartProps {
  data: ICategoryBreakdown[];
  title?: string;
}

const ITEMS_PER_ROW = 2;
const BASE_HEIGHT = 300;
const LEGEND_ROW_HEIGHT = 24;

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, title }) => {
  const chartData = data.map(d => ({
    name: d.category,
    value: d.total,
  }));

  const chartHeight = Math.max(
    BASE_HEIGHT,
    BASE_HEIGHT + Math.ceil(chartData.length / ITEMS_PER_ROW) * LEGEND_ROW_HEIGHT
  );

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: chartHeight, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
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
              formatter={(value) => `€ ${Number(value).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Legend
              verticalAlign="bottom"
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

export default CategoryPieChart;
