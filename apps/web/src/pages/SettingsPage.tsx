import { DndContext, type DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { AccountBalance, AccountBalanceWallet, Add as AddIcon, Backup as BackupIcon, Bolt, Check as CheckIcon, CreditCard, Delete as DeleteIcon, DirectionsCar, DragIndicator as DragIndicatorIcon, Edit as EditIcon, Download, PieChart, Repeat, RestartAlt, ShowChart, TrendingDown, TrendingUp, Upload, ViewQuilt } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Paper, Select, Switch, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/forms/TransactionForm';
import type { TransactionFormData } from '../components/forms/TransactionForm';
import BrokerSettingsModal from '../components/investment/BrokerSettingsModal';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { formTextFieldSx } from '../components/shared/form.styles';
import EntityDrawer from '../components/settings/EntityDrawer';
import SettingsNav, { type SettingsSection } from '../components/settings/SettingsNav';
import { categoryColor } from '../components/settings/categoryColor';
import { monoValueSx, settingsCardSx } from '../components/settings/settings.styles';
import { AlertSnackbar } from '../components/shared/AlertSnackbar';
import { DeleteAccountRequiresPasswordError, deleteUserAccount } from '../lib/deleteAccount';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useInvestmentStore } from '../store/useInvestmentStore';
import { useProjectionSettingsStore, DEFAULT_PROJECTION_SETTINGS } from '../store/useProjectionSettingsStore';
import { DEFAULT_BALANCE_START_DATE, DEFAULT_ENABLED_MODULES, DEFAULT_LANGUAGE } from '../store/defaults';
import { computeAccountBalance } from '../components/transactions/transactionDrawer.utils';
import { maskIban } from '../components/settings/format';
import { formatCurrency } from '../utils/format.utils';
import type { ICard, ICategory } from '../store/types/finance.types';
import type { AppModules } from '../store/useFinanceStore';
import type { ITabPanelProps } from '../types/props.types';

function TabPanel(props: ITabPanelProps) {
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
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

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
        background: '#0E1524',
        mb: 1,
        borderRadius: 2,
        border: '1px solid #1E293B',
        '&:hover': { background: '#16233B' }
      }}
    >
      <Box {...listeners} {...attributes} sx={{ cursor: 'grab', mr: 2, display: 'flex', opacity: 0.3 }}>
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: categoryColor(catName), opacity: 0.6, mr: 1.25, flexShrink: 0 }} />
      <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{sub}</Typography>} />
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

type FinanceType = 'income' | 'expense';
/** Recurring templates may also model transfers, unlike categories. */
type TransactionType = 'income' | 'expense' | 'transfer';

/**
 * Which entity the add/rename/edit dialog is acting on.
 *
 * Modelled as a discriminated union on `type` and `mode` so the compiler can
 * guarantee that a rename always carries the value being renamed, and that
 * subcategory operations always carry their parent category — previously every
 * field was optional and the call sites needed `!` assertions.
 */
type DialogConfig =
  | { type: 'category'; mode: 'add'; financeType: FinanceType }
  | { type: 'category'; mode: 'rename'; financeType: FinanceType; oldValue: string }
  | { type: 'subcategory'; mode: 'add'; financeType: FinanceType; categoryName: string }
  | { type: 'subcategory'; mode: 'rename'; financeType: FinanceType; categoryName: string; oldValue: string }
  | { type: 'recurring'; mode: 'add' | 'edit'; financeType: TransactionType; recurringId?: string }
  | { type: 'account'; mode: 'add' | 'edit'; accountId?: string };

// Droppable Category Card
const DroppableCategory: React.FC<{ cat: ICategory; type: 'income' | 'expense'; children: React.ReactNode; onAddSub: () => void; onRename: () => void; onDelete: () => void }> = ({ cat, type, children, onAddSub, onRename, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${type}-${cat.name}`,
    data: { catName: cat.name, type }
  });

  return (
    <Card
      ref={setNodeRef}
      sx={{
        mb: 3,
        background: isOver ? 'rgba(99, 102, 241, 0.1)' : 'colors.surface',
        border: `1px solid ${isOver ? '#4364f7' : 'colors.border'}`,
        transition: 'all 0.2s',
        minHeight: 150,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'colors.border' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: categoryColor(cat.name), flexShrink: 0 }} />
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>{cat.name}</Typography>
        </Box>
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

const SettingsPage: React.FC = () => {
  const {
    categories,
    incomeCategories,
    addCategory,
    renameCategory,
    deleteCategory,
    addSubcategory,
    renameSubcategory,
    deleteSubcategory,
    deleteSubcategoryAndRemap,
    moveSubcategory,
    accounts,
    cards,
    transactions,
    addAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    addCard,
    updateCard,
    deleteCard,
    recurringTransactions,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    balanceStartDate,
    setBalanceStartDate,
    enabledModules,
    toggleModule,
    exportAllData,
    importAllData,
    previewBackup,
    isSaving,
    saveError,
    language,
    setLanguage,
  } = useFinanceStore();

  const { t } = useTranslation();
  const { inflationRate: savedInflationRate, taxRate: savedTaxRate, loaded: settingsLoaded, loadSettings, saveSettings, resetToDefaults } = useProjectionSettingsStore();

  const [tabValue, setTabValue] = React.useState(0);
  const [projectionForm, setProjectionForm] = React.useState({ inflationRate: '', taxRate: '' });

  // Regional settings and module toggles are edited as a draft: nothing is
  // persisted until "Salva modifiche". Entity CRUD stays immediate.
  const [settingsDraft, setSettingsDraft] = React.useState<{
    language: string;
    balanceStartDate: string;
    modules: AppModules;
  }>(() => ({
    language: language || DEFAULT_LANGUAGE,
    balanceStartDate: balanceStartDate || DEFAULT_BALANCE_START_DATE,
    modules: { ...enabledModules },
  }));

  const [settingsDraftTouched, setSettingsDraftTouched] = React.useState(false);

  // Re-baseline the draft while the user has not edited anything: Firestore
  // hydration can land after the first render, and saving the initial defaults
  // over the user's real settings would be destructive.
  React.useEffect(() => {
    if (settingsDraftTouched) return;
    // Syncing a draft with an external store after hydration is the intended
    // pattern here; the lint rule targets effects that derive state from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettingsDraft({
      language: language || DEFAULT_LANGUAGE,
      balanceStartDate: balanceStartDate || DEFAULT_BALANCE_START_DATE,
      modules: { ...enabledModules },
    });
  }, [language, balanceStartDate, enabledModules, settingsDraftTouched]);

  const updateDraft = React.useCallback((patch: Partial<{ language: string; balanceStartDate: string; modules: AppModules }>) => {
    setSettingsDraftTouched(true);
    setSettingsDraft((current) => ({ ...current, ...patch }));
  }, []);

  const settingsDirty = React.useMemo(
    () =>
      settingsDraft.language !== language ||
      settingsDraft.balanceStartDate !== balanceStartDate ||
      (Object.keys(settingsDraft.modules) as (keyof AppModules)[]).some(
        (key) => settingsDraft.modules[key] !== enabledModules[key],
      ),
    [settingsDraft, language, balanceStartDate, enabledModules],
  );


  React.useEffect(() => {
    if (!settingsLoaded) {
      loadSettings();
    }
  }, [settingsLoaded, loadSettings]);

  const handleTabChange = React.useCallback((newValue: number) => {
    setTabValue(newValue);
    if (newValue === 5) {
      setProjectionForm({
        inflationRate: (savedInflationRate * 100).toFixed(1),
        taxRate: (savedTaxRate * 100).toFixed(1),
      });
    }
  }, [savedInflationRate, savedTaxRate]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [accountInitialBalance, setAccountInitialBalance] = useState('0');
  const [accountIban, setAccountIban] = useState('');

  // Remap Deletion State
  const [remapDialogOpen, setRemapDialogOpen] = useState(false);
  const [remapConfig, setRemapConfig] = useState<{
    type: 'income' | 'expense';
    categoryName: string;
    subToDelete: string;
  } | null>(null);
  const [remapTarget, setRemapTarget] = useState('');

  // Form for recurring
  const [recurringForm, setRecurringForm] = useState<TransactionFormData & { type: 'income' | 'expense' | 'transfer' }>({
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    dayOfMonth: 1,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: '',
    type: 'expense',
    accountId: '',
    frequency: 'monthly',
    monthOfYear: 1,
    cardId: ''
  });

  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardDialogMode, setCardDialogMode] = useState<'add' | 'edit'>('add');
  const [editingCard, setEditingCard] = useState<ICard | null>(null);
  const [cardForm, setCardForm] = useState({ name: '', type: 'credit' as 'credit' | 'debit', plafond: '', billingDay: 1, accountId: '' });

  const resetCardForm = (accountId?: string) => {
    setCardForm({ name: '', type: 'credit', plafond: '', billingDay: 1, accountId: accountId || '' });
  };

  const handleOpenAddCard = (accountId: string) => {
    setCardDialogMode('add');
    setEditingCard(null);
    resetCardForm(accountId);
    setCardDialogOpen(true);
  };

  const handleOpenEditCard = (card: ICard) => {
    setCardDialogMode('edit');
    setEditingCard(card);
    setCardForm({
      name: card.name,
      type: card.type,
      plafond: card.plafond.toString(),
      billingDay: card.billingDay,
      accountId: card.accountId,
    });
    setCardDialogOpen(true);
  };

  const handleSaveCard = () => {
    if (!cardForm.name.trim() || !cardForm.plafond) return;
    if (cardDialogMode === 'add') {
      addCard({
        id: crypto.randomUUID(),
        name: cardForm.name.trim(),
        type: cardForm.type,
        plafond: Number(cardForm.plafond),
        billingDay: Number(cardForm.billingDay),
        accountId: cardForm.accountId,
      });
    } else if (editingCard) {
      updateCard({
        ...editingCard,
        name: cardForm.name.trim(),
        type: cardForm.type,
        plafond: Number(cardForm.plafond),
        billingDay: Number(cardForm.billingDay),
      });
    }
    setCardDialogOpen(false);
  };

  const [brokerDialogOpen, setBrokerDialogOpen] = useState(false);
  const brokerAccounts = useInvestmentStore(s => s.brokerAccounts);

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    transactionCount: number;
    accountCount: number;
    recurringCount: number;
    categoryCount: number;
    incomeCategoryCount: number;
    budgetTargetCount: number;
    brokerAccountCount: number;
    etfTransactionCount: number;
    cashAdjustmentCount: number;
    dividendEntryCount: number;
    exportedAt: string;
  } | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Alert snackbar state
  const [alertState, setAlertState] = useState<{ open: boolean; message: string; severity: 'error' | 'warning' | 'info' | 'success' }>({ open: false, message: '', severity: 'error' });

  const handleOpenConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({ open: true, title, message, onConfirm });
  };

  const handleCloseConfirm = () => {
    setConfirmState(prev => ({ ...prev, open: false }));
  };

  const showAlert = (message: string, severity: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    setAlertState({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlertState(prev => ({ ...prev, open: false }));
  };

  const handleSaveSettings = React.useCallback(() => {
    if (settingsDraft.language !== language) setLanguage(settingsDraft.language);
    if (settingsDraft.balanceStartDate !== balanceStartDate) setBalanceStartDate(settingsDraft.balanceStartDate);
    (Object.keys(settingsDraft.modules) as (keyof AppModules)[]).forEach((key) => {
      if (settingsDraft.modules[key] !== enabledModules[key]) toggleModule(key);
    });
    showAlert(t('settings.saved'), 'success');
  }, [settingsDraft, language, balanceStartDate, enabledModules, setLanguage, setBalanceStartDate, toggleModule, t]);

  const handleResetSettings = React.useCallback(() => {
    setSettingsDraftTouched(true);
    setSettingsDraft({
      language: DEFAULT_LANGUAGE,
      balanceStartDate: DEFAULT_BALANCE_START_DATE,
      modules: { ...DEFAULT_ENABLED_MODULES },
    });
    showAlert(t('settings.resetQueued'), 'info');
  }, [t]);

  // Delete Account state
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deletePasswordOpen, setDeletePasswordOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccountClick = () => {
    setDeleteEmailInput('');
    setDeleteConfirmOpen(true);
  };

  const performDeleteAccount = async (password?: string) => {
    setIsDeletingAccount(true);
    try {
      await deleteUserAccount(password);
      showAlert(t('config.deleteAccountSuccess'), 'success');
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setIsDeletingAccount(false);
      if (err instanceof DeleteAccountRequiresPasswordError) {
        setDeletePassword('');
        setDeletePasswordOpen(true);
      } else {
        const code = (err as { code?: string })?.code;
        if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
          showAlert(t('config.deleteAccountWrongPassword'));
        } else {
          showAlert(t('config.deleteAccountError'));
          console.error('deleteUserAccount error:', err);
        }
      }
    }
  };

  const handleDeleteAccountConfirm = () => {
    if (deleteEmailInput.trim().toLowerCase() !== (user?.email ?? '').toLowerCase()) {
      showAlert(t('config.deleteAccountEmailMismatch'));
      return;
    }
    setDeleteConfirmOpen(false);
    performDeleteAccount();
  };

  const handleDeletePasswordConfirm = () => {
    setDeletePasswordOpen(false);
    performDeleteAccount(deletePassword);
  };

  const handleOpenDialog = (config: DialogConfig) => {
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
            type: rec.type,
            accountId: rec.accountId,
            frequency: rec.frequency || 'monthly',
            monthOfYear: rec.monthOfYear || 1,
            cardId: rec.cardId || ''
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
          type: config.financeType,
          accountId: accounts.find(a => a.isDefault)?.id || accounts[0]?.id || '',
          frequency: 'monthly',
          monthOfYear: 1,
          cardId: ''
        });
      }
    } else if (config?.type === 'account') {
      if (config.mode === 'edit') {
        const acc = accounts.find(a => a.id === config.accountId);
        if (acc) {
          setInputValue(acc.name);
          setAccountInitialBalance(acc.initialBalance.toString());
          setAccountIban(acc.iban ?? '');
        }
      } else {
        setInputValue('');
        setAccountInitialBalance('0');
        setAccountIban('');
      }
    } else {
      setInputValue(config.mode === 'rename' ? config.oldValue : '');
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

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await previewBackup(file);
    if (!result.valid) {
      showAlert(result.error || 'Errore caricamento backup');
      return;
    }
    setPreviewData(result.summary);
    setImportFile(file);
    setPreviewDialogOpen(true);
  };

  const handleConfirmRestore = async () => {
    setPreviewDialogOpen(false);
    if (!importFile) return;

    const success = await importAllData(importFile);
    if (success) {
      showAlert('Backup ripristinato con successo!', 'success');
    } else {
      showAlert(saveError ?? 'Errore nel ripristino del backup');
    }
    setPreviewData(null);
    setImportFile(null);
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
        startDate: recurringForm.startDate || dayjs().format('YYYY-MM-DD'),
        endDate: recurringForm.endDate || '',
        type: recurringForm.type,
        accountId: recurringForm.accountId,
        frequency: recurringForm.frequency,
        monthOfYear: recurringForm.frequency === 'yearly' ? Number(recurringForm.monthOfYear) : undefined,
        cardId: recurringForm.cardId || undefined
      };

      if (dialogConfig.mode === 'add') {
        addRecurring(data);
      } else {
        updateRecurring(data);
      }
    } else if (dialogConfig.type === 'account') {
      const data = {
        id: dialogConfig.accountId || crypto.randomUUID(),
        name: inputValue.trim(),
        initialBalance: Number(accountInitialBalance),
        ...(accountIban.trim() ? { iban: accountIban.trim().toUpperCase() } : {}),
        isDefault: dialogConfig.mode === 'add' ? (accounts.length === 0) : (accounts.find(a => a.id === dialogConfig.accountId)?.isDefault || false)
      };
      if (dialogConfig.mode === 'add') {
        addAccount(data);
      } else {
        updateAccount(data);
      }
    } else if (inputValue.trim()) {
      if (dialogConfig.type === 'category') {
        if (dialogConfig.mode === 'add') {
          addCategory(dialogConfig.financeType, inputValue);
        } else {
          renameCategory(dialogConfig.financeType, dialogConfig.oldValue, inputValue);
        }
      } else if (dialogConfig.type === 'subcategory') {
        if (dialogConfig.mode === 'add') {
          addSubcategory(dialogConfig.financeType, dialogConfig.categoryName, inputValue);
        } else {
          renameSubcategory(dialogConfig.financeType, dialogConfig.categoryName, dialogConfig.oldValue, inputValue);
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

  const renderExplodedList = (cats: ICategory[], type: 'income' | 'expense') => (
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
                  showAlert('Cannot delete a category that still contains items. Move or delete them first.', 'warning');
                  return;
                }
                handleOpenConfirm(`Delete category "${cat.name}"?`, 'This action cannot be undone.', () => deleteCategory(type, cat.name));
              }}
            >
              {cat.subcategories.map((sub: string) => (
                <DraggableSubcategory
                  key={sub}
                  sub={sub}
                  catName={cat.name}
                  type={type}
                  onRename={() => handleOpenDialog({ type: 'subcategory', mode: 'rename', financeType: type, categoryName: cat.name, oldValue: sub })}
                  onDelete={() => {
                    const hasTransactions = transactions.some(t => t.type === type && t.category === cat.name && t.subcategory === sub);
                    const hasRecurring = recurringTransactions.some(r => r.type === type && r.category === cat.name && r.subcategory === sub);

                    if (hasTransactions || hasRecurring) {
                      handleOpenRemapDialog(type, cat.name, sub);
                    } else {
                      handleOpenConfirm(`Delete item "${sub}"?`, 'This action cannot be undone.', () => deleteSubcategory(type, cat.name, sub));
                    }
                  }}
                />
              ))}
            </DroppableCategory>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const sections: SettingsSection[] = React.useMemo(
    () => [
      { id: 0, label: t('settings.nav.general'), icon: <ViewQuilt /> },
      { id: 1, label: t('settings.nav.accounts'), icon: <AccountBalance />, badge: `${accounts.length} ${t('settings.active')}` },
      { id: 2, label: t('settings.nav.expenses'), icon: <TrendingDown />, badge: String(sortedExpenses.length) },
      { id: 3, label: t('settings.nav.incomes'), icon: <TrendingUp />, badge: String(sortedIncome.length) },
      { id: 4, label: t('settings.nav.recurring'), icon: <Repeat />, badge: String(recurringTransactions.length) },
      { id: 5, label: t('settings.nav.projections'), icon: <ShowChart /> },
      { id: 6, label: t('settings.nav.backup'), icon: <BackupIcon /> },
    ],
    [t, accounts.length, sortedExpenses.length, sortedIncome.length, recurringTransactions.length],
  );

  const moduleCards: { key: keyof AppModules; icon: React.ReactNode; label: string; description: string }[] = [
    { key: 'carManagement', icon: <DirectionsCar fontSize="small" />, label: t('config.carManagement'), description: t('settings.modules.car') },
    { key: 'utilityTracker', icon: <Bolt fontSize="small" />, label: t('config.utilityTracker'), description: t('settings.modules.utilities') },
    { key: 'investmentTracking', icon: <TrendingUp fontSize="small" />, label: t('config.investmentTracking'), description: t('settings.modules.investments') },
    { key: 'budgetTracking', icon: <PieChart fontSize="small" />, label: t('config.budgetTracking'), description: t('settings.modules.budget') },
  ];

  // For remap selection
  const remapCategoryObj = remapConfig ? (remapConfig.type === 'income' ? incomeCategories : categories).find(c => c.name === remapConfig.categoryName) : null;
  const otherSubcategories = remapCategoryObj ? remapCategoryObj.subcategories.filter(s => s !== remapConfig?.subToDelete) : [];

  return (
    <DndContext onDragEnd={onDragEnd}>
      <Box sx={{ pb: 8 }}>
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'colors.subtle', mt: 0.5 }}>
              {t('settings.subtitle')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAlt sx={{ fontSize: 16 }} />}
              onClick={handleResetSettings}
              sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'colors.subtle', borderColor: 'colors.border' }}
            >
              {t('settings.actions.reset')}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
              onClick={handleSaveSettings}
              disabled={!settingsDirty}
              sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, bgcolor: 'colors.cyan', color: '#04141a', '&:hover': { bgcolor: '#0891b2' } }}
            >
              {t('settings.actions.save')}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '240px minmax(0, 1fr)' },
            gap: { xs: 2, md: 3 },
            alignItems: 'start',
          }}
        >
          <SettingsNav sections={sections} value={tabValue} onChange={handleTabChange} />
          <Box sx={{ minWidth: 0 }}>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={settingsCardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('settings.regional.title')}</Typography>
                <Box
                  component="span"
                  sx={{ px: 1, py: 0.25, borderRadius: 1, border: '1px solid', borderColor: 'colors.border', bgcolor: 'colors.surfaceNested', fontFamily: (th) => th.colors.mono, fontSize: '0.62rem', color: 'colors.subtle', letterSpacing: '0.06em' }}
                >
                  {t('settings.regional.badge')}
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: 'colors.subtle', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {t('settings.regional.language')}
                  </Typography>
                  <FormControl fullWidth variant="filled">
                    <Select
                      value={settingsDraft.language}
                      onChange={(event) => updateDraft({ language: event.target.value })}
                      sx={{ '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 } }}
                    >
                      <MenuItem value="it"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>🇮🇹</span> {t('language.italian')}</Box></MenuItem>
                      <MenuItem value="en"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>🇬🇧</span> {t('language.english')}</Box></MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: 'colors.subtle', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {t('settings.regional.currency')}
                  </Typography>
                  <FormControl fullWidth variant="filled" disabled>
                    <Select value="EUR">
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: 'colors.subtle', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {t('settings.regional.dateFormat')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ ...monoValueSx, fontSize: '0.9rem' }}>{t('dateFormat')}</Typography>
                    <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: 1, border: '1px solid', borderColor: 'colors.border', bgcolor: 'colors.surfaceNested', ...monoValueSx, fontSize: '0.72rem', color: 'colors.subtle' }}>
                      {t('settings.regional.previewExample')}
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: 'colors.subtle', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {t('settings.regional.startDate')}
                  </Typography>
                  <DatePicker
                    value={dayjs(settingsDraft.balanceStartDate)}
                    onChange={(value) => { if (value) updateDraft({ balanceStartDate: value.format('YYYY-MM-DD') }); }}
                    slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'outlined', sx: formTextFieldSx } }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'colors.subtle' }}>
                    {t('settings.regional.startDateHint')}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('config.modules')}</Typography>
              <Typography variant="body2" sx={{ color: 'colors.subtle', mb: 1.5 }}>{t('config.modulesDescription')}</Typography>
              <Grid container spacing={2.5}>
                {moduleCards.map((module) => (
                  <Grid key={module.key} size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ ...settingsCardSx, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(6,182,212,0.12)', color: 'colors.cyan', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {module.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{module.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'colors.subtle' }}>{module.description}</Typography>
                      </Box>
                      <Switch
                        color="info"
                        checked={Boolean(settingsDraft.modules[module.key])}
                        onChange={() => updateDraft({ modules: { ...settingsDraft.modules, [module.key]: !settingsDraft.modules[module.key] } })}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Paper sx={{ ...settingsCardSx, borderColor: 'rgba(239,68,68,0.3)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'error.main' }}>
                {t('config.deleteAccount')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'colors.subtle' }}>
                {t('config.deleteAccountDescription')}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAccountClick}
                disabled={isDeletingAccount}
              >
                {t('config.deleteAccount')}
              </Button>
            </Paper>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('settings.accounts.title')}</Typography>
                <Typography variant="caption" sx={{ color: 'colors.subtle' }}>{t('settings.accounts.subtitle')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenDialog({ type: 'account', mode: 'add' })} sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'colors.cyan', borderColor: 'rgba(6,182,212,0.4)' }}>
                  {t('settings.accounts.addAccount')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CreditCard sx={{ fontSize: 16 }} />}
                  onClick={() => handleOpenAddCard(accounts.find((account) => account.isDefault)?.id ?? accounts[0]?.id ?? '')}
                  disabled={accounts.length === 0}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'colors.cyan', borderColor: 'rgba(6,182,212,0.4)' }}
                >
                  {t('settings.accounts.addCard')}
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2.5}>
              {accounts.map((account) => {
                const balance = computeAccountBalance(account.id, accounts, transactions) ?? account.initialBalance;
                return (
                  <Grid key={account.id} size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ ...settingsCardSx, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(6,182,212,0.12)', color: 'colors.cyan', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <AccountBalanceWallet fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography noWrap sx={{ fontWeight: 700 }}>{account.name}</Typography>
                            <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: 1, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', bgcolor: account.isDefault ? 'rgba(16,185,129,0.12)' : 'colors.surfaceNested', color: account.isDefault ? 'colors.emerald' : 'colors.subtle', border: '1px solid', borderColor: account.isDefault ? 'rgba(16,185,129,0.3)' : 'colors.border' }}>
                              {account.isDefault ? t('settings.accounts.primary') : t('settings.accounts.secondary')}
                            </Box>
                          </Box>
                          <Typography variant="caption" sx={{ ...monoValueSx, color: 'colors.subtle' }}>
                            {maskIban(account.iban) ?? t('settings.accounts.noIban')}
                          </Typography>
                        </Box>
                        {!account.isDefault && (
                          <Button size="small" variant="text" onClick={() => setDefaultAccount(account.id)} sx={{ fontSize: '0.65rem', textTransform: 'none' }}>
                            {t('config.setDefault')}
                          </Button>
                        )}
                        <IconButton size="small" onClick={() => handleOpenDialog({ type: 'account', mode: 'edit', accountId: account.id })}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" disabled={accounts.length <= 1} onClick={() => handleOpenConfirm(`Delete account "${account.name}"?`, 'This action cannot be undone.', () => deleteAccount(account.id))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography sx={{ ...monoValueSx, fontSize: '1.35rem', fontWeight: 700 }}>
                        {formatCurrency(balance)}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>{t('settings.accounts.cardsTitle')}</Typography>
              <Grid container spacing={2.5}>
                {cards.map((card) => (
                  <Grid key={card.id} size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ ...settingsCardSx, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CreditCard fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 700 }}>{card.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
                            {cards.find((item) => item.id === card.id)?.type === 'credit' ? t('settings.accounts.credit') : t('settings.accounts.debit')}
                            {' · '}
                            {t('settings.accounts.resetDay', { day: card.billingDay })}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleOpenEditCard(card)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleOpenConfirm(`Delete card "${card.name}"?`, 'This action cannot be undone.', () => deleteCard(card.id))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography sx={{ ...monoValueSx, fontSize: '1.1rem', fontWeight: 700 }}>
                        {formatCurrency(card.plafond)} <Typography component="span" variant="caption" sx={{ color: 'colors.subtle' }}>{t('settings.accounts.perMonth')}</Typography>
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
                        {accounts.find((account) => account.id === card.accountId)?.name ?? '—'}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
                {cards.length === 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography sx={{ color: 'colors.subtle', fontStyle: 'italic', py: 2 }}>{t('settings.accounts.noCards')}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Paper sx={settingsCardSx}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Broker Accounts</Typography>
              {brokerAccounts.length === 0 ? (
                <Typography sx={{ color: 'colors.subtle', textAlign: 'center', py: 2, fontStyle: 'italic' }}>
                  No broker accounts configured.
                </Typography>
              ) : (
                <List>
                  {brokerAccounts.map((broker) => (
                    <ListItem key={broker.id} sx={{ bgcolor: 'colors.surfaceNested', mb: 1, borderRadius: 2, border: '1px solid', borderColor: 'colors.border' }}>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700 }}>{broker.name}</Typography>}
                        secondary={<Typography component="span" variant="caption" sx={monoValueSx}>{`Lump: ${formatCurrency(broker.baseLumpSum)} · PAC: ${formatCurrency(broker.monthlyPacAmount)} · Rate: ${broker.interestRate}%`}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setBrokerDialogOpen(true)} fullWidth sx={{ mt: 1, textTransform: 'none' }}>
                Add Broker Account
              </Button>
            </Paper>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderExplodedList(sortedExpenses, 'expense')}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderExplodedList(sortedIncome, 'income')}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Paper sx={{ p: 4, borderRadius: 3, background: 'colors.surface', border: '1px solid #1E293B' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('config.recurringTemplates')}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button startIcon={<AddIcon />} size="small" variant="outlined" color="error" onClick={() => handleOpenDialog({ type: 'recurring', mode: 'add', financeType: 'expense' })}>
                  {t('config.addExpense')}
                </Button>
                <Button startIcon={<AddIcon />} size="small" variant="outlined" color="success" onClick={() => handleOpenDialog({ type: 'recurring', mode: 'add', financeType: 'income' })}>
                  {t('config.addIncome')}
                </Button>
              </Box>
            </Box>
            {recurringTransactions.length === 0 ? (
              <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.3, fontStyle: 'italic' }}>{t('config.noRecurring')}</Typography>
            ) : (
              <List sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 3 }}>
                {recurringTransactions.map((rec, i) => (
                  <ListItem key={rec.id} divider={i !== recurringTransactions.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{rec.description}</Typography>
                            {rec.frequency === 'yearly' && (
                              <Typography variant="caption" sx={{ background: 'colors.border', px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                                YEARLY
                              </Typography>
                            )}
                            <Typography sx={{ color: rec.type === 'income' ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: '1rem', ml: 1 }}>
                              € {rec.frequency === 'yearly'
                                ? (rec.amount / 12).toLocaleString('it-IT', { maximumFractionDigits: 0 })
                                : rec.amount.toLocaleString('it-IT')
                              }
                              {rec.frequency === 'yearly' && <Typography component="span" sx={{ fontSize: '0.7em', opacity: 0.7 }}> /mo</Typography>}
                            </Typography>
                            {rec.frequency === 'yearly' && (
                              <Typography component="span" variant="caption" sx={{ opacity: 0.5 }}>
                                (€{rec.amount.toLocaleString('it-IT')}/yr)
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ opacity: 0.6 }}>
                          {rec.category} &gt; {rec.subcategory} | Every {rec.frequency === 'yearly' ? 'year in ' + dayjs().month((rec.monthOfYear || 1) - 1).format('MMMM') : t('config.month')} on day {rec.dayOfMonth}
                          {rec.cardId && cards.find(c => c.id === rec.cardId) && (
                            <> | Card: {cards.find(c => c.id === rec.cardId)?.name}</>
                          )}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => handleOpenDialog({ type: 'recurring', mode: 'edit', financeType: rec.type, recurringId: rec.id })}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleOpenConfirm('Delete recurring template?', 'This action cannot be undone.', () => deleteRecurring(rec.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'colors.surface', border: '1px solid #1E293B', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {t('config.projections')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
                  {t('config.projectionsDescription')}
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('config.inflationRate')}
                      type="number"
                      variant="filled"
                      value={projectionForm.inflationRate}
                      onChange={(e) => setProjectionForm(prev => ({ ...prev, inflationRate: e.target.value }))}
                      slotProps={{ input: { endAdornment: <Typography sx={{ opacity: 0.5 }}>%</Typography> }, htmlInput: { min: 0, max: 100, step: 0.1 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('config.taxRate')}
                      type="number"
                      variant="filled"
                      value={projectionForm.taxRate}
                      onChange={(e) => setProjectionForm(prev => ({ ...prev, taxRate: e.target.value }))}
                      slotProps={{ input: { endAdornment: <Typography sx={{ opacity: 0.5 }}>%</Typography> }, htmlInput: { min: 0, max: 100, step: 0.1 } }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      const inflationRate = Number(projectionForm.inflationRate) / 100;
                      const taxRate = Number(projectionForm.taxRate) / 100;
                      if (isNaN(inflationRate) || isNaN(taxRate)) return;
                      await saveSettings({ inflationRate, taxRate });
                    }}
                  >
                    {t('common.save')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      await resetToDefaults();
                      setProjectionForm({
                        inflationRate: (DEFAULT_PROJECTION_SETTINGS.inflationRate * 100).toFixed(1),
                        taxRate: (DEFAULT_PROJECTION_SETTINGS.taxRate * 100).toFixed(1),
                      });
                    }}
                  >
                    {t('config.resetDefaults')}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'colors.surface', border: '1px solid #1E293B', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Esporta Backup
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
                  Scarica tutti i tuoi dati in un file JSON. Usa questo per:
                </Typography>
                <List dense>
                  <ListItem><ListItemText primary="Esportare i dati su un altro dispositivo" /></ListItem>
                  <ListItem><ListItemText primary="Proteggerti da perdite di dati" /></ListItem>
                  <ListItem><ListItemText primary="Archiviare i tuoi dati manualmente" /></ListItem>
                </List>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={exportAllData}
                  disabled={isSaving}
                >
                  {t('config.backup.export')}
                </Button>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'colors.surface', border: '1px solid #1E293B', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {t('config.backup.restore')}
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('common.warning') || 'Attenzione!'}</Typography>
                  {t('config.backup.warning')}
                </Alert>
                <input
                  type="file"
                  accept=".json"
                  id="backup-import"
                  hidden
                  onChange={handleImportBackup}
                />
                <label htmlFor="backup-import">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<Upload />}
                    disabled={isSaving}
                    sx={{ cursor: 'pointer' }}
                  >
                    {t('config.backup.selectFile')}
                  </Button>
                </label>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

          </Box>
        </Box>

        {/* Global drawer for Add/Edit/Rename */}
        <EntityDrawer
          open={dialogOpen}
          title={`${dialogConfig?.mode === 'add' ? t('config.addNew') : dialogConfig?.mode === 'edit' ? t('config.edit') : t('config.rename')} ${dialogConfig?.type === 'category' ? t('config.category') : dialogConfig?.type === 'recurring' ? t('config.recurringTemplate') : dialogConfig?.type === 'account' ? t('config.account') : t('config.item')}`}
          subtitle={dialogConfig?.type === 'recurring' ? t('settings.drawer.recurringHint') : undefined}
          onClose={handleCloseDialog}
          onConfirm={handleConfirm}
          confirmLabel={t('common.save')}
          confirmDisabled={dialogConfig?.type === 'recurring' ? (!recurringForm.description || !recurringForm.amount || !recurringForm.category || !recurringForm.accountId) : dialogConfig?.type === 'account' ? !inputValue.trim() : !inputValue.trim()}
        >

            {dialogConfig?.type === 'subcategory' && dialogConfig.mode === 'rename' && (
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(237, 108, 2, 0.1)', border: '1px solid #ed6c02' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('common.headsUp')}</Typography>
                {t('common.headsUpDescription')}
              </Alert>
            )}

            <Box sx={{ mt: 1 }}>
              {dialogConfig?.type === 'recurring' ? (
                <TransactionForm
                  type={recurringForm.type}
                  formData={recurringForm}
                  setFormData={(data) => setRecurringForm(prev => ({ ...prev, ...data }))}
                  isRecurring={true}
                />
              ) : dialogConfig?.type === 'account' ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField sx={formTextFieldSx} autoFocus fullWidth label="Account Name" variant="outlined" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField sx={formTextFieldSx} fullWidth label="Initial Balance" type="number" variant="outlined" value={accountInitialBalance} onChange={(e) => setAccountInitialBalance(e.target.value)} slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, opacity: 0.5 }}>€</Typography> } }} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      sx={formTextFieldSx}
                      fullWidth
                      label={t('settings.accounts.iban')}
                      variant="outlined"
                      value={accountIban}
                      onChange={(e) => setAccountIban(e.target.value)}
                      helperText={t('settings.accounts.ibanHint')}
                      slotProps={{ htmlInput: { maxLength: 34 } }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <TextField sx={formTextFieldSx}
                  autoFocus
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              )}
            </Box>
          
        </EntityDrawer>

        {/* Remap Deletion Dialog */}
        <Dialog open={remapDialogOpen} onClose={handleCloseRemapDialog} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { background: '#1e293b', borderRadius: 3 } } }}>
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

        <EntityDrawer
          open={cardDialogOpen}
          title={cardDialogMode === 'add' ? t('config.addCard') : t('config.editCard')}
          onClose={() => setCardDialogOpen(false)}
          onConfirm={handleSaveCard}
          confirmLabel={t('common.save')}
          confirmDisabled={!cardForm.name.trim() || !cardForm.plafond}
        >

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField sx={formTextFieldSx} autoFocus fullWidth label="Card Name" variant="outlined" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField sx={formTextFieldSx} fullWidth select label="Card Type" variant="outlined" value={cardForm.type} onChange={(e) => setCardForm({ ...cardForm, type: e.target.value as 'credit' | 'debit' })}>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="debit">Debit</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField sx={formTextFieldSx} fullWidth label="Plafond (€)" type="number" variant="outlined" value={cardForm.plafond} onChange={(e) => setCardForm({ ...cardForm, plafond: e.target.value })} slotProps={{ htmlInput: { min: 0 } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField sx={formTextFieldSx} fullWidth label="Reset Day" type="number" variant="outlined" value={cardForm.billingDay} onChange={(e) => setCardForm({ ...cardForm, billingDay: Number(e.target.value) })} slotProps={{ htmlInput: { min: 1, max: 28 } }} helperText="Day of month plafond resets" />
              </Grid>
            </Grid>
          
        </EntityDrawer>
        <BrokerSettingsModal open={brokerDialogOpen} onClose={() => setBrokerDialogOpen(false)} />

        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { background: '#1e293b', borderRadius: 3 } } }}>
          <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>{t('config.deleteAccountConfirmTitle')}</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              {t('config.deleteAccountConfirmMessage')}
            </Alert>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>{t('config.deleteAccountTypeEmail')}</Typography>
            <TextField
              fullWidth
              label={user?.email ?? ''}
              variant="filled"
              value={deleteEmailInput}
              onChange={(e) => setDeleteEmailInput(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">{t('config.deleteAccountCancel')}</Button>
            <Button onClick={handleDeleteAccountConfirm} variant="contained" color="error" disabled={deleteEmailInput.trim().toLowerCase() !== (user?.email ?? '').toLowerCase()}>
              {t('config.deleteAccountConfirm')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deletePasswordOpen} onClose={() => setDeletePasswordOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { background: '#1e293b', borderRadius: 3 } } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>{t('config.deleteAccountPasswordTitle')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>{t('config.deleteAccountPasswordMessage')}</Typography>
            <TextField
              fullWidth
              label={t('config.deleteAccountPassword')}
              type="password"
              variant="filled"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDeletePasswordOpen(false)} color="inherit">{t('config.deleteAccountCancel')}</Button>
            <Button onClick={handleDeletePasswordConfirm} variant="contained" color="error" disabled={!deletePassword}>
              {t('config.deleteAccountConfirm')}
            </Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={() => { confirmState.onConfirm(); handleCloseConfirm(); }}
          onCancel={handleCloseConfirm}
        />
        <AlertSnackbar
          open={alertState.open}
          message={alertState.message}
          severity={alertState.severity}
          onClose={handleCloseAlert}
        />

        {/* Backup Preview Dialog */}
        <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { background: '#1e293b', borderRadius: 3 } } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Anteprima Backup</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Il backup verrà ripristinato con i seguenti dati:
            </Alert>
            {previewData && (
              <List dense>
                <ListItem>
                  <ListItemText primary="Transazioni" secondary={`${previewData.transactionCount} transazioni`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Conti" secondary={`${previewData.accountCount} conti`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Transazioni Ricorrenti" secondary={`${previewData.recurringCount} template`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Categorie Spesa" secondary={`${previewData.categoryCount} categorie`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Categorie Entrata" secondary={`${previewData.incomeCategoryCount} categorie`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Obiettivi Budget" secondary={`${previewData.budgetTargetCount} target`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Conti Broker" secondary={`${previewData.brokerAccountCount} conti`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Transazioni ETF" secondary={`${previewData.etfTransactionCount} transazioni`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Aggiustamenti Cassa" secondary={`${previewData.cashAdjustmentCount} registrazioni`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Dividendi/Interessi" secondary={`${previewData.dividendEntryCount} registrazioni`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Esportato il" secondary={new Date(previewData.exportedAt).toLocaleString('it-IT')} />
                </ListItem>
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setPreviewDialogOpen(false)} color="inherit">Annulla</Button>
            <Button onClick={handleConfirmRestore} variant="contained" color="warning" disabled={isSaving}>
              {isSaving ? 'Ripristino in corso...' : 'Conferma Ripristino'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DndContext>
  );
};

export default SettingsPage;
