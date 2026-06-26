/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import type { IBrokerConfig } from '../../store/types';

interface BrokerSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const BrokerSettingsModal: React.FC<BrokerSettingsModalProps> = ({ open, onClose }) => {
  const { brokerConfig, setBrokerConfig } = useInvestmentStore();
  const [formData, setFormData] = useState({
    brokerName: brokerConfig.brokerName,
    lumpSumAmount: brokerConfig.lumpSumAmount.toString(),
    monthlyPacAmount: brokerConfig.monthlyPacAmount.toString(),
    ticker: brokerConfig.ticker,
    interestRate: brokerConfig.interestRate.toString(),
  });

  useEffect(() => {
    if (open) {
      setFormData({
        brokerName: brokerConfig.brokerName,
        lumpSumAmount: brokerConfig.lumpSumAmount.toString(),
        monthlyPacAmount: brokerConfig.monthlyPacAmount.toString(),
        ticker: brokerConfig.ticker,
        interestRate: brokerConfig.interestRate.toString(),
      });
    }
  }, [open, brokerConfig]);

  const handleSave = () => {
    const config: IBrokerConfig = {
      brokerName: formData.brokerName.trim(),
      lumpSumAmount: Number(formData.lumpSumAmount) || 0,
      monthlyPacAmount: Number(formData.monthlyPacAmount) || 0,
      ticker: formData.ticker.trim().toUpperCase(),
      interestRate: Number(formData.interestRate) || 0,
    };
    setBrokerConfig(config);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2, backgroundImage: 'none', background: '#1e293b' } } }}>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AccountBalance sx={{ opacity: 0.7 }} />
        Broker Settings
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Broker Name"
              variant="filled"
              value={formData.brokerName}
              onChange={(e: any) => setFormData({ ...formData, brokerName: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Lump Sum (€)"
              type="number"
              variant="filled"
              value={formData.lumpSumAmount}
              onChange={(e: any) => setFormData({ ...formData, lumpSumAmount: e.target.value })}
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
              label="ETF Ticker"
              variant="filled"
              value={formData.ticker}
              onChange={(e: any) => setFormData({ ...formData, ticker: e.target.value })}
              placeholder="e.g. SWDA.MI"
              helperText="Enter Yahoo Finance symbol format"
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
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrokerSettingsModal;
