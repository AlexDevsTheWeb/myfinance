import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import React from 'react';
import { useInvestmentStore } from '../../store/useInvestmentStore';

interface PacConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
}

const formatEur = (v: number) => `€${v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PacConfirmationDialog: React.FC<PacConfirmationDialogProps> = ({ open, onClose }) => {
  const { pacState, brokerAccounts, confirmPacTransaction, dismissPacTransaction } = useInvestmentStore();
  const pendingTransaction = pacState.pendingTransaction;

  if (!pendingTransaction) return null;

  const broker = brokerAccounts.find(b => b.id === pendingTransaction.brokerId);

  const handleConfirm = async () => {
    await confirmPacTransaction(pendingTransaction.brokerId);
    onClose();
  };

  const handleDismiss = () => {
    dismissPacTransaction();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 2, backgroundImage: 'none', background: '#1e293b' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AccountBalance sx={{ opacity: 0.7 }} />
        PAC Transaction Pending
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          A monthly PAC transaction is ready to be executed:
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Broker: <strong>{broker?.name ?? pendingTransaction.brokerId}</strong>
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Amount: <strong>{formatEur(pendingTransaction.amount)}</strong>
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Date: <strong>{pendingTransaction.date}</strong>
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mt: 2 }}>
          On confirm, the current market price will be fetched and a buy transaction created.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 1.5 }}>
        <Button onClick={handleDismiss} color="inherit">Dismiss</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm & Execute
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PacConfirmationDialog;
