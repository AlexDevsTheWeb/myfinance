# External Integrations

**Analysis Date:** 2026-04-23

## Firebase (Primary Backend)

**Firebase App:**
- SDK: `firebase` 12.9.0
- Configuration file: `src/lib/firebase.ts`
- Config loaded from environment variables

**Firebase Authentication:**
- Provider: Google Auth Provider
- Implementation: `firebase/auth` module
- Export: `googleProvider` from `src/lib/firebase.ts`
- Used by: `src/hooks/useLogout.ts`

**Firebase Firestore:**
- Database: Cloud Firestore
- Implementation: `firebase/firestore` module
- Export: `db` from `src/lib/firebase.ts`
- Used by:
  - `src/store/useFinanceStore.ts` - Transaction storage
  - `src/hooks/useSyncFinance.ts` - Real-time sync
  - `src/lib/converters.ts` - Data serializers

## Authentication & Identity

**Auth Provider:**
- Google Sign-In (Firebase Google Auth Provider)
- Method: OAuth 2.0 via Firebase Auth
- User state: managed in Zustand store (`src/store/useAuthStore.ts`)

## Data Storage

**Primary Database:**
- Firebase Firestore (NoSQL cloud database)
- Collections: Transactions (inferred from store)
- Real-time subscriptions via `onSnapshot` in `src/hooks/useSyncFinance.ts`

**File Storage:**
- Not used - No Firebase Storage integration detected

**Local State:**
- Zustand stores in `src/store/`
  - `useFinanceStore.ts` - Finance data
  - `useAuthStore.ts` - User authentication state

## Environment Configuration

**Required env vars (Firebase):**
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - FCM sender ID
- `VITE_FIREBASE_APP_ID` - App ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Analytics measurement ID

**Secrets location:**
- `.env` file (per AGENTS.md)
- Loaded via `getEnvVar()` utility in `src/utils/variables.utils.ts`

## Monitoring & Observability

**Error Tracking:**
- Not configured - No error tracking service integrated

**Logs:**
- Console logging only (standard `console.log`/`console.error`)

## CI/CD & Deployment

**Hosting:**
- Not specified - Project is a client-side SPA

**CI Pipeline:**
- Not configured - No CI/CD detected

## Third-Party APIs

**External APIs Used:**
- None detected - All data via Firestore

**SDKs:**
- Firebase SDK only

---

*Integration audit: 2026-04-23*