# Phase 09: Language i18n - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning
**Source:** User request (language change feature)

<domain>
## Phase Boundary

This phase implements internationalization (i18n) for the MyFinance application:
- Add language selection in ConfigPage "General" tab
- Support Italian (default) and English
- Default to browser language detection
- Replace all hardcoded labels with translation keys
- Adapt date formatting to user locale
- Ensure date-pickers work correctly with Firestore storage

</domain>

<decisions>
## Implementation Decisions

### D-01: Language Selection Location
- Place language selector in ConfigPage, first tab ("Moduli attivi" renamed to "General")
- Dropdown with Italian (Italiano) and English options

### D-02: Default Language
- Use browser language via `navigator.language` 
- Fall back to Italian ('it') if browser language not supported
- Default to 'it' if detection fails

### D-03: Translation Library
- Use `i18next` with `react-i18next` for React integration
- Create locale folder at `src/locales/` with JSON translation files

### D-04: Translation File Structure
```
src/locales/
  it.json    # Italian translations
  en.json    # English translations
```

### D-05: Date Format by Language
- Italian (it): DD/MM/YYYY
- English (en): MM/DD/YYYY
- Store dates in Firestore as YYYY-MM-DD strings (ISO format)
- Display dates using locale-specific format

### D-06: Date-Picker Integration
- MUI X DatePickers already in use
- Configure adapter to use locale-aware formatting
- Ensure Firestore read/write uses consistent YYYY-MM-DD format

### D-07: Number Format
- Currency always use 'it-IT' locale (€) for consistency
- Numbers without currency use locale-appropriate thousand separators

</decisions>

<canonical_refs>
## Canonical References

**Project Configuration:**
- `package.json` — Check for existing i18n dependencies

**Source Files to Modify:**
- `src/App.tsx` — Initialize i18n provider
- `src/pages/ConfigPage.tsx` — Add language selector in first tab
- `src/store/useFinanceStore.ts` — Store language preference in Firestore user settings
- Translation files in `src/locales/` — Create new

**Existing Patterns:**
- All UI labels use Italian text (grep: "Typography.*label=", button labels, tab labels)
- Date handling uses `dayjs` throughout
- `toLocaleString('it-IT')` used for currency formatting

</canonical_refs>

<specifics>
## Specific Ideas

**Translation Keys Required:**
- App title, navigation labels
- Page titles (Dashboard, Transactions, Salary, Analysis, Car, Utilities, Config)
- Tab labels in ConfigPage
- Button labels (Add, Edit, Delete, Save, Cancel, etc.)
- Form labels and placeholders
- Table headers
- Status messages and alerts

**Language Store:**
- Save language preference to Firestore user document
- Load preference on app initialization
- Use Zustand store if easier (existing pattern)

</specifics>

<deferred>
## Deferred Ideas

- Additional languages beyond Italian/English
- Language-specific date export formats
- RTL support (not applicable for it/en)

</deferred>

---

*Phase: 09-language-i18n*
*Context gathered: 2026-04-26*