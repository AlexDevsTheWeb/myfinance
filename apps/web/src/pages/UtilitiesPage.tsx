import { Download, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import UtilitiesAnalyticsCharts from '../components/utilities/UtilitiesAnalyticsCharts';
import UtilitiesFilterHeader from '../components/utilities/UtilitiesFilterHeader';
import UtilitiesSummaryCards from '../components/utilities/UtilitiesSummaryCards';
import UtilitiesTable from '../components/utilities/UtilitiesTable';
import { UTILITY_META, type UtilitiesPeriod, type UtilitiesSort, type UtilitiesTypeFilter } from '../components/utilities/types';
import {
  aggregateUtilities,
  availableUtilityYears,
  buildSpendSeries,
  buildUtilityDuplicate,
  buildYearOverYearSeries,
  classifyUtility,
  searchUtilityRows,
  selectUtilities,
  sortUtilityRows,
  toUtilityRows,
  yoyPercent,
  type UtilityRow,
} from '../components/utilities/utilities.utils';
import { useFinanceStore, type Transaction } from '../store/useFinanceStore';
import { useUiStore } from '../store/useUiStore';
import { downloadCsv, escapeCsvField } from '../utils/csv.utils';
import { formatCurrency, formatNumber } from '../utils/format.utils';

const UtilitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { transactions, isLoading, addTransaction, deleteTransaction } = useFinanceStore();
  const openTransactionDrawer = useUiStore((state) => state.openTransactionDrawer);

  const currentYear = dayjs().year();
  const [period, setPeriod] = useState<UtilitiesPeriod>(currentYear);
  const [typeFilter, setTypeFilter] = useState<UtilitiesTypeFilter>('all');
  const [yoyEnabled, setYoyEnabled] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<UtilitiesSort>({ field: 'date', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const years = useMemo(() => availableUtilityYears(transactions), [transactions]);

  /** KPI scope: the period only — the cards are the period's breakdown. */
  const periodBills = useMemo(() => selectUtilities(transactions, period, 'all'), [transactions, period]);

  /** Chart/table scope: the period plus the selected utility. */
  const filteredBills = useMemo(
    () => selectUtilities(transactions, period, typeFilter),
    [transactions, period, typeFilter],
  );

  const totalTotals = useMemo(() => aggregateUtilities(periodBills), [periodBills]);
  const electricityTotals = useMemo(() => aggregateUtilities(selectUtilities(periodBills, 'all', 'electricity')), [periodBills]);
  const gasTotals = useMemo(() => aggregateUtilities(selectUtilities(periodBills, 'all', 'gas')), [periodBills]);
  const waterTotals = useMemo(() => aggregateUtilities(selectUtilities(periodBills, 'all', 'water')), [periodBills]);

  const spendDeltaPercent = useMemo(() => {
    if (period === 'all') return null;
    const previous = aggregateUtilities(selectUtilities(transactions, period - 1, 'all')).spend;
    return yoyPercent(totalTotals.spend, previous);
  }, [transactions, period, totalTotals.spend]);

  const buckets = useMemo(() => buildSpendSeries(filteredBills, period), [filteredBills, period]);

  const yoySeries = useMemo(() => {
    if (!yoyEnabled || period === 'all' || typeFilter === 'all') return null;
    const bills = transactions.filter((transaction) => {
      if (classifyUtility(transaction) !== typeFilter) return false;
      const year = dayjs(transaction.date).year();
      return year === period || year === period - 1;
    });
    return buildYearOverYearSeries(bills, period);
  }, [transactions, yoyEnabled, period, typeFilter]);

  const allRows = useMemo(() => toUtilityRows(filteredBills), [filteredBills]);
  const visibleRows = useMemo(
    () => sortUtilityRows(searchUtilityRows(allRows, search), sort),
    [allRows, search, sort],
  );

  // Clamp during render: filtering can shrink the result set below the page.
  const lastPage = Math.max(0, Math.ceil(visibleRows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);
  const paginatedRows = useMemo(
    () => visibleRows.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage),
    [visibleRows, currentPage, rowsPerPage],
  );

  const unit = typeFilter === 'all' ? null : UTILITY_META[typeFilter].unit;
  const accent = typeFilter === 'all' ? theme.colors.cyan : UTILITY_META[typeFilter].color;

  const resetPage = useCallback(() => setPage(0), []);

  const handleSortChange = (field: UtilitiesSort['field']) => {
    setSort((current) =>
      current.field === field
        ? { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: field === 'date' ? 'desc' : 'asc' },
    );
  };

  const handleEdit = (row: UtilityRow) => {
    openTransactionDrawer('expense', row.transaction);
  };

  const handleDuplicate = (row: UtilityRow) => {
    void addTransaction(buildUtilityDuplicate(row.transaction));
    setToast(t('utilities.table.duplicated'));
  };

  const handleExportCsv = () => {
    const separator = ';';
    const header = [
      t('utilities.table.period'),
      t('utilities.table.provider'),
      t('utilities.table.kind'),
      t('utilities.table.total'),
      t('utilities.table.fixedFee'),
      t('utilities.table.energyFee'),
      t('utilities.table.consumption'),
      t('utilities.table.unit'),
      t('utilities.table.unitRate'),
      t('utilities.table.meter'),
    ];

    const lines = visibleRows.map((row) => {
      const { transaction, type, fixed, energy, hasSplit, unitRate } = row;
      const meta = UTILITY_META[type];
      return [
        transaction.date,
        transaction.provider ?? '',
        t(`utilities.types.${type}`),
        transaction.amount.toFixed(2).replace('.', ','),
        hasSplit ? fixed.toFixed(2).replace('.', ',') : '',
        hasSplit ? energy.toFixed(2).replace('.', ',') : '',
        transaction.consumption !== undefined ? formatNumber(transaction.consumption, 1) : '',
        meta.unit,
        unitRate !== null ? formatNumber(unitRate, 4) : '',
        transaction.meterId ?? '',
      ]
        .map((field) => escapeCsvField(String(field), separator))
        .join(separator);
    });

    downloadCsv(
      `utenze-${period === 'all' ? 'tutti-gli-anni' : period}-${dayjs().format('YYYY-MM-DD')}.csv`,
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
      <UtilitiesFilterHeader
        years={years}
        period={period}
        onPeriodChange={(value) => {
          setPeriod(value);
          resetPage();
        }}
        typeFilter={typeFilter}
        onTypeFilterChange={(value) => {
          setTypeFilter(value);
          resetPage();
        }}
        yoyEnabled={yoyEnabled}
        onYoyChange={setYoyEnabled}
        yoyDisabled={period === 'all' || typeFilter === 'all'}
      />

      <UtilitiesSummaryCards
        total={totalTotals}
        electricity={electricityTotals}
        gas={gasTotals}
        water={waterTotals}
        spendDeltaPercent={spendDeltaPercent}
        period={period}
      />

      <UtilitiesAnalyticsCharts
        buckets={buckets}
        yoy={yoySeries}
        yoyYear={period === 'all' ? null : period}
        unit={unit}
        accent={accent}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <TextField
          size="small"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetPage();
          }}
          placeholder={t('utilities.table.search')}
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" noWrap sx={{ color: 'colors.subtle' }}>
            {t('utilities.table.summary', {
              count: formatNumber(visibleRows.length),
              spend: formatCurrency(aggregateUtilities(visibleRows.map((row) => row.transaction)).spend),
            })}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download sx={{ fontSize: 16 }} />}
            onClick={handleExportCsv}
            sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'colors.subtle', borderColor: 'colors.border' }}
          >
            {t('utilities.table.exportCsv')}
          </Button>
        </Box>
      </Box>

      <UtilitiesTable
        rows={paginatedRows}
        sort={sort}
        onSortChange={handleSortChange}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        total={visibleRows.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          resetPage();
        }}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={(row) => setDeleteTarget(row.transaction)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('utilities.table.deleteTitle')}
        message={t('utilities.table.deleteMessage', { description: deleteTarget?.description ?? '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deleteTransaction(deleteTarget.id);
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

export default UtilitiesPage;
