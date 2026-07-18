---
type: Plan
description: "Phase 2 execution details: disclaimer banner, backup/restore verification, tester invitation."
title: "Beta Launch Playbook"
tags: [plan, beta, launch, go-to-market]
created: 2026-07-18
updated: 2026-07-18
status: active
sources: ["raw/beta-launch-playbook/beta-launch-playbook.md"]
related: ["wiki/plans/go-to-market", "wiki/plans/backup-restore-data-coverage", "wiki/features/error-boundary/error-boundary", "wiki/features/mui-dialogs/mui-dialogs", "wiki/features/loading-states/loading-states"]
---

# Plan: Beta Launch Playbook

Status: `draft` — ready for Phase 2 execution
Priority: **high**

This playbook is the detailed execution guide for **Phase 2 (Soft Beta Launch)** of the [[wiki/plans/go-to-market|Go-to-Market plan]]. It covers the beta disclaimer banner, backup/restore verification, and the tester invitation process.

**Progress:** Section 1 ✅ implemented ([#149](https://github.com/AlexDevsTheWeb/myfinance/pull/151)), Section 2 ✅ verified ([#150](https://github.com/AlexDevsTheWeb/myfinance/issues/150)), Section 3 ⬜ pending

---

## 1. User Trust & Safety Disclaimer

Since the app runs under a personal domain (`home.alessandrotorri.it`), a clear banner is needed to set expectations and limit liability. Testers must understand this is a sandbox environment.

### React/MUI Component (English)

Place this snippet (using MUI `<Alert>`) at the top of the main Dashboard or right after Login:

```typescript
<Alert severity="warning" variant="outlined" sx={{ mb: 3 }}>
  <AlertTitle sx={{ fontWeight: 'bold' }}>Welcome to the Balancr Soft Beta!</AlertTitle>
  This application is currently in an experimental testing phase. While all data transmissions 
  are encrypted and isolated inside a dedicated Firestore database, please <strong>do not input 
  real banking credentials or highly sensitive financial passwords</strong>. This platform operates purely 
  as a self-contained tracking sandbox and has no integrations with external banking institutions.
</Alert>
```

> **Note:** The original source also contains an Italian version of this component. If i18n is active, map the translation accordingly using the app's existing locale system.

---

## 2. Backup/Restore Engine Verification Protocol (Post-Migration)

Having just implemented the first part of **Issue #138** (Firestore sub-collection migration), the legacy JSON exporter may break if it still attempts to read the entire array from a single document. Run this integrity check before inviting the 10-15 testers.

### Developer QA Checklist

1. **Deep Fetching on Export** — Verify that the export function does not just read the base user document `users/{uid}`, but performs an async query to extract all records from the new sub-collection `users/{uid}/transactions/*` before composing the downloadable JSON file.
2. **Validation Schema Update** — Update the import parser so it recognizes the differentiated object structure and does not expect a flat array within the old schema.
3. **Import Idempotency** — Ensure that importing the same JSON file twice overwrites the correct data or cleans the sub-collection before insertion, preventing duplicates caused by old IDs.

### Manual Test Case (Staging)

1. Create a mock broker (`Trade Republic`) with an active PAC and insert 5 purchase transactions.
2. Download the JSON Backup file from Settings (`/config`).
3. Go to the Firebase console and **manually delete the entire user's transaction sub-collection** (simulating data corruption).
4. Return to the app (which will now be empty), upload the JSON file, and verify that the dashboard, allocation charts, and PAC history repopulate instantly without client crashes (no White Screen).

> **Related:** [[wiki/plans/backup-restore-data-coverage]] — this verification tests the sub-collection migration completed in Phase 1.1.

---

## 3. Tester Invitation Template

Email or message template for recruiting the 10-15 selected contacts:

> "Hi [Name], the very first alpha/beta version of Balancr is finally live! If you'd like to try it out and give me your feedback, you can find it at: **https://home.alessandrotorri.it**
>
> A couple of quick notes before you jump in:
> 1. You'll see a disclaimer on entry — the app is secure and isolated, but since it's a beta I ask that you don't enter overly sensitive real data (e.g., don't use real amounts or names if you're not comfortable).
> 2. The focus of this test is to see whether the automatic PAC calculations and ETF charts update correctly over the first few days. If you see anything breaking or white screens, let me know right away! Thanks so much for your help."

---

## Dependencies

- ✅ Phase 0 (Quick Wins) — Error boundary, MUI dialogs, loading states
- ✅ Phase 1 (Secure the Data) — Sub-collection migration, PAC state persistence, recurring dedup
- ⬜ Beta disclaimer component — needs implementation
- ⬜ Backup/restore verification — needs execution before tester invites

## References

- Source: [raw/beta-launch-playbook/beta-launch-playbook.md](raw/beta-launch-playbook/beta-launch-playbook.md)
- Parent: [[wiki/plans/go-to-market]]
- Related: [[wiki/plans/backup-restore-data-coverage]]
