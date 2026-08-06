# Bug Analysis — Silent login errors, no user-facing feedback on auth failure

**Status:** FIXED (analyzed and resolved on 2026-08-06)
**Severity:** medium
**Related issue:** [#157](https://github.com/AlexDevsTheWeb/myfinance/issues/157)
**Related feature:** [new-user-auth-flow](../../new-user-auth-flow/new-user-auth-flow.md)

---

## Summary

Authentication failures on the login page produced **zero user feedback**. Both Google sign-in and email/password auth errors were caught and logged to the console only — the user saw nothing. A popup blocker silently prevented Google sign-in, wrong email/password was invisible, and network errors were uncommunicated.

## Reproduction

1. Open the app → Login page.
2. **Google:** block popups in the browser, then click "Sign in with Google" → nothing visibly happens (only `console.error`).
3. **Email/password:** enter a wrong password → the form silently resets, no error shown.
4. **Network:** go offline, attempt login → no error, no retry hint.

## Root Cause Analysis

### Errors swallowed in `handleSubmit`

`src/pages/LoginPage.tsx:28-31` — the `catch` block for both `signInWithEmailAndPassword` and `createUserWithEmailAndPassword` only logged the error code:

```ts
} catch (error: any) {
  console.error("Errore:", error.code);
  // Esempio: alert("Errore: " + error.message);
}
```

The commented-out `alert()` (line 30) confirms this was known to be temporary and never revisited.

### Errors swallowed in `handleLogin` (Google popup)

`src/pages/LoginPage.tsx:41-43` — same pattern for `signInWithPopup`:

```ts
} catch (error) {
  console.error('Error logging in:', error);
}
```

This is the worst case: `auth/popup-blocked` is one of the most common auth failures (ad-blockers / strict browser privacy settings), yet the user clicks, sees nothing, and assumes the app is broken.

### No error-display infrastructure in LoginPage

The page had no Snackbar, no Alert, no error state. Meanwhile the app already ships `AlertSnackbar` (`src/components/shared/AlertSnackbar.tsx`) and ConfigPage uses a clean `alertState` + `showAlert()` + `<AlertSnackbar/>` pattern — the fix should reuse that, not invent a new mechanism.

### No i18n for auth messages

The rest of the app is fully localized via `react-i18next` (`en.json` / `it.json`), but the login page had hardcoded English/Italian strings and no `t()` usage for errors. Error messages must be localized to match the app convention.

## Proposed Fix / Resolution

1. **Add an `auth` i18n section** to `src/locales/en.json` and `src/locales/it.json` with user-friendly messages for the Firebase auth error codes:
   - `auth/popup-blocked` — tell the user to allow popups for this site
   - `auth/wrong-password` — wrong password
   - `auth/user-not-found` — no account with that email
   - `auth/invalid-credential` — (Firebase v12 may use this instead of `wrong-password`/`user-not-found`)
   - `auth/invalid-email` — malformed email
   - `auth/email-already-in-use` — registration with an existing email
   - `auth/weak-password` — password too weak at registration
   - `auth/network-request-failed` — network error
   - `auth/too-many-requests` — rate limited, try later
   - `auth/user-disabled` — account disabled
   - `auth/operation-not-allowed` — auth method disabled
   - `auth/popup-closed-by-user` / `auth/cancelled-popup-request` — user closed the popup (informational)
   - fallback — generic "something went wrong" message
2. **Create a `getAuthErrorMessage(error)` helper** in `LoginPage.tsx` that maps `error.code` → localized message.
3. **Add `alertState` + `showAlert()` + `<AlertSnackbar/>`** to `LoginPage.tsx`, wired into both catch blocks.
4. Use `useTranslation()` for all messages.

## Files Modified

- `src/pages/LoginPage.tsx` — error handling, AlertSnackbar, `getAuthErrorMessage`
- `src/locales/en.json` — `auth` section
- `src/locales/it.json` — `auth` section

## Verification

- `npm run build` clean; `npm run lint` no new issues.
- Manual: wrong password → red Snackbar "Invalid email or password."; popup blocked → "Please allow popups for this site to sign in with Google."; email already in use at registration → localized message.
- Wiki: raw analysis + `wiki/bugs/silent-login-errors` bug page created, indexes and log updated.

## Related

- [new-user-auth-flow](../../new-user-auth-flow/new-user-auth-flow.md) — the earlier Google auth flow analysis (data isolation, concerns)
- `src/components/shared/AlertSnackbar.tsx` — the app-wide Snackbar used for the fix
