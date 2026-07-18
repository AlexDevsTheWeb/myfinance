---
type: Plan
description: "MAX PRIORITY: six-phase SaaS launch plan from quick wins through beta to monetization."
title: "Go-to-Market Plan"
tags: [plan, strategy, go-to-market, saas]
created: 2026-07-11
updated: 2026-07-12
status: active
sources: ["raw/go-to-market/go-to-market.md", "raw/138-go-to-market/phase-1-analysis.md"]
related: ["wiki/plans/roadmap", "wiki/architecture/concerns-and-tech-debt", "wiki/decisions/saas-readiness", "wiki/queries/app-review", "wiki/features/pac-automation/pac-automation", "wiki/plans/beta-launch-playbook"]
---

# Plan: Go-to-Market

Status: `active` — Phase 0 ✅, Phase 1 ✅
Priority: **maximum**

**Branches:** Phase 0 + 1.3/1.2 → `feat/YATF-138` merged to `development` (PR #140). Phase 1.1 → `feat/YATF-138-sub-collection` (PR #141).

## Goal

Turn MyFinance (YAFT) into a validated SaaS product. Ship fast, validate with real users, monetize only after proven retention.

## Phases

### Phase 0 — Quick Wins (Week 1)

Fix immediate embarrassments before showing the app to anyone.

- [x] Fix ticker bug — `BrokerAccount.ticker` not persisted
- [x] Add error boundary — wrap app to catch render crashes
- [x] Swap `alert()`/`confirm()` → MUI dialogs in ConfigPage
- [x] Add loading states (skeletons/spinners) on Dashboard, Transactions, Investments

### Phase 1 — Secure the Data (Weeks 2-3)

Architectural hardening to prevent data loss before beta.

**Recommended order:** 1.3 → 1.2 → 1.1 (smallest/fastest first, biggest last)

#### 1.3 Fix Recurring Transaction Race Condition (smallest — do first)

`checkRecurring()` called from 3 sources without debouncing: `onSnapshot`, `addRecurring()`, `updateRecurring()`. Guard `isCheckingRecurring` flag only prevents re-entrance, not concurrent calls.

**Solution:**
- Add `lastGeneratedUpTo` field to `IRecurringTransaction` for Firestore-side dedup
- Add session-level ref guard (runs at most once per session)
- Add timestamp-based debounce (min 5s between checks)

**Files:** `src/store/useFinanceStore.ts`, `src/store/types/finance.types.ts`

- [x] Add `lastGeneratedUpTo` to `IRecurringTransaction` type
- [x] Update `checkRecurring` to use Firestore-side dedup via `lastGeneratedUpTo`
- [x] Add session debounce ref in sync hook
- [x] Add timestamp-based cooldown guard in store

#### 1.2 Move PAC State from localStorage to Firestore ✅

PAC state split across Zustand memory (`pendingPacTransaction`, `lastPacGenerationDate`) + localStorage (`pac_last_{brokerId}`). Lost on browser clear, no cross-device sync.

**Solution:**
- Add `pacState` field to `users/{uid}` doc with `lastGenerationDate`, `pendingTransaction`, `perBrokerLastGeneration`
- Update `usePacAutomation` to read/write Firestore instead of localStorage
- Write `lastGenerationDate` after each PAC confirmation

**Files:** `src/hooks/usePacAutomation.ts`, `src/store/useInvestmentStore.ts`, `src/lib/converters.ts`, `src/components/investment/PacConfirmationDialog.tsx`

- [x] Add `pacState` to `UserDoc` interface in converters
- [x] Update `usePacAutomation` to read `pacState` from Firestore on mount
- [x] Update `confirmPacTransaction` to persist `pacState` to Firestore
- [x] Remove `pendingPacTransaction` fallback in Zustand (now in Firestore)
- [x] One-time migration script: read localStorage keys → write to Firestore

#### 1.1 Migrate Transactions to Sub-collection (largest — do last) ✅

All transactions stored as array in `users/{uid}` doc. Every write rewrites the entire array. Hits 1 MiB limit, no pagination, costly writes.

**Solution:**
- Phase A: Dual-write (array + sub-collection) — ✅
- Phase B: One-time backfill script — ✅
- Phase C: Flip reads (`useSyncFinance` → sub-collection listener) — ✅
- Phase D: Remove legacy array field — ✅ (only user, backups taken)

- [x] Add `TransactionDoc` type and sub-collection converter (`src/lib/converters.ts`)
- [x] Update `firestore.rules` with sub-collection read/write rules
- [x] Dual-write: write to both array + sub-collection in CRUD operations
- [x] One-time backfill script (`backfillTransactionsToSubCollection` in `src/store/sync/index.ts`)
- [x] Flip reads: `useSyncFinance` listens to sub-collection
- [x] Remove legacy `transactions` field from `UserDoc` (Phase D)

---

[Detailed analysis](raw/138-go-to-market/phase-1-analysis.md)

### Phase 2 — Soft Beta Launch (Week 4)

See the detailed [[wiki/plans/beta-launch-playbook|Beta Launch Playbook]] for execution checklist, disclaimer component, backup/restore verification, and invitation template.

- [x] Implement beta disclaimer banner on Dashboard — [#149](https://github.com/AlexDevsTheWeb/myfinance/pull/151)
- [x] Execute backup/restore verification protocol (post sub-collection migration) — verified, no code changes needed [#150](https://github.com/AlexDevsTheWeb/myfinance/issues/150)
- [ ] Recruit 10-15 beta testers from: r/ItaliaPersonalFinance, r/ETFs_Italia, Forum FinanzaOnline, dev Twitter/LinkedIn, personal network
- [ ] Beta deal: free access in exchange for bug reports + feature feedback
- [ ] Set up feedback channel (Telegram or Discord)
- [ ] Weekly check-in with testers
- [ ] Public changelog so testers see progress

### Phase 3 — Validate (Weeks 5-8)

Do NOT monetize until these signals appear:

- [ ] At least 5 users logging in weekly after 1 month
- [ ] Users adding transactions regularly
- [ ] Investment tracking being actively used
- [ ] Users asking "when can I pay?" or "can I invite someone?"
- [ ] Critical bug reports slowed to a trickle

If validation fails → pause, interview users, find the gap, iterate.
If validation passes → proceed to Phase 4.

### Phase 4 — Monetization (Week 9+)

- [ ] Stripe integration — €5-7/mo subscription
- [ ] Free tier: limited (50 txn/mo or 1 account)
- [ ] Annual discount (~€50-60/yr)
- [ ] Grandfather beta users — lifetime 50% discount or "Founder's Plan"
- [ ] Landing page: hero + screenshots + pricing + "Inizia gratis" CTA

### Phase 5 — Clean Up (Ongoing, Post-Revenue)

Only after revenue validates the effort:

- [ ] Split ConfigPage (~1054 lines)
- [ ] Split CarPage (~695 lines)
- [ ] Remove `any` types in 19 files
- [ ] Write tests for new features moving forward
- [ ] Set up CI/CD

## References

- Issue: [#138](https://github.com/AlexDevsTheWeb/myfinance/issues/138)
- Phase 1 analysis: [raw/138-go-to-market/phase-1-analysis.md](raw/138-go-to-market/phase-1-analysis.md)
- Source: [raw/go-to-market/go-to-market.md](raw/go-to-market/go-to-market.md)
- Related: [[wiki/decisions/saas-readiness]], [[wiki/queries/app-review]], [[wiki/architecture/concerns-and-tech-debt]], [[wiki/features/pac-automation/pac-automation]]
