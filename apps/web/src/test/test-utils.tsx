import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { theme } from '../theme/theme';
import { i18n } from './setup';

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions & { locale?: string }) {
  const locale = options?.locale ?? 'it';
  if (i18n.language !== locale) i18n.changeLanguage(locale);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { locale: _optionsLocale, ...renderOptions } = options ?? {};

  return render(ui, {
    wrapper: ({ children }) => (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
        </ThemeProvider>
      </I18nextProvider>
    ),
    ...renderOptions,
  });
}
