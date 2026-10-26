# Phase 04: Backup & Restore - Research

**Phase:** 04-backup-and-restore
**Status:** Research Complete
**Date:** 2026-04-23

---

## User Requirements

From user's express request:
1. Export/backup user data to a downloadable file
2. Restore data from backup file
3. Protect against data disasters

---

## Data Model Analysis

The following data must be included in backups (from `useFinanceStore.ts`):

### Core Finance Data
- `transactions: Transaction[]` — All user transactions
- `recurringTransactions: RecurringTransaction[]` — Recurring templates
- `accounts: Account[]` — User accounts
- `initialBalance: number` — Combined initial balance
- `balanceStartDate: string` — Calculation start date

### Configuration Data
- `categories: Category[]` — Expense categories (with subcategories)
- `incomeCategories: Category[]` — Income categories (with subcategories)
- `enabledModules: AppModules` — Module toggles

### Car Management Data (if enabled)
- `carMileage: CarMileageRecord[]`
- `carInitialMileage: number`
- `tireSettings: TireSettings`
- `tireChanges: TireChangeRecord[]`

### Internal Tracking
- `deletedRecurringInstances` — For recurring generation

---

## Backup Approaches

### Option 1: JSON Export (Recommended for MVP)
- **Pros:** Simple, universal, human-readable, easy to restore
- **Cons:** No encryption by default, larger file size
- **Implementation:** `JSON.stringify()` to blob, trigger download

### Option 2: Firestore Export (Built-in)
- **Pros:** Google-managed, supports large datasets
- **Cons:** Requires GCP permissions, not user-friendly download
- **Verdict:** Not suitable for end-user backup

### Option 3: Encrypted JSON
- **Pros:** Secure, portable
- **Cons:** Requires password management, more complex
- **Verdict:** Future enhancement

---

## Implementation Recommendation

**JSON Export with Metadata**

```json
{
  "version": "1.0",
  "exportedAt": "2026-04-23T12:00:00Z",
  "app": "myfinance",
  "data": {
    "transactions": [...],
    "accounts": [...],
    // ... other fields
  }
}
```

**File format:** `myfinance-backup-2026-04-23.json`

---

## Restore Strategy

1. **File picker** — HTML file input accepting `.json`
2. **Validation** — Check version, app name, data structure
3. **Preview** — Show summary (X transactions, Y accounts, etc.)
4. **Confirm** — User confirms before overwrite
5. **Restore** — Batch update Firestore with all data

---

## UI Integration Points

### Config Page
- Add "Backup & Restore" section in ConfigPage tabs
- Two buttons: "Export Backup", "Import Backup"

### Alternative: Settings Drawer
- Add backup button in user settings area

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Data loss on restore | High | Preview before restore, confirm dialog |
| Version mismatch | Medium | Version check in restore, graceful error |
| Large file crash | Medium | Chunked processing, loading states |
| Overwrite current data | High | Require explicit confirmation |

---

## Verification Strategy

1. Export → Download file → File exists and is valid JSON
2. Import → Data appears in store → Matches original export
3. Roundtrip → Export → Import → Data identical

---

*Research conducted: 2026-04-23*