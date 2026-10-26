# External Integrations

**Analysis Date:** 2026-07-11

## APIs & External Services

**Firebase Suite:**
- **Firebase Authentication** — Google Sign-In provider
  - SDK: `firebase/auth` via `firebase ^12.13.0`
  - Initialized in `src/lib/firebase.ts` (line 2: `getAuth`, line 27: `GoogleAuthProvider`)
  - Provider: `GoogleAuthProvider` — configured for Google Sign-In only
  - Auth state observed via `onAuthStateChanged` in `src/App.tsx` (line 54)
  - Sign-in: Google popup flow (handled in `src/pages/LoginPage.tsx`)
  - Sign-out: via `src/hooks/useLogout.ts`
  - Auth state store: `src/store/useAuthStore.ts` (Zustand)

- **Cloud Firestore** — Primary data store (all user data)
  - SDK: `firebase/firestore` via `firebase ^12.13.0`
  - Initialized in `src/lib/firebase.ts` (line 3: `getFirestore`)
  - Core collection: `/users/{userId}` — Single document per user (denormalized schema)
  - Subcollections:
    - `/users/{userId}/portfolio_history/{snapshotId}` — Daily portfolio snapshots
    - `/users/{userId}/dividends/{entryId}` — Dividend records
    - `/users/{userId}/tax_events/{eventId}` — Tax tracking events
  - Firestore Data Converter used for serialization/deserialization (`src/lib/converters.ts` — `userDocConverter`)
  - Document interface: `UserDoc` (`src/lib/converters.ts` lines 6-29) — 27+ top-level fields
  - Real-time sync via `onSnapshot` in 3 sync hooks:
    - `src/store/sync/index.ts` (initializeUser + realtime listener, used by `useSyncFinance`)
    - `src/hooks/useInvestmentSync.ts` (separate investment data sync)
    - `src/hooks/useBudgetSync.ts` (separate budget targets sync)
  - Transactional reads/writes via `runTransaction` in all 3 sync hooks
  - Optimistic updates with Firestore save: update store state first, then persist to Firestore, revert on error (pattern in `src/store/useFinanceStore.ts`)
  - Write operations: `updateDoc` for partial updates, `arrayUnion` for adding items to arrays
  - Security rules in `firestore.rules` — Owner-only read/write by `request.auth.uid`, 3 collections protected

- **Firebase Hosting** — Production deployment target
  - Config in `firebase.json` — Serves `dist/` folder, SPA rewrites (`**` → `/index.html`)
  - Project ID: `myfinancetracker-b257e` (from `.firebaserc`)

## Data Storage

**Databases:**
- **Cloud Firestore** (Firebase Native mode)
  - Single primary collection `/users/{userId}` with a single document per user (document size limit ~1 MiB)
  - Subcollections for portfolio history, dividends, tax events
  - No relational joins; all user data stored in one denormalized document
  - Security rules version 2 with helper functions `isSignedIn()` and `isOwner(userId)`
  - Client: Firestore SDK (`firebase/firestore`)

**User Document Structure** (`UserDoc` in `src/lib/converters.ts`):
| Field | Type | Default |
|-------|------|---------|
| transactions | ITransaction[] | [] |
| initialBalance | number | 0 |
| categories | ICategory[] | defaults |
| incomeCategories | ICategory[] | defaults |
| accounts | IAccount[] | defaults |
| recurringTransactions | IRecurringTransaction[] | [] |
| carMileage | ICarMileageRecord[] | [] |
| carInitialMileage | number | 0 |
| tireSettings | ITireSettings | defaults |
| tireChanges | ITireChangeRecord[] | [] |
| enabledModules | IAppModules | defaults |
| balanceStartDate | string | first of month |
| etfTransactions | IETFTransaction[] | [] |
| portfolioSnapshots | IPortfolioSnapshot[] | [] |
| brokerAccounts | BrokerAccount[] | defaults |
| assetHoldings | AssetHolding[] | [] |
| cashAdjustments | CashAdjustment[] | [] |
| dividendEntries | DividendEntry[] | [] |
| budgetTargets | BudgetTarget[] | [] |

**File Storage:**
- Not detected — No Firebase Storage or other file storage integration

**Caching:**
- Firestore SDK handles local cache automatically (persistence not explicitly configured)
- No Redis, Memcached, or other external caching layer

## Authentication & Identity

**Auth Provider:**
- **Firebase Authentication** with Google Sign-In
  - Implementation: `GoogleAuthProvider` in `src/lib/firebase.ts` (line 27)
  - Only Google provider configured; no email/password, phone, or other providers
  - Auth state managed in `src/store/useAuthStore.ts` (Zustand store)
  - Protected routes via `ProtectedRoute` wrapper in `src/App.tsx` — redirects to `/` if unauthenticated, shows `CircularProgress` during loading
  - No custom claims or role-based access control used

## External API Integrations

**Market Data:**
- **yfin.dev** — Stock/crypto price quotes
  - Endpoint: `https://api.yfin.dev/v1/quote?symbols={ticker}`
  - Used in: `src/hooks/useMarketData.ts` (line 4: `YFIN_BASE`)
  - Pattern: `fetch()` with `/quote` endpoint, returns `{ quotes: [{ symbol, regularMarketPrice, ... }] }`
  - No API key required (public endpoint)
  - No auth/rate limiting handled
  - Used for: ETF portfolio price refresh
  - Error handling: returns `null` on failure, logs to console

**Google Fonts:**
- **Inter** font family
  - Referenced in MUI theme: `src/theme/theme.ts` (line 53: `fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'`)
  - Loaded from Google Fonts CDN (not explicitly imported in source — loaded via `index.html` or system font fallback)

## Monitoring & Observability

**Error Tracking:**
- Not detected — No Sentry, Rollbar, or other error monitoring service
- All errors logged to `console.error()` only

**Analytics:**
- Firebase Analytics `measurementId` is configured in env vars but `getAnalytics()` is NOT called in `src/lib/firebase.ts`
- The `VITE_FIREBASE_MEASUREMENT_ID` env var is validated and passed in `firebaseConfig` but analytics module is never imported or initialized

**Logs:**
- No structured logging service; relies on `console.error()` throughout `src/store/useFinanceStore.ts`, `src/hooks/useSyncFinance.ts`, `src/hooks/useInvestmentSync.ts`, `src/hooks/useMarketData.ts`, etc.

## CI/CD & Deployment

**Hosting:**
- **Firebase Hosting** — Deployment target
  - Project: `myfinancetracker-b257e`
  - SPA configuration with rewrites from `**` to `/index.html`

**CI Pipeline:**
- Not detected — No `.github/` directory or CI workflow files found
- Previous GitHub Actions workflows (`version-bump.yml`, `firebase-hosting-pull-request.yml`) have been removed

**Deployment Process:**
- Manual deployment via Firebase CLI or firebase-tools (`firebase deploy`)
- No automated deployment pipeline currently configured

## Environment Configuration

**Required env vars (all Vite-exposed with `VITE_` prefix, validated in `src/lib/firebase.ts`):**

| Variable | Where Used | Sensitive |
|----------|-----------|-----------|
| `VITE_FIREBASE_API_KEY` | `src/lib/firebase.ts` | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_PROJECT_ID` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_STORAGE_BUCKET` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_APP_ID` | `src/lib/firebase.ts` | No |
| `VITE_FIREBASE_MEASUREMENT_ID` | `src/lib/firebase.ts` | No |

**Secrets location:**
- `.env.development` — Local dev values (not committed per `.gitignore`)
- `.env.production` — Production values (not committed per `.gitignore`)
- GitHub Secrets — Previously used for CI (FIREBASE_SERVICE_ACCOUNT_*, VITE_FIREBASE_*)
- Env access pattern: `src/utils/variables.utils.tsx` — `import.meta.env[name]` with throw-on-missing

**Env validation:**
- `getEnvVar()` in `src/utils/variables.utils.tsx` — throws `Error` if any required env var is undefined
- Called at module level in `src/lib/firebase.ts` for each Firebase config key — crash-early approach

## Webhooks & Callbacks

**Incoming:**
- Not detected — No incoming webhook endpoints

**Outgoing:**
- Not detected — No outgoing webhooks configured

## Internationalization

**i18n Provider:**
- **i18next** with browser language detector
- Config in `src/lib/i18n.ts`
- Supported languages: Italian (`it` — fallback), English (`en`)
- Detection order: `localStorage` → `navigator` (caches to `localStorage`)
- Locale files: `src/locales/it.json`, `src/locales/en.json`
- Dayjs locale synced with i18n language (`src/lib/i18n.ts` lines 32-42)
- Language stored in Zustand store (`src/store/useFinanceStore.ts` field `language`)

## Additional External Dependencies

| Dependency | Purpose | Network Required? |
|-----------|---------|-------------------|
| Google Fonts (Inter) | Primary font family in MUI theme | Yes, at load |
| Firebase CDN | Auth/Firestore SDK operations | Yes |
| Firebase Hosting CDN | Production static assets serving | Yes |
| yfin.dev API | Stock price quotes for ETF portfolio | Yes, on price refresh |
| Google Accounts | OAuth sign-in flow | Yes, on login |

## Data Flow Architecture

```
Browser → Vite Dev Server / Firebase Hosting (SPA)
  └─ React App
       ├─ Firebase Auth SDK → Google OAuth → User session
       ├─ Firestore SDK (real-time) → /users/{uid} doc
       │    ├─ useSyncFinance() → Zustand finance store
       │    ├─ useInvestmentSync() → Zustand investment store
       │    └─ useBudgetSync() → Zustand budget store
       └─ fetch() → yfin.dev API (on demand)
            └─ Portfolio price refresh
```

---

*Integration audit: 2026-07-11*
