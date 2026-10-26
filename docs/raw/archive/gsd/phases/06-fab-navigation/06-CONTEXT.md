# Phase 06: FAB Navigation - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning
**Source:** User express request

---

<domain>
## Phase Boundary

Make transaction entry accessible from all pages by either:
- Option A: Always visible "New Income" and "New Expense" buttons on every page (except Config)
- Option B: Single "+/-" button that shows both options in a dropdown when clicked

User preference: "Maybe we should maintain the actual structure but have a single button '+/-' that will display 'New Expense' and 'New Income' once clicked"

**Current state:**
- FAB buttons exist only on DashboardPage (lines 68-81 in DashboardPage.tsx)
- Each button opens TransactionModal with type preset to 'income' or 'expense'
- ConfigPage should hide these buttons

</domain>

<decisions>
## Implementation Decisions

### D-01: Button Location
- Add FAB buttons to Layout.tsx (shared layout component)
- Position: Fixed at bottom-right corner (same as current Dashboard)
- Only show when user is authenticated
- Hide on ConfigPage (use location.pathname check)

### D-02: Single Button vs Two Buttons
- **User preferred approach:** Single "+/-" button that shows dropdown menu
- Dropdown menu items:
  - "New Income" (green, with ArrowUpward icon)
  - "New Expense" (red, with ArrowDownward icon)
- Clicking either item opens TransactionModal with appropriate type

### D-03: State Management
- TransactionModal open state needs to be accessible from Layout
- Use a global state or context for modal visibility
- Modal type state ('income' | 'expense') needs to be shareable

### D-04: Mobile Considerations
- On mobile, FAB should still be easily accessible
- Consider if dropdown works well on touch devices
- Fallback: Two separate FABs on mobile if dropdown is problematic

</decisions>

<canonical_refs>
## Canonical References

**Required reading:**
- `src/components/layout/Layout.tsx` — Where FAB should be added
- `src/pages/DashboardPage.tsx` — Current FAB implementation (lines 68-81)
- `src/pages/ConfigPage.tsx` — Page where FAB should be hidden
- `src/components/modals/TransactionModal.tsx` — Modal component
- `src/store/useFinanceStore.ts` — State management patterns

</canonical_refs>

<specifics>
## Specific Ideas

- Single FAB with "+/-" label and dropdown
- Uses MUI Menu component for dropdown
- Menu items styled: green for income, red for expense
- Uses existing handleOpenModal pattern from DashboardPage
- Modal state lifted to Layout or use context

</specifics>

<deferred>
## Deferred Ideas

- Animated transitions for FAB appearance
- Keyboard shortcuts (e.g., Ctrl+N for new transaction)
- Mobile-specific optimizations (future iteration)
- Remember last selected type (income vs expense)

</deferred>

---

*Phase: 06-fab-navigation*
*Context gathered: 2026-04-23 via user request*
