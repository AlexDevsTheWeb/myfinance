import { Alert, Snackbar } from '@mui/material'

interface AlertSnackbarProps {
  open: boolean
  message: string
  severity?: 'error' | 'warning' | 'info' | 'success'
  onClose: () => void
}

export function AlertSnackbar({ open, message, severity = 'error', onClose }: AlertSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}
