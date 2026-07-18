import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    chart: {
      primary: string;
      income: string;
      expense: string;
      palette: string[];
    };
  }
  interface ThemeOptions {
    chart?: {
      primary?: string;
      income?: string;
      expense?: string;
      palette?: string[];
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4364f7', // Electric blue from Balancr identity
    },
    secondary: {
      main: '#00c9ff', // Bright cyan from Balancr identity
    },
    background: {
      default: '#0b0f19', // Deep night blue per Balancr spec
      paper: '#111827', // Dark slate per Balancr spec
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
  },
  chart: {
    primary: '#4364f7',
    income: '#10b981',
    expense: '#ef4444',
    palette: [
      '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
      '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4',
      '#84cc16', '#d946ef',
    ],
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
    MuiButtonBase: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
        },
      },
    },
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
          background: '#111827',
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
