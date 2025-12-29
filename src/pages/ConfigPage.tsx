import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Paper, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

const ConfigPage: React.FC = () => {
  const {
    initialBalance,
    setInitialBalance,
    categories,
    incomeCategories,
    addCategory,
    renameCategory,
    deleteCategory,
    addSubcategory,
    renameSubcategory,
    deleteSubcategory,
    recurringTransactions,
    addRecurring,
    updateRecurring,
    deleteRecurring
  } = useFinanceStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    type: 'category' | 'subcategory' | 'recurring';
    mode: 'add' | 'rename' | 'edit';
    financeType: 'income' | 'expense';
    categoryName?: string;
    oldValue?: string;
    recurringId?: string;
  } | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Form for recurring
  const [recurringForm, setRecurringForm] = useState({
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    dayOfMonth: 1,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: '',
    type: 'expense' as 'income' | 'expense'
  });

  const handleOpenDialog = (config: typeof dialogConfig) => {
    setDialogConfig(config);
    if (config?.type === 'recurring') {
      if (config.mode === 'edit') {
        const rec = recurringTransactions.find(r => r.id === config.recurringId);
        if (rec) {
          setRecurringForm({
            description: rec.description,
            amount: rec.amount.toString(),
            category: rec.category,
            subcategory: rec.subcategory,
            dayOfMonth: rec.dayOfMonth,
            startDate: rec.startDate,
            endDate: rec.endDate || '',
            type: rec.type
          });
        }
      } else {
        setRecurringForm({
          description: '',
          amount: '',
          category: '',
          subcategory: '',
          dayOfMonth: 1,
          startDate: dayjs().format('YYYY-MM-DD'),
          endDate: '',
          type: config.financeType
        });
      }
    } else {
      setInputValue(config?.oldValue || '');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogConfig(null);
    setInputValue('');
  };

  const handleConfirm = () => {
    if (!dialogConfig) return;

    if (dialogConfig.type === 'recurring') {
      const data = {
        id: dialogConfig.recurringId || crypto.randomUUID(),
        description: recurringForm.description,
        amount: Number(recurringForm.amount),
        category: recurringForm.category,
        subcategory: recurringForm.subcategory,
        dayOfMonth: Number(recurringForm.dayOfMonth),
        startDate: recurringForm.startDate,
        endDate: recurringForm.endDate || undefined,
        type: recurringForm.type
      };

      if (dialogConfig.mode === 'add') {
        addRecurring(data);
      } else {
        updateRecurring(data);
      }
    } else if (inputValue.trim()) {
      const { type, mode, financeType, categoryName, oldValue } = dialogConfig;
      if (type === 'category') {
        if (mode === 'add') {
          addCategory(financeType, inputValue);
        } else {
          renameCategory(financeType, oldValue!, inputValue);
        }
      } else {
        if (mode === 'add') {
          addSubcategory(financeType, categoryName!, inputValue);
        } else {
          renameSubcategory(financeType, categoryName!, oldValue!, inputValue);
        }
      }
    }

    handleCloseDialog();
  };

  const renderCategoryList = (cats: typeof categories, type: 'income' | 'expense') => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{type === 'income' ? 'Income' : 'Expense'} Categories</Typography>
        <Button startIcon={<AddIcon />} size="small" onClick={() => handleOpenDialog({ type: 'category', mode: 'add', financeType: type })}>
          Add Category
        </Button>
      </Box>
      {cats.map((cat) => (
        <Accordion key={cat.name} sx={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600, flex: 1 }}>{cat.name}</Typography>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog({ type: 'category', mode: 'rename', financeType: type, oldValue: cat.name }); }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete category?')) deleteCategory(type, cat.name); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {cat.subcategories.map((sub) => (
                <ListItem key={sub} divider>
                  <ListItemText primary={sub} />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => handleOpenDialog({ type: 'subcategory', mode: 'rename', financeType: type, categoryName: cat.name, oldValue: sub })}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => { if (window.confirm('Delete item?')) deleteSubcategory(type, cat.name, sub); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
          <AccordionActions>
            <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenDialog({ type: 'subcategory', mode: 'add', financeType: type, categoryName: cat.name })}>
              Add Item
            </Button>
          </AccordionActions>
        </Accordion>
      ))}
    </Box>
  );

  const currentCategories = recurringForm.type === 'income' ? incomeCategories : categories;
  const selectedCategoryObj = currentCategories.find(c => c.name === recurringForm.category);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Configuration
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Initial Balance (Saldo Iniziale)</Typography>
        <TextField
          label="Amount"
          type="number"
          value={initialBalance}
          onChange={(e) => setInitialBalance(Number(e.target.value))}
          slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1 }}>€</Typography> } }}
          variant="outlined"
          sx={{ maxWidth: 300 }}
        />
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Recurring Transactions (Uscite/Entrate Ricorrenti)</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<AddIcon />} size="small" color="error" onClick={() => handleOpenDialog({ type: 'recurring', mode: 'add', financeType: 'expense' })}>
              Add Recurring Expense
            </Button>
            <Button startIcon={<AddIcon />} size="small" color="success" onClick={() => handleOpenDialog({ type: 'recurring', mode: 'add', financeType: 'income' })}>
              Add Recurring Income
            </Button>
          </Box>
        </Box>
        {recurringTransactions.length === 0 ? (
          <Typography sx={{ opacity: 0.5, fontStyle: 'italic' }}>No recurring transactions set up.</Typography>
        ) : (
          <List>
            {recurringTransactions.map(rec => (
              <ListItem key={rec.id} divider>
                <ListItemText
                  primary={`${rec.description} - € ${rec.amount.toLocaleString('it-IT')}`}
                  secondary={`${rec.category} > ${rec.subcategory} | Day: ${rec.dayOfMonth} | From: ${dayjs(rec.startDate).format('DD/MM/YYYY')}${rec.endDate ? ` to ${dayjs(rec.endDate).format('DD/MM/YYYY')}` : ''} (${rec.type})`}
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" onClick={() => handleOpenDialog({ type: 'recurring', mode: 'edit', financeType: rec.type, recurringId: rec.id })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => { if (window.confirm('Delete recurring item?')) deleteRecurring(rec.id); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          {renderCategoryList(categories, 'expense')}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {renderCategoryList(incomeCategories, 'income')}
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth={dialogConfig?.type === 'recurring' ? 'sm' : 'xs'}>
        <DialogTitle>
          {dialogConfig?.mode === 'add' ? 'Add' : dialogConfig?.mode === 'edit' ? 'Edit' : 'Rename'}
          {dialogConfig?.type === 'category' ? ' Category' : dialogConfig?.type === 'recurring' ? ' Recurring Transaction' : ' Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {dialogConfig?.type === 'recurring' ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Description" value={recurringForm.description} onChange={e => setRecurringForm({ ...recurringForm, description: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Amount" type="number" value={recurringForm.amount} onChange={e => setRecurringForm({ ...recurringForm, amount: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Day of Month" type="number" value={recurringForm.dayOfMonth} onChange={e => setRecurringForm({ ...recurringForm, dayOfMonth: Number(e.target.value) })} inputProps={{ min: 1, max: 31 }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    value={recurringForm.category}
                    onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value, subcategory: '' })}
                    SelectProps={{ native: false }}
                  >
                    {currentCategories.map((cat) => (
                      <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Subcategory"
                    value={recurringForm.subcategory}
                    onChange={(e) => setRecurringForm({ ...recurringForm, subcategory: e.target.value })}
                    disabled={!recurringForm.category}
                    SelectProps={{ native: false }}
                  >
                    {selectedCategoryObj?.subcategories.map((sub) => (
                      <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Start Date" type="date" value={recurringForm.startDate} onChange={e => setRecurringForm({ ...recurringForm, startDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="End Date (Optional)" type="date" value={recurringForm.endDate} onChange={e => setRecurringForm({ ...recurringForm, endDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            ) : (
              <TextField
                autoFocus
                fullWidth
                label="Name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" disabled={dialogConfig?.type === 'recurring' ? (!recurringForm.description || !recurringForm.amount || !recurringForm.category) : !inputValue.trim()}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfigPage;
