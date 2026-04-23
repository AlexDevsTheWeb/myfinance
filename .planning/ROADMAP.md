# Roadmap

**Project:** MyFinance - Personal Finance Tracker
**Generated:** 2026-04-23
**Last Updated:** 2026-04-23

---

## Overview

Personal finance tracker with Firebase Auth + Firestore backend, featuring:
- Multi-account transaction tracking (income/expense)
- Recurring transactions with auto-generation
- Category management with subcategories
- Car mileage and tire tracking
- Material UI frontend (React + Vite + TypeScript)

---

## Phase 01: Firebase Security Rules

**Status:** ✓ Complete (2026-04-23)
**Priority:** Critical (security gap identified in CONCERNS.md)

**Goal:** Implement Firestore security rules to enforce user data isolation

**Requirements:**
- **[SEC-01]** Firestore security rules must enforce: `request.auth != null && request.auth.uid == resource.data.ownerId` (or document ID match)

**Plans:**
- [x] 01-01-PLAN.md — Create and deploy Firestore security rules ✓

---

## Future Phases (Suggested)

### Phase 02: Error Handling Improvements
- [x] Wrap Firestore operations in try-catch with user notification ✓ (2026-04-23)
- [x] Add loading states for Firestore writes ✓
- [x] Show toast/snackbar for network failures ✓

### Phase 03: Input Validation
- [x] Add amount validation (> 0) ✓ (2026-04-23)
- [x] Add date bounds checking (lenient per D-01) ✓
- [x] Remove hardcoded category logic for utility fields ✓

**Status:** ✓ Complete (2026-04-23)
**Plans:**
- [x] 03-01-PLAN.md — Add input validation for amount, dates, and remove hardcoded category logic

---

## Completed Phases

- Phase 01: Firebase Security Rules ✓ Complete (2026-04-23)
- Phase 02: Error Handling Improvements ✓ Complete (2026-04-23)
- Phase 03: Input Validation ✓ Complete (2026-04-23)

---

## Phase 04: Backup & Restore

**Status:** Planned (2026-04-23)
**Priority:** High (data disaster protection)

**Goal:** Implement backup and restore functionality for user data

**Requirements:**
- **[BACKUP-01]** User can export all data to downloadable JSON file
- **[BACKUP-02]** User can import backup file to restore all data
- **[BACKUP-03]** Backup files must be valid and human-readable JSON
- **[BACKUP-04]** Data disaster recovery through restore capability

**Plans:**
- [ ] 04-01-PLAN.md — Implement backup export, restore, and preview functions + ConfigPage UI

---

## Phase 05: Cloud Backup (Google Drive)

**Status:** Planned (2026-04-23)
**Priority:** Medium (convenience feature)

**Goal:** Add optional cloud backup to Google Drive for signed-in Google users

**Requirements:**
- **[CLOUD-01]** Auto-detect if user logged in with Google Auth
- **[CLOUD-02]** Upload backup files to user's Google Drive
- **[CLOUD-03]** Show "Save to Google Drive" button next to download backup

**Plans:**
- [ ] 05-01-PLAN.md — Google Drive integration for cloud backup

---

## Phase 06: FAB Navigation

**Status:** Planned (2026-04-23)
**Priority:** High (UX improvement)

**Goal:** Make transaction entry accessible from all pages via single FAB button with dropdown

**Requirements:**
- **[FAB-01]** Single "+/-" FAB button visible on all pages except Config
- **[FAB-02]** Dropdown menu shows "New Income" and "New Expense" options
- **[FAB-03]** Clicking option opens TransactionModal with correct type

**Plans:**
- [ ] 06-01-PLAN.md — Add FAB with dropdown to Layout, remove from Dashboard

---

*Roadmap audit: 2026-04-23*