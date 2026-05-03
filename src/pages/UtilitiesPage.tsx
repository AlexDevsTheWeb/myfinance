import { Bolt as ElecIcon, LocalFireDepartment as GasIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { Box, Card, CardContent, Grid, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { YearSelector } from '../components/common/YearSelector.component';
import { useFinanceStore } from '../store/useFinanceStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UtilitiesPage: React.FC = () => {
  const { transactions } = useFinanceStore();
  const [tabValue, setTabValue] = useState(0);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  const availableYears = useMemo(() => {
    const utilityTransactions = transactions.filter(t => t.type === 'expense' && t.category === 'Bollette');
    const years = utilityTransactions.map(t => dayjs(t.date).year());
    const distinctYears = Array.from(new Set(years));
    if (!distinctYears.includes(dayjs().year())) distinctYears.push(dayjs().year());
    return distinctYears.sort((a, b) => b - a);
  }, [transactions]);

  const getStats = (subcategory: 'Elettricità' | 'Gas') => {
    const relevantTransactions = transactions
      .filter(t => t.type === 'expense' && t.category === 'Bollette' && t.subcategory === subcategory)
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

    const yearlyTransactions = relevantTransactions.filter(t => dayjs(t.date).year() === selectedYear);

    const totalCost = yearlyTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalConsumption = yearlyTransactions.reduce((acc, t) => acc + (t.consumption || 0), 0);

    // Average Monthly (Simple avg based on months passed so far)
    let monthsPassed = 12;
    if (selectedYear === dayjs().year()) {
      monthsPassed = dayjs().month() + 1;
    }
    const avgMonthlyCost = totalCost / monthsPassed;

    // Unit Cost Calculation (Avg of all transactions with consumption data in current year)
    const txWithConsumption = yearlyTransactions.filter(t => t.consumption && t.consumption > 0);
    const avgUnitCost = txWithConsumption.length > 0
      ? txWithConsumption.reduce((acc, t) => acc + (t.amount / t.consumption!), 0) / txWithConsumption.length
      : 0;

    // Chart Data
    const chartData = relevantTransactions.map(t => ({
      date: dayjs(t.date).format('L'),
      year: dayjs(t.date).year(),
      unitCost: t.consumption ? parseFloat((t.amount / t.consumption).toFixed(3)) : 0,
      consumption: t.consumption || 0,
      amount: t.amount,
      period: t.readingDateStart && t.readingDateEnd
        ? `${dayjs(t.readingDateStart).format('L')} - ${dayjs(t.readingDateEnd).format('L')}`
        : 'N/A'
    })).filter(d => d.consumption > 0 && d.year === selectedYear);

    return {
      totalCost,
      totalConsumption,
      avgMonthlyCost,
      avgUnitCost,
      chartData,
      history: relevantTransactions.filter(t => dayjs(t.date).year() === selectedYear).reverse()
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const elecStats = useMemo(() => getStats('Elettricità'), [transactions, selectedYear]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gasStats = useMemo(() => getStats('Gas'), [transactions, selectedYear]);

  interface Stats {
    totalCost: number;
    totalConsumption: number;
    avgMonthlyCost: number;
    avgUnitCost: number;
    chartData: Array<{
      date: string;
      year: number;
      unitCost: number;
      consumption: number;
      amount: number;
      period: string;
    }>;
    history: Array<{
      id: string;
      date: string;
      readingDateStart?: string;
      readingDateEnd?: string;
      amount: number;
      consumption?: number;
    }>;
  }

  const renderDashboard = (stats: Stats, title: string, unit: string, color: string, icon: React.ReactNode) => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ background: `rgba(30, 41, 59, 0.4)`, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {icon}
                  <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', ml: 1 }}>Totale {title}</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color }}>{stats.totalCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ background: `rgba(30, 41, 59, 0.4)`, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ opacity: 0.8, mr: 0.5, fontSize: 18 }} />
                  <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Mensile</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{stats.avgMonthlyCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ background: `rgba(30, 41, 59, 0.4)`, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Consumo Totale</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{stats.totalConsumption.toLocaleString('it-IT')} <small style={{ fontSize: '0.8rem', opacity: 0.7 }}>{unit}</small></Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ background: `rgba(30, 41, 59, 0.4)`, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Costo Unitario</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b' }}>{stats.avgUnitCost.toFixed(3)} <small style={{ fontSize: '0.8rem', opacity: 0.7 }}>€/{unit}</small></Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, lg: 7 }}>
        <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Storico Bollette</Typography>
          <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>Data</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>Importo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>Consumo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.history.map((row: Stats['history'][number]) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ p: 1 }}>{dayjs(row.date).format('L')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, p: 1 }}>{row.amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</TableCell>
                    <TableCell align="right" sx={{ p: 1 }}>{row.consumption ? `${row.consumption} ${unit}` : '-'}</TableCell>
                  </TableRow>
                ))}
                {stats.history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 2, opacity: 0.5 }}>Nessuna bolletta.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Andamento Consumi</Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: any) => `${v || 0}`} />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: any) => `${v || 0}€`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 600 }}
                  formatter={(value: any) => `${Number(value || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
                />
                <Line yAxisId="left" type="monotone" dataKey="consumption" name={`Consumo`} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} />
                <Line yAxisId="right" type="monotone" dataKey="unitCost" name={`Costo Unit.`} stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <ElecIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            Utilities
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Monitor your utility expenses and consumption trends.
          </Typography>
        </Box>
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="inherit" indicatorColor="primary">
          <Tab label="Elettricità" icon={<ElecIcon />} iconPosition="start" />
          <Tab label="Gas" icon={<GasIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderDashboard(elecStats, 'Luce', 'kWh', '#eab308', <ElecIcon sx={{ opacity: 0.8, color: '#eab308' }} />)}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderDashboard(gasStats, 'Gas', 'smc', '#3b82f6', <GasIcon sx={{ opacity: 0.8, color: '#3b82f6' }} />)}
      </TabPanel>
    </Box>
  );
};

export default UtilitiesPage;
