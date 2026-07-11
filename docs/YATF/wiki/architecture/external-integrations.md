---
title: "External Integrations"
tags: [architecture, integrations, firebase, deploy]
created: 2026-06-22
updated: 2026-07-11
status: active
sources: ["raw/codebase/INTEGRATIONS.md"]
related: ["architecture/tech-stack", "architecture/system-architecture"]
---

# External Integrations

*Analysis: 2026-07-11*

## Firebase Suite (v12.13.0)

| Service | Usage | Files |
|---------|-------|-------|
| **Auth** | Google OAuth (`GoogleAuthProvider`) + email/password | `src/lib/firebase.ts`, `src/pages/LoginPage.tsx` |
| **Firestore** | Single doc per user at `users/{userId}` + 3 subcollections, realtime sync via `onSnapshot` | `src/lib/firebase.ts`, `src/lib/converters.ts`, `src/hooks/useSyncFinance.ts` |
| **Hosting** | Serves `dist/`, SPA rewrites (`**` → `/index.html`), project: `myfinancetracker-b257e` | `firebase.json`, `.firebaserc` |

### Firestore Subcollections
- `/users/{userId}/portfolio_history/{snapshotId}` — Daily portfolio snapshots
- `/users/{userId}/dividends/{entryId}` — Dividend records
- `/users/{userId}/tax_events/{eventId}` — Tax tracking events

### Firestore Data Model
- **UserDoc** (`src/lib/converters.ts`) — 27+ top-level fields including transactions, accounts, categories, ETF transactions, broker accounts, budget targets, etc.
- **Converter:** `userDocConverter` — type-safe serialization via `FirestoreDataConverter`
- **Write pattern:** Optimistic updates via `updateDoc` with full-array replacement (anti-pattern)
- **Security rules:** Owner-only read/write by `request.auth.uid`, no field-level validation

## Market Data API

- **yfin.dev** — Stock/crypto price quotes
  - Endpoint: `https://api.yfin.dev/v1/quote?symbols={ticker}`
  - Used in: `src/hooks/useMarketData.ts`
  - No API key required (public endpoint)
  - Used for ETF portfolio price refresh

## CI/CD

**No CI pipeline configured.** Previous GitHub Actions workflows (`version-bump.yml`, `firebase-hosting-pull-request.yml`) have been removed. Deployment is manual via Firebase CLI.

## i18n

- **Provider:** i18next with browser language detector
- **Locales:** Italian (`it`, fallback), English (`en`)
- **Files:** `src/locales/it.json`, `src/locales/en.json`
- **Dayjs locale** synced with i18n language

## Environment Variables

| Variable | Where Used | Sensitive |
|----------|-----------|-----------|
| `VITE_FIREBASE_API_KEY` | `src/lib/firebase.ts` | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_PROJECT_ID` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_STORAGE_BUCKET` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_APP_ID` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_MEASUREMENT_ID` | `src/lib/firebase.ts` | No |
| `VITE_REACT_APP_TITLE` | `src/pages/LoginPage.tsx`, `src/components/layout/Sidebar.tsx` | No |

- **Validation:** `getEnvVar()` in `src/utils/variables.utils.tsx` — throws `Error` if missing at module load (crash-early approach)
- **Sources:** `.env.development` (local dev), `.env.production` (prod)
- **Missing:** `VITE_REACT_APP_TITLE` is undocumented in `AGENTS.md`

## Missing / Not Configured

- **Error tracking:** None (no Sentry/LogRocket)
- **Analytics:** `VITE_FIREBASE_MEASUREMENT_ID` configured but `getAnalytics()` never called
- **Caching:** Firestore SDK local cache only (no explicit persistence config)
- **File storage:** None (data in Firestore only)
- **Webhooks:** None
- **Offline support:** Firestore `enableMultiTabIndexedDbPersistence()` not configured

## External Network Dependencies

| Resource | Purpose | Required At |
|----------|---------|-------------|
| Google Fonts (Inter) | Primary font family | App load |
| Firebase CDN | Auth/Firestore SDK operations | All operations |
| Firebase Hosting CDN | Production static assets | Page load |
| yfin.dev API | Stock price quotes | On price refresh |
| Google Accounts | OAuth sign-in flow | On login |

## Related

- [[wiki/architecture/tech-stack]]
- [[wiki/architecture/system-architecture]]
- [[wiki/architecture/concerns-and-tech-debt]]
