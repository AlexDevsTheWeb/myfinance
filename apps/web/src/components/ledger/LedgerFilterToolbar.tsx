import { Refresh, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import type { Dayjs } from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Account, Card, Category } from '../../store/useFinanceStore';
import { formatNumber } from '../../utils/format.utils';
import type { LedgerPeriod, LedgerTypeFilter } from './types';

export interface LedgerFilterToolbarProps {
  period: LedgerPeriod;
  onPeriodChange: (period: LedgerPeriod) => void;
  customStart: Dayjs | null;
  customEnd: Dayjs | null;
  onCustomStartChange: (value: Dayjs | null) => void;
  onCustomEndChange: (value: Dayjs | null) => void;
  categories: Category[];
  accounts: Account[];
  cards: Card[];
  category: string;
  subcategory: string;
  accountId: string;
  cardId: string;
  typeFilter: LedgerTypeFilter;
  search: string;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onCardChange: (value: string) => void;
  onTypeChange: (value: LedgerTypeFilter) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  activeFilterCount: number;
  shown: number;
  total: number;
}

const selectSx = {
  minWidth: 150,
  bgcolor: 'colors.bg',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'colors.border' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'colors.borderLight' },
  '& .MuiSelect-select': { py: 1, fontSize: '0.75rem' },
};

const PERIODS: LedgerPeriod[] = ['month', '90d', 'year', 'custom'];

const LedgerFilterToolbar: React.FC<LedgerFilterToolbarProps> = ({
  period,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  categories,
  accounts,
  cards,
  category,
  subcategory,
  accountId,
  cardId,
  typeFilter,
  search,
  onCategoryChange,
  onSubcategoryChange,
  onAccountChange,
  onCardChange,
  onTypeChange,
  onSearchChange,
  onReset,
  activeFilterCount,
  shown,
  total,
}) => {
  const { t } = useTranslation();

  const availableSubcategories = React.useMemo(() => {
    if (category === 'all') return [];
    return categories.find((item) => item.name === category)?.subcategories ?? [];
  }, [category, categories]);

  const periodLabel = React.useMemo(() => {
    const year = new Date().getFullYear();
    return {
      month: t('transactions.ledger.filters.period.month'),
      '90d': t('transactions.ledger.filters.period.90d'),
      year: t('transactions.ledger.filters.period.year', { year }),
      custom: t('transactions.ledger.filters.period.custom'),
    } satisfies Record<LedgerPeriod, string>;
  }, [t]);

  return (
    <Paper sx={{ p: 1.5, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('common.search')}
            sx={{ width: 190, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 1 } }}
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

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              p: 0.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'colors.border',
              bgcolor: 'colors.bg',
            }}
          >
            {PERIODS.map((item) => {
              const active = period === item;
              return (
                <Button
                  key={item}
                  size="small"
                  onClick={() => onPeriodChange(item)}
                  sx={{
                    px: 1,
                    py: 0.25,
                    minWidth: 0,
                    fontSize: '0.72rem',
                    fontWeight: active ? 700 : 500,
                    textTransform: 'none',
                    color: active ? 'colors.cyan' : 'colors.subtle',
                    bgcolor: active ? 'rgba(6,182,212,0.18)' : 'transparent',
                    border: '1px solid',
                    borderColor: active ? 'rgba(6,182,212,0.4)' : 'transparent',
                    '&:hover': { bgcolor: active ? 'rgba(6,182,212,0.22)' : 'rgba(148,163,184,0.08)' },
                  }}
                >
                  {periodLabel[item]}
                </Button>
              );
            })}
          </Box>

          <FormControl size="small">
            <InputLabel id="ledger-category-label" sx={{ fontSize: '0.75rem' }}>
              {t('transactions.filters.category')}
            </InputLabel>
            <Select
              labelId="ledger-category-label"
              label={t('transactions.filters.category')}
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              sx={selectSx}
            >
              <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>
                {t('transactions.ledger.filters.allCategories', { count: formatNumber(categories.length) })}
              </MenuItem>
              {categories.map((item) => (
                <MenuItem key={item.name} value={item.name} sx={{ fontSize: '0.8rem' }}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {category !== 'all' && (
            <FormControl size="small">
              <InputLabel id="ledger-subcategory-label" sx={{ fontSize: '0.75rem' }}>
                {t('transactions.filters.subcategory')}
              </InputLabel>
              <Select
                labelId="ledger-subcategory-label"
                label={t('transactions.filters.subcategory')}
                value={subcategory}
                onChange={(event) => onSubcategoryChange(event.target.value)}
                sx={selectSx}
              >
                <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>
                  {t('transactions.filters.allSubcategories')}
                </MenuItem>
                {availableSubcategories.map((item) => (
                  <MenuItem key={item} value={item} sx={{ fontSize: '0.8rem' }}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl size="small">
            <InputLabel id="ledger-account-label" sx={{ fontSize: '0.75rem' }}>
              {t('transactions.account')}
            </InputLabel>
            <Select
              labelId="ledger-account-label"
              label={t('transactions.account')}
              value={accountId}
              onChange={(event) => onAccountChange(event.target.value)}
              sx={selectSx}
            >
              <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>
                {t('transactions.ledger.filters.allAccounts', { count: formatNumber(accounts.length) })}
              </MenuItem>
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id} sx={{ fontSize: '0.8rem' }}>
                  {account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {cards.length > 0 && (
            <FormControl size="small">
              <InputLabel id="ledger-card-label" sx={{ fontSize: '0.75rem' }}>
                {t('transactions.ledger.filters.cards')}
              </InputLabel>
              <Select
                labelId="ledger-card-label"
                label={t('transactions.ledger.filters.cards')}
                value={cardId}
                onChange={(event) => onCardChange(event.target.value)}
                sx={selectSx}
              >
                <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>
                  {t('transactions.ledger.filters.allCards')}
                </MenuItem>
                <MenuItem value="none" sx={{ fontSize: '0.8rem' }}>
                  {t('transactions.ledger.filters.withoutCard')}
                </MenuItem>
                {cards.map((card) => (
                  <MenuItem key={card.id} value={card.id} sx={{ fontSize: '0.8rem' }}>
                    {card.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl size="small">
            <InputLabel id="ledger-type-label" sx={{ fontSize: '0.75rem' }}>
              {t('transactions.type')}
            </InputLabel>
            <Select
              labelId="ledger-type-label"
              label={t('transactions.type')}
              value={typeFilter}
              onChange={(event) => onTypeChange(event.target.value as LedgerTypeFilter)}
              sx={selectSx}
            >
              <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>
                {t('transactions.ledger.filters.typeAll')}
              </MenuItem>
              <MenuItem value="recurring" sx={{ fontSize: '0.8rem' }}>
                {t('transactions.ledger.filters.typeRecurring')}
              </MenuItem>
              <MenuItem value="oneOff" sx={{ fontSize: '0.8rem' }}>
                {t('transactions.ledger.filters.typeOneOff')}
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            size="small"
            onClick={onReset}
            startIcon={<Refresh sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', fontSize: '0.72rem', color: 'colors.subtle' }}
          >
            {t('transactions.ledger.filters.reset')}
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
        </Box>

        <Typography variant="caption" noWrap sx={{ color: 'colors.subtle' }}>
          {t('transactions.ledger.filters.shown')}{' '}
          <Box component="span" sx={{ fontFamily: (theme) => theme.colors.mono, color: 'colors.subtle', fontWeight: 600 }}>
            {formatNumber(shown)}
          </Box>{' '}
          {t('transactions.ledger.filters.of')}{' '}
          <Box component="span" sx={{ fontFamily: (theme) => theme.colors.mono, fontWeight: 600 }}>
            {formatNumber(total)}
          </Box>
        </Typography>
      </Box>

      {period === 'custom' && (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
          <DatePicker
            label={t('transactions.ledger.filters.from')}
            value={customStart}
            onChange={onCustomStartChange}
            slotProps={{ textField: { size: 'small', sx: { width: 170 } } }}
          />
          <DatePicker
            label={t('transactions.ledger.filters.to')}
            value={customEnd}
            onChange={onCustomEndChange}
            slotProps={{ textField: { size: 'small', sx: { width: 170 } } }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default LedgerFilterToolbar;
