# Phase 05 Summary: Cloud Backup (Google Drive)

## Completed: 2026-04-23

## Overview
Added optional Google Drive backup upload for users signed in with Google Auth.

## Features Implemented

### 1. GAPI Client Loading (`loadGapiClient`)
- Dynamic loading of Google API client script
- Initializes with `drive.file` scope (minimal permissions)
- Requires `VITE_GOOGLE_CLIENT_ID` in `.env` file

### 2. Google User Detection (`isGoogleUser`)
- Helper function exported from useFinanceStore
- Checks `user.providerData` for `google.com` provider
- Used to conditionally show Drive button

### 3. Upload to Drive (`uploadBackupToDrive`)
- Creates backup JSON with same structure as local export
- Uses GAPI client for OAuth authentication
- Uploads via multipart form to Google Drive API
- Creates new file with timestamp in filename

### 4. "Salva su Drive" Button
- Only appears for Google-signed-in users
- Shows success/error feedback via alert
- Disabled during other save operations

## Files Modified

- `src/lib/firebase.ts` - Added `loadGapiClient` function
- `src/store/useFinanceStore.ts` - Added `isGoogleUser`, `uploadBackupToDrive`
- `src/pages/ConfigPage.tsx` - Added Google Drive button in Backup tab

## Requirements

- `VITE_GOOGLE_CLIENT_ID` must be set in `.env` file
- This is a separate OAuth Client ID from Firebase (configured in Google Cloud Console)

## Verification

1. Log in with Google Auth
2. Go to ConfigPage → Backup tab
3. Verify "Salva su Drive" button appears
4. Click it → Backup uploads to Drive
5. Log out, log in with email/password → Button does NOT appear