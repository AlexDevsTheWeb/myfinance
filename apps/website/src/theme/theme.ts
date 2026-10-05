import { createTheme } from '@mui/material/styles';

/**
 * Design tokens derived from `docs/YATF/raw/website/layout-example.html`.
 *
 * The source is a Material 3 export with an exhaustive token set. Two of its
 * own directives were followed over the export where they conflict, per the
 * brief in `starting-prompt.md`:
 *
 *  1. Solid surfaces, no decorative glow. The export paints a 1000x450 blurred
 *     gradient behind the hero; it is deliberately not reproduced.
 *  2. Restrained radii. The export uses `rounded-2xl` (16px) and
 *     `rounded-3xl` (24px) throughout. The brief caps radius at 8px, so
 *     `shape.borderRadius` is 4/8 and only the small circular affordances
 *     (dots, avatars, pills) go fully round.
 *
 * The gradient on the hero headline span is the one gradient retained -- it
 * carries brand colour rather than decoration.
 */

/** Brand seed values, taken verbatim from the export's tailwind.config. */
const seed = {
  primary: '#b8c4ff',
  primaryContainer: '#1e40af',
  onPrimary: '#002584',
  onPrimaryContainer: '#a8b8ff',
  secondary: '#4cd7f6',
  secondaryContainer: '#03b5d3',
  onSecondary: '#003640',
  tertiary: '#adc6ff',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
} as const;

const darkSurfaces = {
  background: '#0f131c',
  surfaceLowest: '#0a0e16',
  containerLow: '#181c24',
  container: '#1c2028',
  containerHigh: '#262a33',
  containerHighest: '#31353e',
  onSurface: '#dfe2ee',
  onSurfaceVariant: '#c4c5d5',
  outline: '#8e909f',
  outlineVariant: '#444653',
  surfaceTint: '#b8c4ff',
} as const;

/**
 * Light palette derived from the same Material 3 tonal relationships the dark
 * scheme uses, inverted: light surfaces, dark ink, same accent hues carried
 * forward from `seed`.
 *
 * The export configures `darkMode: "class"` but ships no light palette at all
 * -- there is no `.light` rule anywhere in the file, so a toggle there would
 * have had nothing to switch to. These values are constructed, not sampled,
 * and are the main thing to revisit with a designer.
 */
const lightSurfaces = {
  background: '#fdfbff',
  surfaceLowest: '#ffffff',
  containerLow: '#f4f2fa',
  container: '#eeecf4',
  containerHigh: '#e8e6ee',
  containerHighest: '#e2e1e9',
  onSurface: '#1a1b21',
  onSurfaceVariant: '#45464f',
  outline: '#767680',
  outlineVariant: '#c6c5d0',
  surfaceTint: seed.primary,
} as const;

/** Primary accents must darken for light mode or they fail contrast on white. */
const lightPrimary = '#2b4ec4';
const lightOnPrimary = '#ffffff';
const lightPrimaryContainer = '#dee0ff';
const lightOnPrimaryContainer = '#001551';

const makePalette = (mode: 'light' | 'dark') => {
  const s = mode === 'dark' ? darkSurfaces : lightSurfaces;
  const primaryMain = mode === 'dark' ? seed.primary : lightPrimary;

  return {
    mode,
    primary: {
      main: primaryMain,
      container: mode === 'dark' ? seed.primaryContainer : lightPrimaryContainer,
      onPrimary: mode === 'dark' ? seed.onPrimary : lightOnPrimary,
      onPrimaryContainer:
        mode === 'dark' ? seed.onPrimaryContainer : lightOnPrimaryContainer,
    },
    secondary: {
      main: seed.secondary,
      container: seed.secondaryContainer,
      onSecondary: seed.onSecondary,
    },
    tertiary: { main: seed.tertiary },
    error: {
      main: seed.error,
      container: seed.errorContainer,
      onError: seed.onError,
    },
    background: {
      default: s.background,
      paper: s.containerLow,
    },
    text: {
      primary: s.onSurface,
      secondary: s.onSurfaceVariant,
    },
    divider: s.outlineVariant,
    /** Named for the export's `surface-container-*` ramp. */
    surfaceLowest: s.surfaceLowest,
    containerLow: s.containerLow,
    container: s.container,
    containerHigh: s.containerHigh,
    containerHighest: s.containerHighest,
    outline: s.outline,
  };
};

export type SurfaceTokens = ReturnType<typeof makePalette>;

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: makePalette(mode),
    // Exposed so components can read the surface ramp by name instead of
    // hardcoding hex values against `theme.palette`.
    surfaceTokens: makePalette(mode),
    shape: {
      // The brief caps radius at 4px/8px ("sobrio ed esecutivo"). The export's
      // 16px/24px radii are not reproduced.
      borderRadius: 4,
    },
    typography: {
      // Display and headline faces are Plus Jakarta Sans, body is Manrope, per
      // the export's fontFamily map. Loaded in index.html.
      fontFamily: '"Manrope", "Helvetica Neue", Arial, sans-serif',
      h1: {
        fontFamily: '"Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif',
        fontSize: 'clamp(2rem, 1.2rem + 3.6vw, 3.5rem)',
        lineHeight: 1.14,
        letterSpacing: '-0.03em',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif',
        fontSize: 'clamp(1.5rem, 1.1rem + 1.6vw, 2.5rem)',
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
        fontWeight: 700,
      },
      h3: {
        fontFamily: '"Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif',
        fontSize: '1.25rem',
        lineHeight: 1.4,
        letterSpacing: '-0.015em',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '1.125rem',
        lineHeight: 1.55,
        letterSpacing: '-0.01em',
      },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.55, letterSpacing: '0.01em' },
      button: {
        fontFamily: '"Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif',
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: 0,
      },
      // The export's small uppercase tracked labels (label-md).
      overline: {
        fontSize: '0.75rem',
        lineHeight: 1.33,
        letterSpacing: '0.04em',
        fontWeight: 600,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          'html, body, #root': { minHeight: '100%' },
          body: { overscrollBehaviorY: 'none' },
          // Focus must stay visible: this site is keyboard-navigable and the
          // default MUI focus ring is nearly invisible on dark surfaces.
          ':focus-visible': {
            outline: `2px solid ${
              mode === 'dark' ? darkSurfaces.onSurface : lightPrimary
            }`,
            outlineOffset: '2px',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 4 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 8 },
        },
      },
    },
  });

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
export type AppTheme = ReturnType<typeof buildTheme>;
declare module '@mui/material/styles' {
  interface Palette {
    surfaceLowest: string;
    containerLow: string;
    container: string;
    containerHigh: string;
    containerHighest: string;
    outline: string;
  }
  interface PaletteOptions {
    surfaceLowest?: string;
    containerLow?: string;
    container?: string;
    containerHigh?: string;
    containerHighest?: string;
    outline?: string;
  }
  interface Theme {
    surfaceTokens: SurfaceTokens;
  }
  interface ThemeOptions {
    surfaceTokens?: SurfaceTokens;
  }
}
