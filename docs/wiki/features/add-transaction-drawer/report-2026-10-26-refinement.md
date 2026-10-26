---
type: Report
title: "Implementation Report — Add Transaction Drawer refinement"
description: "Unified input styling, accent-coloured and auto-formatted amount, and full-viewport mobile layout for the transaction drawer — plus a same-day suffix rule for reports."
resource: "https://github.com/AlexDevsTheWeb/myfinance/pull/200"
tags: [report, transactions, ui, frontend, mobile]
created: 2026-10-26
updated: 2026-10-26
status: shipped
sources: ["raw/2026-10-UI-refactor/2026-10-26-transactions-refinement.md"]
related: ["wiki/features/add-transaction-drawer/add-transaction-drawer"]
---

# Implementation Report — Add Transaction Drawer refinement

**Branch:** `feat/add-transaction-drawer-refinement` · **PR:** [#200](https://github.com/AlexDevsTheWeb/myfinance/pull/200) (stacked on [#199](https://github.com/AlexDevsTheWeb/myfinance/pull/199)) · **Status:** shipped

## Context

The drawer from #199 worked but looked unfinished: three different input
surfaces, a white hover border on a dark palette, an amount field whose digits
ignored the type colour, raw unformatted numbers, and a fixed 480px panel on
mobile.

This branch is based on `feat/add-transaction-drawer`, not `development` — the
refinement edits a component that only exists there. GitHub retargets the PR to
`development` once #199 merges.

The prompt's reference screenshot (`Screenshot 2026-10-26 alle 14.53.21.png`) was
not in the repository, so the work follows the written spec.

## Changes

| Area | What changed |
|---|---|
| `components/transactions/drawer.styles.ts` | New — `drawerTextFieldSx`, `drawerSelectSx`, `drawerDateFieldSx` |
| `AddTransactionDrawer.tsx` | All fields outlined with the shared style; date fields monospaced with a muted calendar icon; amount digits take the tab colour; mobile viewport layout + safe-area footer; 48px action buttons |
| `transactionDrawer.utils.ts` | `formatAmountInput`, `parseAmountInput`; validation, `draftToTransaction` and `buildRecurringTemplate` all parse the formatted string |
| `transactionDrawer.utils.test.ts` | 11 new cases (grouping, decimal normalisation, trailing comma, decimal cap, round-trip) |

## Decisions

1. **Shared style module, not per-field overrides.** Three components have three
   different internal DOM shapes (TextField nests `.MuiOutlinedInput-root`, Select
   *is* the outlined root, DatePicker wraps a TextField). Keeping the rules in one
   file makes the differences explicit instead of scattering `sx` blobs.
2. **Format while typing, not on blur.** Blur formatting hides the value the user
   is about to confirm; live formatting shows exactly what will be saved. The cost
   is that the caret jumps to the end of the field — acceptable for a currency
   input, worth confirming on a real device.
3. **Parsing is the single entry point.** `parseAmountInput` is used by
   validation, the transaction payload and the recurring template, so no
   downstream code ever receives `"2.123,45"`. The round-trip is unit-tested.
4. **Disambiguation rules.** A single dot with one or two trailing digits is a
   decimal separator (`42.5` → 42,5); repeated dots or three trailing digits are
   thousands (`2.123` → 2.123). Ambiguity is unavoidable when accepting both
   notations; the Italian reading wins.
5. **Theme tokens over literal hex.** The prompt asks for `#334155` hover and
   `#0B0E14` surface; the drawer uses `colors.borderLight` (#475569) and
   `colors.bg` (#0B0F17) so it stays consistent with the rest of the app instead
   of introducing near-duplicate colours.
6. **No `react-number-format`.** A 40-line formatter/parser pair is smaller than
   a dependency and is testable without a DOM.
7. **Report filenames gain an optional suffix.** Two implementations on the same
   day collided on `report-YYYY-MM-DD.md`. This report is
   `report-2026-10-26-refinement.md`; the schema, the `wiki-sync` skill and the
   validator were updated together so the rule exists before the second use, not
   after.

## Deviations

| Request | Shipped | Agreed? |
|---|---|---|
| `#334155` hover, `#0B0E14` surface | `colors.borderLight`, `colors.bg` | Judgement — palette consistency |
| `react-number-format` or mask library | custom `formatAmountInput` / `parseAmountInput` | Judgement — no new dependency |
| `size="medium"` 48px | outlined medium with `minHeight: 48` on every control | Equivalent |
| Update `docs/reports/` | wiki report beside the feature | Merged convention |
| "Open a follow-up PR or commit to `feat/...refinement`" | follow-up stacked PR | Followed |

## Verification

```bash
npx tsc -b
# clean (after fixing a duplicated slotProps attribute on the amount field)

npm run build
# ✓ built

npx vitest run
# 15 files / 254 tests passed — 13 new for the amount formatter/parser and the tab reset

npm run lint
# 6 errors / 3 warnings — unchanged baseline, no new problems

python3 docs/scripts/okf_validate.py
# clean, including the new suffixed report filename
```

The one test failure during the work was legitimate: `transactionToDraft` now
returns the Italian-formatted amount (`88,4`), so the round-trip expectation was
updated rather than the behaviour.

## Follow-up fixes (same PR)

Three issues found in use after the refinement:

1. **An expense amount appeared under the Income tab.** The drawer keeps one
   `draft` for all tabs and `handleTypeChange` only reset the category fields, so
   the amount (and description, consumption and billing period) survived a tab
   switch. Not intended: `resetDraftForType()` now clears the type-specific
   fields and keeps only the shared context (date, account, card). Two tests lock
   the behaviour, including that it does not mutate the original draft.
2. **Category and subcategory stacked vertically.** They now share one row.
3. **The Date field was heavier than the billing-period fields.** It now uses the
   same `size="small"` picker, so the three date inputs match.

## Not verified / deferred

- **No browser pass at 375px and 1280px.** The prompt asks for devtools
  verification; that could not be run here. The responsive rules are structural
  (viewport units, pinned regions, safe-area padding) but unconfirmed visually.
- **No E2E test** for the typing mask or the mobile keyboard behaviour.
- **Caret position**: formatting moves the caret to the end while editing an
  existing value. No regression risk for new entries; slightly awkward when
  fixing a digit in the middle.
- **Stacked PR ordering**: this cannot merge before #199.

## Wiki pages touched

- Created `wiki/features/add-transaction-drawer/report-2026-10-26-refinement.md` (this file)
- Updated `wiki/features/add-transaction-drawer/add-transaction-drawer.md` — new *Refinement* section and report link
- Updated `docs/AGENTS.md`, `.claude/skills/wiki-sync/SKILL.md`, `docs/scripts/okf_validate.py` — same-day report suffix rule
- Updated `docs/log.md`
- Raw source kept: `raw/2026-10-UI-refactor/2026-10-26-transactions-refinement.md`

## Related

- Parent: [[wiki/features/add-transaction-drawer/add-transaction-drawer]]
- Previous report: [[wiki/features/add-transaction-drawer/report-2026-10-26]]
- Source: [prompt](../../../raw/2026-10-UI-refactor/2026-10-26-transactions-refinement.md)
