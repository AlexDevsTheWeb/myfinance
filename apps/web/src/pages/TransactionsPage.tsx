import { Download, ViewColumn } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_COLUMN_VISIBILITY,
  LedgerFilterToolbar,
  LedgerSummaryCards,
  LedgerTransactionsTable,
  type LedgerColumnKey,
  type LedgerColumnVisibility,
  type LedgerPeriod,
  type LedgerSort,
  type LedgerTypeFilter,
} from '../components/ledger';
import { monthlyRecurringCost, nextRecurringCharge, resolvePeriodRange } from '../components/ledger/ledger.utils';
import TransactionModal from '../components/modals/TransactionModal';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { useBudgetStore } from '../store/useBudgetStore';
import { useFinanceStore, type Transaction } from '../store/useFinanceStore';
import { downloadCsv, transactionsToCsv } from '../utils/csv.utils';
import { formatNumber } from '../utils/format.utils';

const COLUMN_STORAGE_KEY = 'balancr.ledger.columns';

function readStoredColumns(): LedgerColumnVisibility {
  try {
    const stored = window.localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!stored) return DEFAULT_COLUMN_VISIBILITY;
    return { ...DEFAULT_COLUMN_VISIBILITY, ...(JSON.parse(stored) as Partial<LedgerColumnVisibility>) };
  } catch {
    return DEFAULT_COLUMN_VISIBILITY;
  }
}

const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    transactions,
    categories,
    incomeCategories,
    accounts,
    cards,
    recurringTransactions,
    isLoading,
    deleteTransaction,
    duplicateTransaction,
  } = useFinanceStore();
  const budgetTargets = useBudgetStore((state) => state.budgetTargets);

  // Filters
  const [period, setPeriod] = useState<LedgerPeriod>('month');
  const [customStart, setCustomStart] = useState<Dayjs | null>(null);
  const [customEnd, setCustomEnd] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [accountId, setAccountId] = useState('all');
  const [cardId, setCardId] = useState('all');
  const [typeFilter, setTypeFilter] = useState<LedgerTypeFilter>('all');
  const [search, setSearch] = useState('');

  // Table
  const [sort, setSort] = useState<LedgerSort>({ field: 'date', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columns, setColumns] = useState<LedgerColumnVisibility>(readStoredColumns);
  const [columnsAnchor, setColumnsAnchor] = useState<null | HTMLElement>(null);

  // Modal / dialogs
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(columns));
    } catch {
      // Storage can be unavailable (private mode); the toggle still works in-session.
    }
  }, [columns]);

  const allCategories = useMemo(
    () => [...categories, ...incomeCategories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories, incomeCategories],
  );

  const [rangeStart, rangeEnd] = useMemo(
    () => resolvePeriodRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  /** Period/account/card window — the KPI cards describe this slice. */
  const scopeTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const date = dayjs(transaction.date);
        if (date.isBefore(rangeStart, 'day') || date.isAfter(rangeEnd, 'day')) return false;
        if (accountId !== 'all' && transaction.accountId !== accountId) return false;
        if (cardId === 'none' && transaction.cardId) return false;
        if (cardId !== 'all' && cardId !== 'none' && transaction.cardId !== cardId) return false;
        return true;
      }),
    [transactions, rangeStart, rangeEnd, accountId, cardId],
  );

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = scopeTransactions.filter((transaction) => {
      if (category !== 'all' && transaction.category !== category) return false;
      if (subcategory !== 'all' && transaction.subcategory !== subcategory) return false;
      if (typeFilter === 'recurring' && !transaction.recurringLinkId) return false;
      if (typeFilter === 'oneOff' && transaction.recurringLinkId) return false;
      if (term && !transaction.description.toLowerCase().includes(term)) return false;
      return true;
    });

    return result.sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1;
      if (sort.field === 'amount') return (a.amount - b.amount) * direction;
      return (dayjs(a.date).valueOf() - dayjs(b.date).valueOf()) * direction;
    });
  }, [scopeTransactions, category, subcategory, typeFilter, search, sort]);

  const metrics = useMemo(() => {
    const isIncome = (transaction: Transaction) => transaction.type === 'income';
    const isExpense = (transaction: Transaction) => transaction.type === 'expense';

    const inflow = scopeTransactions.filter(isIncome).reduce((sum, transaction) => sum + transaction.amount, 0);
    const outflow = scopeTransactions.filter(isExpense).reduce((sum, transaction) => sum + transaction.amount, 0);
    const inflowCount = scopeTransactions.filter(isIncome).length;
    const outflowCount = scopeTransactions.filter(isExpense).length;

    // Previous window of the same length, for the inflow trend badge.
    const lengthInDays = Math.max(1, rangeEnd.startOf('day').diff(rangeStart.startOf('day'), 'day') + 1);
    const previousStart = rangeStart.subtract(lengthInDays, 'day');
    const previousInflow = transactions
      .filter((transaction) => {
        const date = dayjs(transaction.date);
        return (
          transaction.type === 'income' &&
          !date.isBefore(previousStart, 'day') &&
          date.isBefore(rangeStart, 'day') &&
          (accountId === 'all' || transaction.accountId === accountId)
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const inflowDeltaPercent = previousInflow > 0 ? ((inflow - previousInflow) / previousInflow) * 100 : null;

    const activeRecurring = recurringTransactions.filter(
      (recurring) =>
        recurring.type === 'expense' &&
        (!recurring.endDate || !dayjs(recurring.endDate).isBefore(dayjs(), 'day')),
    );
    const recurringMonthly = activeRecurring.reduce(
      (sum, recurring) => sum + monthlyRecurringCost(recurring),
      0,
    );
    const nextDates = activeRecurring
      .map((recurring) => nextRecurringCharge(recurring))
      .filter((date): date is Dayjs => date !== null)
      .sort((a, b) => a.valueOf() - b.valueOf());

    const monthlyBudget = budgetTargets
      .filter((target) => target.period === 'monthly')
      .reduce((sum, target) => sum + target.targetAmount, 0);
    const budgetPercent = monthlyBudget > 0 ? (outflow / monthlyBudget) * 100 : null;

    return {
      inflow,
      outflow,
      inflowCount,
      outflowCount,
      inflowDeltaPercent,
      budgetPercent,
      recurringMonthly,
      recurringCount: activeRecurring.length,
      nextRecurringDate: nextDates[0]?.format('YYYY-MM-DD') ?? null,
    };
  }, [scopeTransactions, transactions, recurringTransactions, budgetTargets, rangeStart, rangeEnd, accountId]);

  const activeFilterCount = useMemo(
    () =>
      [category !== 'all', subcategory !== 'all', accountId !== 'all', cardId !== 'all', typeFilter !== 'all', search.trim() !== '']
        .filter(Boolean)
        .length,
    [category, subcategory, accountId, cardId, typeFilter, search],
  );

  // Clamp during render instead of in an effect: filters can shrink the result
  // set below the current page, and correcting it in an effect would cascade.
  const lastPage = Math.max(0, Math.ceil(filteredTransactions.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);

  const paginatedTransactions = useMemo(
    () => filteredTransactions.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage),
    [filteredTransactions, currentPage, rowsPerPage],
  );

  const resetFilters = useCallback(() => {
    setPeriod('month');
    setCustomStart(null);
    setCustomEnd(null);
    setCategory('all');
    setSubcategory('all');
    setAccountId('all');
    setCardId('all');
    setTypeFilter('all');
    setSearch('');
    setPage(0);
  }, []);

  const handleSortChange = (field: LedgerSort['field']) => {
    setSort((current) =>
      current.field === field
        ? { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: field === 'date' ? 'desc' : 'asc' },
    );
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory('all');
    setPage(0);
  };

  const handleEdit = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setModalType(transaction.type);
    setModalOpen(true);
  };

  const handleDuplicate = async (transaction: Transaction) => {
    await duplicateTransaction(transaction.id);
    setToast(t('transactions.ledger.table.duplicated'));
  };

  const handleExportCsv = () => {
    const csv = transactionsToCsv(
      filteredTransactions,
      (id) => accounts.find((account) => account.id === id)?.name ?? '',
      (id) => (id ? cards.find((card) => card.id === id)?.name ?? '' : ''),
    );
    downloadCsv(`transazioni-${dayjs().format('YYYY-MM-DD')}.csv`, csv);
  };

  const toggleColumn = (key: LedgerColumnKey) => {
    setColumns((current) => ({ ...current, [key]: !current[key] }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            {t('transactions.ledger.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'colors.subtle' }}>
            {t('transactions.ledger.totalMovements', { count: formatNumber(transactions.length) })}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download sx={{ fontSize: 16 }} />}
            onClick={handleExportCsv}
            sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'colors.subtle', borderColor: 'colors.border' }}
          >
            {t('transactions.ledger.exportCsv')}
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewColumn sx={{ fontSize: 16 }} />}
            onClick={(event) => setColumnsAnchor(event.currentTarget)}
            sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'colors.subtle', borderColor: 'colors.border' }}
          >
            {t('transactions.ledger.customizeColumns')}
          </Button>

          <Menu anchorEl={columnsAnchor} open={Boolean(columnsAnchor)} onClose={() => setColumnsAnchor(null)}>
            {(['category', 'account', 'type'] as LedgerColumnKey[]).map((key) => (
              <MenuItem key={key} dense onClick={() => toggleColumn(key)}>
                <FormControlLabel
                  onClick={(event) => event.preventDefault()}
                  control={<Checkbox size="small" checked={columns[key]} onChange={() => toggleColumn(key)} />}
                  label={<Typography variant="body2">{t(`transactions.ledger.columns.${key}`)}</Typography>}
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      <LedgerSummaryCards {...metrics} />

      <LedgerFilterToolbar
        period={period}
        onPeriodChange={(value) => {
          setPeriod(value);
          setPage(0);
        }}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={(value) => {
          setCustomStart(value);
          setPage(0);
        }}
        onCustomEndChange={(value) => {
          setCustomEnd(value);
          setPage(0);
        }}
        categories={allCategories}
        accounts={accounts}
        cards={cards}
        category={category}
        subcategory={subcategory}
        accountId={accountId}
        cardId={cardId}
        typeFilter={typeFilter}
        search={search}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={(value) => {
          setSubcategory(value);
          setPage(0);
        }}
        onAccountChange={(value) => {
          setAccountId(value);
          setPage(0);
        }}
        onCardChange={(value) => {
          setCardId(value);
          setPage(0);
        }}
        onTypeChange={(value) => {
          setTypeFilter(value);
          setPage(0);
        }}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        onReset={resetFilters}
        activeFilterCount={activeFilterCount}
        shown={paginatedTransactions.length}
        total={filteredTransactions.length}
      />

      <LedgerTransactionsTable
        transactions={paginatedTransactions}
        accounts={accounts}
        cards={cards}
        columns={columns}
        sort={sort}
        onSortChange={handleSortChange}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        total={filteredTransactions.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={setDeleteTarget}
      />

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        transaction={transactionToEdit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('transactions.ledger.table.deleteTitle')}
        message={t('transactions.ledger.table.deleteMessage', { description: deleteTarget?.description ?? '' })}
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

export default TransactionsPage;
