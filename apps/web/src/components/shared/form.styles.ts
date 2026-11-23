/**
 * Shared input styling for the transaction drawer.
 *
 * TextFields, Selects and DatePickers must look identical: same surface, 8px
 * radius, 48px minimum touch target, slate hover and cyan focus — never the
 * default white hover border MUI derives from the dark palette's contrast text.
 */
import type { SxProps, Theme } from '@mui/material/styles';

const surface = {
  bgcolor: 'colors.bg',
  borderRadius: '8px',
  minHeight: 48,
};

const hoverFocus = {
  transition: 'border-color 0.2s ease-in-out',
};

/** TextField / DatePicker slot styling. */
export const formTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    ...surface,
    '& fieldset': { borderColor: 'colors.border', ...hoverFocus },
    '&:hover fieldset': { borderColor: 'colors.borderLight' },
    '&.Mui-focused fieldset': { borderColor: 'colors.cyan', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.8rem' },
  '& .MuiInputBase-input': { fontSize: '0.875rem' },
};

/** Select is its own OutlinedInput root, so the selectors target itself. */
export const formSelectSx: SxProps<Theme> = {
  ...surface,
  fontSize: '0.875rem',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'colors.border', ...hoverFocus },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'colors.borderLight' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'colors.cyan', borderWidth: '1.5px' },
};

/** Date field: monospaced value and a muted calendar icon that turns cyan. */
export const formDateFieldSx: SxProps<Theme> = {
  ...formTextFieldSx,
  '& .MuiInputBase-input': {
    fontFamily: (theme) => theme.colors.mono,
    fontVariantNumeric: 'tabular-nums',
  },
  '& .MuiInputAdornment-root .MuiIconButton-root': { color: 'colors.subtle' },
  '& .MuiInputAdornment-root .MuiIconButton-root:hover': { color: 'colors.cyan' },
};
