---
type: Feature
title: "Account Deletion"
description: "Users can delete their own account and all data — Firestore doc, transactions/portfolio_history subcollections, and Firebase Auth account — with re-auth guard and confirmation UI."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/158"
tags: [feature, auth, firestore, gdpr, account]
created: 2026-08-06
updated: 2026-08-06
status: implemented
sources: ["raw/158-account-deletion/158-account-deletion.md"]
related: ["wiki/queries/new-user-auth-flow/new-user-auth-flow.md", "wiki/plans/backup-restore-data-coverage.md"]
---

# Feature: Account Deletion

Status: **implemented**
Priority: medium

## Description

Users can now delete their own account and all associated data directly from the app. This covers the GDPR right-to-erasure requirement and prevents orphaned Firestore data when a user wants to leave or reset.

## Requirements

- Delete the `users/{uid}` Firestore document.
- Bulk-delete subcollection data (`users/{uid}/transactions`, `users/{uid}/portfolio_history`).
- Call `deleteUser()` from Firebase Auth to remove the auth account.
- Handle the `auth/requires-recent-login` re-authentication requirement (Google popup or email/password credential).
- Provide a confirmation dialog (destructive action) and localized success/error feedback.
- Reset client stores + navigate to login after deletion.

## Implementation Notes

- Ordering matters: re-authenticate → delete subcollections → delete `users/{uid}` → `deleteUser()` → client cleanup. Deleting the auth account first would revoke the Firestore token and break the bulk delete.
- Firestore does NOT cascade-delete subcollections; both must be iterated explicitly.
- Re-auth: `reauthenticateWithPopup(googleProvider)` for Google accounts, `reauthenticateWithCredential(EmailAuthProvider.credential(...))` for email/password accounts.
- Implementation lives in `src/lib/deleteAccount.ts`; UI in ConfigPage General tab danger zone; i18n keys under `config.deleteAccount.*`.

## Related

- [[wiki/queries/new-user-auth-flow/new-user-auth-flow]] — Google auth registration flow and data isolation
- [[wiki/plans/backup-restore-data-coverage]] — related data-coverage work
- Source: [raw/158-account-deletion/158-account-deletion.md](raw/158-account-deletion/158-account-deletion.md)
