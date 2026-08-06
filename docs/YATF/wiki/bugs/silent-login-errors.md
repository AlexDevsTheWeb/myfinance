---
type: Bug
title: "Silent login errors — no user-facing feedback on auth failure"
description: "Authentication failures (Google popup blocked, wrong password, network errors) were caught and console.logged only — the user saw nothing. Fixed by showing localized error messages via the app's AlertSnackbar."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/157"
tags: [bug, auth, login, firebase, ux]
created: 2026-08-06
updated: 2026-08-06
status: fixed
severity: major
sources: ["raw/bugs/silent-login-errors/silent-login-errors.md"]
related: ["wiki/queries/new-user-auth-flow/new-user-auth-flow.md", "wiki/features/error-boundary/error-boundary.md"]
---

# Bug: Silent login errors — no user-facing feedback on auth failure

Status: **fixed**
Severity: **medium**

## Symptom

Authentication failures on the login page produced **zero user feedback**. Both Google sign-in and email/password auth errors were swallowed into `console.error` only — the user saw nothing.

- **Popup blocked** → Google sign-in silently does nothing (ad-blockers / strict browser privacy settings are common).
- **Wrong email/password** → the form just does nothing.
- **Network errors** → invisible.

## Reproduction

1. Open the app → Login page.
2. Block popups → click "Sign in with Google" → nothing happens.
3. Enter a wrong password → no error shown.
4. Go offline and attempt login → no error, no hint.

## Root Cause Analysis

- `src/pages/LoginPage.tsx:28-31` — `handleSubmit` catch block for `signInWithEmailAndPassword` / `createUserWithEmailAndPassword` only called `console.error("Errore:", error.code)`. A commented-out `alert()` (line 30) marks this as known-temporary, never revisited.
- `src/pages/LoginPage.tsx:41-43` — `handleLogin` catch block for `signInWithPopup` only did `console.error('Error logging in:', error)`. This is the worst case: a **common** failure (`auth/popup-blocked`) leaves the user thinking the app is broken.
- The page had no Snackbar/Alert/error state, while the app already ships `AlertSnackbar` (`src/components/shared/AlertSnackbar.tsx`) used by ConfigPage.
- No i18n for auth messages: the rest of the app uses `react-i18next` (`en.json`/`it.json`) but the login page had hardcoded strings.

## Fix

1. Added an **`auth` i18n section** to `src/locales/en.json` and `src/locales/it.json` mapping Firebase auth error codes to user-friendly, localized messages.
2. Added a **`getAuthErrorMessage(error)`** helper in `LoginPage.tsx` that maps `error.code` → localized message (with a generic fallback).
3. Added **`alertState` + `showAlert()` + `<AlertSnackbar/>`** to `LoginPage.tsx`, wired into both catch blocks.
4. Used `useTranslation()` for all messages.

Error codes handled: `auth/popup-blocked`, `auth/wrong-password`, `auth/user-not-found`, `auth/invalid-credential`, `auth/invalid-email`, `auth/email-already-in-use`, `auth/weak-password`, `auth/network-request-failed`, `auth/too-many-requests`, `auth/user-disabled`, `auth/operation-not-allowed`, `auth/popup-closed-by-user`, `auth/cancelled-popup-request`, plus a generic fallback.

## Related

- [[wiki/queries/new-user-auth-flow/new-user-auth-flow]] — earlier Google auth flow analysis
- [[wiki/features/error-boundary/error-boundary]] — related UX-resilience work
- Source: [raw/bugs/silent-login-errors/silent-login-errors.md](raw/bugs/silent-login-errors/silent-login-errors.md)