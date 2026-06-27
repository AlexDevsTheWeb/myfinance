# Roadmap: MyFinance

## Overview

Personal finance tracker evolving from transaction logging to a full financial platform with investment tracking, projections, and multi-asset portfolio management.

## Phases

### Phase 1: Firebase Security Rules
**Goal**: Implement Firestore security rules to enforce user data isolation
**Depends on**: Nothing (first phase)
**Plans**: 1 plan

Plans:
- [x] 01-01: Create and deploy Firestore security rules ✅ (2026-04-23)

### Phase 2: Error Handling Improvements
**Goal**: Improve error resilience across Firestore operations
**Depends on**: Phase 1
**Plans**: 1 plan

Plans:
- [x] 02-01: Wrap Firestore ops in try-catch, add loading states, toast notifications ✅

### Phase 3: Input Validation
**Goal**: Add input validation and remove hardcoded category logic
**Depends on**: Phase 2
**Plans**: 1 plan

Plans:
- [x] 03-01: Add validation for amount, dates, remove hardcoded categories ✅

### Phase 4: Backup & Restore
**Goal**: Implement backup and restore functionality for user data
**Depends on**: Phase 3
**Plans**: 1 plan

Plans:
- [ ] 04-01: Implement backup export, restore, and preview + ConfigPage UI

### Phase 5: Cloud Backup (Google Drive)
**Goal**: Add optional cloud backup to Google Drive for signed-in Google users
**Depends on**: Phase 4
**Plans**: 1 plan

Plans:
- [ ] 05-01: Google Drive integration for cloud backup

### Phase 6: FAB Navigation
**Goal**: Add floating action button navigation for quick actions
**Depends on**: Phase 5
**Plans**: 1 plan

Plans:
- [ ] 06-01: Implement FAB navigation component

### Phase 7: UI Layout Refinement
**Goal**: Refine dashboard layout with 60/40 column ratio and typography fixes
**Depends on**: Phase 6
**Plans**: 4 plans

Plans:
- [ ] 07-01: Adjust dashboard column grid ratio and fix typography overflow
- [ ] 07-02: Apply 60/40 ratio to AnalysisPage, SalaryPage, TransactionsPage, UtilitiesPage
- [ ] 07-03: Move account details to right column above Cash Flow Trend
- [ ] 07-04: Compact SalaryPage table to 2 rows

### Phase 8: Move Year Selector to Page Title
**Goal**: Move year selector inline with page titles across pages
**Depends on**: Phase 7
**Plans**: 1 plan

Plans:
- [ ] 08-01: Move year selector inline with page title on AnalysisPage, CarPage, UtilitiesPage

### Phase 9: Language i18n
**Goal**: Implement Italian/English internationalization with language selector
**Depends on**: Phase 8
**Plans**: 4 plans

Plans:
- [ ] 09-01: Set up i18next infrastructure and locale files
- [ ] 09-02: Add language selector to ConfigPage General tab
- [ ] 09-03: Replace all hardcoded labels with translation keys
- [ ] 09-04: Configure locale-aware date formatting

### Phase 10: Investment Tracking & Broker Integration
**Goal**: Implement ETF portfolio tracking, broker integration, PAC strategy, and portfolio charts
**Depends on**: Phase 9
**Plans**: 6 plans

Plans:
- [x] 10-01: Types + Schema + Converter ✅
- [x] 10-02: Investment Store (Zustand) ✅
- [x] 10-03: Transaction Flow (transfer type) ✅
- [x] 10-04: Broker Settings Modal ✅
- [x] 10-05: Portfolio Page (charts, holdings, tabs) ✅
- [x] 10-06: Market Data + Routing + i18n + ConfigPage toggle ✅

### Phase 11: Financial Projections & Compound Interest Simulator
**Goal**: Create a predictive charting module for compound interest simulation
**Depends on**: Phase 10
**Plans**: 3 plans

Plans:
- [x] 11-01: Simulation engine + types ✅
- [x] 11-02: UI shell (controls, chart, summary cards) ✅
- [x] 11-03: Hook, routing, i18n, optional prefill ✅

### Phase 12: Investment Tracking V2 — UX & Architecture Enhancements
**Goal**: Evolve investment tracking with PAC automation, full CRUD, multi-broker architecture, historical snapshots, tax modeling, and ticker validation
**Depends on**: Phase 10, Phase 11
**Requirements**: REQ-PAC, REQ-CRUD, REQ-MULTI, REQ-SNAP, REQ-TAX, REQ-TICKER
**Success Criteria** (what must be TRUE):
  1. PAC transactions auto-generate on schedule with user confirmation
  2. Users can edit/delete ETF transactions with correct cascading recalculation
  3. Multi-broker configuration works with dashboard filtering
  4. Historical portfolio chart persists across page reloads and devices
  5. Projections page shows inflation-adjusted real vs nominal values
  6. Invalid Yahoo tickers are rejected at config save time
**Plans**: 6 plans

Plans:
- [ ] 12-01-PLAN.md — Multi-broker schema refactor (types, store, migration, validation)
- [ ] 12-02-PLAN.md — Multi-broker UI components (BrokerSelect, BrokerSettingsModal, usePortfolio, i18n)
- [ ] 12-03-PLAN.md — Transaction CRUD (Edit/Delete, safe cascade, PAC state)
- [ ] 12-04-PLAN.md — Historical snapshots subcollection (Firestore + trigger + rules)
- [ ] 12-05-PLAN.md — PAC automation UI + ticker validation
- [ ] 12-06-PLAN.md — Projections inflation toggle (types, engine, chart, summary)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Firebase Security Rules | 1/1 | Complete | 2026-04-23 |
| 2. Error Handling | 1/1 | Complete | 2026-04-23 |
| 3. Input Validation | 1/1 | Complete | 2026-04-23 |
| 4. Backup & Restore | 0/1 | Not started | - |
| 5. Cloud Backup | 0/1 | Not started | - |
| 6. FAB Navigation | 0/1 | Not started | - |
| 7. UI Layout Refinement | 0/4 | Not started | - |
| 8. Year Selector Move | 0/1 | Not started | - |
| 9. Language i18n | 0/4 | Not started | - |
| 10. Investment Tracking | 6/6 | Complete | 2026-06-26 |
| 11. Financial Projections | 3/3 | Complete | 2026-06-26 |
| 12. Investment Tracking V2 | 0/6 | Not started | - |
