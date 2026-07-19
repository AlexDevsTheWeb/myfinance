---
type: Query
description: "New user registration flow analysis via Google Auth — data isolation, concerns, and false alarms."
title: "New User Auth Flow Analysis"
tags: [query, auth, security, data-flow]
created: 2026-07-18
updated: 2026-07-18
status: active
sources: ["raw/new-user-auth-flow/new-user-auth-flow.md"]
related: ["architecture/external-integrations", "architecture/concerns-and-tech-debt", "architecture/system-architecture"]
---

# Query: What Happens When a New User Logs In?

## Summary

New user registration via Google Auth is **safe**. Data isolation is enforced at the Firestore security rules level (`request.auth.uid == userId`), preventing any cross-user data leakage. No other user's data is at risk.

## Full Auth Flow

1. User clicks "Sign in with Google" → `signInWithPopup(auth, googleProvider)` (`src/pages/LoginPage.tsx:40`)
2. `onAuthStateChanged` fires in `src/App.tsx:54` → stores `User` in `useAuthStore`
3. `ProtectedRoute` sees auth → renders `Layout`
4. Three sync hooks fire simultaneously (`useSyncFinance`, `useInvestmentSync`, `useBudgetSync`)
5. Each calls `runTransaction` on `users/{uid}` — doc doesn't exist → `transaction.set(docRef, defaultConfig)`
6. Firestore transactions handle the race condition (retry on conflict)
7. Default user document created with Italian-language categories, empty transactions, default broker stub
8. `_migrateToMultiAccount` runs but early-returns (empty arrays, no-op)
9. `onSnapshot` listeners start for real-time sync
10. User sees DashboardPage with empty default state

## Concerns Found

| # | Concern | Risk Level |
|---|---------|------------|
| 1 | Silent login errors — Google/email auth failures caught but not shown to user | **Medium** |
| 2 | No account deletion functionality — no way to remove data | **Medium** |
| 3 | Three concurrent transactions on new user — handled but unnecessary overhead | **Low** |
| 4 | No onboarding or welcome flow for new users | **Low** |
| 5 | `_migrateToMultiAccount` runs (harmlessly) on every mount | **Low** |
| 6 | No Firestore write rate limiting | **Low-Medium** |

## False Alarms

| Check | Result |
|-------|--------|
| Can User A see User B's data? | **No** — Firestore rules enforce `request.auth.uid == userId` on all paths |
| Can client bugs write to wrong user? | **No** — `uid` always from Firebase Auth, rules would reject anyway |
| Do subcollections have proper rules? | **Yes** — All 4 subcollections have `isOwner` guards |
| Can the three sync hooks corrupt each other? | **No** — Firestore transactions provide atomicity + retry |

## Source

Full analysis: [raw/new-user-auth-flow/new-user-auth-flow.md](raw/new-user-auth-flow/new-user-auth-flow.md)
