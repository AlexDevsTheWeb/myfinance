# External Integrations

**Analysis Date:** 2026-05-03

## APIs & External Services

**Firebase Platform:**
- Firebase - Backend-as-a-service for authentication and database
  - SDK: `firebase` (npm package v12.9.0)
  - Implementation: `src/lib/firebase.ts`
  - Services used:
    - Firebase Auth - Authentication with Google provider
    - Firebase Firestore - NoSQL database for data storage
  - Required env vars:
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_STORAGE_BUCKET`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`
    - `VITE_FIREBASE_APP_ID`
    - `VITE_FIREBASE_MEASUREMENT_ID`

## Data Storage

**Database:**
- Firebase Firestore - Cloud NoSQL database
  - Client: Firebase SDK (`getFirestore()`)
  - Connection: Configured via Firebase project credentials
  - Location: Implemented in `src/lib/firebase.ts:26`

**File Storage:**
- None detected - Application stores data in Firestore only

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication
  - Implementation: `src/lib/firebase.ts:25`
  - Providers: Google OAuth via `GoogleAuthProvider`
  - Auth hooks: `src/store/useAuthStore.ts`, `src/hooks/useLogout.ts`
  - Login page: `src/pages/LoginPage.tsx`

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, LogRocket, or similar integration

**Logs:**
- Console logging only - No structured logging system

## CI/CD & Deployment

**Hosting:**
- Firebase (implied by Firebase configuration)
  - Project ID from environment variables

**CI Pipeline:**
- None detected - No GitHub Actions, CircleCI, or similar

## Environment Configuration

**Required env vars:**
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project identifier
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app identifier
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase Analytics measurement ID

**Secrets location:**
- Environment files: `.env`, `.env.development`, `.env.production`
- Loaded via `src/utils/variables.utils.tsx` using `import.meta.env`

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected