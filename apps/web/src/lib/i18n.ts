import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import dayjs from 'dayjs';
import itLocale from 'dayjs/locale/it';

import it from '../locales/it.json';
import en from '../locales/en.json';

export const resources = {
  it: { translation: it },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    supportedLngs: ['it', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Sync dayjs locale with i18n language
const setDayjsLocale = (lng: string) => {
  dayjs.locale(lng === 'it' ? itLocale : 'en');
};

// Set initial locale
setDayjsLocale(i18n.language);

// Update dayjs locale when language changes
i18n.on('languageChanged', (lng) => {
  setDayjsLocale(lng);
});

export default i18n;