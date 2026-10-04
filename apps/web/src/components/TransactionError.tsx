import { useCallback } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { useFinanceStore } from '../store/useFinanceStore';

export function TransactionError() {
  const { saveError, clearSaveError } = useFinanceStore();

  const handleClose = useCallback((_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason !== 'clickaway') {
      clearSaveError();
    }
  }, [clearSaveError]);

  return (
    <Snackbar
      open={!!saveError}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity="error"
        variant="filled"
        sx={{ width: '100%' }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            DISMISS
          </Button>
        }
      >
        {saveError}
      </Alert>
    </Snackbar>
  );
}