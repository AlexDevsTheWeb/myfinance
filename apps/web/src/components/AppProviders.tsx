import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { I18nextProvider } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import i18n from '../lib/i18n';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    i18n.on('languageChanged', setLang);
    return () => {
      i18n.off('languageChanged', setLang);
    };
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang?.startsWith('it') ? 'it' : undefined}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LocalizationProvider>
  );
}
