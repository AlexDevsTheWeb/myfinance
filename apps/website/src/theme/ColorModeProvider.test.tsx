import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ColorModeProvider } from './ColorModeProvider';
import { useColorMode } from './colorModeContext';
import { lightTheme, darkTheme } from './theme';

const STORAGE_KEY = 'balancr-website-color-mode';

const ModeProbe = () => {
  const { mode, toggleColorMode } = useColorMode();
  return (
    <button type="button" onClick={toggleColorMode}>
      {mode}
    </button>
  );
};

const stubMatchMedia = (prefersLight: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('light') ? prefersLight : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
};

describe('ColorModeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    stubMatchMedia(false);
  });

  it('defaults to dark when nothing is stored and the OS prefers dark', () => {
    render(
      <ColorModeProvider>
        <ModeProbe />
      </ColorModeProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('dark');
  });

  it('follows the OS preference when nothing is stored', () => {
    stubMatchMedia(true);
    render(
      <ColorModeProvider>
        <ModeProbe />
      </ColorModeProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('light');
  });

  it('prefers a stored choice over the OS preference', () => {
    window.localStorage.setItem(STORAGE_KEY, 'light');
    stubMatchMedia(false);
    render(
      <ColorModeProvider>
        <ModeProbe />
      </ColorModeProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('light');
  });

  it('toggles and persists the choice', async () => {
    const user = userEvent.setup();
    render(
      <ColorModeProvider>
        <ModeProbe />
      </ColorModeProvider>,
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('light');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('ignores a corrupted stored value instead of rendering nothing', () => {
    window.localStorage.setItem(STORAGE_KEY, 'neon');
    render(
      <ColorModeProvider>
        <ModeProbe />
      </ColorModeProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('dark');
  });

  it('renders when storage throws', () => {
    // Private-mode Safari and hardened browsers can throw on access; the site
    // must still paint rather than white-screen before first render.
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });

    expect(() =>
      render(
        <ColorModeProvider>
          <ModeProbe />
        </ColorModeProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByRole('button')).toHaveTextContent('dark');

    getItem.mockRestore();
    setItem.mockRestore();
  });
});

describe('themes', () => {
  it('keeps both palettes complete, including the surface ramp', () => {
    for (const theme of [darkTheme, lightTheme]) {
      expect(theme.palette.background.default).toMatch(/^#/);
      expect(theme.palette.surfaceLowest).toMatch(/^#/);
      expect(theme.palette.containerHighest).toMatch(/^#/);
      expect(theme.palette.divider).toMatch(/^#/);
      expect(theme.surfaceTokens).toBeDefined();
    }
  });

  it('gives the two modes genuinely different backgrounds', () => {
    expect(lightTheme.palette.background.default).not.toBe(
      darkTheme.palette.background.default,
    );
    expect(lightTheme.palette.mode).toBe('light');
    expect(darkTheme.palette.mode).toBe('dark');
  });

  it('caps the radius at 8px, per the brief', () => {
    // The source export used 16px and 24px radii throughout; the brief asked
    // for "sobrio ed esecutivo", so this is a deliberate divergence.
    expect(darkTheme.shape.borderRadius).toBe(4);
    expect(darkTheme.components?.MuiDialog?.styleOverrides?.paper).toEqual({
      borderRadius: 8,
    });
  });

  it('keeps the primary accent readable on each background', () => {
    // A #b8c4ff primary (the export's dark-mode value) fails contrast on a
    // near-white surface, which is why light mode uses a darker accent.
    expect(lightTheme.palette.primary.main).not.toBe(darkTheme.palette.primary.main);
  });
});
