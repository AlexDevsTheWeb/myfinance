---
status: testing
phase: 01-03-completed
source: [01-SUMMARY.md, 02-SUMMARY.md, 03-SUMMARY.md]
started: 2026-04-23
updated: 2026-04-23
---

## Current Test

number: 1
name: Firestore Security Rules
expected: |
  Users can only access their own /users/{uid} data. Authenticated users cannot read/write other users' data.
awaiting: user response

## Tests

### 1. Firestore Security Rules
expected: |
  Users can only access their own /users/{uid} data. Authenticated users cannot read/write other users' data.
result: pending

### 2. Error Handling
expected: |
  When a Firestore write fails (e.g., network error), an error message appears via Snackbar. The app doesn't silently fail.
result: pending

### 3. Amount Validation
expected: |
  Try to submit a transaction with amount = 0 or negative. An inline error appears: "Amount must be greater than 0". Submit is blocked.
result: pending

### 4. Amount Validation (store level)
expected: |
  Adding a transaction programmatically with amount <= 0 fails silently (store-level validation rejects it before Firestore call).
result: pending

### 5. Utility Fields
expected: |
  For subcategories like Elettricità, Gas, Acqua — utility consumption fields appear. These are driven by a configurable list, not hardcoded 'Bollette' checks.
result: pending

### 6. Build Passes
expected: |
  `npm run build` completes without errors (TypeScript compiles, Vite bundles successfully).
result: pending

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0

## Gaps

[none yet]