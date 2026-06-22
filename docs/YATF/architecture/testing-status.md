---
title: "Testing Status"
tags: [architecture, testing, quality]
created: 2026-06-22
updated: 2026-06-22
status: active
sources: ["raw/codebase/TESTING.md"]
related: ["architecture/concerns-and-tech-debt", "architecture/project-state"]
---

# Testing Status

*Analysis: 2026-06-22*

## Critical Finding: No Testing Infrastructure

This codebase has **zero testing infrastructure**:
- No test runner (Vitest, Jest, Playwright)
- No test files (`*.test.*`, `*.spec.*` — all empty)
- No test commands in `package.json`
- No test dependencies in `devDependencies`
- No test configuration files

## Recommended Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Priority Test Areas

### Unit Tests

| Area | File | What to Test |
|------|------|-------------|
| Validation | `src/store/validation/finance.validation.ts` | `validateTransaction`, `validateRecurringTransaction` |
| Sanitization | `src/store/sanitization/` | `sanitizeTransaction`, `sanitizeRecurring` |
| Firestore converters | `src/lib/converters.ts` | Data ↔ type mapping |
| Analytics hooks | `src/analytics/hooks/` | Pure `useMemo` computations |
| Env utilities | `src/utils/variables.utils.tsx` | `getEnvVar` |
| Backup validation | `src/store/backup/index.ts` | `validateBackupData` |

### Integration Tests

| Area | What to Test |
|------|-------------|
| Zustand stores | CRUD actions, cross-store interaction |
| Firebase sync | `useSyncFinance` snapshot → store |
| Auth flow | Login → logout → route protection |

### Component Tests

| Component | What to Test |
|-----------|-------------|
| `TransactionForm.tsx` | Validation, field interactions, edit vs create mode |
| `TransactionError.tsx` | Renders on `saveError`, dismisses |
| `AccountCard.component.tsx` | Positive/negative balance display |
| `TransactionTable.tsx` | Sort, filter, pagination |

### E2E Flows

Login → Dashboard → Full CRUD → Multi-account → Car management → Language switch → Backup/import

## Related

- [[architecture/concerns-and-tech-debt]]
- [[architecture/project-state]]

## Related

- [[architecture/concerns-and-tech-debt]]
- [[architecture/project-state]]
