import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5b6cb8', // Muted indigo - less saturated
    },
    secondary: {
      main: '#c026d3', // Less saturated pink
    },
    background: {
      default: '#0f1523', // Darker slate
      paper: '#161b2e', // Slightly darker than before
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 2, // Minimal corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 2, // Sharp corners
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 2, // Minimal corners
          overflow: 'hidden',
          background: '#161b2e',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 2,
        },
      },
    },
    MuiTypography: {
      variants: [
      {
          props: { variant: 'h4' },
          style: {
            fontSize:'1.575rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            lineHeight: 1.2,
            
          },
        },
        {
          props: { variant: 'h6' },
          style: {
            fontWeight: 700,
            letterSpacing: '0.05em',
            lineHeight: 1.2,
            padding: '10px',
          },
        },
        {
          props: { variant: 'button' },
          style: {
            fontWeight: 600,
            textTransform: 'none',
          }
        },
        {
          props: { variant: 'subtitle2' },
          style: {
            fontSize: '0.875rem',
            opacity: 0.8,
            fontWeight: 600
          }
        }
      ]
    }
  },
});
