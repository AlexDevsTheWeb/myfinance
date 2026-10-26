# Phase 03: Input Validation - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning
**Source:** ROADMAP.md (Phase 03) + discuss-phase

<domain>
## Phase Boundary

This phase adds input validation to transaction forms and store operations:

1. **Amount validation (> 0)** — Ensure transaction amounts are positive numbers
2. **Date validation** — Validate dates are reasonable (no hard limits)
3. **Remove hardcoded category logic** — Replace hardcoded 'Bollette' checks with configurable utility field handling
</domain>

<decisions>
## Implementation Decisions

### Amount Validation
- Transaction amount must be > 0 (not zero or negative)
- Apply validation in both UI form and store-level operations
- Show inline error message when validation fails

### Date Validation
- **D-01:** No hard date bounds — agent decides reasonable validation
- D-02: Apply to transaction date, recurring start/end dates, utility reading dates

### Hardcoded Category Logic
- Remove hardcoded checks: `category === 'Bollette' && (subcategory === 'Elettricità' || subcategory === 'Gas')`
- Implement configurable approach: utility fields (consumption, reading dates) display based on subcategory metadata, not hardcoded strings

### Validation Approach
- **D-03:** Agent decides — use React Hook Form + Zod OR inline validation based on codebase patterns

### the agent's Discretion
- Exact validation library choice
- Error message text and localization
- Store-level validation implementation
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Files
- `src/components/forms/TransactionForm.tsx` — Main transaction input form
- `src/store/useFinanceStore.ts` — State store with transaction CRUD operations

### Patterns to Follow
- Use existing error handling patterns from Phase 02 (snackbar notifications)
- Follow MUI form validation patterns
</canonical_refs>

<specifics>
## Specific Ideas

From ROADMAP.md Phase 03:
- Add amount validation (> 0)
- Add date bounds checking
- Remove hardcoded category logic for utility fields
</specifics>

<deferred>
## Deferred Ideas

None — all Phase 03 items are in scope.
</deferred>

---

*Phase: 03-input-validation*
*Context gathered: 2026-04-23*