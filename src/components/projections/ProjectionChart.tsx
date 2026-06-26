import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartDataPoint {
  label: string;
  netWorth: number;
  totalInvested: number;
}

interface ProjectionChartProps {
  data: ChartDataPoint[];
}

const formatEuro = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}k`;
  return `€${v}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <Box
      sx={{
        background: '#161b2e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.6, mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      {payload.map((entry: any, idx: number) => (
        <Typography
          key={idx}
          variant="body2"
          sx={{ fontWeight: 600, color: entry.color }}
        >
          {entry.name}: €{Number(entry.value).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </Typography>
      ))}
    </Box>
  );
};

const ProjectionChart: React.FC<ProjectionChartProps> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {t('projections.chartTitle')}
      </Typography>
      <Box sx={{ height: 400, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5b6cb8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5b6cb8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatEuro}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => (
                <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              name={t('projections.seriesNetWorth')}
              stroke="#5b6cb8"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="totalInvested"
              name={t('projections.seriesInvested')}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#investedGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ProjectionChart;
