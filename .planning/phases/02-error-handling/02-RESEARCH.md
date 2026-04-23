# Phase 02: Error Handling Improvements - Research

**Researched:** 2026-04-23
**Domain:** Error handling for Firestore operations in Zustand stores, MUI notification patterns
**Confidence:** HIGH

## Summary

This phase addresses silent failure of Firestore write operations in the Zustand store. Research confirms a standard pattern: wrap async Firestore calls in try-catch within store actions, track error state alongside data in Zustand, and use MUI Snackbar with Alert for non-blocking user feedback.

The approach leverages Zustand's built-in async handling capability (no middleware needed) and MUI's notification system. Key decisions from research:
- **State pattern:** Track `isLoading` and `error` alongside business data in the store
- **Error feedback:** Show only on failure (D-01), not on success
- **Loading UX:** Non-blocking indicators, not full UI blocking (D-03)
- **Component choice:** MUI Snackbar with embedded Alert provides severity colors and proper UX

**Primary recommendation:** Use Zustand's `set()` to manage loading/error states in async actions, show error via MUI Snackbar with Alert inside, and implement per-action error tracking rather than a global error state.

---

## Standard Stack

### Core Libraries
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|-------------|
| @mui/material Snackbar | 7.3.8 | Toast notifications | Native MUI, matches existing UI |
| @mui/material Alert | 7.3.8 | Error severity display | Provides color-coded feedback |
| Zustand (existing) | 5.0.11 | State management | Already in project, handles async natively |

### Notification Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MUI Snackbar + Alert | notistack | notistack adds queuing but requires additional dependency; simpler to start with MUI native |
| Custom toast component | react-hot-toast | Heavier, not MUI-native |

**Installation:**
```bash
# No new packages needed - MUI already installed
# Verify versions:
npm view @mui/material version  # Should be ~7.3.x
npm view @mui/materialSnackbar version  # Same package
```

---

## Architecture Patterns

### Pattern 1: Zustand Async Error Handling

**What:** Store async actions that wrap Firestore calls with try-catch and state management

**When to use:** Every async Firestore operation (updateDoc, setDoc, deleteDoc)

**Example:**
```typescript
// Source: React SME Cookbook (zustand async patterns)
// TypeScript interface for store with error handling
interface FinanceStore {
  // ... existing state
  isSaving: boolean;
  saveError: string | null;
  
  // Action with try-catch
  addTransaction: (transaction: Transaction) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  // ... existing state
  isSaving: false,
  saveError: null,

  addTransaction: async (transaction) => {
    // 1. Set loading state
    set({ isSaving: true, saveError: null });
    
    try {
      // 2. Perform Firestore operation
      const docRef = doc(db, 'users', get().userId);
      // ... update logic
      set({ isSaving: false });
    } catch (err) {
      // 3. Capture error - DO NOT throw
      const errorMessage = err instanceof Error ? err.message : 'Failed to save';
      set({ saveError: errorMessage, isSaving: false });
    }
  },
}));
```

**Key insight:** 
- Zustand actions can be async without special middleware
- Use `set()` multiple times: once for loading, once for success/error
- Catch block captures error but doesn't throw — error state enables UI reaction
- Component can subscribe to `saveError` and display appropriately

### Pattern 2: MUI Snackbar with Alert

**What:** Non-blocking toast notification for error feedback

**When to use:** User feedback for failed Firestore writes

**Example:**
```typescript
// Source: MUI Snackbar documentation
import { Snackbar, Alert } from '@mui/material';

function ErrorSnackbar({ 
  open, 
  error, 
  onClose 
}: { 
  open: boolean; 
  error: string; 
  onClose: () => void;
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000} // 6 seconds for errors (longer than success)
      onClose={(_, reason) => {
        if (reason !== 'clickaway') onClose();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose} 
        severity="error" 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {error}
      </Alert>
    </Snackbar>
  );
}
```

**MUI Alert severity levels:**
| Severity | Use Case | Default Duration |
|----------|---------|----------------|
| `success` | Confirmations | 3-5 seconds |
| `info` | Informational | 4 seconds |
| `warning` | Caution | 5-6 seconds |
| `error` | Failures | 6-10 seconds |

**Best practices from MUI docs:**
- Error snackbars should persist longer (6-10 seconds)
- Include actionable next step ("Retry", "Contact support")
- Never use for critical errors requiring user input (use Dialog instead)

### Pattern 3: Non-Blocking Loading Indicators

**What:** Subtle loading feedback near affected elements, not full UI blocking

**When to use:** During Firestore write operations

**Approach per D-03:**
- Use small spinner or skeleton near the submit button
- Disable only the affected control, not entire screen
- Maintain optimistic updates (no rollback per D-04)

**Example:**
```typescript
// In component using the store action
import { CircularProgress } from '@mui/material';

function SaveButton() {
  const { isSaving, saveError, addTransaction } = useFinanceStore();
  
  return (
    <Box position="relative">
      <Button 
        onClick={handleAdd}
        disabled={isSaving}
      >
        Add Transaction
      </Button>
      {isSaving && (
        <CircularProgress 
          size={24} 
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px'
          }} 
        />
      )}
    </Box>
  );
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|------------|------------|-----|
| Async state management | Redux Thunk / saga middleware | Zustand native async | Zustand handles async directly; middleware adds unnecessary complexity |
| Toast notifications | Custom div overlay | MUI Snackbar | Already in MUI, accessible, properly positioned, handles transitions |
| Error state | Prop drilling | Zustand store error state | Components can subscribe directly to error state |

**Key insight:** The existing stack (Zustand + MUI) fully supports this use case. No additional libraries required.

---

## Common Pitfalls

### Pitfall 1: Forgetting Firestore Promise Rejection
**What goes wrong:** Unhandled promise rejection crashes the app or causes "unhandled promise rejection" warnings
**Why it happens:** Firestore `updateDoc` returns a Promise that can reject on network failure
**How to avoid:** Always wrap Firestore operations in try-catch within the async action
**Warning signs:** Browser console shows "Unhandled Promise Rejection"

### Pitfall 2: Error State Not Clearing
**What goes wrong:** Old error persists after successful retry
**Why it happens:** Error state set once but never cleared on subsequent success
**How to avoid:** Clear error at start of action AND on successful completion
**Warning signs:** Error shows for unrelated subsequent actions

### Pitfall 3: Blocking UI During Saves
**What goes wrong:** Full-screen loading overlay making app unusable during writes
**Why it happens:** UsingModal/Skeleton for all loading states
**How to avoid:** Per D-03: use non-blocking indicators near affected elements only
**Warning signs:** Users can't cancel operations, apparent freezes

### Pitfall 4: Success Feedback for Every Write
**What goes wrong:** Showing "Saved!" toast after successful operations
**Why it happens:** Implementing success notifications by default
**How to avoid:** Per D-01: only show feedback on failure, trust that successful writes reflected in UI
**Warning signs:** Annoyed users, redundant notifications

---

## Code Examples

### Example 1: Wrapped Firestore Update (Recommended Pattern)

```typescript
// src/store/useFinanceStore.ts - add error handling to existing action

interface FinanceStateWithError {
  // ... existing fields
  isSaving: boolean;
  saveError: string | null;
}

export const useFinanceStore = create<FinanceStateWithError>((set, get) => ({
  // ... existing state
  isSaving: false,
  saveError: null,

  addTransaction: async (transaction) => {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    // Clear previous error, set loading
    set({ saveError: null, isSaving: true });

    try {
      const userDocRef = doc(db, 'users', userId);
      // ... existing transaction logic
      
      // Success - clear loading
      set({ isSaving: false });
    } catch (err) {
      // Capture error for UI, clear loading
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to save transaction';
      set({ saveError: errorMessage, isSaving: false });
      
      // Optionally log for debugging
      console.error('addTransaction error:', err);
    }
  },
}));
```

### Example 2: Error Display Component

```typescript
// src/components/TransactionError.tsx

import { Snackbar, Alert } from '@mui/material';
import { useFinanceStore } from '../store/useFinanceStore';

export function TransactionError() {
  const { saveError, isSaving } = useFinanceStore();
  
  return (
    <Snackbar
      open={!!saveError}
      autoHideDuration={6000}
      onClose={() => useFinanceStore.setState({ saveError: null })}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity="error"
        variant="filled"
        onClose={() => useFinanceStore.setState({ saveError: null })}
        action={
          <Button 
            color="inherit" 
            size="small"
            onClick={() => {
              // Retry mechanism if needed
              useFinanceStore.setState({ saveError: null });
            }}
          >
            RETRY
          </Button>
        }
      >
        {saveError || 'An error occurred'}
      </Alert>
    </Snackbar>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|-------------|------------------|-------------|--------|
| Silent failures | Error state + Snackbar | Current phase | User knows when writes fail |
| No loading feedback | isSaving + near-element spinner | Current phase | Better UX during writes |
| Alert dialog for errors | Snackbar for non-critical | Current phase | Non-blocking per D-03 |

**Industry trends:**
- Notistack gained popularity for notification queuing, but MUI Snackbar sufficient for single-app instance
- Optimistic updates remain standard for write-heavy apps (no rollback in this phase per D-04, just notification)

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Existing store actions all use async/await pattern | Code Examples | Low — confirmed by reading useFinanceStore.ts |
| A2 | MUI Snackbar/Alert already available | Standard Stack | Low — MUI is in project (STACK.md confirms @mui/material 7.3.8) |
| A3 | No external notification system needed | Standard Stack | Low — MUI native satisfies requirements |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

---

## Open Questions

1. **Centralized vs per-action error state**
   - What we know: Both patterns work in Zustand
   - What's unclear: Should errors be in a single `lastError` state or action-specific?
   - Recommendation: Start with action-specific (simpler, clearer attribution), graduate to centralized if UX becomes complex

2. **Retry mechanism**
   - What we know: User can re-trigger action when error shows
   - What's unclear: Automatic retry vs manual retry?
   - Recommendation: Per D-06, just notify user — no retry in this phase

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| @mui/material | Snackbar/Alert | ✓ | 7.3.8 | — |
| Zustand | Store | ✓ | 5.0.11 | — |
| Firebase SDK | Firestore | ✓ | 12.9.0 | — |

**Missing dependencies with no fallback:**
- None — all required packages already in project

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Not configured (see ROADMAP.md Phase 04) |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EH-01 | Firestore writes wrapped in try-catch | Manual | Inspect code | ✅ Implementation visible in store |
| EH-02 | Loading state shows during writes | Manual | UI test | ❌ No test framework |

### Sampling Rate
- **Per task commit:** Manual code review
- **Per wave merge:** Manual code review
- **Phase gate:** Manual verification that error handling exists

### Wave 0 Gaps
- [ ] Test framework setup in Phase 04
- [ ] Any automated tests

**Note:** No automated tests for this phase given no test framework exists. Manual code review required.

---

## Sources

### Primary (HIGH confidence)
- [MUI Snackbar Documentation](https://mui.com/material-ui/react-snackbar/) - Component API and usage patterns
- [MUI Alert Documentation](https://mui.com/components/alert/) - Severity levels and best practices
- [React SME Cookbook - Zustand Async Actions](https://reactdevelopers.org/docs/zustand/async-actions) - Zustand async patterns

### Secondary (MEDIUM confidence)
- [Stack Overflow: Zustand async error handling](https://stackoverflow.com/questions/72426995/how-to-return-errors-from-zustand-store) - Community-validated patterns
- [Firebase Firestore Error Handling](https://docs.fireact.dev/best-practices/error-handling/) - Firestore-specific error codes

### Tertiary (LOW confidence)
- [The Linux Code: MUI Snackbar Patterns](https://thelinuxcode.com/react-mui-snackbar-feedback-practical-patterns-edge-cases-and-production-ready-ux/) - Production UX recommendations

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — MUI and Zustand are established, versions verified via project
- Architecture: HIGH — Standard patterns from official docs and community
- Pitfalls: MEDIUM — Common patterns identified, some assumptions on implementation details

**Research date:** 2026-04-23
**Valid until:** 2026-05-23 (30 days for stable stack)

---

*Research complete for Phase 02: Error Handling Improvements*