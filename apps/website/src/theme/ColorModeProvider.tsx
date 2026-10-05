import { useCallback, useEffect, useState, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { ColorModeContext, type ColorMode } from './colorModeContext';
import { darkTheme, lightTheme } from './theme';

const STORAGE_KEY = 'balancr-website-color-mode';

/**
 * Reads the persisted preference, falling back to the OS setting.
 *
 * localStorage is read inside a try/catch on purpose: `prefers-color-scheme`
 * is often the only signal available in a private window with storage blocked,
 * and a throw here would white-screen the site before first paint.
 */
const readInitialMode = (): ColorMode => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable -- fall through to the OS preference */
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
};

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  // Lazy initialiser, so localStorage is read once during the initial render
  // rather than in an effect after a dark-to-light flash.
  const [mode, setMode] = useState<ColorMode>(readInitialMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* preference simply will not persist; not worth breaking the page */
    }
  }, [mode]);

  const toggleColorMode = useCallback(() => {
    setMode((previous) => (previous === 'dark' ? 'light' : 'dark'));
  }, []);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};