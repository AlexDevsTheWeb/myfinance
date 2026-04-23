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
- Add amount validation (> 0)
- Add date bounds checking
- Remove hardcoded category logic for utility fields

### Phase 04: Test Suite
- Set up Vitest or Jest
- Add tests for store functions
- Add component tests with RTL

### Phase 05: Data Integrity
- Cascade deletion warnings for accounts
- Migration flag to prevent repeated migrations
- Confirmation dialogs for deletes

### Phase 06: Offline Support
- Service worker configuration
- Offline indicator
- Sync queue for offline writes

---

## Completed Phases

None yet.

---

*Roadmap audit: 2026-04-23*