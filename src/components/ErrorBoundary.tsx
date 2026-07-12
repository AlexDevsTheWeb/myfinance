import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', _error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Paper
            elevation={3}
            sx={{
              p: 6,
              maxWidth: 480,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <ErrorOutlinedIcon color="error" sx={{ fontSize: 64 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Qualcosa è andato storto
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
            </Typography>
            <Button variant="contained" onClick={this.handleRetry} sx={{ mt: 2 }}>
              Riprova
            </Button>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}
