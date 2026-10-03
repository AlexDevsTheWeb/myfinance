---
title: "Replace `any` types with proper typed interfaces"
issue: 126
status: in-progress
priority: medium
labels: tech-debt
---

## Summary

Issue 126: Replace `any` types with proper typed interfaces across 19 files.

## Findings

- 18 eslint-disable directives for `no-explicit-any`
- 62 occurrences of `: any` across codebase
- Key locations:
  - src/lib/converters.ts (Firestore converters, has eslint-disable)
  - src/components/investment/EtfTransactionForm.tsx (many onChange handlers with e: any)
  - src/components/investment/EtfTransactionModal.tsx, BrokerSettingsModal.tsx
  - src/components/forms/TransactionForm.tsx
  - src/store/sanitization/*.ts
  - src/pages/ConfigPage.tsx (handleOpenDialog(config: any), renderExplodedList(cats: any[]))

## Analysis

Many `any` usages are in event handlers (React.ChangeEvent) and Firestore data deserialization. Can replace with proper types:
- ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
- SelectChangeEvent for MUI selects
- Proper typed interfaces for Firestore data (or use existing types)

## Implementation

Started work on fix/YATF-126 branch. Created draft PR #184.

## Plan

1. Fix converters.ts - replace any with proper types where possible
2. Fix EtfTransactionForm.tsx - fix event handler types
3. Fix other investment component forms
4. Fix TransactionForm.tsx if any
5. Fix sanitization utilities
6. Fix ConfigPage.tsx types
7. Remove eslint-disable directives where no longer needed
8. Run lint and typecheck
