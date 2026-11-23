# OpenCode Prompt: Settings Page Structural Layout & Grid Refinement (React + MUI v9)

## Context & Objective
We are aligning the **Settings page** (`/config` / `SettingsPage.tsx`) strictly with the **layout, structure, and high-density grid design** produced by Stitch (`Screenshot 2026-10-26 alle 18.07.03.png` / `Screenshot 2026-10-26 alle 16.48.26.png`).

> **NOTE ON TRANSLATION/i18n**: Italian localization is NOT a priority at this step. You may keep existing English/i18n labels. Focus **100% on structural fidelity, card layout, high-density 2x2 grids, monospaced numbers, and functional parity**.

---

## Key Layout & Structural Requirements

### 1. Two-Column Sub-Sidebar Architecture (`SYSTEM PARAMETERS`)
- **Main Shell Integration**: Re-use the existing app layout shell (`Layout.tsx`) with the global TopBar intact.
- **Sub-Sidebar (220px - 240px)**: A dedicated inner left navigation column containing the 7 sub-tabs with badge counters:
  1. `General & Modules` (Active count badge)
  2. `Accounts & Cards` (Count badge, e.g. "4 Active")
  3. `Expense Categories` (Count badge, e.g. "12")
  4. `Income Categories` (Count badge, e.g. "4")
  5. `Recurring Templates` (Count badge, e.g. "8")
  6. `Projections & Rates`
  7. `Backup & Data`
- **Responsive Mobile Behavior (`< md`)**: Automatically collapse the sub-sidebar into a top horizontal scrollable pill bar.

### 2. Page Header & Action Buttons
- **Top Header Bar inside content area**:
  - Breadcrumbs: `SETTINGS / GENERAL`
  - Title: `GENERAL SETTINGS & INFRASTRUCTURE`
  - Action buttons on top right:
    - `Restore Defaults` (Outlined Slate button)
    - `Save Changes` (Contained Cyan `#0EA5E9` button with checkmark icon)

### 3. High-Density Content Grid (Tab 1: General & Modules)
Replace simple vertical list stacks with **MUI Grid / Card layouts**:

- **Card 1: Regional & Currency Preferences**
  - Input Selectors for Language, Main Currency (`EUR €`), and Date Format (`DD/MM/YYYY`).
  - Calculation Start Date picker (`01/01/2026`).
  - Formatted currency preview box in **JetBrains Mono font** (e.g., `1.234,56 €`).

- **Card 2: Active Application Modules (2x2 Grid)**
  - 2x2 Grid displaying module cards: `Fleet / Car`, `Utilities`, `Investments`, `Budgeting`.
  - Each module tile includes:
    - Dedicated icon box (Car, Zap, TrendingUp, PieChart icons).
    - Bold title + description text.
    - Cyan toggle switch (`#0EA5E9`).

- **Card 3: Accounts & Settlement Cards (2x2 Grid)**
  - 2x2 Grid of Account & Card tiles:
    - Account/Card name + masked IBAN/number (`IT28 •••• 9012`).
    - Status badges (`PRIMARY CC`, `CHECKING`, `BROKER`).
    - Prominent current balance displayed in **JetBrains Mono font** (e.g. `€ 24.120,00`).
  - Action CTA button: `+ Add Account / Card` triggering the slide-over drawer or account modal.

---

## Styling & Typography Specifications
- **Theme Tokens**: Surface `#131B2E`, Page Background `#0B0E14`, Borders `#1E293B`.
- **Monospace Font**: Use `JetBrains Mono` or `fontFamily: 'monospace'` for ALL monetary values, balances, dates, and percentages.
- **No White Input Boxes**: All input backgrounds must remain dark (`#0B0E14` / `#131B2E`) with light text and clean focus rings.

---

## Execution Checklist for OpenCode
1. Refactor `SettingsPage.tsx` and related components under `src/components/settings/`.
2. Map existing Zustand store state (`useFinanceStore`, `useSettingsStore`) to the new grid structure.
3. Write an Implementation Report under `docs/reports/PR-[NUMBER]-settings-layout-refinement.md`.
4. Update OKF wiki documentation, verify with `npm run build`, and submit/update the Pull Request.
