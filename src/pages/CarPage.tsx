/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edit as EditIcon, LocalGasStation as FuelIcon, Speed as SpeedIcon, DriveEta as TireIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Collapse, Grid, IconButton, MenuItem, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { YearSelector } from '../components/common/YearSelector.component';
import { useFinanceStore, type CarMileageRecord, type TireChangeRecord } from '../store/useFinanceStore';

const months = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

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

const CarPage: React.FC = () => {
  const {
    carMileage, carInitialMileage, setCarInitialMileage, addCarMileage, updateCarMileage,
    tireSettings, tireChanges, addTireChange, updateTireChange,
    transactions
  } = useFinanceStore();

  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);

  // Mileage State
  const [newReading, setNewReading] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedYearFilter, setSelectedYearFilter] = useState(dayjs().year());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [initialMileageValue, setInitialMileageValue] = useState(carInitialMileage.toString());

  // Tire State
  const [newTireChange, setNewTireChange] = useState({ date: dayjs().format('YYYY-MM-DD'), type: 'winter' as 'summer' | 'winter', odometer: '' });
  const [editingTireChangeId, setEditingTireChangeId] = useState<string | null>(null);

  // Fuel Categories helper
  const fuelCategories = useMemo(() => ['Carburante', 'Benzina', 'Gasolio'], []);

  const availableYears = useMemo(() => {
    const mileageYears = carMileage.map(m => m.year);
    const fuelYears = transactions
      .filter(t => t.type === 'expense' && (t.category === 'Trasporti' || t.category === 'Transport') && fuelCategories.some(fuelWord => t.subcategory.includes(fuelWord)))
      .map(t => dayjs(t.date).year());

    const years = Array.from(new Set([...mileageYears, ...fuelYears]));
    if (!years.includes(dayjs().year())) years.push(dayjs().year());
    return years.sort((a, b) => b - a);
  }, [carMileage, transactions, fuelCategories]);

  const totalOdometer = useMemo(() => {
    if (carMileage.length === 0) return carInitialMileage;
    return Math.max(...carMileage.map(m => m.reading), carInitialMileage);
  }, [carMileage, carInitialMileage]);

  const yearStats = useMemo(() => {
    const yearRecords = carMileage
      .filter(m => m.year === selectedYearFilter)
      .sort((a, b) => a.month - b.month);

    const monthlyData = yearRecords.map((record) => {
      let prevReading = 0;
      const allPrev = carMileage.filter(m =>
        m.year < record.year || (m.year === record.year && m.month < record.month)
      ).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

      if (allPrev.length > 0) {
        prevReading = allPrev[allPrev.length - 1].reading;
      } else {
        prevReading = carInitialMileage;
      }

      const delta = record.reading - prevReading;
      return { ...record, delta };
    });

    const totalKmYear = monthlyData.reduce((acc, curr) => acc + curr.delta, 0);
    const avgKmYear = monthlyData.length > 0 ? totalKmYear / monthlyData.length : 0;

    return {
      year: selectedYearFilter,
      monthlyData: [...monthlyData].reverse(),
      totalKmYear,
      avgKmYear,
      chartData: monthlyData.map(d => ({
        name: months[d.month - 1].substring(0, 3),
        km: d.delta,
        reading: d.reading
      }))
    };
  }, [carMileage, selectedYearFilter, carInitialMileage]);

  // Historical averages for all years
  const historicalStats = useMemo(() => {
    const yearMap = new Map<number, { total: number; months: number; avgWithData: number; avgFullYear: number }>();
    
    const sortedMileage = [...carMileage].sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
    
    sortedMileage.forEach(m => {
      const prevReadings = sortedMileage.filter(p => p.year * 12 + p.month < m.year * 12 + m.month);
      const prevReading = prevReadings.length > 0 ? prevReadings[prevReadings.length - 1].reading : carInitialMileage;
      const delta = m.reading - prevReading;
      
      const existing = yearMap.get(m.year) || { total: 0, months: 0, avgWithData: 0, avgFullYear: 0 };
      yearMap.set(m.year, {
        total: existing.total + delta,
        months: existing.months + 1,
        avgWithData: 0,
        avgFullYear: 0
      });
    });
    
    yearMap.forEach((val) => {
      val.avgWithData = val.months > 0 ? val.total / val.months : 0;
      val.avgFullYear = val.total / 12;
    });
    
    return Array.from(yearMap.entries())
      .map(([year, val]) => ({ year, ...val }))
      .sort((a, b) => b.year - a.year);
  }, [carMileage, carInitialMileage]);

  // Tire Calculations
  const tireStats = useMemo(() => {
    const sortedChanges = [...tireChanges].sort((a, b) => a.date.localeCompare(b.date));
    let summerKm = 0;
    let winterKm = 0;

    let lastOdometer = carInitialMileage;
    let lastType = tireSettings.initialTireType || 'summer';
    const changesWithRun = [];

    for (const change of sortedChanges) {
      const runKm = change.odometer - lastOdometer;
      if (lastType === 'summer') summerKm += runKm;
      else winterKm += runKm;
      changesWithRun.push({ ...change, runKm, tireThatRan: lastType });
      lastOdometer = change.odometer;
      lastType = change.type;
    }

    const currentRunKm = totalOdometer - lastOdometer;
    if (lastType === 'summer') summerKm += currentRunKm;
    else winterKm += currentRunKm;

    return {
      history: [...changesWithRun].reverse(),
      summerTotal: summerKm,
      winterTotal: winterKm,
      currentTire: lastType,
      currentRunKm
    };
  }, [tireChanges, totalOdometer, carInitialMileage, tireSettings.initialTireType]);

  // Cost Efficiency Calculations
  const costStats = useMemo(() => {
    const fuelTransactions = transactions.filter(t =>
      t.type === 'expense' &&
      (t.category === 'Trasporti' || t.category === 'Transport') &&
      fuelCategories.some(fuelWord => t.subcategory.includes(fuelWord))
    );

    const expensesByMonth: Record<string, number> = {};
    fuelTransactions.forEach(t => {
      const date = dayjs(t.date);
      const key = `${date.year()}-${date.month() + 1}`;
      expensesByMonth[key] = (expensesByMonth[key] || 0) + Math.abs(t.amount);
    });

    const allRecords = [...carMileage].sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));

    const efficiencyData = allRecords.map((m, idx) => {
      let prevReading = 0;
      if (idx > 0) {
        prevReading = allRecords[idx - 1].reading;
      } else {
        prevReading = carInitialMileage;
      }

      const kmDriven = m.reading - prevReading;
      const fuelCost = expensesByMonth[`${m.year}-${m.month}`] || 0;
      const euroPerKm = kmDriven > 0 ? fuelCost / kmDriven : 0;

      return {
        year: m.year,
        month: m.month,
        kmDriven,
        fuelCost,
        euroPerKm
      };
    }).filter(d => d.year === selectedYearFilter);

    const totalCostYear = efficiencyData.reduce((acc, curr) => acc + curr.fuelCost, 0);
    const totalKmYear = efficiencyData.reduce((acc, curr) => acc + curr.kmDriven, 0);
    const avgEfficiencyYear = totalKmYear > 0 ? totalCostYear / totalKmYear : 0;

    return {
      monthlyEfficiency: [...efficiencyData].reverse(),
      totalCostYear,
      totalKmYear,
      avgEfficiencyYear,
      chartData: efficiencyData.map(d => ({
        name: months[d.month - 1].substring(0, 3),
        val: parseFloat(d.euroPerKm.toFixed(3))
      }))
    };
  }, [transactions, carMileage, carInitialMileage, selectedYearFilter, fuelCategories]);

  const handleSaveMileage = () => {
    const reading = parseFloat(newReading);
    if (isNaN(reading)) return;

    if (editingId) {
      updateCarMileage({ id: editingId, year: selectedYear, month: selectedMonth, reading });
      setEditingId(null);
    } else {
      const existing = carMileage.find(m => m.month === selectedMonth && m.year === selectedYear);
      if (existing) {
        updateCarMileage({ ...existing, reading });
      } else {
        addCarMileage({ id: crypto.randomUUID(), year: selectedYear, month: selectedMonth, reading });
      }
    }
    setNewReading('');
    setEditingId(null);
  };

  const handleEditMileage = (record: CarMileageRecord) => {
    setEditingId(record.id);
    setSelectedYear(record.year);
    setSelectedMonth(record.month);
    setNewReading(record.reading.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveInitialMileage = () => {
    const val = parseFloat(initialMileageValue);
    if (!isNaN(val)) {
      setCarInitialMileage(val);
      setShowSettings(false);
    }
  };

  const handleSaveTireChange = () => {
    const odo = parseFloat(newTireChange.odometer);
    if (isNaN(odo)) return;

    const record: TireChangeRecord = {
      id: editingTireChangeId || crypto.randomUUID(),
      date: newTireChange.date,
      type: newTireChange.type,
      odometer: odo
    };

    if (editingTireChangeId) {
      updateTireChange(record);
    } else {
      addTireChange(record);
    }

    setNewTireChange({ date: dayjs().format('YYYY-MM-DD'), type: 'winter', odometer: '' });
    setEditingTireChangeId(null);
  };

  // Note: handleEditTireChange not currently used but kept for future edit feature
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditTireChange = (record: TireChangeRecord) => {
    setNewTireChange({ date: record.date, type: record.type, odometer: record.odometer.toString() });
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            Car Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Track mileage, tires, and fuel efficiency.
          </Typography>
        </Box>
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYearFilter}
          onYearChange={setSelectedYearFilter}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="inherit" indicatorColor="primary">
          <Tab label="Mileage" icon={<SpeedIcon />} iconPosition="start" />
          <Tab label="Tires" icon={<TireIcon />} iconPosition="start" />
          <Tab label="Fuel" icon={<FuelIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <Collapse in={showSettings}>
        <Paper sx={{ p: 3, mb: 3, background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>{t('car.settings')}</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Initial Km"
              type="number"
              value={initialMileageValue}
              onChange={(e: any) => setInitialMileageValue(e.target.value)}
              variant="filled"
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleSaveInitialMileage}>{t('car.save')}</Button>
          </Box>
        </Paper>
      </Collapse>

      {/* CHILOMETRAGGIO TAB */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Column 1: Total Odometer + New Reading Form */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: 4, boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SpeedIcon sx={{ mr: 1, opacity: 0.8 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>{t('car.totalKm')}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>{totalOdometer.toLocaleString('it-IT')} <small style={{ fontSize: '1rem', opacity: 0.7 }}>km</small></Typography>
              </CardContent>
            </Card>

            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                {editingId ? 'Edit Reading' : 'New Reading'}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField select fullWidth label="Month" value={selectedMonth} onChange={(e: any) => setSelectedMonth(Number(e.target.value))} variant="filled" SelectProps={{ native: true }} size="small">
                    {months.map((m, i) => <option key={m} value={i + 1}>{m.substring(0, 3)}</option>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField type="number" fullWidth label="Year" value={selectedYear} onChange={(e: any) => setSelectedYear(Number(e.target.value))} variant="filled" size="small" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField type="number" fullWidth label="Odometer" value={newReading} onChange={(e: any) => setNewReading(e.target.value)} variant="filled" placeholder="e.g. 45200" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button fullWidth variant="contained" onClick={handleSaveMileage}>{editingId ? 'Update' : 'Save'}</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Column 2: 4 stats in 2x2 grid + chart */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Current year total */}
              <Grid size={{ xs: 6 }}>
                <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>{selectedYearFilter}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#6366f1' }}>{yearStats.totalKmYear.toLocaleString()} km</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Avg with data */}
              <Grid size={{ xs: 6 }}>
                <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>{t('car.avgData')}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{yearStats.avgKmYear.toLocaleString()} km</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Avg full year */}
              <Grid size={{ xs: 6 }}>
                <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>{t('car.avg12')}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{(yearStats.totalKmYear / 12).toLocaleString()} km</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Historical summary */}
              <Grid size={{ xs: 6 }}>
                <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, display: 'block', mb: 1 }}>{t('car.history')}</Typography>
                    <Box sx={{ maxHeight: 50, overflow: 'auto' }}>
                      {historicalStats.slice(0, 3).map(h => (
                        <Box key={h.year} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span>{h.year}</span>
                          <span style={{ fontWeight: 600 }}>{h.total.toLocaleString()}</span>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Mileage Trend Chart */}
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('car.trend')}</Typography>
              <Box sx={{ height: 200, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="km" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Column 3: Statistics Table */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('car.statistics', { year: selectedYearFilter })}</Typography>
              </Box>
              <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>{t('car.month')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>{t('car.km')}</TableCell>
                      <TableCell align="right" sx={{ p: 1 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {yearStats.monthlyData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ p: 1 }}>{months[row.month - 1].substring(0, 3)}</TableCell>
                        <TableCell align="right" sx={{ p: 1, fontWeight: 600 }}>+{row.delta.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ p: 1 }}>
                          <IconButton size="small" onClick={() => handleEditMileage(row)}><EditIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* PNEUMATICI TAB */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Column 1: Stats + Form */}
          <Grid size={{ xs: 12, md: 3 }}>
            {/* 3 Stat cards - Current spans 2 columns */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Summer Total */}
              <Grid size={{ xs: 6 }}>
                <Card sx={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: 4, border: '1px solid #f59e0b' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>{t('car.summer')}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#f59e0b' }}>{tireStats.summerTotal.toLocaleString()} km</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Winter Total */}
              <Grid size={{ xs: 6 }}>
                <Card sx={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: 4, border: '1px solid #3b82f6' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>{t('car.winter')}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#3b82f6' }}>{tireStats.winterTotal.toLocaleString()} km</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Current - spans 2 columns */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>{t('car.current')}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{tireStats.currentTire === 'summer' ? t('car.summer') : t('car.winter')}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.6 }}>{tireStats.currentRunKm.toLocaleString()} km</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* New Tire Change Form */}
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('car.newTire')}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField type="date" fullWidth label={t('car.date')} value={newTireChange.date} onChange={(e: any) => setNewTireChange({ ...newTireChange, date: e.target.value })} variant="filled" size="small" InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField select fullWidth label={t('car.type')} value={newTireChange.type} onChange={(e: any) => setNewTireChange({ ...newTireChange, type: e.target.value as any })} variant="filled" size="small">
                    <MenuItem value="summer">{t('car.summer')}</MenuItem>
                    <MenuItem value="winter">{t('car.winter')}</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField type="number" fullWidth label="Odometer" value={newTireChange.odometer} onChange={(e: any) => setNewTireChange({ ...newTireChange, odometer: e.target.value })} variant="filled" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button fullWidth variant="contained" onClick={handleSaveTireChange}>{editingTireChangeId ? 'Update' : 'Save'}</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Column 2: History Table */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>History</Typography>
              <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>{t('car.date')}</TableCell>
                      <TableCell sx={{ p: 1 }}>{t('car.type')}</TableCell>
                      <TableCell align="right" sx={{ p: 1 }}>{t('car.km')}</TableCell>
                      <TableCell align="right" sx={{ p: 1 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tireStats.history.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ p: 1 }}>{dayjs(row.date).format('L')}</TableCell>
                        <TableCell sx={{ p: 1, color: row.type === 'summer' ? '#f59e0b' : '#3b82f6' }}>{row.type === 'summer' ? t('car.summer') : t('car.winter')}</TableCell>
                        <TableCell align="right" sx={{ p: 1, fontWeight: 600 }}>{row.runKm.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ p: 1 }}>
                          <IconButton size="small" onClick={() => handleEditTireChange(row)}><EditIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Column 3: Tire Usage Chart */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('car.tireUsage')}</Typography>
              <Box sx={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tireStats.history.slice(0, 10).map((t, i) => ({ name: `${i + 1}`, km: t.runKm }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="km" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ANALISI COSTI TAB */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {/* Column 1: Stats */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Total Spent */}
              <Grid size={{ xs: 6 }}>
                <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 4 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700 }}>Total Spent</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{costStats.totalCostYear.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Efficiency */}
              <Grid size={{ xs: 6 }}>
                <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Efficiency</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981' }}>{costStats.avgEfficiencyYear.toFixed(3)} €/km</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Km - spans 2 columns */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Total Km</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{costStats.totalKmYear.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Column 2: Monthly Details Table */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Monthly Details</Typography>
              <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>Month</TableCell>
                      <TableCell align="right" sx={{ p: 1 }}>Km</TableCell>
                      <TableCell align="right" sx={{ p: 1 }}>Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {costStats.monthlyEfficiency.map((row) => (
                      <TableRow key={`${row.year}-${row.month}`}>
                        <TableCell sx={{ p: 1, fontWeight: 600 }}>{months[row.month - 1].substring(0, 3)}</TableCell>
                        <TableCell align="right" sx={{ p: 1 }}>{row.kmDriven.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ p: 1 }}>{row.fuelCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</TableCell>
                      </TableRow>
                    ))}
                    {costStats.monthlyEfficiency.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 2, opacity: 0.5 }}>No data.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Column 3: Fuel Efficiency Trend Chart */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Fuel Efficiency Trend</Typography>
              <Box sx={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={costStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default CarPage;
