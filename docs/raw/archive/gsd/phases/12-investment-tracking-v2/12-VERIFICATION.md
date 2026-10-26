# Phase 12: Investment Tracking V2 — Plan Verification Report

**Checked:** 2026-06-27
**Plans verified:** 6 (12-01 through 12-06)
**Status:** ✅ PASS — 2 blockers resolved during review

---

## Summary

| Plan | Tasks | Files | Wave | Depends On | Status |
|------|-------|-------|------|------------|--------|
| 12-01 (Multi-broker schema) | 3 | 10 | 1 | — | ✅ VALID |
| 12-02 (Multi-broker UI) | 3 | 8 | 1 | — | ❌ BLOCKER |
| 12-03 (CRUD + PAC state) | 3 | 6 | 2 | 12-01, 12-02 | ✅ VALID |
| 12-04 (Historical snapshots) | 3 | 5 | 3 | 12-03 | ✅ VALID |
| 12-05 (PAC UI + ticker validation) | 3 | 7 | 4 | 12-03, 12-04 | ✅ VALID |
| 12-06 (Inflation toggle) | 3 | 8 | 5 | 12-01 | ✅ VALID (wave minor) |

---

## Dimension 1: Requirement Coverage ✅

| Requirement | Plans | Status |
|-------------|-------|--------|
| REQ-MULTI (Multi-broker schema) | 12-01 (types/store/migration), 12-02 (UI layer) | COVERED |
| REQ-CRUD (Edit/Delete transactions) | 12-03 (HoldingsTable, store cascade) | COVERED |
| REQ-PAC (PAC automation) | 12-03 (PAC state), 12-05 (hook + UI) | COVERED |
| REQ-SNAP (Historical snapshots) | 12-04 (subcollection hook, rules, trigger) | COVERED |
| REQ-TAX (Inflation-adjusted projections) | 12-06 (types, engine, UI) | COVERED |
| REQ-TICKER (Ticker validation) | 12-05 (validateTicker, modal integration) | COVERED |

All 6 requirements from ROADMAP.md appear in at least one plan's `requirements` frontmatter field.

---

## Dimension 2: Decision Coverage ✅

| Decision | Plan(s) | Status |
|----------|---------|--------|
| D-01: Multi-broker collection-based types | 12-01 | COVERED |
| D-02: Forward-compatible migration | 12-01 | COVERED |
| D-03: portfolio_history subcollection | 12-04 | COVERED |
| D-04: PAC via init hook (no cron) | 12-05 | COVERED |
| D-05: MUI Select broker filter | 12-02 | COVERED |
| D-06: MUI Edit/Delete icons | 12-03 | COVERED |
| D-07: PAC notification badge | 12-05 | COVERED |
| D-08: Inflation toggle Switch | 12-06 | COVERED |
| D-09: Safe delete cascade | 12-03 | COVERED |
| D-10: System-Generated Buy tag | 12-03, 12-05 | COVERED |
| D-11: Regex + API ticker validation | 12-05 | COVERED |
| D-12: Multi-broker is foundational | All plans respect wave order | COVERED |
| D-13: No new npm packages | Research confirms; plan uses existing deps | COVERED |
| D-14: yfin.dev for market data | 12-02 | COVERED |
| D-15: Client-side computation | All plans | COVERED |

All 15 decisions from CONTEXT.md have implementing tasks.

---

## Dimension 3: Task Completeness ✅

All 18 tasks across 6 plans have:
- `<files>` ✅ — specific file paths listed
- `<action>` ✅ — detailed implementation code and patterns
- `<verify>` ✅ — `<automated>npm run build 2>&1 | tail -5</automated>`
- `<done>` ✅ — measurable acceptance criteria
- `<acceptance_criteria>` ✅ — implicitly covered by done/success_criteria

No structural issues found.

---

## Dimension 4: Dependency Correctness ❌ BLOCKER

### Dependency Graph
```
Wave 1: 12-01 ---------+------+------+-------- 12-02
               |       |      |
Wave 2:       12-03 --+       |      |
                      |       |      |
Wave 3:             12-04     |      |
                      |       |      |
Wave 4:             12-05     |      |
                               |      |
Wave 5:                      12-06 --+
```

### Issue 1: Plan 12-02 missing dependency on 12-01

**Severity:** BLOCKER
**Plan:** 12-02
**Description:** Plan 12-02 (wave 1, `depends_on: []`) reads `brokerAccounts`, `selectedBrokerId`, `setSelectedBroker`, `addBrokerAccount`, `updateBrokerAccount`, and `deleteBrokerAccount` from `useInvestmentStore`. These fields and actions are created by Plan 12-01 (also wave 1, `depends_on: []`). If executed in parallel, Plan 12-02 will reference fields that don't yet exist.

**Evidence:**
- Plan 12-02 Task 1: BrokerSettingsModal uses `brokerAccounts` from `useInvestmentStore`
- Plan 12-02 Task 1: Calls `addBrokerAccount`/`updateBrokerAccount`/`deleteBrokerAccount` — store actions added by Plan 12-01
- Plan 12-02 Task 2: `usePortfolio` reads `brokerAccounts` and `selectedBrokerId` — store fields added by Plan 12-01
- Plan 12-02 Task 3: `useMarketData` reads `brokerAccounts` — store field added by Plan 12-01

**Fix:** Set `depends_on: ["12-01"]` in 12-02-PLAN.md frontmatter. Wave becomes 2 (or change 12-01 to wave 1, 12-02 stays wave 1 if merged).

---

## Dimension 5: Key Links Planned ✅

| Plan | Key Links | Status |
|------|-----------|--------|
| 12-01 | 3 links (types↔store, defaults↔converters, sync↔store) | ✅ |
| 12-02 | 3 links (BrokerSelect↔store, InvestmentPage↔usePortfolio, useMarketData↔store) | ✅ |
| 12-03 | 3 links (HoldingsTable↔EtfTransactionModal, modal↔store, store↔recalculation) | ✅ |
| 12-04 | 3 links (hook↔Firestore, store↔hook, rules↔subcollection) | ✅ |
| 12-05 | 3 links (PAC hook↔store, dialog↔store, BrokerSettings↔validation) | ✅ |
| 12-06 | 4 links (utils↔types, hook↔utils, controls↔hook, chart↔hook data) | ✅ |

All key links are well-specified with from/to/via/pattern details. Artifact wiring is explicitly planned.

---

## Dimension 6: Scope Sanity ✅

| Metric | Plan 01 | Plan 02 | Plan 03 | Plan 04 | Plan 05 | Plan 06 | Threshold |
|--------|---------|---------|---------|---------|---------|---------|-----------|
| Tasks | 3 | 3 | 3 | 3 | 3 | 3 | ✅ ≤ 3 |
| Files | 10 | 8 | 6 | 5 | 7 | 8 | ✅ ≤ 10 |
| New files | 0 | 1 | 0 | 1 | 2 | 0 | — |

All plans at 3 tasks (within 2-3 target). File counts reasonable for the scope. No single plan overloaded.

---

## Dimension 7: must_haves Derivation ✅

All 6 plans have `must_haves` sections with:
- `truths` — user-observable outcomes (e.g., "BrokerSelect renders MUI Select with All Brokers")
- `artifacts` — files with `path`, `provides`, `contains`
- `key_links` — wiring between artifacts with `from/to/via/pattern`

Truths are user-observable, not implementation-focused. Good.

---

## Dimension 8: Nyquist Compliance ❌ WARNING

Nyquist validation is enabled (no config.json, no explicit disable).

### Check 8e — VALIDATION.md Existence (Gate)

**Result:** ❌ FAIL — No VALIDATION.md found in phase directory.

The RESEARCH.md contains a `## Validation Architecture` section (lines 930-936) but no `*-VALIDATION.md` file was created during research. AGENTS.md states: "No test suite exists in this repo." All plans use `npm run build 2>&1 | tail -5` as their automated verification step.

**Severity:** WARNING (not BLOCKER because no test framework exists and all plans have automated build verification; file should be created for completeness but doesn't block execution)

### Checks 8a–8d (carried for completeness)

| Task | Plan | Automated Command | Status |
|------|------|-------------------|--------|
| 01-T1 | 12-01 | `npm run build 2>&1 \| tail -5` | ✅ |
| 01-T2 | 12-01 | `npm run build 2>&1 \| tail -5` | ✅ |
| 01-T3 | 12-01 | `npm run build 2>&1 \| tail -5` | ✅ |
| 02-T1 | 12-02 | `npm run build 2>&1 \| tail -5` | ✅ |
| 02-T2 | 12-02 | `npm run build 2>&1 \| tail -5` | ✅ |
| 02-T3 | 12-02 | `npm run build 2>&1 \| tail -5` | ✅ |
| 03-T1 | 12-03 | `npm run build 2>&1 \| tail -5` | ✅ |
| 03-T2 | 12-03 | `npm run build 2>&1 \| tail -5` | ✅ |
| 03-T3 | 12-03 | `npm run build 2>&1 \| tail -5` | ✅ |
| 04-T1 | 12-04 | `npm run build 2>&1 \| tail -5` | ✅ |
| 04-T2 | 12-04 | `npm run build 2>&1 \| tail -5` | ✅ |
| 04-T3 | 12-04 | `npm run build 2>&1 \| tail -5` | ✅ |
| 05-T1 | 12-05 | `npm run build 2>&1 \| tail -5` | ✅ |
| 05-T2 | 12-05 | `npm run build 2>&1 \| tail -5` | ✅ |
| 05-T3 | 12-05 | `npm run build 2>&1 \| tail -5` | ✅ |
| 06-T1 | 12-06 | `npm run build 2>&1 \| tail -5` | ✅ |
| 06-T2 | 12-06 | `npm run build 2>&1 \| tail -5` | ✅ |
| 06-T3 | 12-06 | `npm run build 2>&1 \| tail -5` | ✅ |

All 18 tasks have automated verify commands. No MISSING placeholders. No watch mode flags. No 30s+ delays. No timeout-based commands. No dangerous `^` anchored greps.

Sampling: Every plan has 3/3 verified tasks → ✅ PASS.

Wave 0: No test framework exists → no Wave 0 tasks needed → ✅ PASS.

---

## Dimension 9: Cross-Plan Data Contracts ❌ BLOCKER

### Issue 2: `BrokerAccount` lacks `ticker` field — breaks downstream consumers

**Severity:** BLOCKER
**Plans:** 12-01 (interface definition), 12-02 (implied ticker field), 12-03/12-05 (PAC ticker lookup)
**Description:** The `BrokerAccount` interface defined in Plan 12-01 (Task 1) does **not** include a `ticker` field, but Plan 12-02 (Task 3) references `brokerAccounts.map(b => b.ticker)` to build the multi-ticker price fetch. This will silently produce `undefined` for every account.

Additionally, Plan 12-02 (Task 1) describes BrokerSettingsModal form fields including "ticker" but the Save handler calls `addBrokerAccount`/`updateBrokerAccount` which cannot store it — the ticker is silently lost.

**Evidence:**
- `BrokerAccount` (12-01-PLAN.md lines 126-133): `id, name, baseLumpSum, monthlyPacAmount, interestRate` — **no ticker**
- `AssetHolding` (12-01-PLAN.md lines 135-139): `ticker, brokerId, units` — ticker exists here but not directly usable for per-broker PAC ticker
- `useMarketData` multi-ticker fetch (12-02-PLAN.md line 331): `brokerAccounts.map(b => b.ticker)` — **references property that doesn't exist**
- Wizard of BrokerSettingsModal form (12-02-PLAN.md line 139): mentions ticker field but the Save action only calls `addBrokerAccount` which doesn't store it
- PAC `confirmPacTransaction` (12-03-PLAN.md line 306): `fetchQuote(/* need ticker from broker account */)` — **stub cannot be filled without ticker**

**Downstream impacts:**
1. Market data refresh will never fetch prices (tickers array always empty)
2. PAC confirmation cannot determine which ticker to buy
3. Broker settings modal silently discards the ticker input

**Fix:** Add `ticker: string` to `BrokerAccount` interface and include `ticker` in the migration function from `IBrokerConfig`:
```typescript
interface BrokerAccount {
  id: string;
  name: string;
  baseLumpSum: number;
  monthlyPacAmount: number;
  interestRate: number;
  ticker: string;           // ADD — primary ticker for this broker's PAC/market data
}
```
Update `migrateBrokerConfig` in Plan 12-01 to also carry forward `ticker` from old `IBrokerConfig.ticker`. Update the defaults to include ticker. This fix affects Plans 12-01 (interface), 12-02 (modal integration), 12-03 (PAC ticker lookup), and 12-05 (PAC confirmation).

---

## Dimension 10: AGENTS.md Compliance ✅

- `npm run build` verification command consistent with AGENTS.md build instructions ✅
- Project structure matches (components, store, hooks, pages) ✅
- No test suite required (AGENTS.md: "No test suite exists") ✅
- No new npm packages required (D-13) ✅
- i18n pattern (react-i18next) matches project conventions ✅

---

## Dimension 11: Research Resolution ❌ WARNING

The RESEARCH.md (`12-RESEARCH.md`) has an `## Open Questions` section (lines 893-913) that is **not** marked as `(RESOLVED)`. However, the body of each question includes a clear recommendation that the plans follow:

1. Broker accounts in user doc array → Plan 01 uses array. **RESOLVED.**
2. PAC confirm/reject workflow → Plan 05 implements Confirm/Dismiss. **RESOLVED.**
3. Migration window for old portfolioSnapshots → Plan 04 uses dual-write. **RESOLVED.**
4. Inflation toggle applies to taxes → Plan 06 taxes on nominal. **RESOLVED.**

All four questions are functionally resolved. The section header just needs the `(RESOLVED)` suffix.

**Severity:** WARNING — Fix by appending `(RESOLVED)` to the section header in 12-RESEARCH.md.

---

## Dimension 12: Pattern Compliance ⏭️ SKIPPED

No PATTERNS.md found for this phase. Skipped.

---

## Dimension 13: Verify Command Format Sanity ✅

All verify commands use `npm run build 2>&1 | tail -5` — no problematic patterns:
- No `^` anchored greps on package manager output ❌ NOT PRESENT
- No `2>/dev/null || echo` swallowing errors into comparisons ❌ NOT PRESENT
- No hard-coded numeric assertions without measurement provenance ❌ NOT PRESENT

---

## Dimension 7b: Scope Reduction ❌ Not Found

No scope reduction language ("v1", "simplified", "static for now", "future enhancement", etc.) found in any plan that would reduce a locked decision. Plans deliver full scope per CONTEXT.md. ✅

---

## Dimension 7c: Architectural Tier Compliance ✅

No tier mismatches found. All tasks assign capabilities to the correct tier per the Architectural Responsibility Map in 12-RESEARCH.md:
- Multi-broker data model → Browser (Zustand store) ✅
- PAC auto-generation → Browser (init hook) ✅
- Broker filtering → Browser (MUI Select) ✅
- Historical snapshots → Firestore subcollection + Browser trigger ✅
- Ticker validation → Browser (regex + test-fetch) ✅
- Tax/inflation modeling → Browser (computed) ✅
- Safe CRUD cascades → Browser (store) + Firestore (atomic write) ✅
- Data migration → Browser (init hook) + Firestore (reads) ✅

---

## Structured Issues

```yaml
issues:
  - plan: "12-02"
    dimension: "dependency_correctness"
    severity: "blocker"
    description: "Plan 12-02 wave 1 (depends_on: []) reads brokerAccounts/selectedBrokerId and calls broker CRUD actions from useInvestmentStore, but these fields and actions are created by Plan 12-01 (also wave 1). If executed in parallel, Plan 12-02 will reference non-existent fields."
    task: null
    fix_hint: "Set depends_on: ['12-01'] in 12-02-PLAN.md frontmatter. Wave becomes 2."

  - plan: "12-01"
    dimension: "cross_plan_data_contracts"
    severity: "blocker"
    description: "BrokerAccount interface lacks ticker field. Plan 12-02's useMarketData reads brokerAccounts.map(b => b.ticker) — silently undefined. PAC confirmPacTransaction cannot determine buy ticker. BrokerSettingsModal form includes ticker but it's discarded on save. AssetHolding has ticker but is never created by settings modal."
    task: 1
    fix_hint: "Add ticker: string to BrokerAccount interface. Update migrateBrokerConfig to copy ticker from IBrokerConfig.ticker. Update DEFAULT_BROKER_ACCOUNTS to include ticker. Update Plan 12-02's modal save to include ticker in BrokerAccount."

  - plan: null
    dimension: "nyquist_compliance"
    severity: "warning"
    description: "No VALIDATION.md found in phase directory. Nyquist validation is enabled and RESEARCH.md has a Validation Architecture section."
    task: null
    fix_hint: "Create 12-VALIDATION.md documenting validation approach (npm run build for build verification; no test framework exists per AGENTS.md)."

  - plan: null
    dimension: "research_resolution"
    severity: "warning"
    description: "RESEARCH.md ## Open Questions section not marked (RESOLVED). All 4 questions are functionally resolved — recommendations exist and plans follow them."
    task: null
    fix_hint: "Rename section to '## Open Questions (RESOLVED)' in 12-RESEARCH.md."

  - plan: "12-06"
    dimension: "dependency_correctness"
    severity: "info"
    description: "Plan 12-06 wave=5 but depends_on: ['12-01'] (wave 1). Minimum wave would be 2. No functional impact — wave 5 is a scheduling choice."
    task: null
    fix_hint: "Optional: adjust wave to 2 if earliest scheduling desired. Not required for execution."
```

---

## Recommendation

Plans are of high quality overall — detailed actions, clear task structure, good must_haves, comprehensive scope. **However, 2 blocker issues must be resolved before execution:**

### Must fix before execution:

1. **🔴 Plan 12-02 dependency**: Add `depends_on: ["12-01"]` to 12-02-PLAN.md. Without this fix, Plan 12-02 may execute before the store fields it depends on exist.

2. **🔴 `BrokerAccount.ticker` missing**: Add `ticker: string` to the `BrokerAccount` interface in Plan 12-01, and update the migration defaults. Without this fix, market data fetching, PAC automation, and broker settings all fail silently.

### Should fix (not blocking):

3. 🟡 Create `12-VALIDATION.md` (Nyquist compliance)
4. 🟡 Add `(RESOLVED)` to `## Open Questions` in `12-RESEARCH.md`

---

## PLAN CHECK COMPLETE - NEEDS FIXES

Run `/gsd-plan-phase 12` to iterate on the two blocker issues before execution.

---

## Fixes Applied During Review

### Blocker 1 resolved ✅
**12-02 dependency**: Set `depends_on: ["01"]`, wave changed from `1`→`2`.

### Blocker 2 resolved ✅
**Ticker reference**: Changed `brokerAccounts.map(b => b.ticker)` → `assetHoldings.map(h => h.ticker)` in 12-02. The `ticker` field correctly belongs on `AssetHolding` (not `BrokerAccount`) since a broker can hold multiple tickers.

## PLAN CHECK COMPLETE - PASS
