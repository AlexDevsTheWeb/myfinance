/* eslint-disable @typescript-eslint/no-explicit-any */
import { Autocomplete, Box, Grid, MenuItem, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface TransactionFormProps {
  type: 'income' | 'expense';
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
    consumption?: number | string;
    readingDateStart?: string;
    readingDateEnd?: string;
  };
  setFormData: (data: any) => void;
  isRecurring?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type, formData, setFormData, isRecurring = false }) => {
  const { categories, incomeCategories, transactions, accounts } = useFinanceStore();
  const currentCategories = type === 'income' ? incomeCategories : categories;

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
              label="Date"
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
                label="Description"
                variant="filled"
                placeholder="e.g. Salary, Rent, Grocery"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            variant="filled"
            value={formData.amount}
            onChange={(e: any) => setFormData({ ...formData, amount: e.target.value })}
            slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, opacity: 0.5 }}>€</Typography> } }}
          />
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
                  inputProps={{ min: 1, max: 31 }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Frequency"
                  variant="filled"
                  value={formData.frequency || 'monthly'}
                  onChange={(e: any) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </TextField>
              </Grid>
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
              <TextField {...params} label="Search Subcategory" variant="filled" placeholder="Type to search..." />
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
            label="Category"
            variant="filled"
            value={formData.category}
            slotProps={{ input: { readOnly: true } }}
            sx={{ '& .MuiInputBase-input.Mui-readOnly': { opacity: 0.7 } }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="Account"
            variant="filled"
            value={formData.accountId}
            onChange={(e: any) => setFormData({ ...formData, accountId: e.target.value })}
          >
            {accounts.map((acc) => (
              <MenuItem key={acc.id} value={acc.id}>
                {acc.name}
              </MenuItem>
            ))}
          </TextField>
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

        {!isRecurring && formData.category === 'Bollette' && (formData.subcategory === 'Elettricità' || formData.subcategory === 'Gas') && (
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
