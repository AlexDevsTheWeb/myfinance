/** Shared surface styles for the settings page. */
import type { SxProps, Theme } from '@mui/material/styles';

export const settingsCardSx: SxProps<Theme> = {
  p: 2.5,
  borderRadius: 3,
  bgcolor: 'colors.surface',
  border: '1px solid',
  borderColor: 'colors.border',
  height: '100%',
};

export const settingsRowSx: SxProps<Theme> = {
  bgcolor: 'colors.surfaceNested',
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'colors.border',
  mb: 1,
};

/** Monospaced figures, used for balances, plafonds, amounts and rates. */
export const monoValueSx: SxProps<Theme> = {
  fontFamily: (theme: Theme) => theme.colors.mono,
  fontVariantNumeric: 'tabular-nums',
};
