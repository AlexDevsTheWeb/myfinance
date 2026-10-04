---
type: Decision
title: "Firestore write rate limiting"
description: "No server-side write rate limiting exists; client-only app means client throttle is bypassable — defer App Check + server-side limiting to paid-tier launch."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/159"
tags: [decision, security, firestore, rate-limiting]
created: 2026-08-06
updated: 2026-08-06
status: accepted
sources: ["raw/159-rate-limiting/159-rate-limiting.md"]
related:
  - "wiki/decisions/saas-readiness.md"
  - "wiki/architecture/concerns-and-tech-debt.md"
  - "wiki/architecture/external-integrations.md"
---

# Decision: Firestore Write Rate Limiting

Status: accepted
Severity: low–medium

## Context

`firestore.rules` only checks auth (`isSignedIn()` / `isOwner(userId)`). An authenticated user can write an unlimited number of documents in rapid succession — no rate guard, no counters, no field validation. The app is **client-only** (no backend, no Cloud Functions), so all writes go directly through the SDK.

Impact today is low (personal/small-scale). Exposure grows at paid-tier launch: one user or a runaway loop could exhaust the Firestore free-tier budget (50k reads / 20k writes per day).

## Options Considered

1. **Firebase App Check (Web)** — prove each request comes from the legitimate app via `ReCaptchaV3Provider` + a reCAPTCHA site key. Real abuse prevention; blocks direct REST API abuse. Requires Firebase console setup + a new env var; ships the site key in the client bundle (raises the bar, not a hard guarantee).
2. **Server-side rate limiting (Cloud Functions)** — per-user write counter with sliding window; real enforcement but substantial new infrastructure.
3. **Firestore rules counters** — not viable. Firestore rules have no time-based primitives; the often-suggested `request.write_requests_per_minute` is not a real rules API. Fragile and bypassable.
4. **Client-side throttle/debounce** — cheap, protects against accidental runaway loops, but trivially bypassed by scripting the Firestore API directly.

## Decision

**Document the threat model now; defer implementation to the paid-tier launch.** Client-side hardening alone is bypassable and would add risk to already-hot write paths; the correct fix (App Check + server-side limiting) belongs with the launch work that introduces real multi-tenant exposure. Track with the [[wiki/plans/go-to-market]] data-security phase.

## Consequences

- Current mitigations stay as-is: `isSaving` / `isCheckingRecurring` guards + the 5s `checkRecurring` throttle.
- Before launch: add conditional App Check init in `src/lib/firebase.ts` (env-gated `VITE_FIREBASE_APPCHECK_SITE_KEY`) and a shared `src/lib/writeGuard.ts` throttle applied to bulk-write paths (import, restore, backup, `checkRecurring`).
- The issue's rules-based suggestions (`request.write_requests_per_minute`) are documented as non-real so they are not re-investigated.

## Related

- [[wiki/decisions/saas-readiness]]
- [[wiki/plans/go-to-market]]
- [[wiki/architecture/concerns-and-tech-debt]]
- [[wiki/architecture/external-integrations]]
- Source: [raw/159-rate-limiting](raw/159-rate-limiting/159-rate-limiting.md)
