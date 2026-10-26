import { Box, Paper, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../../store/useFinanceStore';
import { usePortfolio } from '../../analytics/hooks/usePortfolio';
import { formatCurrency } from '../../utils/format.utils';

const VB_W = 500;
const VB_H = 160;
const GRID_LINES = [30, 80, 130];
const X_START = 15;
const X_END = 485;
const Y_TOP = 30;
const Y_BOTTOM = 150;

interface Pt {
  x: number;
  y: number;
}

/** Catmull-Rom → cubic Bézier smoothing, matching the prototype's soft curves. */
function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

function toPoints(values: number[], max: number): Pt[] {
  const span = max > 0 ? max : 1;
  const n = values.length;
  const step = n > 1 ? (X_END - X_START) / (n - 1) : 0;
  return values.map((v, i) => ({
    x: X_START + step * i,
    y: Y_BOTTOM - (v / span) * (Y_BOTTOM - Y_TOP),
  }));
}

function areaPath(line: string, pts: Pt[]): string {
  if (pts.length === 0) return '';
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${line} L ${last.x} ${VB_H} L ${first.x} ${VB_H} Z`;
}

const Tooltip: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <Box
    sx={{
      position: 'absolute',
      left: `${(x / VB_W) * 100}%`,
      top: `${(y / VB_H) * 100}%`,
      transform: 'translate(-50%, -140%)',
      pointerEvents: 'none',
      zIndex: 2,
      bgcolor: 'colors.surfaceNested',
      border: 1,
      borderColor: 'colors.border',
      borderRadius: 1,
      px: 1.25,
      py: 0.75,
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </Box>
);

const TooltipRow: React.FC<{ color: string; label: string; value: string }> = ({ color, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
      <Typography sx={{ fontSize: '0.625rem', color: 'colors.subtle' }}>{label}</Typography>
    </Box>
    <Typography sx={{ fontFamily: (t) => t.colors.mono, fontSize: '0.6875rem', fontWeight: 700, color: 'text.primary' }}>{value}</Typography>
  </Box>
);

const LegendItem: React.FC<{ color: string; label: string; dashed?: boolean }> = ({ color, label, dashed }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <Box
      sx={{
        width: 12,
        height: 2,
        bgcolor: dashed ? 'transparent' : color,
        borderBottom: dashed ? `2px dashed ${color}` : undefined,
      }}
    />
    <Typography sx={{ fontSize: '0.6875rem', color: '#CBD5E1' }}>{label}</Typography>
  </Box>
);

const ChartCard: React.FC<{
  title: string;
  badge: string;
  legend: React.ReactNode;
  children: React.ReactNode;
  axis: React.ReactNode;
  columns?: number;
}> = ({ title, badge, legend, children, axis, columns = 6 }) => (
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'common.white', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              fontFamily: (t) => t.colors.mono,
              fontSize: '0.625rem',
              color: 'colors.subtle',
              bgcolor: 'colors.surfaceNested',
              border: 1,
              borderColor: 'colors.border',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {badge}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>{legend}</Box>
      </Box>
      <Box sx={{ position: 'relative', width: '100%' }}>{children}</Box>
    </Box>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        textAlign: 'center',
        fontFamily: (t) => t.colors.mono,
        fontSize: '0.625rem',
        color: 'colors.subtle',
        mt: 1,
        pt: 1,
        borderTop: 1,
        borderColor: 'colors.border',
      }}
    >
      {axis}
    </Box>
  </Paper>
);

const CashFlowChart: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { transactions } = useFinanceStore();

  const data = React.useMemo(() => {
    const buckets: { key: string; label: string; income: number; expense: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = dayjs().subtract(i, 'month').startOf('month');
      buckets.push({ key: d.format('YYYY-MM'), label: d.format('MMM').toUpperCase(), income: 0, expense: 0 });
    }
    const index: Record<string, number> = {};
    buckets.forEach((b, i) => (index[b.key] = i));
    for (const tx of transactions) {
      const key = dayjs(tx.date).format('YYYY-MM');
      const i = index[key];
      if (i === undefined) continue;
      if (tx.type === 'income') buckets[i].income += tx.amount;
      else if (tx.type === 'expense') buckets[i].expense += tx.amount;
    }
    return buckets;
  }, [transactions]);

  const { incomeLine, expenseLine, incomeArea, expenseArea, incomePts, expensePts } = React.useMemo(() => {
    const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 0);
    const incomePts = toPoints(data.map((d) => d.income), max);
    const expensePts = toPoints(data.map((d) => d.expense), max);
    const incomeLine = smoothPath(incomePts);
    const expenseLine = smoothPath(expensePts);
    return {
      incomePts,
      expensePts,
      incomeLine,
      expenseLine,
      incomeArea: areaPath(incomeLine, incomePts),
      expenseArea: areaPath(expenseLine, expensePts),
    };
  }, [data]);

  const [hover, setHover] = React.useState<number | null>(null);
  const step = data.length > 1 ? (X_END - X_START) / (data.length - 1) : 0;

  return (
    <ChartCard
      title={t('dashboard.charts.cashFlow')}
      badge={t('dashboard.charts.last12Months')}
      legend={
        <>
          <LegendItem color={theme.colors.emerald} label={t('dashboard.income')} />
          <LegendItem color={theme.colors.rose} label={t('dashboard.expense')} />
        </>
      }
      columns={12}
      axis={data.map((d, i) => {
        const isLast = i === data.length - 1;
        const showYear = i === 0 || d.key.endsWith('-01') || isLast;
        return (
          <Box key={d.key} component="span" sx={{ color: isLast ? 'colors.cyan' : 'inherit', fontWeight: isLast ? 700 : 400 }}>
            {d.label}
            {showYear ? (
              <Box component="span" sx={{ display: 'block', color: isLast ? 'colors.cyan' : 'colors.muted' }}>
                '{dayjs(d.key).format('YY')}
              </Box>
            ) : null}
          </Box>
        );
      })}
    >
      <>
        <Box component="svg" viewBox={`0 0 ${VB_W} ${VB_H}`} sx={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="cf-greenArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={theme.colors.emerald} stopOpacity={0.12} />
              <stop offset="100%" stopColor={theme.colors.emerald} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cf-redArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={theme.colors.rose} stopOpacity={0.1} />
              <stop offset="100%" stopColor={theme.colors.rose} stopOpacity={0} />
            </linearGradient>
          </defs>

          {GRID_LINES.map((y) => (
            <line key={y} x1={0} x2={VB_W} y1={y} y2={y} stroke={theme.colors.border} strokeWidth={1} strokeDasharray="3,3" />
          ))}

          <path d={incomeArea} fill="url(#cf-greenArea)" />
          <path d={expenseArea} fill="url(#cf-redArea)" />
          <path d={incomeLine} fill="none" stroke={theme.colors.emerald} strokeWidth={2.5} strokeLinecap="round" />
          <path d={expenseLine} fill="none" stroke={theme.colors.rose} strokeWidth={2.5} strokeLinecap="round" />

          {incomePts.map((p, i) => (
            <circle
              key={`inc-${i}`}
              cx={p.x}
              cy={p.y}
              r={i === incomePts.length - 1 ? 4.5 : 3.5}
              fill={theme.colors.emerald}
              stroke={theme.colors.bg}
              strokeWidth={i === incomePts.length - 1 ? 2 : 1.5}
            />
          ))}
          {expensePts.map((p, i) => (
            <circle
              key={`exp-${i}`}
              cx={p.x}
              cy={p.y}
              r={i === expensePts.length - 1 ? 4.5 : 3.5}
              fill={theme.colors.rose}
              stroke={theme.colors.bg}
              strokeWidth={i === expensePts.length - 1 ? 2 : 1.5}
            />
          ))}

          {data.map((_, i) => {
            const cx = X_START + step * i;
            const x = Math.max(0, Math.min(VB_W - step, cx - step / 2));
            return (
              <rect
                key={`hit-${i}`}
                x={x}
                y={0}
                width={step}
                height={VB_H}
                fill="transparent"
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </Box>
        {hover !== null ? (
          <Tooltip x={incomePts[hover].x} y={Math.min(incomePts[hover].y, expensePts[hover].y)}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: 'colors.subtle', mb: 0.5 }}>
              {data[hover].label} '{dayjs(data[hover].key).format('YY')}
            </Typography>
            <TooltipRow color={theme.colors.emerald} label={t('dashboard.income')} value={formatCurrency(data[hover].income)} />
            <TooltipRow color={theme.colors.rose} label={t('dashboard.expense')} value={formatCurrency(data[hover].expense)} />
          </Tooltip>
        ) : null}
      </>
    </ChartCard>
  );
};

const PortfolioChart: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const portfolio = usePortfolio();
  const data = React.useMemo(() => portfolio.chartData.slice(-6), [portfolio.chartData]);

  const { valuePts, investedPts, valueLine, investedLine, valueArea } = React.useMemo(() => {
    const max = Math.max(...data.flatMap((d) => [d.value, d.invested]), 0);
    const valuePts = toPoints(data.map((d) => d.value), max);
    const investedPts = toPoints(data.map((d) => d.invested), max);
    const valueLine = smoothPath(valuePts);
    const investedLine = smoothPath(investedPts);
    return { valuePts, investedPts, valueLine, investedLine, valueArea: areaPath(valueLine, valuePts) };
  }, [data]);

  const [hover, setHover] = React.useState<number | null>(null);
  const step = data.length > 1 ? (X_END - X_START) / (data.length - 1) : 0;

  return (
    <ChartCard
      title={t('dashboard.charts.portfolio')}
      badge={t('dashboard.charts.pacTimeline')}
      legend={
        <>
          <LegendItem color={theme.colors.cyan} label={t('dashboard.charts.currentValue')} />
          <LegendItem color={theme.colors.muted} label={t('dashboard.charts.investedCapital')} dashed />
        </>
      }
      axis={
        data.length < 2
          ? Array.from({ length: 6 }, (_, i) => (
              <Box key={i} component="span" sx={{ color: 'colors.muted' }}>
                —
              </Box>
            ))
          : data.map((d, i) => (
              <Box key={d.date} component="span" sx={{ color: i === data.length - 1 ? 'colors.cyan' : 'inherit', fontWeight: i === data.length - 1 ? 700 : 400 }}>
                {dayjs(d.date).format('MMM').toUpperCase()}
                <Box component="span" sx={{ display: 'block', color: i === data.length - 1 ? 'colors.cyan' : 'colors.muted' }}>
                  (€ {Math.round(d.invested).toLocaleString('it-IT')})
                </Box>
              </Box>
            ))
      }
    >
      {data.length < 2 ? (
        <Box sx={{ height: 192, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'colors.muted' }}>{t('dashboard.charts.noHistory')}</Typography>
        </Box>
      ) : (
        <>
        <Box component="svg" viewBox={`0 0 ${VB_W} ${VB_H}`} sx={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="pf-cyanArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={theme.colors.cyan} stopOpacity={0.14} />
              <stop offset="100%" stopColor={theme.colors.cyan} stopOpacity={0} />
            </linearGradient>
          </defs>

          {GRID_LINES.map((y) => (
            <line key={y} x1={0} x2={VB_W} y1={y} y2={y} stroke={theme.colors.border} strokeWidth={1} strokeDasharray="3,3" />
          ))}

          <path d={valueArea} fill="url(#pf-cyanArea)" />
          <path d={investedLine} fill="none" stroke={theme.colors.muted} strokeWidth={2} strokeDasharray="4,4" />
          <path d={valueLine} fill="none" stroke={theme.colors.cyan} strokeWidth={2.5} strokeLinecap="round" />

          {investedPts.map((p, i) => (
            <circle key={`inv-${i}`} cx={p.x} cy={p.y} r={3} fill={theme.colors.muted} />
          ))}
          {valuePts.map((p, i) => (
            <circle
              key={`val-${i}`}
              cx={p.x}
              cy={p.y}
              r={i === valuePts.length - 1 ? 5 : 3.5}
              fill={theme.colors.cyan}
              stroke={i === valuePts.length - 1 ? theme.colors.bg : undefined}
              strokeWidth={i === valuePts.length - 1 ? 2 : undefined}
            />
          ))}

          {data.map((_, i) => {
            const cx = X_START + step * i;
            const x = Math.max(0, Math.min(VB_W - step, cx - step / 2));
            return (
              <rect
                key={`pf-hit-${i}`}
                x={x}
                y={0}
                width={step}
                height={VB_H}
                fill="transparent"
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </Box>
        {hover !== null ? (
          <Tooltip x={valuePts[hover].x} y={Math.min(valuePts[hover].y, investedPts[hover].y)}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: 'colors.subtle', mb: 0.5 }}>
              {dayjs(data[hover].date).format('MMM YY').toUpperCase()}
            </Typography>
            <TooltipRow color={theme.colors.cyan} label={t('dashboard.charts.currentValue')} value={formatCurrency(data[hover].value)} />
            <TooltipRow color={theme.colors.muted} label={t('dashboard.charts.investedCapital')} value={formatCurrency(data[hover].invested)} />
          </Tooltip>
        ) : null}
        </>
      )}
    </ChartCard>
  );
};

const ChartsRow: React.FC = () => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 2.5 }}>
      <CashFlowChart />
      <PortfolioChart />
    </Box>
  );
};

export default ChartsRow;
