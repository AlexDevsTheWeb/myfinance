# Threat Model — No Firestore write rate limiting (#159)

**Status:** DOCUMENTED (analyzed 2026-08-06; implementation deferred to SaaS launch)
**Severity:** low–medium
**Related issue:** [#159](https://github.com/AlexDevsTheWeb/myfinance/issues/159)
**Related decisions:** [saas-readiness](../../saas-readiness/saas-readiness.md), [go-to-market](../../go-to-market/go-to-market.md)
**Related architecture:** [external-integrations](../codebase/INTEGRATIONS.md), [concerns-and-tech-debt](../codebase/CONCERNS.md)

---

## Summary

There is no rate limiting or throttling on Firestore writes. An authenticated user can write an unlimited number of documents in rapid succession. `firestore.rules` checks **auth only** (`isSignedIn()` / `isOwner(userId)`) — no rate, no write-count guard, no field validation. All client-side writes go directly to Firestore through `firebase/firestore` with no server-side layer in between.

**Impact at current scale (low):** personal/small-scale use makes this a theoretical risk today. The realistic exposure is (a) the Firestore free tier limits (50k reads/day, 20k writes/day) being exhausted by one user or a runaway loop, and (b) no guard against accidental runaway writes (e.g., a buggy loop in `checkRecurring`).

## Current Defense-in-Depth State

| Layer | Status | Evidence |
|-------|--------|----------|
| Auth check in rules | ✅ Present | `firestore.rules` `isSignedIn()` + `isOwner(userId)` on all `users/{userId}` docs and subcollections |
| Rate limit in rules | ❌ Absent | No `request.write_requests_per_minute` (not a real Firestore rules feature), no counters, no time windows |
| Server-side proxy/backend | ❌ Absent | Pure client app; no Cloud Functions, no custom backend |
| Firebase App Check | ❌ Absent | `src/lib/firebase.ts` only initializes app + auth + firestore; no `getAppCheck`/`ReCaptchaV3Provider` |
| Client-side `isSaving` guard | ✅ Present | All stores (`useFinanceStore`, `useInvestmentStore`, `useBudgetStore`, `sync/index.ts`) set `isSaving` around each write action, preventing concurrent double-writes from the UI |
| Client-side throttle | ⚠️ Partial | `checkRecurring` has a 5s `lastRecurringCheck` guard (`useFinanceStore.ts:819-822`) + `isCheckingRecurring` re-entrancy lock |
| Client-side debounce of rapid-fire UI actions | ⚠️ Partial | `isSaving` blocks overlap but does not rate-limit *sequential* rapid writes (e.g., rapid-fire import or a tight loop calling a save action) |
| Field-level validation in rules | ❌ Absent | Rules do not validate doc structure or types (see CONCERNS.md) |

## Threat Scenarios

1. **Single-user quota exhaustion:** a user (or attacker with a valid account) writes thousands of documents rapidly → consumes the project-wide free-tier 20k writes/day → degrades service for all users.
2. **Runaway client loop:** a regression in `checkRecurring` (see #146 duplicate bug) or in a bulk-write action (import, restore, backup) could fire unbounded writes. The 5s throttle is the only current guard and is specific to one action.
3. **Scripted abuse at SaaS launch:** once the app is paid/multi-tenant at scale, an attacker can bypass the UI entirely and drive the Firestore REST API with their own auth token — client-side throttling cannot stop this, only server-side controls can.

## Key Constraint: Client-Only App

There is **no backend** in this project. Client-side throttle/debounce protects against accidental runaway writes but is trivially bypassable by anyone scripting the Firestore API directly. Real abuse prevention at scale requires one of:

1. **Firebase App Check** (recommended primary) — proves each request comes from the legitimate app. Web implementation uses a reCAPTCHA site key (`ReCaptchaV3Provider`). Blocks calls not issued by the deployed app, including the Firestore REST API. Requires: Firebase console setup (App Check + reCAPTCHA Enterprise key) and a `VITE_*` env var for the site key.
2. **Server-side rate limiting** — Cloud Functions or a custom backend that tracks writes per user per window. The proper long-term solution for paid-tier scale, but substantial infrastructure.
3. **Firestore rules counters** — not viable: Firestore rules have no time-based primitives; implementing per-user counters in rules is fragile and bypassable, and the issue's suggestion of `request.write_requests_per_minute` is not a real rules API. Recorded here so it is not re-investigated.

## Recommended Mitigations (in priority order)

### At SaaS launch (server-side, real protection)

1. **Firebase App Check (Web)** — add to `src/lib/firebase.ts`:
   ```ts
   import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
   const appCheck = initializeAppCheck(app, {
     provider: new ReCaptchaV3Provider(siteKey),
     isTokenAutoRefreshEnabled: true,
   });
   ```
   - Site key from env var (`VITE_FIREBASE_APPCHECK_SITE_KEY`), **conditional init** so the app keeps working in dev/CI when the key is absent.
   - Enforce in Firebase console (Firestore enforcement) once enabled.
   - Note: App Check on web ships with the reCAPTCHA site key in the client bundle — it raises the bar (blocks non-app calls) but does not stop someone extracting the key; pair with server-side limiting for hard guarantees.
2. **Server-side rate limiting (Cloud Functions)** — per-user write counter with sliding window; reject/backoff beyond a threshold. Real enforcement for a paid tier.

### Client-side hardening (cheap, do now or before launch)

3. **Shared write-throttle guard** — a small util (e.g., `src/lib/writeGuard.ts`) wrapping Firestore write calls with a per-user minimum interval + max-burst counter. Apply to bulk-write paths: `importAllData`, backup/restore, and the `checkRecurring` transaction-generation loop. This complements the existing `isSaving` flags (which prevent overlap, not runaway sequential loops).
4. **Keep `isSaving` + `isCheckingRecurring` guards** (already present) — they are the correct first line for UI-driven writes.

## Decision

**Document the threat model now; defer implementation to the paid-tier launch** (track with saas-readiness / go-to-market plans). Rationale:

- At current personal/small-scale usage, exposure is low and no incident has occurred.
- Client-side throttling alone is bypassable and adds risk of introducing bugs into hot write paths (the codebase already has known concurrency concerns in the single-doc write model).
- App Check + server-side limiting are the correct fixes and belong together with the launch work that introduces real multi-tenant exposure.
- The cheap client-side hardening (item 3 above) can be done opportunistically before launch without a full backend.

## Files That Would Change When Implemented

- `src/lib/firebase.ts` — conditional App Check init
- `.env` / `.env.*` — `VITE_FIREBASE_APPCHECK_SITE_KEY`
- `firestore.rules` — field-level validation (optional hardening, separate concern)
- New `src/lib/writeGuard.ts` — shared throttle util
- `src/store/useFinanceStore.ts` (bulk write paths), `src/store/sync/index.ts` — apply guard

## Verification

- No code changes in this pass (documentation-only).
- OKF check passes: `python3 docs/YATF/scripts/okf_migrate.py --check`.
- Wiki: raw analysis + `wiki/decisions/firestore-rate-limiting` decision page, indexes and log updated.

## Related

- [saas-readiness](../../saas-readiness/saas-readiness.md) — launch-blocking decision matrix
- [go-to-market](../../go-to-market/go-to-market.md) — launch plan with data-security phase
- [concerns-and-tech-debt](../codebase/CONCERNS.md) — Firestore write pattern + rules validation concerns
- [external-integrations](../codebase/INTEGRATIONS.md) — Firebase config / env management
- `src/store/useFinanceStore.ts` — `isSaving` / `isCheckingRecurring` / 5s throttle
- `firestore.rules` — current auth-only rules
