---
type: Feature
description: "Native alert()/confirm() replaced with MUI Dialog and Snackbar components."
title: "MUI Dialogs"
tags: [feature, ux, go-to-market]
created: 2026-07-12
updated: 2026-07-12
status: implemented
sources: ["openspec/changes/go-to-market-phase-0/"]
related: ["wiki/plans/go-to-market", "wiki/features/sidebar-redesign/sidebar-redesign"]
---

# Feature: MUI Dialogs

Status: `implemented`

## Description

Replaced all native `alert()`/`confirm()` browser dialogs with MUI `Dialog`/`Snackbar` components for a professional appearance.

## Implementation

### New Components

- `src/components/shared/ConfirmDialog.tsx` — reusable MUI Dialog with title, message, confirm/cancel buttons
- `src/components/shared/AlertSnackbar.tsx` — reusable MUI Snackbar + Alert for notifications

### Files Modified

| File | Replacements |
|------|-------------|
| `src/pages/ConfigPage.tsx` | 8 instances (4 alert → AlertSnackbar, 4 confirm → ConfirmDialog) |
| `src/pages/InvestmentPage.tsx` | 1 confirm → ConfirmDialog |
| `src/components/dashboard/TransactionTable.tsx` | 1 confirm → ConfirmDialog |

## Motivation

Native browser dialogs look unprofessional and break PWA UX. Beta users would notice immediately. Part of [#138](https://github.com/AlexDevsTheWeb/myfinance/issues/138) Phase 0.

## Related

- [[wiki/plans/go-to-market]]
- [[wiki/features/error-boundary/error-boundary]]
