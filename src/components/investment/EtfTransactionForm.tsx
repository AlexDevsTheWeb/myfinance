/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, FormHelperText, Grid, MenuItem, TextField } from '@mui/material';
import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useInvestmentStore } from '../../store/useInvestmentStore';

interface EtfTransactionFormData {
  ticker: string;
  type: 'buy' | 'sell';
  units: string;
  price: string;
  totalAmount: string;
  date: string;
  accountId: string;
  description: string;
  notes: string;
  brokerId?: string;
}

interface EtfTransactionFormProps {
  formData: EtfTransactionFormData;
  setFormData: (data: EtfTransactionFormData) => void;
  errors: Record<string, string>;
}

const EtfTransactionForm: React.FC<EtfTransactionFormProps> = ({ formData, setFormData, errors }) => {
  const { accounts } = useFinanceStore();
  const { brokerAccounts } = useInvestmentStore();
  const units = Number(formData.units) || 0;
  const price = Number(formData.price) || 0;
  const autoTotal = units * price;

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            label="Ticker"
            variant="filled"
            value={formData.ticker}
            onChange={(e: any) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
            placeholder="EUNL.DE"
            error={!!errors.ticker}
          />
          {errors.ticker && <FormHelperText error>{errors.ticker}</FormHelperText>}
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            select
            label="Type"
            variant="filled"
            value={formData.type}
            onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
          >
            <MenuItem value="buy">Buy</MenuItem>
            <MenuItem value="sell">Sell</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            fullWidth
            label="Units"
            type="number"
            variant="filled"
            value={formData.units}
            onChange={(e: any) => setFormData({ ...formData, units: e.target.value })}
            slotProps={{ htmlInput: { step: 0.001 } }}
            error={!!errors.units}
          />
          {errors.units && <FormHelperText error>{errors.units}</FormHelperText>}
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            fullWidth
            label="Price (€)"
            type="number"
            variant="filled"
            value={formData.price}
            onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
            slotProps={{ htmlInput: { step: 0.01 } }}
            error={!!errors.price}
          />
          {errors.price && <FormHelperText error>{errors.price}</FormHelperText>}
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            fullWidth
            label="Total (€)"
            type="number"
            variant="filled"
            value={formData.totalAmount || autoTotal.toFixed(2)}
            onChange={(e: any) => setFormData({ ...formData, totalAmount: e.target.value })}
            helperText={!formData.totalAmount ? `Auto: €${autoTotal.toFixed(2)}` : 'Manual override'}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            variant="filled"
            value={formData.date}
            onChange={(e: any) => setFormData({ ...formData, date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.date}
          />
          {errors.date && <FormHelperText error>{errors.date}</FormHelperText>}
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            select
            label="Account"
            variant="filled"
            value={formData.accountId}
            onChange={(e: any) => setFormData({ ...formData, accountId: e.target.value })}
            error={!!errors.accountId}
          >
            {accounts.map((acc) => (
              <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
            ))}
          </TextField>
          {errors.accountId && <FormHelperText error>{errors.accountId}</FormHelperText>}
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            select
            label="Broker Account"
            variant="filled"
            value={formData.brokerId ?? ''}
            onChange={(e: any) => setFormData({ ...formData, brokerId: e.target.value })}
          >
            <MenuItem value="">None</MenuItem>
            {brokerAccounts.map((ba) => (
              <MenuItem key={ba.id} value={ba.id}>{ba.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Description"
            variant="filled"
            value={formData.description}
            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Notes (optional)"
            variant="filled"
            multiline
            rows={2}
            value={formData.notes}
            onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export type { EtfTransactionFormData };
export default EtfTransactionForm;
