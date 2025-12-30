import { DndContext, type DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { AccountBalance, Add as AddIcon, Delete as DeleteIcon, DragIndicator as DragIndicatorIcon, Edit as EditIcon, Repeat, TrendingDown, TrendingUp } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

// Custom TabPanel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Draggable Subcategory Item
const DraggableSubcategory: React.FC<{ sub: string; catName: string; type: 'income' | 'expense'; onRename: () => void; onDelete: () => void }> = ({ sub, catName, type, onRename, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${type}-${catName}-${sub}`,
    data: { sub, catName, type }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        background: 'rgba(255,255,255,0.03)',
        mb: 1,
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.05)',
        '&:hover': { background: 'rgba(255,255,255,0.06)' }
      }}
    >
      <Box {...listeners} {...attributes} sx={{ cursor: 'grab', mr: 2, display: 'flex', opacity: 0.3 }}>
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <ListItemText primary={sub} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
      <ListItemSecondaryAction>
        <IconButton size="small" onClick={onRename}>
          <EditIcon fontSize="inherit" />
        </IconButton>
        <IconButton size="small" color="error" onClick={onDelete}>
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// Droppable Category Card
const DroppableCategory: React.FC<{ cat: any; type: 'income' | 'expense'; children: React.ReactNode; onAddSub: () => void; onRename: () => void; onDelete: () => void }> = ({ cat, type, children, onAddSub, onRename, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${type}-${cat.name}`,
    data: { catName: cat.name, type }
  });

  return (
    <Card
      ref={setNodeRef}
      sx={{
        mb: 3,
        background: isOver ? 'rgba(99, 102, 241, 0.1)' : 'rgba(30, 41, 59, 0.5)',
        border: `1px solid ${isOver ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.2s',
        minHeight: 150,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{cat.name}</Typography>
        <Box>
          <IconButton size="small" onClick={onRename}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1, pt: 2, pb: '16px !important' }}>
        <List dense disablePadding>
          {children}
        </List>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddSub}
          sx={{ mt: 1, borderStyle: 'dashed', opacity: 0.6 }}
        >
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
};

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
    deleteSubcategoryAndRemap,
    moveSubcategory,
    recurringTransactions,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    balanceStartDate,
    setBalanceStartDate
  } = useFinanceStore();

  const [tabValue, setTabValue] = React.useState(0);

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

  // Remap Deletion State
  const [remapDialogOpen, setRemapDialogOpen] = useState(false);
  const [remapConfig, setRemapConfig] = useState<{
    type: 'income' | 'expense';
    categoryName: string;
    subToDelete: string;
  } | null>(null);
  const [remapTarget, setRemapTarget] = useState('');

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (config: any) => {
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

  const handleOpenRemapDialog = (type: 'income' | 'expense', categoryName: string, subToDelete: string) => {
    setRemapConfig({ type, categoryName, subToDelete });
    setRemapTarget('');
    setRemapDialogOpen(true);
  };

  const handleCloseRemapDialog = () => {
    setRemapDialogOpen(false);
    setRemapConfig(null);
  };

  const handleConfirmRemap = () => {
    if (remapConfig && remapTarget) {
      deleteSubcategoryAndRemap(remapConfig.type, remapConfig.categoryName, remapConfig.subToDelete, remapTarget);
      handleCloseRemapDialog();
    }
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

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current;
    const dropData = over.data.current;

    if (dragData && dropData && dragData.type === dropData.type && dragData.catName !== dropData.catName) {
      moveSubcategory(dragData.type, dragData.sub, dragData.catName, dropData.catName);
    }
  };

  const sortedExpenses = useMemo(() => {
    return [...categories]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cat => ({ ...cat, subcategories: [...cat.subcategories].sort((a, b) => a.localeCompare(b)) }));
  }, [categories]);

  const sortedIncome = useMemo(() => {
    return [...incomeCategories]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cat => ({ ...cat, subcategories: [...cat.subcategories].sort((a, b) => a.localeCompare(b)) }));
  }, [incomeCategories]);

  const renderExplodedList = (cats: any[], type: 'income' | 'expense') => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{type === 'income' ? 'Income' : 'Expense'} Structure</Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => handleOpenDialog({ type: 'category', mode: 'add', financeType: type })}>
          Add Category
        </Button>
      </Box>
      <Grid container spacing={2}>
        {cats.map((cat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={cat.name}>
            <DroppableCategory
              cat={cat}
              type={type}
              onAddSub={() => handleOpenDialog({ type: 'subcategory', mode: 'add', financeType: type, categoryName: cat.name })}
              onRename={() => handleOpenDialog({ type: 'category', mode: 'rename', financeType: type, oldValue: cat.name })}
              onDelete={() => {
                if (cat.subcategories.length > 0) {
                  alert('Cannot delete a category that still contains items. Move or delete them first.');
                  return;
                }
                if (window.confirm(`Delete category "${cat.name}"?`)) deleteCategory(type, cat.name);
              }}
            >
              {cat.subcategories.map((sub: string) => (
                <DraggableSubcategory
                  key={sub}
                  sub={sub}
                  catName={cat.name}
                  type={type}
                  onRename={() => handleOpenDialog({ type: 'subcategory', mode: 'rename', financeType: type, categoryName: cat.name, oldValue: sub })}
                  onDelete={() => handleOpenRemapDialog(type, cat.name, sub)}
                />
              ))}
            </DroppableCategory>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const currentCategories = recurringForm.type === 'income' ? incomeCategories : categories;
  const selectedCategoryObj = currentCategories.find(c => c.name === recurringForm.category);

  // For remap selection
  const remapCategoryObj = remapConfig ? (remapConfig.type === 'income' ? incomeCategories : categories).find(c => c.name === remapConfig.categoryName) : null;
  const otherSubcategories = remapCategoryObj ? remapCategoryObj.subcategories.filter(s => s !== remapConfig?.subToDelete) : [];

  return (
    <DndContext onDragEnd={onDragEnd}>
      <Box sx={{ pb: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: -1 }}>
          Financial Configuration
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.9rem',
                minHeight: 64,
                opacity: 0.6,
                '&.Mui-selected': { opacity: 1 }
              }
            }}
          >
            <Tab icon={<AccountBalance sx={{ mr: 1 }} />} iconPosition="start" label="Balance" />
            <Tab icon={<Repeat sx={{ mr: 1 }} />} iconPosition="start" label="Recurring" />
            <Tab icon={<TrendingDown sx={{ mr: 1 }} />} iconPosition="start" label="Expenses" />
            <Tab icon={<TrendingUp sx={{ mr: 1 }} />} iconPosition="start" label="Incomes" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 4, height: '100%', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Initial Balance (Saldo Iniziale)</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(Number(e.target.value))}
                  slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, opacity: 0.5 }}>€</Typography> } }}
                  variant="filled"
                />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 4, height: '100%', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Calculation Start Date</Typography>
                <TextField
                  type="date"
                  fullWidth
                  value={balanceStartDate}
                  onChange={(e) => setBalanceStartDate(e.target.value)}
                  variant="filled"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 4, borderRadius: 4, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Recurring Templates</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button startIcon={<AddIcon />} size="small" variant="outlined" color="error" onClick={() => handleOpenDialog({ type: 'recurring', mode: 'add', financeType: 'expense' })}>
                  Add Exp
                </Button>
                <Button startIcon={<AddIcon />} size="small" variant="outlined" color="success" onClick={() => handleOpenDialog({ type: 'recurring', mode: 'add', financeType: 'income' })}>
                  Add Inc
                </Button>
              </Box>
            </Box>
            {recurringTransactions.length === 0 ? (
              <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.3, fontStyle: 'italic' }}>No recurring transactions defined.</Typography>
            ) : (
              <List sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 3 }}>
                {recurringTransactions.map((rec, i) => (
                  <ListItem key={rec.id} divider={i !== recurringTransactions.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700 }}>{rec.description}</Typography>
                          <Typography sx={{ color: rec.type === 'income' ? '#10b981' : '#ef4444', fontWeight: 800 }}>
                            € {rec.amount.toLocaleString('it-IT')}
                          </Typography>
                        </Box>
                      }
                      secondary={`${rec.category} > ${rec.subcategory} | Every day ${rec.dayOfMonth}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => handleOpenDialog({ type: 'recurring', mode: 'edit', financeType: rec.type, recurringId: rec.id })}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => { if (window.confirm('Delete recurring template?')) deleteRecurring(rec.id); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderExplodedList(sortedExpenses, 'expense')}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderExplodedList(sortedIncome, 'income')}
        </TabPanel>

        {/* Global Dialog for Add/Edit/Rename */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth={dialogConfig?.type === 'recurring' ? 'sm' : 'xs'} PaperProps={{ sx: { background: '#1e293b', borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {dialogConfig?.mode === 'add' ? 'Add New ' : dialogConfig?.mode === 'edit' ? 'Edit ' : 'Rename '}
            {dialogConfig?.type === 'category' ? 'Category' : dialogConfig?.type === 'recurring' ? 'Recurring Template' : 'Item'}
          </DialogTitle>
          <DialogContent>
            {dialogConfig?.type === 'subcategory' && dialogConfig.mode === 'rename' && (
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(237, 108, 2, 0.1)', border: '1px solid #ed6c02' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Heads up!</Typography>
                Renaming this item will also update all your existing transactions and recurring templates associated with it.
              </Alert>
            )}

            <Box sx={{ mt: 1 }}>
              {dialogConfig?.type === 'recurring' ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Description" variant="filled" value={recurringForm.description} onChange={e => setRecurringForm({ ...recurringForm, description: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Amount" type="number" variant="filled" value={recurringForm.amount} onChange={e => setRecurringForm({ ...recurringForm, amount: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Day of Month" type="number" variant="filled" value={recurringForm.dayOfMonth} onChange={e => setRecurringForm({ ...recurringForm, dayOfMonth: Number(e.target.value) })} inputProps={{ min: 1, max: 31 }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      select
                      label="Category"
                      variant="filled"
                      value={recurringForm.category}
                      onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value, subcategory: '' })}
                    >
                      {(currentCategories || []).map((cat) => (
                        <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      select
                      label="Subcategory"
                      variant="filled"
                      value={recurringForm.subcategory}
                      onChange={(e) => setRecurringForm({ ...recurringForm, subcategory: e.target.value })}
                      disabled={!recurringForm.category}
                    >
                      {(selectedCategoryObj?.subcategories || []).map((sub) => (
                        <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Start Date" type="date" variant="filled" value={recurringForm.startDate} onChange={e => setRecurringForm({ ...recurringForm, startDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="End Date (Optional)" type="date" variant="filled" value={recurringForm.endDate} onChange={e => setRecurringForm({ ...recurringForm, endDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                </Grid>
              ) : (
                <TextField
                  autoFocus
                  fullWidth
                  label="Name"
                  variant="filled"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
            <Button onClick={handleConfirm} variant="contained" disabled={dialogConfig?.type === 'recurring' ? (!recurringForm.description || !recurringForm.amount || !recurringForm.category) : !inputValue.trim()}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remap Deletion Dialog */}
        <Dialog open={remapDialogOpen} onClose={handleCloseRemapDialog} fullWidth maxWidth="xs" PaperProps={{ sx: { background: '#1e293b', borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Delete & Remap</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 3 }}>
              You are about to delete <strong>{remapConfig?.subToDelete}</strong>.
            </Alert>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
              Existing transactions using this item must be re-categorized. Please select a replacement:
            </Typography>
            <TextField
              fullWidth
              select
              label="New Subcategory"
              variant="filled"
              value={remapTarget}
              onChange={(e) => setRemapTarget(e.target.value)}
            >
              {otherSubcategories.length === 0 ? (
                <MenuItem disabled>No other items in this category</MenuItem>
              ) : (
                otherSubcategories.map((sub) => (
                  <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                ))
              )}
            </TextField>
            {otherSubcategories.length === 0 && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                You cannot delete the last item in a category. Create a new one first.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseRemapDialog} color="inherit">Cancel</Button>
            <Button
              onClick={handleConfirmRemap}
              variant="contained"
              color="error"
              disabled={!remapTarget}
            >
              Confirm Deletion & Move
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DndContext>
  );
};

export default ConfigPage;
