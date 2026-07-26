## Context

MyFinance stores all user data in a single `users/{uid}` Firestore document. Transactions are kept as an array field — every write rewrites the entire array, risking the 1 MiB document limit and preventing pagination. PAC automation state (`pendingPacTransaction`, `lastPacGenerationDate`, per-broker tracking) lives in Zustand memory + localStorage, so clearing browser data or switching devices resets the automation trail. The `checkRecurring()` function, called from three sources without proper debouncing, can generate duplicate recurring transactions under concurrent snapshot events.

Phase 0 (Quick Wins) is complete. Phase 1 hardens the data layer before beta users arrive.

## Goals / Non-Goals

**Goals:**
- Migrate transactions to a Firestore sub-collection with zero data loss
- Persist PAC automation state to Firestore for cross-device reliability
- Eliminate duplicate recurring transactions via Firestore-side dedup + session debounce
- Maintain backward compatibility during migration (dual-write phase)

**Non-Goals:**
- Adding pagination to transactions (trivial after migration, separate concern)
- Splitting other array fields (accounts, categories, etc.) — stay focused on highest-risk data
- Performance optimization beyond what sub-collections naturally provide
- Cross-device testing infrastructure

## Decisions

### D1: Implement in reverse-risk order (1.3 → 1.2 → 1.1)
**Rationale:** 1.3 (recurring dedup) is the smallest change with the highest safety impact — do it first to stabilize the data layer. 1.2 (PAC state) is medium complexity and standalone. 1.1 (sub-collection) is the largest and riskiest — do it last, after the other changes have settled.
**Alternatives considered:** Risk-first order (1.1 first if you want to fail fast). Rejected because a failed migration with incomplete rollback would block beta.

### D2: Sub-collection migration uses dual-write pattern
**Rationale:** Dual-write (write to both array and sub-collection) allows atomic rollback — if the sub-collection path breaks, readers fall back to the array field. Pure sub-collection from day one would force all users through a blocking migration.
**Phases:** A (dual-write) → B (backfill) → C (flip reads) → D (remove legacy). Each phase is independently deployable.

### D3: `pacState` as a single Firestore field (not sub-collection)
**Rationale:** PAC state is small (< 1 KB per user) and rarely written (once per month per broker). A sub-collection adds complexity for no benefit. A single `pacState` field on the user doc is simpler, cheaper, and consistent with how we handle other small config state (e.g., `projectionSettings`).
**Alternatives considered:** Sub-collection `users/{uid}/pac/{stateId}` — rejected for over-engineering.

### D4: `lastGeneratedUpTo` field on recurring transaction for dedup
**Rationale:** Each recurring transaction template tracks the last month it generated up to. When `checkRecurring` runs, it starts from `lastGeneratedUpTo` instead of scanning all history. This is atomic — the same write that creates new transactions also advances `lastGeneratedUpTo`. Eliminates the race condition at the Firestore level.
**Alternatives considered:** Timestamp-based lock file — rejected because it's fragile under concurrent tabs. Server-side timestamps — rejected because we don't have a backend.

## Risks / Trade-offs

- **Sub-collection migration complexity:** Largest change in the app's data layer. Mitigation: dual-write pattern with clear phase gates; test with real data copy before flipping reads.
- **Legacy readers during dual-write:** Pages reading from the array may briefly see stale data if writes complete asynchronously. Mitigation: array is updated optimistically first, then sub-collection; acceptable for <1s window.
- **PAC state field conflicts:** Three sync hooks (`useSyncFinance`, `useInvestmentSync`, `useBudgetSync`) independently write to the user doc. Mitigation: `pacState` updates in `usePacAutomation` are independent of the finance/investment sync hooks.
- **Backfill script failure:** Array-to-sub-collection backfill could miss transactions if users write during migration. Mitigation: run backfill during a maintenance window; validate counts before and after.
