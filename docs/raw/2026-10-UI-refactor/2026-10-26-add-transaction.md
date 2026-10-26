# OpenCode Prompt: Add Transaction Slide-Over Drawer Implementation (React + MUI v9)

## Context & Objective
We are standardizing the "Add Transaction" user experience across the **Balancr** application.
Instead of centered modals or bulky Floating Action Button (FAB) context menus, we are implementing a **Right Slide-Over Drawer** (`AddTransactionDrawer.tsx`) with **Progressive Disclosure**.

This component must seamlessly integrate with our existing React + Material UI codebase using **MUI v9** (`@mui/material` ^9.0.1, `@mui/icons-material` ^9.0.1, `@mui/x-date-pickers` / `@mui/x-date-pickers-pro` ^9.2.0), the Dark Executive Wealth theme (`#0B0E14` / `#131B2E`), and our Zustand transaction store.

---

## Package Ecosystem & Versioning Requirements
- **MUI Core & Icons**: `@mui/material` ^9.0.1, `@mui/icons-material` ^9.0.1
- **Date/Time Pickers**: `@mui/x-date-pickers` / `@mui/x-date-pickers-pro` ^9.2.0 (use `LocalizationProvider` + `AdapterDayjs` with Day.js)
- **Charts (App-wide)**: `@mui/x-charts` ^9.2.0
- **No Tailwind CSS**: Use native MUI v9 components, `styled()`, and `sx` props mapped to theme tokens.

---

## Trigger Mechanisms (Unified Entry Points)
The `AddTransactionDrawer` must be controllable via a single global state (e.g. `isAddTransactionOpen` in Zustand UI store):
1. **TopBar Primary CTA**: The green `+ Nuova Operazione` button in the TopBar.
2. **Global FAB (Floating Action Button)**: A clean, compact squircle/circular FAB positioned at `bottom: 24px, right: 24px` with a subtle Cyan border (`#0EA5E9`) and a `+` icon.
Both triggers toggle the exact same Drawer.

---

## Technical Specifications & UI Standards

### 1. Component Structure (`src/components/transactions/AddTransactionDrawer.tsx`)
- **MUI Component**: Native `Drawer` with `anchor="right"` and fixed width `width: { xs: '100%', sm: 480 }`.
- **Background & Elevation**: Solid Dark Slate surface (`#131B2E`) with a subtle 1px left border (`#1E293B`).
- **NO WHITE INPUT BOXES**: All `TextField`, `Select`, and `@mui/x-date-pickers` components must use dark filled/outlined variants with `#0B0E14` or `#1A233A` background, light text, and clean Cyan focus borders.

### 2. Header & Type Segmented Control
- **Drawer Header**: Title "NUOVA OPERAZIONE" + Close icon (`IconButton`).
- **Segmented Tabs (`MUI Tabs`)**: 3 full-width tabs:
  - `[ Uscita / Spesa ]` (Default, Coral Red accent `#EF4444`)
  - `[ Entrata ]` (Emerald Green accent `#10B981`)
  - `[ Trasferimento ]` (Cyan accent `#0EA5E9` - for internal account-to-account moves)

### 3. Hero Amount Field
- Prominent input field for the monetary amount:
  - Large monospaced font (`JetBrains Mono`, 32px/36px).
  - Prefix adornment: `€`.
  - Auto-focused on drawer open.

### 4. Core Fields (Always Visible)
1. **Date & Time Picker**: `@mui/x-date-pickers` `DateTimePicker` (or `DatePicker`), integrated with Day.js (`AdapterDayjs`), defaulted to `dayjs()`.
2. **Description / Merchant**: `TextField` with auto-complete/history suggestions.
3. **Category & Subcategory Picker**: Grouped `Select` with category color indicators/icons.
4. **Account & Payment Method**: `Select` showing available accounts (e.g., "Conto Arancio ING", "Carta Credito Gold") along with current balance or remaining credit limit.

### 5. Progressive Disclosure Sections (Collapsible Accordions)
Keep the form fast and lightweight by hiding complex fields inside `Accordion` or `Collapse` components:

- **A) Utility & Fuel Consumption Details (`UtilityMetricsCollapse`)**:
  - Automatically expands if Category = "Utenze" or "Auto / Carburante".
  - Dynamic fields based on category:
    - **Luce**: Consumption in `kWh`
    - **Gas**: Consumption in `smc`
    - **Carburante**: Liters (`L`), Price per Liter (`€/L`), and Odometer (`km`).
- **B) Recurring / Scheduled Expense Options (`RecurringCollapse`)**:
  - Toggle switch: "Imposta come spesa ricorrente".
  - Frequency dropdown (Mensile, Bimestrale, Annuale) + Day of month charge selector.

### 6. Action Bar (Footer)
- Fixed at the bottom of the drawer:
  - `Annulla` (Text Button, Slate)
  - `Salva Operazione` (Primary Contained Button, Emerald Green `#10B981`)

---

## Agent Execution Loop for OpenCode

1. **Inspect & Verify**:
   - Review existing Zustand transaction stores (`src/store/`) and transaction types (`src/types/`).
   - Check `@mui/material` (v9.x) and `@mui/x-date-pickers` (v9.2.0) setup in `package.json` and `src/theme/`.
   - Ensure new metric fields (`kwh`, `smc`, `liters`, `odometer`) are typed in `Transaction` payload interfaces.

2. **Implementation**:
   - Create `AddTransactionDrawer.tsx` under `src/components/transactions/`.
   - Use `@mui/x-date-pickers/DateTimePicker` wrapped in `LocalizationProvider`.
   - Update `TopBar.tsx` and create a global `FloatingActionButton.tsx` to trigger the drawer state.
   - Apply dark theme tokens to all MUI form controls.

3. **Documentation & Implementation Report**:
   - Create an Implementation Report in `docs/reports/PR-[NUMBER]-add-transaction-drawer.md`.
   - Update OKF wiki documentation under `docs/` or `.planning/`.
   - Commit, push branch `feature/add-transaction-drawer`, and open Merge Request.
