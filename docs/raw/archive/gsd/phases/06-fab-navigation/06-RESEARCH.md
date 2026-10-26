# Phase 06: FAB Navigation - Research

**Research Date:** 2026-04-23
**Status:** Complete

---

## Technical Approach

### Current Implementation
- FAB buttons exist in `DashboardPage.tsx` (lines 68-81)
- Each FAB uses `Zoom` animation, `variant="extended"`, `size="large"`
- Colors: `color="success"` (green) for income, `color="error"` (red) for expense
- Opens `TransactionModal` with preset type

### Proposed Changes

1. **Move FAB to Layout Component**
   - Layout.tsx wraps all pages (except Login)
   - Add FAB in the main Box, before closing `</Box>`
   - Use `useLocation()` to detect current route

2. **Hide on Config Page**
   - Check `location.pathname === '/config'`
   - Conditional rendering: `{pathname !== '/config' && <FAB />}`

3. **Single Button with Dropdown**
   - Use MUI `Menu` component
   - Anchor menu to FAB button
   - Two menu items: "New Income", "New Expense"

4. **State Management Options**
   - Option A: Lift state to Layout (useState in Layout.tsx)
   - Option B: Create useTransactionModal hook/context
   - Option C: Use existing store (not ideal for UI state)

   **Recommendation:** Option A is simplest - lift modal state to Layout

### Pattern Analysis

From DashboardPage.tsx:
```typescript
const [modalOpen, setModalOpen] = useState(false);
const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

const handleOpenModal = (type: 'income' | 'expense') => {
  setTransactionToEdit(null);
  setModalType(type);
  setModalOpen(true);
};
```

This pattern can be moved to Layout.tsx and the functions passed down or exposed via context.

### Dependencies
- No new npm packages required
- Uses existing MUI components (Button, Fab, Menu, MenuItem, Zoom)
- No Firebase changes needed

---

## Validation Architecture

**Not applicable** - This is a pure UI change with no backend components.

---

*Research complete: 2026-04-23*
