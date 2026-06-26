/* eslint-disable @typescript-eslint/no-explicit-any */
import { Autocomplete, Box, FormHelperText, Grid, MenuItem, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../../store/useFinanceStore';

interface TransactionFormProps {
  type: 'income' | 'expense' | 'transfer';
  formData: {
    date?: string;
    description: string;
    category: string;
    subcategory: string;
    amount: string | number;
    accountId: string;
    dayOfMonth?: number;
    startDate?: string;
    endDate?: string | null;
    frequency?: 'monthly' | 'yearly';
    monthOfYear?: number;
    consumption?: number | string;
    readingDateStart?: string;
    readingDateEnd?: string;
  };
  setFormData: (data: any) => void;
  isRecurring?: boolean;
}

// Utility subcategories that show consumption fields
const UTILITY_SUBCATEGORIES = ['Elettricità', 'Gas', 'Acqua', 'Telefono'];

// Validation function for transaction form data
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

function validateTransactionForm(
  formData: TransactionFormProps['formData'],
  isRecurring: boolean
): ValidationResult {
  const errors: Record<string, string> = {};

  // Amount validation: must be > 0
  const amount = typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount;
  if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  // Description validation: required
  if (!formData.description || formData.description.trim().length === 0) {
    errors.description = 'Description is required';
  }

  // Category/Subcategory validation: both required
  if (!formData.category) {
    errors.category = 'Category is required';
  }
  if (!formData.subcategory) {
    errors.subcategory = 'Subcategory is required';
  }

  // Account validation: required
  if (!formData.accountId) {
    errors.accountId = 'Account is required';
  }

  // Date validation: LENIENT per D-01 - no bounds enforced
  // Only check if provided (optional for recurring)
  if (!isRecurring && !formData.date) {
    // Date is optional in formData but we use today's date as default
  }

  // Recurring-specific validations
  if (isRecurring) {
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      errors.endDate = 'End date cannot be before start date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type, formData, setFormData, isRecurring = false }) => {
  const { categories, incomeCategories, transactions, accounts } = useFinanceStore();
  const currentCategories = type === 'income' ? incomeCategories : categories;
  const { t } = useTranslation();

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Validate on formData changes
  const validation = useMemo(() => validateTransactionForm(formData, isRecurring), [formData, isRecurring]);

  // Update errors when validation changes
  useMemo(() => {
    setFormErrors(validation.errors);
  }, [validation.errors]);

  // Unique descriptions for suggestions based on current type
  const descriptionOptions = useMemo(() => {
    const unique = new Set(
      transactions
        .filter(t => t.type === type)
        .map(t => t.description)
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [transactions, type]);

  // Flat list of subcategories with their parent category
  const subcategoryOptions = useMemo(() => {
    const options: { subcategory: string; category: string }[] = [];
    currentCategories.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        options.push({ subcategory: sub, category: cat.name });
      });
    });
    return options.sort((a, b) => a.subcategory.localeCompare(b.subcategory));
  }, [currentCategories]);

  const selectedSubcategoryOption = subcategoryOptions.find(
    (opt) => opt.subcategory === formData.subcategory && opt.category === formData.category
  ) || null;

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        {!isRecurring && (
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('transactions.date')}
              type="date"
              variant="filled"
              value={formData.date || dayjs().format('YYYY-MM-DD')}
              onChange={(e: any) => setFormData({ ...formData, date: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Autocomplete
            fullWidth
            freeSolo
            options={descriptionOptions}
            value={formData.description}
            onInputChange={(_, newInputValue) => {
              setFormData({ ...formData, description: newInputValue });
            }}
            onChange={(_, newValue) => {
              if (newValue && typeof newValue === 'string') {
                const matchingTx = [...transactions]
                  .filter(t => t.type === type && t.description === newValue)
                  .sort((a, b) => b.date.localeCompare(a.date))[0];

                if (matchingTx) {
                  setFormData({
                    ...formData,
                    description: newValue,
                    category: matchingTx.category,
                    subcategory: matchingTx.subcategory,
                  });
                } else {
                  setFormData({ ...formData, description: newValue });
                }
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('transactions.description')}
                variant="filled"
                placeholder="e.g. Salary, Rent, Grocery"
                error={!!formErrors.description}
              />
            )}
          />
          {formErrors.description && <FormHelperText error>{formErrors.description}</FormHelperText>}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label={t('transactions.amount')}
            type="number"
            variant="filled"
            value={formData.amount}
            onChange={(e: any) => setFormData({ ...formData, amount: e.target.value })}
            slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, opacity: 0.5 }}>€</Typography> } }}
            error={!!formErrors.amount}
          />
          {formErrors.amount && <FormHelperText error>{formErrors.amount}</FormHelperText>}
        </Grid>

        {isRecurring && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Day of Month"
                  type="number"
                  variant="filled"
                  value={formData.dayOfMonth || 1}
                  onChange={(e: any) => setFormData({ ...formData, dayOfMonth: Number(e.target.value) })}
                  slotProps={{ htmlInput: { min: 1, max: 31 } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Frequency"
                  variant="filled"
                  value={formData.frequency || 'monthly'}
                  onChange={(e: any) => setFormData({ ...formData, frequency: e.target.value, monthOfYear: e.target.value === 'yearly' ? (formData.monthOfYear || 1) : undefined })}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </TextField>
              </Grid>
              {formData.frequency === 'yearly' && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    label="Month of Year"
                    variant="filled"
                    value={formData.monthOfYear || 1}
                    onChange={(e: any) => setFormData({ ...formData, monthOfYear: Number(e.target.value) })}
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                      <MenuItem key={i} value={i + 1}>{m}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}

        <Grid size={{ xs: 7 }}>
          <Autocomplete
            options={subcategoryOptions}
            getOptionLabel={(option) => option.subcategory}
            value={selectedSubcategoryOption}
            onChange={(_, newValue) => {
              if (newValue) {
                setFormData({ ...formData, subcategory: newValue.subcategory, category: newValue.category });
              } else {
                setFormData({ ...formData, subcategory: '', category: '' });
              }
            }}
            groupBy={(option) => option.category}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Subcategory"
                variant="filled"
                placeholder="Type to search..."
                error={!!formErrors.subcategory}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...rest } = props as any;
              return (
                <Box component="li" key={key} {...rest} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body1">{option.subcategory}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>{option.category}</Typography>
                </Box>
              );
            }}
          />
        </Grid>

        <Grid size={{ xs: 5 }}>
          <TextField
            fullWidth
            label={t('transactions.category')}
            variant="filled"
            value={formData.category}
            slotProps={{ input: { readOnly: true } }}
            sx={{ '& .MuiInputBase-input.Mui-readOnly': { opacity: 0.7 } }}
            error={!!formErrors.category}
          />
          {formErrors.category && <FormHelperText error>{formErrors.category}</FormHelperText>}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label={t('transactions.account')}
            variant="filled"
            value={formData.accountId}
            onChange={(e: any) => setFormData({ ...formData, accountId: e.target.value })}
            error={!!formErrors.accountId}
          >
            {accounts.map((acc) => (
              <MenuItem key={acc.id} value={acc.id}>
                {acc.name}
              </MenuItem>
            ))}
          </TextField>
          {formErrors.accountId && <FormHelperText error>{formErrors.accountId}</FormHelperText>}
        </Grid>

        {isRecurring && (
          <>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                variant="filled"
                value={formData.startDate || dayjs().format('YYYY-MM-DD')}
                onChange={(e: any) => setFormData({ ...formData, startDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="End Date (Optional)"
                type="date"
                variant="filled"
                value={formData.endDate || ''}
                onChange={(e: any) => setFormData({ ...formData, endDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </>
        )}

        {!isRecurring && formData.subcategory && UTILITY_SUBCATEGORIES.includes(formData.subcategory) && (
          <>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1, mt: 1, fontWeight: 700 }}>Dettagli Utenza (Opzionale)</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label={formData.subcategory === 'Elettricità' ? 'Consumo (kWh)' : 'Consumo (smc)'}
                type="number"
                variant="filled"
                value={formData.consumption || ''}
                onChange={(e: any) => setFormData({ ...formData, consumption: e.target.value })}
                slotProps={{ input: { endAdornment: <Typography sx={{ ml: 1, opacity: 0.5, fontSize: '0.8rem' }}>{formData.subcategory === 'Elettricità' ? 'kWh' : 'smc'}</Typography> } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                fullWidth
                label="Periodo Dal"
                type="date"
                variant="filled"
                value={formData.readingDateStart || ''}
                onChange={(e: any) => setFormData({ ...formData, readingDateStart: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                fullWidth
                label="Periodo Al"
                type="date"
                variant="filled"
                value={formData.readingDateEnd || ''}
                onChange={(e: any) => setFormData({ ...formData, readingDateEnd: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box >
  );
};

export default TransactionForm;
