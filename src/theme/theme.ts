import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Luxury Indigo
    },
    secondary: {
      main: '#ec4899', // Pinkish/Magenta
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
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
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Corrisponde a borderRadius: 1 (4px default)
          overflow: 'hidden',
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
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
