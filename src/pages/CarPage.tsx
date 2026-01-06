import { Delete as DeleteIcon, Edit as EditIcon, LocalGasStation as FuelIcon, Settings as SettingsIcon, Speed as SpeedIcon, DriveEta as TireIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Collapse, FormControlLabel, Grid, IconButton, MenuItem, Paper, Radio, RadioGroup, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
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
    carMileage, carInitialMileage, setCarInitialMileage, addCarMileage, updateCarMileage, deleteCarMileage,
    tireSettings, tireChanges, setTireSettings, addTireChange, updateTireChange, deleteTireChange,
    transactions
  } = useFinanceStore();

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
  const [tireModelEdit, setTireModelEdit] = useState({
    summer: tireSettings.summerModel,
    winter: tireSettings.winterModel,
    initialType: tireSettings.initialTireType || 'summer'
  });
  const [isEditingTireModels, setIsEditingTireModels] = useState(false);
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

  const handleSaveTireModels = () => {
    setTireSettings({
      summerModel: tireModelEdit.summer,
      winterModel: tireModelEdit.winter,
      initialTireType: tireModelEdit.initialType as 'summer' | 'winter'
    });
    setIsEditingTireModels(false);
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

  const handleEditTireChange = (record: TireChangeRecord) => {
    setEditingTireChangeId(record.id);
    setNewTireChange({ date: record.date, type: record.type, odometer: record.odometer.toString() });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
          Gestione Automobile
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {tabValue !== 1 && ( // Hide year filter only on Tires tab if preferred, but usually keep it
            <YearSelector
              availableYears={availableYears}
              selectedYear={selectedYearFilter}
              onYearChange={setSelectedYearFilter}
            />
          )}
          <IconButton onClick={() => setShowSettings(!showSettings)} color={showSettings ? "primary" : "default"}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="inherit" indicatorColor="primary">
          <Tab label="Chilometraggio" icon={<SpeedIcon />} iconPosition="start" />
          <Tab label="Pneumatici" icon={<TireIcon />} iconPosition="start" />
          <Tab label="Analisi Costi" icon={<FuelIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <Collapse in={showSettings}>
        <Paper sx={{ p: 3, mb: 4, borderRadius: 4, background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Impostazioni Veicolo</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Km iniziali (al momento dell'acquisto o inizio tracking)"
              type="number"
              value={initialMileageValue}
              onChange={(e) => setInitialMileageValue(e.target.value)}
              variant="filled"
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleSaveInitialMileage}>Salva Baseline</Button>
          </Box>
          <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.6 }}>
            Questo valore verrà usato come base per calcolare la distanza percorsa dalla tua prima registrazione.
          </Typography>
        </Paper>
      </Collapse>

      {/* CHILOMETRAGGIO TAB */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: 4, height: '100%', boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SpeedIcon sx={{ mr: 1, opacity: 0.8 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Km Totali Veicolo</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>{totalOdometer.toLocaleString('it-IT')} <small style={{ fontSize: '1.2rem', opacity: 0.7 }}>km</small></Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>Distanza totale registrata</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {editingId ? 'Modifica Lettura' : 'Registra Nuova Lettura'}
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField select fullWidth label="Mese" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} variant="filled" SelectProps={{ native: true }}>
                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField type="number" fullWidth label="Anno" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} variant="filled" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField type="number" fullWidth label="Km sul cruscotto" value={newReading} onChange={(e) => setNewReading(e.target.value)} variant="filled" placeholder="Esempio: 45200" />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button fullWidth variant="contained" size="large" onClick={handleSaveMileage} sx={{ height: 56, borderRadius: 2 }}>
                    {editingId ? 'Aggiorna' : 'Salva'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {yearStats.chartData.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 4, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 4 }}>Andamento Chilometri Percorsi ({selectedYearFilter})</Typography>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearStats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} km`} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ fontWeight: 600 }} />
                      <Line type="monotone" dataKey="km" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>Statistiche {selectedYearFilter}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.6 }}>Riepilogo mensile dei chilometri percorsi</Typography>
                </Box>
                <Box sx={{ textAlign: 'right', display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Totale Anno</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#6366f1' }}>{yearStats.totalKmYear.toLocaleString('it-IT')} km</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Media Mensile</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>{Math.round(yearStats.avgKmYear).toLocaleString('it-IT')} km</Typography>
                  </Box>
                </Box>
              </Box>

              <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, opacity: 0.7 }}>Mese</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7 }}>Lettura Cruscotto</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7 }}>Differenza (Km Fatti)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7 }}>Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {yearStats.monthlyData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{months[row.month - 1]}</TableCell>
                        <TableCell align="right">{row.reading.toLocaleString('it-IT')} km</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#10b981' }}>
                            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>+{row.delta.toLocaleString('it-IT')} km</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => handleEditMileage(row)} sx={{ mr: 1 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => { if (window.confirm('Eliminare questa lettura?')) deleteCarMileage(row.id); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ background: tireStats.currentTire === 'summer' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(30, 41, 59, 0.4)', borderRadius: 4, height: '100%', border: tireStats.currentTire === 'summer' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Pneumatici Estivi</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{tireSettings.summerModel || 'Non impostato'}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setIsEditingTireModels(true)}><SettingsIcon fontSize="small" /></IconButton>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#f59e0b' }}>{tireStats.summerTotal.toLocaleString('it-IT')} <small style={{ fontSize: '1.2rem', opacity: 0.7 }}>km</small></Typography>
                <Typography variant="body2" sx={{ opacity: 0.6 }}>Chilometraggio totale cumulativo</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ background: tireStats.currentTire === 'winter' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.4)', borderRadius: 4, height: '100%', border: tireStats.currentTire === 'winter' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Pneumatici Invernali</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{tireSettings.winterModel || 'Non impostato'}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setIsEditingTireModels(true)}><SettingsIcon fontSize="small" /></IconButton>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#3b82f6' }}>{tireStats.winterTotal.toLocaleString('it-IT')} <small style={{ fontSize: '1.2rem', opacity: 0.7 }}>km</small></Typography>
                <Typography variant="body2" sx={{ opacity: 0.6 }}>Chilometraggio totale cumulativo</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Collapse in={isEditingTireModels} sx={{ width: '100%', px: 4 }}>
            <Paper sx={{ p: 4, mt: 4, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30, 41, 59, 0.8)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Imposta Modelli e Baseline</Typography>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="Modello Estive" value={tireModelEdit.summer} onChange={(e) => setTireModelEdit({ ...tireModelEdit, summer: e.target.value })} variant="filled" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="Modello Invernali" value={tireModelEdit.winter} onChange={(e) => setTireModelEdit({ ...tireModelEdit, winter: e.target.value })} variant="filled" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, display: 'block', mb: 1 }}>Gomme al ritiro dell'auto</Typography>
                  <RadioGroup row value={tireModelEdit.initialType} onChange={(e) => setTireModelEdit({ ...tireModelEdit, initialType: e.target.value as any })}>
                    <FormControlLabel value="summer" control={<Radio size="small" />} label="Estive" />
                    <FormControlLabel value="winter" control={<Radio size="small" />} label="Invernali" />
                  </RadioGroup>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" size="large" onClick={handleSaveTireModels}>Salva Impostazioni</Button>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>

          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>Monta Nuovi Pneumatici</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField type="date" fullWidth label="Data del cambio" value={newTireChange.date} onChange={(e) => setNewTireChange({ ...newTireChange, date: e.target.value })} variant="filled" InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField select fullWidth label="Nuovo Set Montato" value={newTireChange.type} onChange={(e) => setNewTireChange({ ...newTireChange, type: e.target.value as any })} variant="filled">
                    <MenuItem value="summer">Estivi</MenuItem>
                    <MenuItem value="winter">Invernali</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField type="number" fullWidth label="Odomatro al cambio (Km)" value={newTireChange.odometer} onChange={(e) => setNewTireChange({ ...newTireChange, odometer: e.target.value })} variant="filled" />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button fullWidth variant="contained" size="large" onClick={handleSaveTireChange} sx={{ height: 56, borderRadius: 2 }}>{editingTireChangeId ? 'Modifica' : 'Registra'}</Button>
                </Grid>
              </Grid>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.5 }}>
                Registrando un cambio, il sistema calcolerà i km fatti dal set precedente fino a questa lettura.
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>Cronologia Cambi e Utilizzo</Typography>
              <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, opacity: 0.7 }}>Data</TableCell>
                      <TableCell sx={{ fontWeight: 700, opacity: 0.7 }}>Evento</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7 }}>Lettura Cruscotto</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7 }}>Km Percorsi dal set precedente</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7 }}>Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ opacity: 0.6, fontStyle: 'italic' }}>
                      <TableCell>-</TableCell>
                      <TableCell>Baseline veicolo</TableCell>
                      <TableCell align="right">{carInitialMileage.toLocaleString('it-IT')} km</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                    {tireStats.history.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{dayjs(row.date).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ fontSize: '0.8rem', mr: 1, color: 'rgba(255,255,255,0.5)' }}>Montati</Box>
                            <Box sx={{ color: row.type === 'summer' ? '#f59e0b' : '#3b82f6', fontWeight: 700 }}>
                              {row.type === 'summer' ? 'Estivi' : 'Invernali'}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{row.odometer.toLocaleString('it-IT')} km</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Typography sx={{ fontWeight: 700 }}>{row.runKm.toLocaleString('it-IT')} km</Typography>
                            <Box sx={{ fontSize: '0.7rem', ml: 1, color: row.tireThatRan === 'summer' ? '#f59e0b' : '#3b82f6', opacity: 0.8 }}>
                              ({row.tireThatRan === 'summer' ? 'Estive' : 'Invernali'})
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => handleEditTireChange(row)} sx={{ mr: 1 }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => { if (window.confirm('Eliminare questo cambio?')) deleteTireChange(row.id); }}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {tireStats.currentRunKm > 0 && (
                      <TableRow sx={{ background: 'rgba(255,255,255,0.02)' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Oggi</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Run in corso</TableCell>
                        <TableCell align="right">{totalOdometer.toLocaleString('it-IT')} km</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Typography sx={{ fontWeight: 700 }}>{tireStats.currentRunKm.toLocaleString('it-IT')} km</Typography>
                            <Box sx={{ fontSize: '0.7rem', ml: 1, color: tireStats.currentTire === 'summer' ? '#f59e0b' : '#3b82f6' }}>
                              ({tireStats.currentTire === 'summer' ? 'Estive' : 'Invernali'})
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">-</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ANALISI COSTI TAB */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 4, height: '100%', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FuelIcon sx={{ mr: 1, opacity: 0.8 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Spesa Carburante {selectedYearFilter}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>{costStats.totalCostYear.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>Totale speso in benzina/diesel</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4, height: '100%', border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1, color: '#10b981' }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Efficienza Media</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981' }}>{costStats.avgEfficiencyYear.toFixed(3)} <small style={{ fontSize: '1rem', opacity: 0.7 }}>€/km</small></Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.6 }}>Costo medio per chilometro</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4, height: '100%', border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SpeedIcon sx={{ mr: 1, opacity: 0.6 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Km Totali {selectedYearFilter}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>{costStats.totalKmYear.toLocaleString('it-IT')} <small style={{ fontSize: '1rem', opacity: 0.7 }}>km</small></Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.6 }}>Distanza totale nell'anno selezionato</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 4 }}>Andamento Efficienza Carburante (€/km)</Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={costStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}€`} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ fontWeight: 600 }}
                      formatter={(value: number) => [`${value} €/km`, 'Efficienza']}
                    />
                    <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, mb: 3 }}>Dettaglio Mensile Costi</Typography>
              <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, opacity: 0.7 }}>Mese</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7 }}>Km Percorsi</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7 }}>Spesa Carburante</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7 }}>Efficienza (€/km)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {costStats.monthlyEfficiency.map((row) => (
                      <TableRow key={`${row.year}-${row.month}`}>
                        <TableCell sx={{ fontWeight: 600 }}>{months[row.month - 1]}</TableCell>
                        <TableCell align="right">{row.kmDriven.toLocaleString('it-IT')} km</TableCell>
                        <TableCell align="right">{row.fuelCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 800, color: '#10b981' }}>
                            {row.euroPerKm > 0 ? `${row.euroPerKm.toFixed(3)} €/km` : '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {costStats.monthlyEfficiency.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, opacity: 0.5 }}>
                          Nessun dato disponibile per l'anno {selectedYearFilter}. Assicurati di aver inserito sia i km che le spese carburante.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.5, fontStyle: 'italic' }}>
                * Le spese sono estratte automaticamente dalla categoria 'Trasporti' e sottocategorie 'Carburante', 'Benzina' o 'Gasolio'.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default CarPage;
