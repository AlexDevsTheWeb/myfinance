import { ExpandMore, Speed, TireRepair } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { axisClasses } from '@mui/x-charts';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore, type CarMileageRecord, type TireChangeRecord } from '../../store/useFinanceStore';
import { formatNumber } from '../../utils/format.utils';
import { listVehicleOptions, primaryVehicle } from './car.utils';
import { CAR_COLORS } from './types';

interface CarMileageTiresSectionProps {
  /** Year selected in the page scope bar. The vehicle log is not vehicle-scoped. */
  year: number;
  /** Years available in the page scope, so the form can switch the page year. */
  years: number[];
  onYearChange: (year: number) => void;
}

const chartSx = {
  '&, & *, & svg': { overflow: 'visible !important' },
  [`& .${axisClasses.tickLabel}`]: { fill: 'rgba(148,163,184,0.9)', fontSize: 11 },
};

const monthLabel = (month: number): string => dayjs().month(month - 1).format('MMM');

const headerCellSx = {
  fontSize: '0.66rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'colors.subtle',
  py: 1,
  px: 1.25,
  borderColor: 'colors.border',
};

const bodyCellSx = { py: 0.9, px: 1.25, borderColor: 'rgba(30,41,59,0.5)' };

const CarMileageTiresSection: React.FC<CarMileageTiresSectionProps> = ({ year, years, onYearChange }) => {
  const { t } = useTranslation();
  const {
    carMileage,
    carInitialMileage,
    transactions,
    setCarInitialMileage,
    addCarMileage,
    updateCarMileage,
    tireSettings,
    tireChanges,
    addTireChange,
    updateTireChange,
  } = useFinanceStore();

  const [newReading, setNewReading] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mileageVehicle, setMileageVehicle] = useState('');
  const [initialMileageValue, setInitialMileageValue] = useState(String(carInitialMileage));
  const [newTireChange, setNewTireChange] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    type: 'winter' as 'summer' | 'winter',
    odometer: '',
  });
  const [editingTireId, setEditingTireId] = useState<string | null>(null);

  const vehicleOptions = useMemo(
    () => listVehicleOptions(transactions, carMileage).filter((option) => option.name !== null),
    [transactions, carMileage],
  );
  const primary = useMemo(() => primaryVehicle(transactions, carMileage), [transactions, carMileage]);
  const effectiveVehicle = mileageVehicle || primary || '';

  const yearOptions = useMemo(() => {
    const set = new Set<number>([year, ...years]);
    const now = dayjs().year();
    for (let candidate = now - 5; candidate <= now; candidate += 1) set.add(candidate);
    return Array.from(set).sort((a, b) => b - a);
  }, [year, years]);

  const totalOdometer = useMemo(() => {
    if (carMileage.length === 0) return carInitialMileage;
    return Math.max(...carMileage.map((m) => m.reading), carInitialMileage);
  }, [carMileage, carInitialMileage]);

  const yearStats = useMemo(() => {
    const yearRecords = carMileage
      .filter((m) => m.year === year)
      .sort((a, b) => a.month - b.month);

    const before = [...carMileage].sort(
      (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
    );

    const monthlyData = yearRecords.map((record) => {
      const previous = before.filter(
        (m) => m.year * 12 + m.month < record.year * 12 + record.month,
      );
      const prevReading = previous.length > 0 ? previous[previous.length - 1].reading : carInitialMileage;
      return { ...record, delta: record.reading - prevReading };
    });

    const totalKmYear = monthlyData.reduce((acc, curr) => acc + curr.delta, 0);
    return {
      monthlyData: [...monthlyData].reverse(),
      totalKmYear,
      avgKmYear: monthlyData.length > 0 ? totalKmYear / monthlyData.length : 0,
      chartData: monthlyData.map((d) => ({ name: monthLabel(d.month), km: d.delta })),
    };
  }, [carMileage, carInitialMileage, year]);

  const historicalStats = useMemo(() => {
    const sorted = [...carMileage].sort(
      (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
    );
    const yearMap = new Map<number, { total: number; months: number }>();
    sorted.forEach((m) => {
      const previous = sorted.filter((p) => p.year * 12 + p.month < m.year * 12 + m.month);
      const prevReading = previous.length > 0 ? previous[previous.length - 1].reading : carInitialMileage;
      const existing = yearMap.get(m.year) ?? { total: 0, months: 0 };
      yearMap.set(m.year, { total: existing.total + (m.reading - prevReading), months: existing.months + 1 });
    });
    return Array.from(yearMap.entries())
      .map(([entryYear, value]) => ({ year: entryYear, ...value }))
      .sort((a, b) => b.year - a.year);
  }, [carMileage, carInitialMileage]);

  const tireStats = useMemo(() => {
    const sorted = [...tireChanges].sort((a, b) => a.date.localeCompare(b.date));
    let summerKm = 0;
    let winterKm = 0;
    let lastOdometer = carInitialMileage;
    let lastType = tireSettings.initialTireType || 'summer';
    const history: (TireChangeRecord & { runKm: number; tireThatRan: 'summer' | 'winter' })[] = [];

    for (const change of sorted) {
      const runKm = change.odometer - lastOdometer;
      if (lastType === 'summer') summerKm += runKm;
      else winterKm += runKm;
      history.push({ ...change, runKm, tireThatRan: lastType });
      lastOdometer = change.odometer;
      lastType = change.type;
    }

    const currentRunKm = totalOdometer - lastOdometer;
    if (lastType === 'summer') summerKm += currentRunKm;
    else winterKm += currentRunKm;

    return {
      history: [...history].reverse(),
      summerTotal: summerKm,
      winterTotal: winterKm,
      currentTire: lastType,
      currentRunKm,
    };
  }, [tireChanges, totalOdometer, carInitialMileage, tireSettings.initialTireType]);

  const saveMileage = () => {
    const reading = Number(newReading.replace(',', '.'));
    if (!Number.isFinite(reading) || reading < 0) return;

    if (editingId) {
      const existing = carMileage.find((m) => m.id === editingId);
      updateCarMileage({
        id: editingId,
        year,
        month: selectedMonth,
        reading,
        ...(effectiveVehicle ? { vehicleName: effectiveVehicle } : {}),
        ...(existing?.vehicleName && !effectiveVehicle ? { vehicleName: existing.vehicleName } : {}),
      });
    } else {
      const existing = carMileage.find((m) => m.month === selectedMonth && m.year === year);
      const record = {
        id: existing?.id ?? crypto.randomUUID(),
        year,
        month: selectedMonth,
        reading,
        ...(effectiveVehicle ? { vehicleName: effectiveVehicle } : {}),
      };
      if (existing) updateCarMileage(record);
      else addCarMileage(record);
    }
    setNewReading('');
    setEditingId(null);
  };

  const editMileage = (record: CarMileageRecord) => {
    setEditingId(record.id);
    setSelectedMonth(record.month);
    setMileageVehicle(record.vehicleName ?? '');
    setNewReading(String(record.reading));
  };

  const saveTireChange = () => {
    const odometer = Number(newTireChange.odometer.replace(',', '.'));
    if (!Number.isFinite(odometer) || odometer < 0) return;

    const record: TireChangeRecord = {
      id: editingTireId ?? crypto.randomUUID(),
      date: newTireChange.date,
      type: newTireChange.type,
      odometer,
    };
    if (editingTireId) updateTireChange(record);
    else addTireChange(record);

    setNewTireChange({ date: dayjs().format('YYYY-MM-DD'), type: 'winter', odometer: '' });
    setEditingTireId(null);
  };

  const editTireChange = (record: TireChangeRecord) => {
    setEditingTireId(record.id);
    setNewTireChange({ date: record.date, type: record.type, odometer: String(record.odometer) });
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('car.log.title')}
      </Typography>

      <Accordion
        disableGutters
        sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'colors.border', borderRadius: 3, '&:before': { display: 'none' }, mb: 1.5 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Speed sx={{ fontSize: 18, color: 'colors.cyan' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('car.mileage')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'colors.subtle', fontFamily: (theme) => theme.colors.mono }}>
              {formatNumber(totalOdometer)} km
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px 1fr 1fr' }, gap: 2 }}>
            <Paper sx={{ p: 1.5, borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: 'colors.subtle', fontWeight: 700 }}>
                {t('car.totalKm')}
              </Typography>
              <Typography sx={{ fontFamily: (theme) => theme.colors.mono, fontSize: '1.3rem', fontWeight: 700 }}>
                {formatNumber(totalOdometer)} km
              </Typography>

              <TextField
                select
                size="small"
                fullWidth
                label={t('car.log.vehicle')}
                value={effectiveVehicle}
                disabled={vehicleOptions.length === 0}
                onChange={(event) => setMileageVehicle(event.target.value)}
                sx={{ mb: 1, mt: 1.5 }}
              >
                {vehicleOptions.map((option) => (
                  <MenuItem key={option.key} value={option.name ?? ''}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <TextField
                  select
                  size="small"
                  label={t('car.year')}
                  value={year}
                  onChange={(event) => onYearChange(Number(event.target.value))}
                  sx={{ width: 96 }}
                >
                  {yearOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label={t('car.log.monthCovered')}
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(Number(event.target.value))}
                  sx={{ minWidth: 140, flexGrow: 1 }}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                    <MenuItem key={month} value={month}>
                      {monthLabel(month)}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <TextField
                size="small"
                type="number"
                label={t('car.odometer')}
                value={newReading}
                onChange={(event) => setNewReading(event.target.value)}
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'colors.subtle' }}>
                {t('car.log.readingHint', { month: monthLabel(selectedMonth), year })}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button size="small" variant="contained" onClick={saveMileage} sx={{ textTransform: 'none' }}>
                  {editingId ? t('car.update') : t('car.addMileage')}
                </Button>
                {editingId && (
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingId(null);
                      setNewReading('');
                    }}
                    sx={{ textTransform: 'none', color: 'colors.subtle' }}
                  >
                    {t('common.cancel')}
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  size="small"
                  type="number"
                  label={t('car.initialKm')}
                  value={initialMileageValue}
                  onChange={(event) => setInitialMileageValue(event.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  size="small"
                  onClick={() => {
                    const value = Number(initialMileageValue.replace(',', '.'));
                    if (Number.isFinite(value) && value >= 0) setCarInitialMileage(value);
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  {t('car.save')}
                </Button>
              </Box>
            </Paper>

            <Paper sx={{ p: 1.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'colors.subtle', fontWeight: 700 }}>
                    {year}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatNumber(yearStats.totalKmYear)} km</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'colors.subtle', fontWeight: 700 }}>
                    {t('car.avgData')}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatNumber(yearStats.avgKmYear)} km</Typography>
                </Box>
              </Box>
              <Box sx={{ height: 190 }}>
                {yearStats.chartData.length > 0 ? (
                  <LineChart
                    series={[{ data: yearStats.chartData.map((d) => d.km), color: CAR_COLORS.rate, showMark: false }]}
                    xAxis={[{ scaleType: 'band', data: yearStats.chartData.map((d) => d.name), disableLine: true, disableTicks: true }]}
                    yAxis={[{ disableLine: true, disableTicks: true }]}
                    grid={{ vertical: false, horizontal: true }}
                    height={190}
                    margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
                    sx={chartSx}
                  />
                ) : (
                  <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
                    {t('car.log.noMileage')}
                  </Typography>
                )}
              </Box>
            </Paper>

            <Paper sx={{ p: 1.5, borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: 'colors.subtle', fontWeight: 700 }}>
                {t('car.history')}
              </Typography>
              <Box sx={{ maxHeight: 90, overflow: 'auto', mb: 1 }}>
                {historicalStats.map((entry) => (
                  <Box key={entry.year} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>{entry.year}</span>
                    <span style={{ fontFamily: 'inherit', fontWeight: 600 }}>{formatNumber(entry.total)} km</span>
                  </Box>
                ))}
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerCellSx}>{t('car.log.vehicle')}</TableCell>
                      <TableCell sx={headerCellSx}>{t('car.month')}</TableCell>
                      <TableCell align="right" sx={headerCellSx}>
                        {t('car.km')}
                      </TableCell>
                      <TableCell align="right" sx={headerCellSx} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {yearStats.monthlyData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={bodyCellSx}>
                          {row.vehicleName ?? primary ?? t('car.vehicles.unassigned')}
                        </TableCell>
                        <TableCell sx={bodyCellSx}>
                          {monthLabel(row.month)}{' '}
                          <Box component="span" sx={{ color: 'colors.subtle', fontSize: '0.68rem' }}>
                            {row.year}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ ...bodyCellSx, fontFamily: (theme) => theme.colors.mono }}>
                          +{formatNumber(row.delta)}
                        </TableCell>
                        <TableCell align="right" sx={bodyCellSx}>
                          <IconButton size="small" onClick={() => editMileage(row)}>
                            <Speed sx={{ fontSize: 14 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        disableGutters
        sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'colors.border', borderRadius: 3, '&:before': { display: 'none' } }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TireRepair sx={{ fontSize: 18, color: 'colors.amber' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('car.tires')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
              {tireStats.currentTire === 'summer' ? t('car.summer') : t('car.winter')} ·{' '}
              {formatNumber(tireStats.currentRunKm)} km
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px 1fr 1fr' }, gap: 2 }}>
            <Paper sx={{ p: 1.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'colors.subtle', fontWeight: 700 }}>
                    {t('car.summer')}
                  </Typography>
                  <Typography sx={{ fontFamily: (theme) => theme.colors.mono, fontWeight: 700 }}>
                    {formatNumber(tireStats.summerTotal)} km
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'colors.subtle', fontWeight: 700 }}>
                    {t('car.winter')}
                  </Typography>
                  <Typography sx={{ fontFamily: (theme) => theme.colors.mono, fontWeight: 700 }}>
                    {formatNumber(tireStats.winterTotal)} km
                  </Typography>
                </Box>
              </Box>

              <TextField
                size="small"
                type="date"
                fullWidth
                label={t('car.date')}
                value={newTireChange.date}
                onChange={(event) => setNewTireChange({ ...newTireChange, date: event.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  select
                  size="small"
                  label={t('car.type')}
                  value={newTireChange.type}
                  onChange={(event) =>
                    setNewTireChange({ ...newTireChange, type: event.target.value === 'winter' ? 'winter' : 'summer' })
                  }
                  sx={{ width: 120 }}
                >
                  <MenuItem value="summer">{t('car.summer')}</MenuItem>
                  <MenuItem value="winter">{t('car.winter')}</MenuItem>
                </TextField>
                <TextField
                  size="small"
                  type="number"
                  label={t('car.odometer')}
                  value={newTireChange.odometer}
                  onChange={(event) => setNewTireChange({ ...newTireChange, odometer: event.target.value })}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={saveTireChange} sx={{ textTransform: 'none' }}>
                  {editingTireId ? t('car.update') : t('car.addTire')}
                </Button>
                {editingTireId && (
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingTireId(null);
                      setNewTireChange({ date: dayjs().format('YYYY-MM-DD'), type: 'winter', odometer: '' });
                    }}
                    sx={{ textTransform: 'none', color: 'colors.subtle' }}
                  >
                    {t('common.cancel')}
                  </Button>
                )}
              </Box>
            </Paper>

            <Paper sx={{ p: 1.5, borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: 'colors.subtle', fontWeight: 700 }}>
                {t('car.history')}
              </Typography>
              <TableContainer sx={{ maxHeight: 220 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerCellSx}>{t('car.date')}</TableCell>
                      <TableCell sx={headerCellSx}>{t('car.type')}</TableCell>
                      <TableCell align="right" sx={headerCellSx}>
                        {t('car.km')}
                      </TableCell>
                      <TableCell align="right" sx={headerCellSx} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tireStats.history.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={bodyCellSx}>{dayjs(row.date).format('DD MMM YY')}</TableCell>
                        <TableCell sx={{ ...bodyCellSx, color: row.type === 'summer' ? 'colors.amber' : 'colors.cyan' }}>
                          {row.type === 'summer' ? t('car.summer') : t('car.winter')}
                        </TableCell>
                        <TableCell align="right" sx={{ ...bodyCellSx, fontFamily: (theme) => theme.colors.mono }}>
                          {formatNumber(row.runKm)}
                        </TableCell>
                        <TableCell align="right" sx={bodyCellSx}>
                          <IconButton size="small" onClick={() => editTireChange(row)}>
                            <TireRepair sx={{ fontSize: 14 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper sx={{ p: 1.5, borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: 'colors.subtle', fontWeight: 700 }}>
                {t('car.tireUsage')}
              </Typography>
              <Box sx={{ height: 220 }}>
                {tireStats.history.length > 0 ? (
                  <LineChart
                    series={[
                      {
                        data: tireStats.history.slice(0, 10).map((tire) => tire.runKm),
                        color: CAR_COLORS.fuel,
                        showMark: false,
                      },
                    ]}
                    xAxis={[
                      {
                        scaleType: 'band',
                        data: tireStats.history.slice(0, 10).map((_, index) => `${index + 1}`),
                        disableLine: true,
                        disableTicks: true,
                      },
                    ]}
                    yAxis={[{ disableLine: true, disableTicks: true }]}
                    grid={{ vertical: false, horizontal: true }}
                    height={220}
                    margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
                    sx={chartSx}
                  />
                ) : (
                  <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
                    {t('car.log.noTires')}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CarMileageTiresSection;
