# Phase Context: Firebase Security Rules

**Created:** 2026-04-23

## Problem Statement

The MyFinance app uses Firebase Auth for authentication and Firestore for data storage. However, there are **no Firestore security rules** configured. This is a critical security vulnerability.

## Current Architecture

- **Auth:** Firebase Google Auth provider via `src/lib/firebase.ts`
- **Database:** Firestore with single-document-per-user pattern at `/users/{uid}`
- **All data stored:** transactions, categories, accounts, recurringTransactions, carMileage, etc.
- **User ID source:** Firebase Auth UID (`useAuthStore.getState().user?.uid`)

## Issue Details

- **Missing files:** `firestore.rules`, `storage.rules` in project root
- **Risk:** Any authenticated user could read/write/modify other users' data
- **Current protection:** Client-side auth check (insufficient)

## User Requirement

Implement Firestore security rules that enforce:
- Users can only read their own document
- Users can only write to their own document
- The document path `/users/{uid}` matches authenticated user's UID

## Data Structure Reference

From `src/store/useFinanceStore.ts` and `src/lib/converters.ts`:
- Collection: `users`
- Document ID: Firebase Auth UID (`user.uid`)
- All fields: transactions, categories, incomeCategories, accounts, recurringTransactions, carMileage, carInitialMileage, tireSettings, tireChanges, enabledModules, balanceStartDate, deletedRecurringInstances

## Constraints

- Must not break existing functionality
- Must work with existing Firebase project: `myfinancetracker-b257e`
- Rules must be deployed via Firebase CLI
- No storage rules needed (no file storage used)

## Success Criteria

1. `firestore.rules` file exists in project root
2. Rules enforce: `request.auth != null && request.auth.uid == userId` for `/users/{userId}`
3. Rules tested locally with `firebase emulators:exec` or Firebase Console simulator
4. Rules deployed to production Firebase project