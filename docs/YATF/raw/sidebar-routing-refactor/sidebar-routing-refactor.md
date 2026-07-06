# Sidebar & Routing Refactor

## Changes Made

### 1. Duplicate Title Removal
- Removed `{appTitle}` ("Yet Another Finance Tracker") from the Layout.tsx AppBar
- Title remains in the sidebar (the canonical navigation location)
- Removed unused `getEnvVar` import from Layout.tsx

### 2. Finance Page Consolidation
- Created `src/pages/FinancePage.tsx` — tabbed page with "Salary" and "Insights" tabs
- Removed `/salary` and `/insights` routes from App.tsx
- Added single `/finance` route
- Sidebar: replaced NavGroup (Salary + Insights sub-links) with single "Finance" link

### 3. Investments Page Consolidation
- Created `src/pages/InvestmentsPage.tsx` — tabbed page with "Investments" and "Projections" tabs
- Removed `/invest` and `/projections` routes from App.tsx
- Added single `/investments` route
- Sidebar: replaced NavGroup (Investments + Projections sub-links) with single "Investments" link

### 4. NavGroup Component Removed
- Removed `NavGroup` component and `Collapse` import from Sidebar.tsx
- Simplified sidebar to flat link structure

### Files Created
- `src/pages/FinancePage.tsx`
- `src/pages/InvestmentsPage.tsx`

### Files Modified
- `src/App.tsx` — routes, imports
- `src/components/layout/Layout.tsx` — removed app title from AppBar, updated breadcrumbs
- `src/components/layout/Sidebar.tsx` — removed NavGroup, flat links, removed Collapse import
