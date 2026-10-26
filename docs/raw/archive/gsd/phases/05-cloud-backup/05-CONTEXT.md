# Phase 05: Cloud Backup (Google Drive) - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning
**Source:** User express request

---

<domain>
## Phase Boundary

Add optional cloud backup upload to Google Drive. Auto-detect if user logged in with Google Auth and offer to save backup file to their Google Drive.

- Auto-detect Google sign-in method
- Upload backup to user's Google Drive
- Optional feature (user choice)
- Seamless with existing local download
</domain>

<decisions>
## Implementation Decisions

### D-01: Auto-Detection Logic
- Check `user.providerData` for `google.com` provider ID
- Only show Google Drive option if user signed in with Google

### D-02: UI Behavior
- Add "Save to Google Drive" button next to existing "Download Backup" button
- Only appear if user logged in with Google Auth
- Show loading indicator during upload

### D-03: Google Drive API
- Use Google Drive API v3
- Upload to app-specific folder
- Make backup publicly visible to app only (not shared with others)

### D-04: Error Handling
- Show error toast if upload fails
- Allow retry
- Fall back to local download still works
</decisions>

<canonical_refs>
## Canonical References

**Required reading:**
- `src/store/useFinanceStore.ts` — Existing exportAllData function
- `src/store/useAuthStore.ts` — User authentication state
- `src/lib/firebase.ts` — Firebase config

</canonical_refs>

<specifics>
## Specific Ideas

- Create folder "MyFinance Backups" in user's Drive
- File name: `myfinance-backup-YYYY-MM-DD.json`
- Use Google's access token for API calls
</specifics>

<deferred>
## Deferred Ideas

- Auto-backup scheduling (scheduled daily/weekly)
- Encrypted backup to Drive
- Other cloud providers (Dropbox, OneDrive)
- Backup versioning in Drive

</deferred>

---

*Phase: 05-cloud-backup*
*Context gathered: 2026-04-23 via user request*