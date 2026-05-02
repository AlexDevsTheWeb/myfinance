# Phase 09: Language i18n - Research

**Phase:** 09-language-i18n
**Date:** 2026-04-26

---

## Domain Analysis

### What is i18n in React?

Internationalization (i18n) in React applications involves:
1. Detecting user language preference
2. Storing preference persistently
3. Providing translations for all UI text
4. Formatting dates/numbers according to locale

### Current State

The MyFinance app uses:
- **React + TypeScript + Vite** - Modern frontend stack
- **MUI (Material UI)** - Component library with built-in i18n support
- **dayjs** - Date handling library
- **Firebase** - Backend for auth and data storage
- **Zustand** - State management

### Hardcoded Labels Found

All UI text is currently in Italian:
- Navigation: "Dashboard", "Transazioni", "Stipendio", etc.
- ConfigPage tabs: "Moduli attivi", "Balance", "Recurring", etc.
- Buttons: "Aggiungi", "Salva", "Annulla", etc.
- Form labels and error messages

---

## Technical Approach

### Option 1: i18next + react-i18next (Recommended)

**Pros:**
- Industry standard for React i18n
- Good TypeScript support
- Extensive features (pluralization, interpolation, namespace separation)
- Tree-shakeable
- Active maintenance

**Cons:**
- Additional dependency (~60KB)
- More setup than simple solutions

### Option 2: Simple JSON-based custom solution

**Pros:**
- No extra dependencies
- Full control over implementation

**Cons:**
- Reinventing the wheel
- No built-in interpolation/pluralization
- More code to maintain

### Option 3: MUI built-in i18n

**Pros:**
- Already using MUI
- Integrated with DatePicker

**Cons:**
- Only covers MUI components
- Would still need custom solution for app labels

---

## Recommendation

**Use i18next with react-i18next** for these reasons:

1. **MUI X DatePickers** already have built-in i18n support that integrates with i18next
2. **Industry standard** - well-documented, tested, maintained
3. **TypeScript support** - first-class support with type definitions
4. **Bundle size** - tree-shakeable, minimal overhead
5. **Flexibility** - easy to add more languages later

---

## Implementation Pattern

### Step 1: Install dependencies

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### Step 2: Create locale files

```
src/locales/
  it.json
  en.json
```

### Step 3: Initialize i18n

```typescript
// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import it from '../locales/it.json';
import en from '../locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
      en: { translation: en }
    },
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### Step 4: Wrap App with Provider

```tsx
// In App.tsx or main.tsx
import './lib/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';

// Wrap app
<I18nextProvider i18n={i18n}>
  <App />
</I18nextProvider>
```

### Step 5: Use translations

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <Typography>{t('dashboard.title')}</Typography>;
}
```

### Step 6: Configure MUI DatePicker with locale

```tsx
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import itLocale from 'dayjs/locale/it';
import enLocale from 'dayjs/locale/en';

// Use adapter with locale
<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language === 'it' ? itLocale : enLocale}>
  {children}
</LocalizationProvider>
```

---

## Date Handling

### Storage Format (Firestore)

Always store as **YYYY-MM-DD** strings (ISO format, no time component):
- Consistent regardless of display locale
- Easy to sort and filter
- dayjs parsing works universally

### Display Format

| Language | Format | Example |
|----------|--------|---------|
| Italian | DD/MM/YYYY | 26/04/2026 |
| English | MM/DD/YYYY | 04/26/2026 |

### Implementation

```tsx
import dayjs from 'dayjs';
import itLocale from 'dayjs/locale/it';
import enLocale from 'dayjs/locale/en';

// Set locale globally
dayjs.locale(i18n.language === 'it' ? itLocale : enLocale);

// Format for display
const displayDate = dayjs(dateStr).format('L'); // Locale-aware format
```

---

## Language Preference Storage

### Option A: Firestore user document

```typescript
// In useFinanceStore or separate store
setLanguagePreference: (lang: string) => {
  // Update Firestore user settings document
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, { language: lang });
}
```

### Option B: Zustand + localStorage only

```typescript
// In useFinanceStore
setLanguage: (lang: string) => {
  localStorage.setItem('language', lang);
  i18n.changeLanguage(lang);
}
```

### Recommendation

**Option B (localStorage)** for simplicity:
- User preference doesn't need to sync across devices
- Faster to implement
- Works offline during initial load before Firestore connects

**Option A** can be added in a future phase if device sync becomes important.

---

## Migration Scope

### All components requiring translation updates:

1. **Layout.tsx** - Navigation, current date display
2. **ConfigPage.tsx** - All tabs, dialogs, labels
3. **DashboardPage.tsx** - Section titles, card labels
4. **TransactionsPage.tsx** - Headers, filters, table
5. **SalaryPage.tsx** - Table headers, labels
6. **AnalysisPage.tsx** - Headers, table columns
7. **CarPage.tsx** - All labels and tables
8. **UtilitiesPage.tsx** - All labels and tables
9. **TransactionModal.tsx** - Form labels, buttons
10. **TransactionForm.tsx** - Form fields, validation
11. **TransactionTable.tsx** - Table headers
12. **RecapCards.tsx** - Card labels
13. **Charts.tsx** - Axis labels (if any)
14. **FinancialTrendChart.tsx** - Labels
15. **AnalysisTables.tsx** - Table headers
16. **AccountCard.component.tsx** - Labels
17. **YearSelector.component.tsx** - Labels

### Approximate translation keys needed: 150-200

---

## Validation Architecture

### Functional Tests

1. **Language detection works** - Browser language detected on first load
2. **Language switch works** - Changing language updates all UI immediately
3. **Language persists** - Selecting language survives page refresh
4. **Date format changes** - Dates display in correct format per language
5. **DatePicker works** - Date picker accepts and returns correct format
6. **Firestore dates work** - Dates stored/retrieved from Firestore display correctly

### Visual Checks

1. All labels in ConfigPage "General" tab show translated text
2. Navigation items show translated labels
3. All pages show translated titles
4. DatePicker popup shows correct locale format
5. Currency formatting remains consistent (€ with Italian locale)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translations | Medium | High | Systematic audit, placeholder keys |
| Date format bugs | Medium | Medium | Unit tests for format conversion |
| MUI DatePicker locale issues | Low | High | Test both locales thoroughly |
| Performance impact | Low | Low | i18next is tree-shakeable |

---

*Research complete: 2026-04-26*