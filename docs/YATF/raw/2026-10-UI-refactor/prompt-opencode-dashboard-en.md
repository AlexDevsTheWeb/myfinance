# OpenCode Prompt: Redesign Dashboard Implementation (React + Material UI)

## Context & Objective
We are implementing the complete redesign of the **Balancr** main Dashboard. Source code of the actual web app is in apps/web/ folder.
A high-fidelity design prototype has been created in Google Stitch (`Stitch-dashboard-final-1.png` and `Stitch-dashboard-final-2.png`). The exported HTML + Tailwind CSS source code and reference screenshots are available in the project raw wiki sources.

Your goal is to reproduce this Stitch prototype in our React + Material UI (MUI v9) codebase with at least **95%+ visual and functional fidelity**, maintaining strict compatibility with our existing Zustand state management, Day.js date handling, and Firebase architecture.

---

## Technical Constraints & Design System Standards

1. **Strict MUI v9 Conversion (No Tailwind CSS)**:
   - Do NOT install or use Tailwind CSS in the project.
   - Convert all Tailwind classes to native MUI components (`Box`, `Grid`, `Stack`, `Paper`, `Card`, `Typography`, `Button`, `IconButton`) using `sx` props and themed custom components.
   - Map colors, spacing, and typography directly into our MUI theme (`createTheme` in `src/theme/`).

2. **Color Palette & Theme Tokens**:
   - **Background**: Deep Slate (`#0B0E14`)
   - **Card / Surface**: Solid Dark Slate (`#131B2E`) with a 1px solid subtle border (`#1E293B` or `#334155`).
   - **No Neon Background Glows**: Keep card surfaces flat and opaque.
   - **Accents**:
     - Cyan / Teal (`#0EA5E9` or `#06B6D4`): Liquidity & Neutral highlight
     - Emerald Green (`#10B981`): Incomes & Positive trends
     - Coral Red (`#EF4444`): Expenses & Negative trends
     - Amber (`#F59E0B`): Warnings & Limits

3. **Typography & Layout Precision**:
   - **Monospaced Numbers**: Use `JetBrains Mono` or `Roboto Mono` for ALL numerical values, currency figures (`€`), dates, odometers (`km`), utility meters (`kWh`, `smc`), and ETF quantities.
   - **No Unwanted Text Wrapping**: Apply `noWrap` or `textOverflow: 'ellipsis'` on all KPI labels, card headers, and table titles.
   - **Uniform Grid System**: Maintain consistent 20px padding (`p={2.5}`) and 20px grid gaps (`spacing={2.5}`).

4. **Component Architecture**:
   Structure the dashboard modularly under `src/components/dashboard/`:
   - `DashboardLayout.tsx`: Handles collapsible Sidebar (240px expanded vs 64px collapsed).
   - `TopBar.tsx`: Search bar, currency picker, user profile, and `+ New Transaction` primary CTA.
   - `KpiMetricsRow.tsx`: 4 compact KPI cards (Liquid Balance, Income, Expenses, Net Delta).
   - `CalendarMasterDetailSection.tsx`: Integrated Master-Detail section combining Mini-Calendar (left), Selected Day Transactions list (middle), and Credit/Debit Card Limits (right).
   - `BentoWidgetsRow.tsx`: Vehicle Odometer, Utility Consumption (kWh/smc), and ETF PAC tracker.
   - `ChartsRow.tsx`: Cash Flow Trend area chart and Portfolio Value vs Invested comparison chart.
   Some of this are already present and implemented, check before create something new that we already have. For example the Calendar, we just need to update its layout to the new stitch proposal.


5. **State Management & Reactivity**:
   - Connect the Calendar `selectedDate` state directly to the daily transactions filter using Zustand stores.
   - Clicking a day with transaction indicators must reactively update the middle "Transactions of [Date]" panel.

---

## Agent Execution Loop & Workflow

Execute your tasks following this strict iterative workflow:

### Step 1: Read & Analyze
- Read the exported Stitch HTML + Tailwind CSS file from the raw wiki sources.
- Inspect the reference screenshots (`Stitch-dashboard-final-1.png` and `Stitch-dashboard-final-2.png`).
- Review the current `src/` directory structure, Zustand stores (`src/store/`), types (`src/types/`), and existing MUI theme definitions.

### Step 2: Implementation Plan Proposal
- Outline a detailed step-by-step implementation plan in Markdown.
- Specify modified files, new components, theme updates, and state bindings.
- Confirm alignment with repository conventions before writing code.

### Step 3: Execution & Implementation
- Update the MUI theme configuration (`src/theme/`).
- Build the modular React components with full TypeScript typing (no `any`).
- Connect state from Zustand stores.
- Ensure responsive layout adaptation for expanded (240px) vs collapsed (64px) sidebar.

### Step 4: Wiki Documentation
- Update the project LLM-wiki (OpenSpec / OKF compliant) under `docs/YATF/wiki` to document the new Dashboard layout, component hierarchy, and store interface changes.

### Step 5: Branching & Merge Request
- Follow repo branch naming conventions (e.g., `feat/redesign-dashboard-mui`).
- Commit changes with clear, structured commit messages.
- Push the branch and open a Merge Request (MR) / Pull Request with a summary of changes in DRAFT.
