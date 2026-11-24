import { Download, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CarAnalyticsCharts from '../components/car/CarAnalyticsCharts';
import CarExpenseTable from '../components/car/CarExpenseTable';
import CarMileageTiresSection from '../components/car/CarMileageTiresSection';
import CarScopeBar from '../components/car/CarScopeBar';
import CarSummaryCards from '../components/car/CarSummaryCards';
import {
  applyLegacyDistance,
  availableCarYears,
  buildCarRows,
  buildDistanceYoY,
  buildMonthlyBuckets,
  computeCarTotals,
  latestCarDataYear,
  legacyDistanceFor,
  legacyDistanceYoY,
  legacyMileageSeries,
  listVehicleOptions,
  odometerDeltas,
  percentChange,
  selectCarTransactions,
  UNASSIGNED_VEHICLE,
  withDistance,
  type CarPeriod,
  type CarRow,
  type CarVehicleFilter,
} from '../components/car/car.utils';
import type { CarExpenseFilter, CarSort, CarSortField } from '../components/car/types';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { useFinanceStore } from '../store/useFinanceStore';
import { useUiStore } from '../store/useUiStore';
import { downloadCsv, escapeCsvField } from '../utils/csv.utils';
import { formatCurrency, formatNumber } from '../utils/format.utils';

const CarPage: React.FC = () => {
  const { t } = useTranslation();
  const { transactions, carMileage, carInitialMileage, isLoading, duplicateTransaction, deleteTransaction } =
    useFinanceStore();
  const openTransactionDrawer = useUiStore((state) => state.openTransactionDrawer);

  const [vehicle, setVehicle] = useState<CarVehicleFilter>('all');
  const [period, setPeriod] = useState<CarPeriod | null>(null);
  const [search, setSearch] = useState('');
  const [expenseFilter, setExpenseFilter] = useState<CarExpenseFilter>('all');
  const [sort, setSort] = useState<CarSort>({ field: 'date', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<CarRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const years = useMemo(() => {
    const set = new Set([...availableCarYears(transactions), ...carMileage.map((record) => record.year)]);
    return Array.from(set).sort((a, b) => b - a);
  }, [transactions, carMileage]);
  const latestDataYear = useMemo(() => latestCarDataYear(transactions, carMileage), [transactions, carMileage]);
  /** `null` means "follow the latest year with data", so a 2025-only account is not empty in 2026. */
  const effectivePeriod: CarPeriod = period ?? latestDataYear;
  const vehicles = useMemo(() => listVehicleOptions(transactions), [transactions]);

  /** All years for the selected vehicle: odometer deltas need the prior reading. */
  const scopedTransactions = useMemo(
    () => selectCarTransactions(transactions, { vehicle, period: 'all' }),
    [transactions, vehicle],
  );
  const deltas = useMemo(() => odometerDeltas(scopedTransactions), [scopedTransactions]);

  const totals = useMemo(
    () => computeCarTotals(transactions, deltas, { vehicle, period: effectivePeriod }),
    [transactions, deltas, vehicle, effectivePeriod],
  );
  const previousTotals = useMemo(
    () =>
      effectivePeriod === 'all'
        ? null
        : computeCarTotals(transactions, deltas, { vehicle, period: effectivePeriod - 1 }),
    [transactions, deltas, vehicle, effectivePeriod],
  );
  const spendDeltaPercent = useMemo(
    () => (previousTotals === null ? null : percentChange(totals.spend, previousTotals.spend)),
    [totals.spend, previousTotals],
  );

  const legacyPoints = useMemo(
    () => legacyMileageSeries(carMileage, carInitialMileage),
    [carMileage, carInitialMileage],
  );

  /**
   * The manual log has no vehicle, so it belongs to the untagged/main scope. Use
   * it only while that scope has no transaction-level distance, otherwise the
   * same km would be counted twice.
   */
  const unassignedTotals = useMemo(
    () => computeCarTotals(transactions, deltas, { vehicle: UNASSIGNED_VEHICLE, period: effectivePeriod }),
    [transactions, deltas, effectivePeriod],
  );
  const legacyScope = vehicle === 'all' || vehicle === UNASSIGNED_VEHICLE;
  const useLegacyDistance = legacyScope && unassignedTotals.distanceKm === 0 && legacyPoints.length > 0;
  const legacyDistance = useMemo(
    () => legacyDistanceFor(legacyPoints, effectivePeriod),
    [legacyPoints, effectivePeriod],
  );
  const displayTotals = useMemo(() => {
    if (!useLegacyDistance) return totals;
    const baseDistance = vehicle === 'all' ? totals.distanceKm : 0;
    const months = Array.from(new Set([...totals.months, ...legacyDistance.months])).sort();
    return withDistance(totals, baseDistance + legacyDistance.distanceKm, months);
  }, [useLegacyDistance, totals, vehicle, legacyDistance]);

  const chartYear = effectivePeriod === 'all' ? latestDataYear : effectivePeriod;
  const buckets = useMemo(
    () => buildMonthlyBuckets(transactions, deltas, vehicle, chartYear),
    [transactions, deltas, vehicle, chartYear],
  );
  const yoy = useMemo(
    () => buildDistanceYoY(transactions, deltas, vehicle, chartYear),
    [transactions, deltas, vehicle, chartYear],
  );
  const displayBuckets = useMemo(
    () => (useLegacyDistance ? applyLegacyDistance(buckets, legacyPoints, chartYear) : buckets),
    [useLegacyDistance, buckets, legacyPoints, chartYear],
  );
  const displayYoY = useMemo(
    () => (useLegacyDistance ? legacyDistanceYoY(legacyPoints, chartYear) : yoy),
    [useLegacyDistance, legacyPoints, chartYear, yoy],
  );

  const rows = useMemo(
    () => buildCarRows(selectCarTransactions(transactions, { vehicle, period: effectivePeriod }), deltas),
    [transactions, deltas, vehicle, effectivePeriod],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (expenseFilter !== 'all' && row.expenseType !== expenseFilter) return false;
      if (!query) return true;
      return [row.transaction.description, row.vehicleName, row.transaction.category, row.transaction.subcategory]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [rows, search, expenseFilter]);

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows].sort((a, b) => {
      if (sort.field === 'amount') return Math.abs(a.transaction.amount) - Math.abs(b.transaction.amount);
      if (sort.field === 'odometer') return (a.transaction.odometerKm ?? 0) - (b.transaction.odometerKm ?? 0);
      return a.transaction.date.localeCompare(b.transaction.date);
    });
    return sort.direction === 'asc' ? sorted : sorted.reverse();
  }, [filteredRows, sort]);

  const lastPage = Math.max(0, Math.ceil(sortedRows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);
  const paginatedRows = useMemo(
    () => sortedRows.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage),
    [sortedRows, currentPage, rowsPerPage],
  );
  const filteredSpend = useMemo(
    () => sortedRows.reduce((sum, row) => sum + Math.abs(row.transaction.amount), 0),
    [sortedRows],
  );

  const hasSpend = displayBuckets.some((bucket) => bucket.fuelSpend + bucket.otherSpend > 0);
  const hasDistance =
    displayTotals.distanceKm > 0 || displayYoY.some((point) => point.current !== null || point.previous !== null);
  const onlyUnassigned = vehicles.length > 0 && vehicles.every((option) => option.key === UNASSIGNED_VEHICLE);

  const resetPage = () => setPage(0);

  const handleSortChange = (field: CarSortField) => {
    setSort((current) => ({
      field,
      direction: current.field === field ? (current.direction === 'asc' ? 'desc' : 'asc') : field === 'date' ? 'desc' : 'asc',
    }));
  };

  const handleEdit = (row: CarRow) => {
    openTransactionDrawer('expense', row.transaction);
  };

  const handleDuplicate = (row: CarRow) => {
    void duplicateTransaction(row.transaction.id);
    setToast(t('car.table.duplicated'));
  };

  const handleExportCsv = () => {
    const separator = ';';
    const header = [
      t('car.table.date'),
      t('car.table.vehicle'),
      t('car.table.vehicleType'),
      t('car.table.type'),
      t('car.table.description'),
      t('car.table.odometer'),
      t('car.table.liters'),
      t('car.table.pricePerLiter'),
      t('car.table.total'),
      t('car.table.efficiency'),
    ];

    const lines = sortedRows.map((row) => {
      const { transaction } = row;
      return [
        transaction.date,
        row.vehicleName ?? t('car.vehicles.unassigned'),
        t(`car.vehicles.${row.vehicleType}`),
        row.expenseType ? t(`car.expenseTypes.${row.expenseType}`) : '',
        transaction.description,
        transaction.odometerKm !== undefined ? formatNumber(transaction.odometerKm) : '',
        row.liters !== null ? formatNumber(row.liters, 2) : '',
        row.pricePerLiter === null ? '' : formatNumber(row.pricePerLiter, 3),
        formatNumber(Math.abs(transaction.amount), 2),
        row.kmPerLiter === null ? '' : formatNumber(row.kmPerLiter, 2),
      ]
        .map((field) => escapeCsvField(String(field), separator))
        .join(separator);
    });

    downloadCsv(
      `auto-${effectivePeriod === 'all' ? 'tutti-gli-anni' : effectivePeriod}-${dayjs().format('YYYY-MM-DD')}.csv`,
      `\uFEFF${[header.map((field) => escapeCsvField(field, separator)).join(separator), ...lines].join('\r\n')}\r\n`,
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <CarScopeBar
        vehicles={vehicles}
        vehicle={vehicle}
        onVehicleChange={(value) => {
          setVehicle(value);
          resetPage();
        }}
        years={years}
        period={effectivePeriod}
        onPeriodChange={(value) => {
          setPeriod(value);
          resetPage();
        }}
      />

      {onlyUnassigned && (
        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
          {t('car.filters.tagHint')}
        </Alert>
      )}

      <CarSummaryCards totals={displayTotals} spendDeltaPercent={spendDeltaPercent} />

      <CarAnalyticsCharts
        buckets={displayBuckets}
        yoy={displayYoY}
        year={chartYear}
        hasSpend={hasSpend}
        hasDistance={hasDistance}
        legacyDistance={useLegacyDistance}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            placeholder={t('car.table.search')}
            sx={{ width: 230, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 1 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: 'colors.muted' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Select
            size="small"
            value={expenseFilter}
            onChange={(event) => {
              setExpenseFilter(event.target.value as CarExpenseFilter);
              resetPage();
            }}
            inputProps={{ 'aria-label': t('car.table.type') }}
            sx={{
              minWidth: 160,
              height: 34,
              fontSize: '0.75rem',
              bgcolor: 'colors.bg',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'colors.border' },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.78rem' }}>
              {t('car.filters.allTypes')}
            </MenuItem>
            <MenuItem value="fuel" sx={{ fontSize: '0.78rem' }}>
              {t('car.expenseTypes.fuel')}
            </MenuItem>
            <MenuItem value="maintenance" sx={{ fontSize: '0.78rem' }}>
              {t('car.expenseTypes.maintenance')}
            </MenuItem>
            <MenuItem value="tax" sx={{ fontSize: '0.78rem' }}>
              {t('car.expenseTypes.tax')}
            </MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" noWrap sx={{ color: 'colors.subtle' }}>
            {t('car.table.summary', {
              count: formatNumber(sortedRows.length),
              spend: formatCurrency(filteredSpend),
            })}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download sx={{ fontSize: 16 }} />}
            onClick={handleExportCsv}
            sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'colors.subtle', borderColor: 'colors.border' }}
          >
            {t('car.table.exportCsv')}
          </Button>
        </Box>
      </Box>

      <CarExpenseTable
        rows={paginatedRows}
        sort={sort}
        onSortChange={handleSortChange}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        total={sortedRows.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          resetPage();
        }}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={setDeleteTarget}
      />

      <CarMileageTiresSection year={effectivePeriod === 'all' ? chartYear : effectivePeriod} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('car.table.deleteTitle')}
        message={t('car.table.deleteMessage', { description: deleteTarget?.transaction.description ?? '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deleteTransaction(deleteTarget.transaction.id);
          setDeleteTarget(null);
        }}
      />

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast(null)}>
        <Alert severity="success" variant="filled" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CarPage;
