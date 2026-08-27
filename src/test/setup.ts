import '@testing-library/jest-dom/vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from '../lib/i18n';

// Initialize i18n for tests (synchronous, no detection)
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'it',
    fallbackLng: 'it',
    supportedLngs: ['it', 'en'],
    interpolation: { escapeValue: false },
    detection: { order: [] },
  });
}

export { i18n };
