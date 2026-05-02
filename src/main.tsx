import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { theme } from './theme/theme'
import i18n from './lib/i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
