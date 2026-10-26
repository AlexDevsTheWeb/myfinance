import { Close } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore, type Transaction } from '../../store/useFinanceStore';
import { useUiStore } from '../../store/useUiStore';
import { formatCurrency } from '../../utils/format.utils';
import {
  buildRecurringTemplate,
  computeAccountBalance,
  DEFAULT_RECURRING_DRAFT,
  draftToTransaction,
  EMPTY_DRAFT,
  hasErrors,
  pricePerLitre,
  resolveUtilityUnit,
  showsReadingPeriod,
  transactionToDraft,
  validateDraft,
  type RecurringDraft,
  type TransactionDraft,
  type TransactionDrawerType,
} from './transactionDrawer.utils';

const fieldSx = {
  '& .MuiFilledInput-root': {
    bgcolor: 'colors.bg',
    border: '1px solid',
    borderColor: 'colors.border',
    borderRadius: 1.5,
    '&:hover': { borderColor: 'colors.borderLight' },
    '&.Mui-focused': { borderColor: 'colors.cyan' },
    '&:before, &:after': { display: 'none' },
  },
};

interface DrawerBodyProps {
  initialType: TransactionDrawerType;
  transaction: Transaction | null;
  onClose: () => void;
}

const DrawerBody: React.FC<DrawerBodyProps> = ({ initialType, transaction, onClose }) => {
  const { t } = useTranslation();
  const { categories, incomeCategories, accounts, cards, transactions, addTransaction, updateTransaction, addRecurring } =
    useFinanceStore();

  const [type, setType] = useState<TransactionDrawerType>(transaction?.type ?? initialType);
  const [draft, setDraft] = useState<TransactionDraft>(() =>
    transaction
      ? transactionToDraft(transaction)
      : {
          ...EMPTY_DRAFT,
          accountId: accounts.find((account) => account.isDefault)?.id ?? accounts[0]?.id ?? '',
        },
  );
  const [recurring, setRecurring] = useState<RecurringDraft>(DEFAULT_RECURRING_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [utilityOverride, setUtilityOverride] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(transaction);
  const isRecurringInstance = Boolean(transaction?.recurringLinkId);

  const transferCategory = useMemo(
    () => ({ name: 'Internal Transfer', subcategories: ['Bonifico', 'Trasferimento'] }),
    [],
  );
  const availableCategories = type === 'income' ? incomeCategories : type === 'transfer' ? [transferCategory] : categories;
  const selectedCategory = availableCategories.find((category) => category.name === draft.category);

  const unit = resolveUtilityUnit(draft.category, draft.subcategory);
  const utilityOpen = utilityOverride ?? unit !== null;
  const litres = Number(draft.consumption);
  const unitPrice = unit === 'L' ? pricePerLitre(Number(draft.amount), litres) : null;

  const update = <K extends keyof TransactionDraft>(key: K, value: TransactionDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const handleTypeChange = (_: React.SyntheticEvent, next: TransactionDrawerType) => {
    setType(next);
    // Categories differ per type (income vs expense vs transfer) — reset them.
    setDraft((current) => ({ ...current, category: '', subcategory: '' }));
    setUtilityOverride(null);
    setErrors({});
  };

  const handleSave = () => {
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    try {
      if (transaction) {
        updateTransaction(draftToTransaction(draft, type, transaction.id));
      } else {
        addTransaction(draftToTransaction(draft, type));
        if (recurring.enabled) {
          addRecurring(buildRecurringTemplate({ draft, recurring, type }));
        }
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const accent = type === 'income' ? 'colors.emerald' : type === 'transfer' ? 'colors.cyan' : 'colors.rose';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'colors.surface' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.02em' }}>
          {isEdit ? t('transactions.drawer.editTitle') : t('transactions.drawer.title')}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label={t('common.close')} sx={{ color: 'colors.subtle' }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <Tabs
        value={type}
        onChange={handleTypeChange}
        variant="fullWidth"
        sx={{
          minHeight: 40,
          borderBottom: '1px solid',
          borderColor: 'colors.border',
          '& .MuiTabs-indicator': { bgcolor: accent, height: 2 },
        }}
      >
        <Tab value="expense" label={t('transactions.drawer.tabs.expense')} sx={{ fontSize: '0.75rem', fontWeight: 600, color: type === 'expense' ? 'colors.rose' : 'colors.subtle' }} />
        <Tab value="income" label={t('transactions.drawer.tabs.income')} sx={{ fontSize: '0.75rem', fontWeight: 600, color: type === 'income' ? 'colors.emerald' : 'colors.subtle' }} />
        <Tab value="transfer" label={t('transactions.drawer.tabs.transfer')} sx={{ fontSize: '0.75rem', fontWeight: 600, color: type === 'transfer' ? 'colors.cyan' : 'colors.subtle' }} />
      </Tabs>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          autoFocus
          fullWidth
          variant="filled"
          type="number"
          value={draft.amount}
          onChange={(event) => update('amount', event.target.value)}
          placeholder="0,00"
          error={Boolean(errors.amount)}
          sx={{
            ...fieldSx,
            '& .MuiFilledInput-input': {
              fontFamily: (theme) => theme.colors.mono,
              fontVariantNumeric: 'tabular-nums',
              fontSize: '2rem',
              fontWeight: 700,
              py: 1.5,
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ fontFamily: (theme) => theme.colors.mono, fontSize: '1.5rem', color: accent }}>€</Typography>
                </InputAdornment>
              ),
            },
          }}
        />

        <DatePicker
          label={t('transactions.date')}
          value={dayjs(draft.date)}
          onChange={(value) => update('date', value ? value.format('YYYY-MM-DD') : draft.date)}
          slotProps={{ textField: { fullWidth: true, variant: 'filled', sx: fieldSx } }}
        />

        <Autocomplete
          freeSolo
          options={Array.from(new Set(transactions.filter((item) => item.type === type).map((item) => item.description))).sort()}
          value={draft.description}
          onInputChange={(_, value) => update('description', value)}
          onChange={(_, value) => {
            if (typeof value !== 'string') return;
            const match = [...transactions]
              .filter((item) => item.type === type && item.description === value)
              .sort((a, b) => b.date.localeCompare(a.date))[0];
            setDraft((current) => ({
              ...current,
              description: value,
              ...(match ? { category: match.category, subcategory: match.subcategory } : {}),
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('transactions.description')}
              variant="filled"
              error={Boolean(errors.description)}
              sx={fieldSx}
            />
          )}
        />

        <Select
          displayEmpty
          fullWidth
          value={draft.category}
          onChange={(event) => {
            setDraft((current) => ({ ...current, category: event.target.value, subcategory: '' }));
            setUtilityOverride(null);
          }}
          sx={{ bgcolor: 'colors.bg', fontSize: '0.875rem' }}
          renderValue={(value) => (value ? String(value) : t('transactions.drawer.selectCategory'))}
          error={Boolean(errors.category)}
        >
          {availableCategories.map((category) => (
            <MenuItem key={category.name} value={category.name} sx={{ fontSize: '0.85rem' }}>
              {category.name}
            </MenuItem>
          ))}
        </Select>

        <Select
          displayEmpty
          fullWidth
          disabled={!draft.category}
          value={draft.subcategory}
          onChange={(event) => {
            update('subcategory', event.target.value);
            setUtilityOverride(null);
          }}
          sx={{ bgcolor: 'colors.bg', fontSize: '0.875rem' }}
          renderValue={(value) => (value ? String(value) : t('transactions.drawer.selectSubcategory'))}
          error={Boolean(errors.subcategory)}
        >
          {(selectedCategory?.subcategories ?? []).map((subcategory) => (
            <MenuItem key={subcategory} value={subcategory} sx={{ fontSize: '0.85rem' }}>
              {subcategory}
            </MenuItem>
          ))}
        </Select>

        <Select
          displayEmpty
          fullWidth
          value={draft.accountId}
          onChange={(event) => update('accountId', event.target.value)}
          sx={{ bgcolor: 'colors.bg', fontSize: '0.875rem' }}
          renderValue={(value) =>
            value ? (accounts.find((account) => account.id === value)?.name ?? '') : t('transactions.drawer.selectAccount')
          }
          error={Boolean(errors.accountId)}
        >
          {accounts.map((account) => {
            const balance = computeAccountBalance(account.id, accounts, transactions);
            return (
              <MenuItem key={account.id} value={account.id} sx={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <span>{account.name}</span>
                {balance !== null && (
                  <Typography component="span" sx={{ fontFamily: (theme) => theme.colors.mono, fontSize: '0.75rem', color: 'colors.subtle' }}>
                    {formatCurrency(balance)}
                  </Typography>
                )}
              </MenuItem>
            );
          })}
        </Select>

        {cards.length > 0 && (
          <Select
            displayEmpty
            fullWidth
            value={draft.cardId}
            onChange={(event) => update('cardId', event.target.value)}
            sx={{ bgcolor: 'colors.bg', fontSize: '0.875rem' }}
            renderValue={(value) =>
              value ? (cards.find((card) => card.id === value)?.name ?? '') : t('transactions.drawer.noCard')
            }
          >
            <MenuItem value="" sx={{ fontSize: '0.85rem' }}>
              {t('transactions.drawer.noCard')}
            </MenuItem>
            {cards.map((card) => (
              <MenuItem key={card.id} value={card.id} sx={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <span>{card.name}</span>
                <Typography component="span" sx={{ fontFamily: (theme) => theme.colors.mono, fontSize: '0.75rem', color: 'colors.subtle' }}>
                  {formatCurrency(card.plafond)}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        )}

        <Accordion
          expanded={utilityOpen}
          onChange={(_, expanded) => setUtilityOverride(expanded)}
          disableGutters
          sx={{ bgcolor: 'colors.bg', border: '1px solid', borderColor: 'colors.border', borderRadius: 1.5, '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<span>⌄</span>}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
              {t('transactions.drawer.utility.title')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              variant="filled"
              type="number"
              label={unit ? t('transactions.drawer.utility.consumptionWithUnit', { unit }) : t('transactions.drawer.utility.consumption')}
              value={draft.consumption}
              onChange={(event) => update('consumption', event.target.value)}
              helperText={unitPrice !== null ? t('transactions.drawer.utility.pricePerLitre', { price: formatCurrency(unitPrice, 3) }) : undefined}
              sx={fieldSx}
            />
            {showsReadingPeriod(unit) && (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <DatePicker
                  label={t('transactions.drawer.utility.periodFrom')}
                  value={draft.readingDateStart ? dayjs(draft.readingDateStart) : null}
                  onChange={(value) => update('readingDateStart', value ? value.format('YYYY-MM-DD') : '')}
                  slotProps={{ textField: { size: 'small', fullWidth: true, variant: 'filled', sx: fieldSx } }}
                />
                <DatePicker
                  label={t('transactions.drawer.utility.periodTo')}
                  value={draft.readingDateEnd ? dayjs(draft.readingDateEnd) : null}
                  onChange={(value) => update('readingDateEnd', value ? value.format('YYYY-MM-DD') : '')}
                  slotProps={{ textField: { size: 'small', fullWidth: true, variant: 'filled', sx: fieldSx } }}
                />
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {!isEdit && (
          <Accordion
            expanded={recurring.enabled}
            onChange={(_, expanded) => setRecurring((current) => ({ ...current, enabled: expanded }))}
            disableGutters
            sx={{ bgcolor: 'colors.bg', border: '1px solid', borderColor: 'colors.border', borderRadius: 1.5, '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<span>⌄</span>}>
              <FormControlLabel
                onClick={(event) => event.stopPropagation()}
                control={<Switch size="small" checked={recurring.enabled} onChange={(event) => setRecurring((current) => ({ ...current, enabled: event.target.checked }))} />}
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {t('transactions.drawer.recurring.title')}
                  </Typography>
                }
              />
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
                {t('transactions.drawer.recurring.hint')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  select
                  fullWidth
                  variant="filled"
                  label={t('transactions.drawer.recurring.frequency')}
                  value={recurring.frequency}
                  onChange={(event) =>
                    setRecurring((current) => ({ ...current, frequency: event.target.value === 'yearly' ? 'yearly' : 'monthly' }))
                  }
                  sx={fieldSx}
                >
                  <MenuItem value="monthly">{t('transactions.drawer.recurring.monthly')}</MenuItem>
                  <MenuItem value="yearly">{t('transactions.drawer.recurring.yearly')}</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  label={t('transactions.drawer.recurring.dayOfMonth')}
                  value={recurring.dayOfMonth}
                  onChange={(event) => setRecurring((current) => ({ ...current, dayOfMonth: Number(event.target.value) }))}
                  slotProps={{ htmlInput: { min: 1, max: 31 } }}
                  sx={fieldSx}
                />
              </Box>
              {recurring.frequency === 'yearly' && (
                <TextField
                  select
                  fullWidth
                  variant="filled"
                  label={t('transactions.drawer.recurring.monthOfYear')}
                  value={recurring.monthOfYear}
                  onChange={(event) => setRecurring((current) => ({ ...current, monthOfYear: Number(event.target.value) }))}
                  sx={fieldSx}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                    <MenuItem key={month} value={month}>
                      {dayjs().month(month - 1).format('MMMM')}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <DatePicker
                label={t('transactions.drawer.recurring.endDate')}
                value={recurring.endDate ? dayjs(recurring.endDate) : null}
                onChange={(value) => setRecurring((current) => ({ ...current, endDate: value ? value.format('YYYY-MM-DD') : '' }))}
                slotProps={{ textField: { fullWidth: true, variant: 'filled', sx: fieldSx } }}
              />
            </AccordionDetails>
          </Accordion>
        )}

        {isRecurringInstance && (
          <Typography variant="caption" sx={{ color: 'colors.amber' }}>
            {t('transactions.drawer.recurringInstanceNote')}
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: 'colors.border' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, px: 2.5, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'colors.subtle' }}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: 'colors.emerald',
            color: '#04120c',
            '&:hover': { bgcolor: '#0ea371' },
          }}
        >
          {t('transactions.drawer.save')}
        </Button>
      </Box>
    </Box>
  );
};

/**
 * Global add/edit transaction drawer.
 *
 * Mounted once in the app layout and driven by `useUiStore`, so the dashboard
 * CTA, the FAB and the ledger row menu all open the same surface.
 */
const AddTransactionDrawer: React.FC = () => {
  const open = useUiStore((state) => state.txDrawerOpen);
  const type = useUiStore((state) => state.txDrawerType);
  const transaction = useUiStore((state) => state.txDrawerTransaction);
  const close = useUiStore((state) => state.closeTransactionDrawer);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={close}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 480 },
            bgcolor: 'colors.surface',
            borderLeft: '1px solid',
            borderColor: 'colors.border',
            backgroundImage: 'none',
          },
        },
      }}
    >
      {open && <DrawerBody key={transaction?.id ?? 'new'} initialType={type} transaction={transaction} onClose={close} />}
    </Drawer>
  );
};

export default AddTransactionDrawer;
