import { Box, Button, Paper, Typography } from '@mui/material';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import dayjs from 'dayjs';

interface PortfolioLineChartProps {
  data: { date: string; value: number; invested: number }[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const TIME_RANGES = ['1M', '6M', '1Y', 'ALL'];

const PortfolioLineChart: React.FC<PortfolioLineChartProps> = ({ data, timeRange, onTimeRangeChange }) => {
  const filtered = timeRange === 'ALL' ? data : (() => {
    const cutoff = timeRange === '1M' ? dayjs().subtract(30, 'day')
      : timeRange === '6M' ? dayjs().subtract(6, 'month')
      : dayjs().subtract(1, 'year');
    return data.filter(d => dayjs(d.date).isAfter(cutoff));
  })();

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Portfolio Value</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {TIME_RANGES.map(r => (
            <Button
              key={r}
              size="small"
              variant={timeRange === r ? 'contained' : 'outlined'}
              onClick={() => onTimeRangeChange(r)}
              sx={{ minWidth: 36 }}
            >
              {r}
            </Button>
          ))}
        </Box>
      </Box>
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5b6cb8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5b6cb8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `€${v.toLocaleString()}`} />
            <Tooltip
              contentStyle={{ background: '#161b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: any) => `€${Number(value || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Area type="monotone" dataKey="value" stroke="#5b6cb8" strokeWidth={3} fillOpacity={1} fill="url(#portfolioGradient)" dot={false} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="invested" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default PortfolioLineChart;
