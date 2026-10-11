import { createTheme } from '@mui/material/styles';

type ThemeColors = {
  bg: string;
  surface: string;
  surfaceNested: string;
  surfaceInput: string;
  sidebar: string;
  border: string;
  borderLight: string;
  cyan: string;
  emerald: string;
  rose: string;
  amber: string;
  muted: string;
  subtle: string;
  active: string;
  mono: string;
};

declare module '@mui/material/styles' {
  interface Theme {
    chart: {
      primary: string;
      income: string;
      expense: string;
      palette: string[];
    };
    colors: ThemeColors;
  }
  interface ThemeOptions {
    chart?: {
      primary?: string;
      income?: string;
      expense?: string;
      palette?: string[];
    };
    colors?: Partial<ThemeColors>;
  }
  interface Palette {
    colors: ThemeColors;
  }
  interface PaletteOptions {
    colors?: Partial<ThemeColors>;
  }
}

/**
 * Design tokens transcribed from the Stitch prototype
 * (docs/YATF/raw/2026-10-UI-refactor/Stitch-dashboard-final-1.html).
 *
 * These are exposed both under `theme.colors.*` (for function style values)
 * and `theme.palette.colors.*`, so that the dotted `sx` strings used across
 * the dashboard (e.g. `bgcolor: 'colors.surface'`) resolve correctly.
 */
const colors: ThemeColors = {
  bg: '#0B0F17',
  surface: '#131B2E',
  surfaceNested: '#0E1524',
  surfaceInput: '#131B2E',
  sidebar: '#0E1524',
  border: '#1E293B',
  borderLight: '#475569',
  cyan: '#06B6D4',
  emerald: '#10B981',
  rose: '#EF4444',
  amber: '#F59E0B',
  muted: '#64748B',
  subtle: '#94A3B8',
  active: '#16233B',
  mono: '"JetBrains Mono", "Roboto Mono", monospace',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.cyan,
    },
    secondary: {
      main: colors.emerald,
    },
    background: {
      default: colors.bg,
      paper: colors.surface,
    },
    success: {
      main: colors.emerald,
    },
    error: {
      main: colors.rose,
    },
    warning: {
      main: colors.amber,
    },
    info: {
      main: colors.cyan,
    },
    text: {
      primary: '#F8FAFC',
      secondary: colors.subtle,
      disabled: colors.muted,
    },
    divider: colors.border,
    colors,
  },
  chart: {
    primary: colors.cyan,
    income: colors.emerald,
    expense: colors.rose,
    palette: [
      '#6366f1', colors.emerald, colors.amber, colors.rose, '#3b82f6',
      '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', colors.cyan,
      '#84cc16', '#d946ef',
    ],
  },
  colors,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
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
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          background: colors.surface,
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          background: colors.surface,
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.surfaceNested,
          border: `1px solid ${colors.border}`,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { variant: 'h4' },
          style: {
            fontSize: '1.575rem',
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
          },
        },
        {
          props: { variant: 'subtitle2' },
          style: {
            fontSize: '0.875rem',
            opacity: 0.8,
            fontWeight: 600,
          },
        },
      ],
    },
  },
});
