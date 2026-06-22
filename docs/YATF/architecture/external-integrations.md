---
title: "External Integrations"
tags: [architecture, integrations, firebase, deploy]
created: 2026-06-22
updated: 2026-06-22
status: active
sources: ["raw/codebase/INTEGRATIONS.md"]
related: ["architecture/tech-stack", "architecture/system-architecture"]
---

# External Integrations

*Analysis: 2026-06-22*

## Firebase Suite (v12.13.0)

| Service | Usage | Files |
|---------|-------|-------|
| **Auth** | Google OAuth (`GoogleAuthProvider`) + email/password | `src/lib/firebase.ts`, `src/pages/LoginPage.tsx` |
| **Firestore** | Single doc per user at `users/{userId}`, realtime sync via `onSnapshot` | `src/lib/firebase.ts`, `src/lib/converters.ts`, `src/hooks/useSyncFinance.ts` |
| **Hosting** | Serves `dist/`, SPA rewrites (`**` → `/index.html`), project: `myfinancetracker-b257e` | `firebase.json`, `.firebaserc` |

## CI/CD

**GitHub Actions** — Two workflows in `.github/workflows/`:

1. **`version-bump.yml`** (push to `main`): Ubuntu + Node 24, conventional commit parsing, `standard-version` for version bump + git tag + GitHub Release, builds with Firebase secrets, deploys to Firebase Hosting
2. **`firebase-hosting-pull-request.yml`** (PR): Builds and deploys PR preview to Firebase Hosting

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
| `VITE_REACT_APP_TITLE` | `src/main.tsx` (via index.html) | No |

- Env validation: `getEnvVar()` in `src/utils/variables.utils.tsx` — throws if any required var is missing
- Sources: `.env.development` (local dev), `.env.production` (prod), GitHub Secrets (CI)

## Missing

- **Error tracking:** None (no Sentry/LogRocket)
- **Caching:** None (Firestore SDK local cache only)
- **File storage:** None (data in Firestore only)
- **Webhooks:** None
- **Firebase Analytics:** `measurementId` is configured but `getAnalytics()` is never called

## External Network Dependencies

| Resource | Purpose |
|----------|---------|
| Google Fonts (Inter) | Primary font family in MUI theme |
| Firebase CDN | Auth/Firestore SDK operations |
| Firebase Hosting CDN | Production static assets |

## Related

- [[architecture/tech-stack]]
- [[architecture/system-architecture]]
- [[architecture/concerns-and-tech-debt]]
