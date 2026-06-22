---
title: "Project Roadmap"
tags: [plans, roadmap, project]
created: 2026-06-22
updated: 2026-06-22
status: active
sources: ["raw/ROADMAP.md"]
related: ["architecture/project-state", "architecture/concerns-and-tech-debt", "features/car-management-redesign"]
---

# Roadmap: MyFinance - Personal Finance Tracker

## Overview

Personal finance tracker with Firebase Auth + Firestore backend, featuring multi-account transaction tracking, recurring transactions, category management, and car mileage/tire tracking.

## Completed Phases

| Phase | Completed | Priority |
|-------|-----------|----------|
| Phase 01: Firebase Security Rules | 2026-04-23 | Critical |
| Phase 02: Error Handling Improvements | 2026-04-23 | High |
| Phase 03: Input Validation | 2026-04-23 | High |
| Phase 06: FAB Navigation | 2026-04-26 | Medium |
| Phase 09: Language i18n | 2026-05-02 | High |

## Planned Phases

### Phase 04: Backup & Restore
- **Priority:** High — data disaster protection
- **Requirements:** Export to JSON, import/restore, preview, valid human-readable format
- **Plan:** [[plans/04-01-backup-restore]] (not yet created)

### Phase 05: Cloud Backup (Google Drive)
- **Priority:** Medium — convenience feature
- **Requirements:** Auto-detect Google auth, upload to Drive, "Save to Google Drive" button
- **Plan:** [[plans/05-01-google-drive-backup]] (not yet created)

### Phase 07: UI Layout Refinement
- **Priority:** Medium — UX improvement
- **Requirements:** 60/40 column ratio across all pages, fix typography overflow, compact SalaryPage
- **Plans:**
  - 07-01: Dashboard column grid ratio (60/40) and typography
  - 07-02: Apply 60/40 to AnalysisPage, SalaryPage, TransactionsPage, UtilitiesPage
  - 07-03: Move account details to right column
  - 07-04: Compact SalaryPage table

### Phase 08: Year Selector CleanUI
- **Priority:** Medium
- **Requirements:** Move year selector inline with page title on AnalysisPage, CarPage, UtilitiesPage

## Related

- [[features/car-management-redesign]]
- [[architecture/concerns-and-tech-debt]]
- [[architecture/project-state]]
