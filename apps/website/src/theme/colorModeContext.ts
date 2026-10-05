import { createContext, useContext } from 'react';

export type ColorMode = 'light' | 'dark';

export interface ColorModeContextValue {
  mode: ColorMode;
  toggleColorMode: () => void;
}

/**
 * Lives apart from the provider component so `ColorModeProvider.tsx` exports
 * only a component: mixing context, hooks and components in one file breaks
 * React Fast Refresh, which the repo enforces through eslint.
 */
export const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'dark',
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);