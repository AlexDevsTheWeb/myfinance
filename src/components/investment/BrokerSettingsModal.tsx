/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { AccountBalance, Add, Delete, Edit } from '@mui/icons-material';
import React, { useState } from 'react';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import { validateTicker, validateTickerWithApi } from '../../store/validation/investment.validation';

interface BrokerSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type ModalMode = 'list' | 'form';

interface BrokerFormData {
  name: string;
  baseLumpSum: string;
  monthlyPacAmount: string;
  interestRate: string;
  ticker: string;
}

const emptyFormData: BrokerFormData = {
  name: '',
  baseLumpSum: '0',
  monthlyPacAmount: '0',
  interestRate: '0',
  ticker: '',
};

const BrokerSettingsModal: React.FC<BrokerSettingsModalProps> = ({ open, onClose }) => {
  const { brokerAccounts, addBrokerAccount, updateBrokerAccount, deleteBrokerAccount } = useInvestmentStore();

  const [mode, setMode] = useState<ModalMode>('list');
  const [editingBrokerId, setEditingBrokerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BrokerFormData>(emptyFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [tickerError, setTickerError] = useState<string | null>(null);
  const [tickerWarning, setTickerWarning] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingBrokerId(null);
    setFormData(emptyFormData);
    setMode('form');
  };

  const handleEdit = (id: string) => {
    const broker = brokerAccounts.find(b => b.id === id);
    if (!broker) return;
    setEditingBrokerId(id);
    setFormData({
      name: broker.name,
      baseLumpSum: broker.baseLumpSum.toString(),
      monthlyPacAmount: broker.monthlyPacAmount.toString(),
      interestRate: broker.interestRate.toString(),
      ticker: '',
    });
    setMode('form');
  };

  const handleDelete = async (id: string) => {
    await deleteBrokerAccount(id);
    setDeleteConfirmId(null);
  };

  const handleSave = async () => {
    const name = formData.name.trim();
    if (!name) return;

    // Validate ticker (blocking regex check — D-11)
    const tickerValidation = validateTicker(formData.ticker);
    if (!tickerValidation.valid) {
      setTickerError(tickerValidation.error ?? null);
      return; // Block save
    }
    setTickerError(null);

    // Optional API test-fetch (non-blocking warning — D-11)
    validateTickerWithApi(formData.ticker).then(result => {
      if (result.warning) {
        setTickerWarning(result.warning);
      }
    });

    const account = {
      id: editingBrokerId || crypto.randomUUID(),
      name,
      baseLumpSum: Number(formData.baseLumpSum) || 0,
      monthlyPacAmount: Number(formData.monthlyPacAmount) || 0,
      interestRate: Number(formData.interestRate) || 0,
    };

    if (editingBrokerId) {
      await updateBrokerAccount(account);
    } else {
      await addBrokerAccount(account);
    }

    setMode('list');
    setEditingBrokerId(null);
    setFormData(emptyFormData);
    setTickerError(null);
    setTickerWarning(null);
  };

  const handleCancel = () => {
    setMode('list');
    setEditingBrokerId(null);
    setFormData(emptyFormData);
    setTickerError(null);
    setTickerWarning(null);
  };

  const handleClose = () => {
    setMode('list');
    setEditingBrokerId(null);
    setFormData(emptyFormData);
    setDeleteConfirmId(null);
    setTickerError(null);
    setTickerWarning(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2, backgroundImage: 'none', background: '#1e293b' } } }}>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AccountBalance sx={{ opacity: 0.7 }} />
        {mode === 'list' ? 'Broker Accounts' : editingBrokerId ? 'Edit Broker' : 'Add Broker Account'}
      </DialogTitle>

      {mode === 'list' ? (
        <DialogContent>
          {brokerAccounts.length === 0 ? (
            <Typography sx={{ opacity: 0.6, textAlign: 'center', py: 4 }}>
              No broker accounts configured.
            </Typography>
          ) : (
            <List>
              {brokerAccounts.map(broker => (
                <ListItem
                  key={broker.id}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  secondaryAction={
                    <>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(broker.id)} sx={{ mr: 1 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => setDeleteConfirmId(broker.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={broker.name}
                    secondary={`Lump: €${broker.baseLumpSum.toLocaleString()} · PAC: €${broker.monthlyPacAmount.toLocaleString()} · Rate: ${broker.interestRate}%`}
                    slotProps={{ primary: { fontWeight: 700 } as any }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAdd}
            fullWidth
            sx={{ mt: 2 }}
          >
            Add Broker Account
          </Button>

          {/* Delete confirmation */}
          {deleteConfirmId && (
            <Typography sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              Delete "{brokerAccounts.find(b => b.id === deleteConfirmId)?.name}"? Transactions linked to this broker will remain.
              <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => setDeleteConfirmId(null)} color="inherit">Cancel</Button>
                <Button size="small" onClick={() => handleDelete(deleteConfirmId)} color="error" variant="contained">Delete</Button>
              </Box>
            </Typography>
          )}
        </DialogContent>
      ) : (
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Broker Name"
                variant="filled"
                value={formData.name}
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="ETF Ticker"
                variant="filled"
                value={formData.ticker}
                onChange={(e: any) => {
                  setFormData({ ...formData, ticker: e.target.value });
                  setTickerError(null);
                  setTickerWarning(null);
                }}
                error={!!tickerError}
                helperText={tickerError || tickerWarning || 'Enter Yahoo Finance symbol format'}
                placeholder="e.g. SWDA.MI"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Lump Sum (€)"
                type="number"
                variant="filled"
                value={formData.baseLumpSum}
                onChange={(e: any) => setFormData({ ...formData, baseLumpSum: e.target.value })}
                slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, opacity: 0.5 }}>€</Typography> } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Monthly PAC (€)"
                type="number"
                variant="filled"
                value={formData.monthlyPacAmount}
                onChange={(e: any) => setFormData({ ...formData, monthlyPacAmount: e.target.value })}
                slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, opacity: 0.5 }}>€</Typography> } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Interest Rate (%)"
                type="number"
                variant="filled"
                value={formData.interestRate}
                onChange={(e: any) => setFormData({ ...formData, interestRate: e.target.value })}
                slotProps={{ input: { endAdornment: <Typography sx={{ ml: 1, opacity: 0.5 }}>%</Typography> } }}
                helperText="Annual percentage yield on uninvested cash"
              />
            </Grid>
          </Grid>
        </DialogContent>
      )}

      <DialogActions sx={{ p: 1.5 }}>
        {mode === 'list' ? (
          <Button onClick={handleClose} color="inherit">Close</Button>
        ) : (
          <>
            <Button onClick={handleCancel} color="inherit">Cancel</Button>
            <Button onClick={handleSave} variant="contained" disabled={!formData.name.trim()}>
              {editingBrokerId ? 'Save' : 'Add'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BrokerSettingsModal;
