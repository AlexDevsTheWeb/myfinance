# Phase 04: Backup & Restore - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning
**Source:** User express request (no discuss-phase run)

---

<domain>
## Phase Boundary

Feature to backup and restore user financial data. The goal is disaster recovery protection.
- Export all user data to downloadable JSON file
- Import backup file to restore data
- UI integrated into ConfigPage
</domain>

<decisions>
## Implementation Decisions

### D-01: File Format
- JSON (human-readable, universal, easy to debug)
- Versioned format for future compatibility

### D-02: Data Coverage
- All finance data must be in backup: transactions, accounts, categories, recurring, modules, car data if enabled
- Metadata: version, exportedAt timestamp, app name

### D-03: Import Behavior
- Preview before restore (show summary counts)
- Full overwrite (no merge)
- Clear confirmation required

### D-04: Out of Scope (for MVP)
- Encrypted backups
- Partial restore (restore specific collections)
- Auto-upload to cloud storage
- Scheduled automatic backups
</decisions>

<canonical_refs>
## Canonical References

**Required reading:**
- `src/store/useFinanceStore.ts` — Data model and store functions
- `src/pages/ConfigPage.tsx` — UI integration point

</canonical_refs>

<specifics>
## Specific Ideas

- File naming: `myfinance-backup-YYYY-MM-DD.json`
- Backup version: "1.0" for initial release
- Tab in ConfigPage between "Incomes" and end
</specifics>

<deferred>
## Deferred Ideas

- Encrypted backup with password
- Partial restore (select which data to restore)
- Cloud sync/auto-backup
- Backup versioning migration

</deferred>

---

*Phase: 04-backup-and-restore*
*Context gathered: 2026-04-23 via user request*