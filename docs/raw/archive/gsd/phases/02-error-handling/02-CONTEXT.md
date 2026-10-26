# Phase 02: Error Handling - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Improve Firestore error handling in the Zustand stores. Wrap all Firestore write operations (updateDoc calls) with try-catch. Add loading states and user feedback for network failures. This does NOT include offline support (Phase 06) or retry logic.

</domain>

<decisions>
## Implementation Decisions

### Error feedback
- **D-01:** Show user feedback only on failure, not on success
- **D-02:** Agent decides best mechanism (toast vs banner) based on MUI integration patterns

### Loading experience
- **D-03:** Non-blocking indicators — subtle spinner/near affected element, no full UI block
- **D-04:** Optimistic updates remain (no rollback needed since we're only adding error feedback)

### Scope
- **D-05:** Only wrap Firestore writes in stores (useFinanceStore.ts) — auth errors handled separately
- **D-06:** No retry logic in this phase — just notify user of failure

### the agent's Discretion
- Exact error component implementation (MUI Snackbar vs Alert vs custom)
- Error message text
- Which specific store methods get try-catch first (prioritize by user impact)

</decisions>

<canonical_refs>
## Canonical References

### Firebase/Zustand
- `src/store/useFinanceStore.ts` — All Firestore write operations needing try-catch
- `src/store/useAuthStore.ts` — Auth state (errors handled separately in auth flow)
- `src/lib/firebase.ts` — Firebase initialization

### Codebase patterns
- `src/codebase/STACK.md` — Tech stack (MUI, Zustand, Firebase)
- `src/codebase/CONVENTIONS.md` — Code conventions

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- MUI Snackbar/Alert component for notifications
- Existing store patterns with Zustand actions

### Established Patterns
- Zustand with persist middleware
- Firestore updateDoc pattern in all store actions
- All writes: doc(db, 'users', userId) → updateDoc(..., {...fields})

### Integration Points
- Store actions → Firestore → UI feedback needed
- useFinanceStore.ts lines 209-392 contain all write operations

</codebase_context>

<specifics>
## Specific Ideas

- "Errors silently fail" — current behavior documented in CONCERNS.md
- "No loading states for writes" — CONCERNS.md identified this

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-error-handling*
*Context gathered: 2026-04-23*