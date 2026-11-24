# OpenCode Prompt: Create Release Tag v1.0.0-beta.1 & Fetch Open Issues Inventory

## Objective
1. Tag the current state of the `development` branch as **`v1.0.0-beta.1`** and draft a formal GitHub Release with a structured Changelog.
2. Fetch and inventory all **open GitHub Issues** for the `AlexDevsTheWeb/myfinance` repository, outputting them into a structured report for milestone planning.

---

## Task 1: Release Tagging & Changelog (`v1.0.0-beta.1`)

### 1.1 Git Tag Execution
- Ensure you are on the latest `development` branch (`git checkout development && git pull`).
- Create annotated tag: `git tag -a v1.0.0-beta.1 -m "Release v1.0.0-beta.1: Core Redesign, Settings, Utilities Analytics"`
- Push tag to origin: `git push origin v1.0.0-beta.1`

### 1.2 GitHub Release Draft / Notes
Generate a GitHub Release (via GitHub CLI `gh release create v1.0.0-beta.1` or output to `docs/reports/release-v1.0.0-beta.1.md`) containing:
- **Title**: `v1.0.0-beta.1 — Executive Dark UI & Core Modules Refactor`
- **Summary**: Milestone release establishing the new Swiss-Tech / Executive Dark design system, unified Drawer, rebuilt Settings, and the full Utilities & Consumption analytics engine.
- **Structured Changelog**:
  - 🚀 **Features & Modules**:
    - **Utilities & Consumption Page (`PR #202`)**: Unified electricity/gas/water analytics, dual-axis chart (spend vs physical volume), YoY comparison, weighted unit-rate calculation (€/kWh, €/SMC, €/m³), and live quota split (Fixed vs Energy).
    - **Settings Page Redesign (`PR #201`)**: Sub-Sidebar system parameters navigation, 2x2 grid cards, regional/currency formatting preview, and account/card balance management.
    - **Transaction Ledger Redesign (`PR #197`)**: High-density transaction table with KPI summary header, advanced filters toolbar, row duplication, and CSV export.
    - **Slide-Over Transaction Drawer**: 480px right drawer with progressive disclosure for expenses, income, transfers, and utility/vehicle metadata.
    - **Executive Dark Design System**: Standardized `#0B0E14` shell, `#131B2E` cards, `#1E293B` borders, and `JetBrains Mono` typography for all monetary figures and dates.
  - 🛠️ **Infrastructure & Store**:
    - Optional additive schema extension for `ITransaction` (`fixedFee`, `energyFee`, `provider`, `meterId`, `utilityType`).
    - Unified `useNewTransaction()` route-aware creation hook.

---

## Task 2: Open GitHub Issues Inventory

### 2.1 Fetch Open Issues
- Use `gh issue list --repo AlexDevsTheWeb/myfinance --state open --json number,title,labels,body,createdAt` (or GitHub API) to list all active open issues.
- Save the structured inventory to `docs/reports/open-issues-inventory.md`.

### 2.2 Report Format (`docs/reports/open-issues-inventory.md`)
Structure the report as follows:
```markdown
# Open GitHub Issues Inventory

**Date:** YYYY-MM-DD
**Repository:** AlexDevsTheWeb/myfinance

| Issue # | Title | Labels | Summary | Proposed Milestone |
|---------|-------|--------|---------|-------------------|
| #123    | ...   | ...    | ...     | v1.0.0-beta.2 / v1.0.0-beta.3 / v1.0.0 |
```

---

## Workflow Requirements
1. Run `npx tsc -b` and `npm test` to ensure zero regressions before tagging.
2. Update the OKF wiki index (`docs/index.md`, `wiki/features/index.md`) referencing the new release report.
3. Output the contents of `open-issues-inventory.md` in the CLI output so the team can analyze issues in the next step.
