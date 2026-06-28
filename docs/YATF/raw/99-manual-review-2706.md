# Manual Review 27-06-2026 — Analysis & Solution Approach

Issue: [#99](https://github.com/AlexDevsTheWeb/myfinance/issues/99)

---

## 1. Dashboard Split (UI/UX)

### Problem
The current Dashboard (`DashboardPage.tsx`) is overloaded — it shows RecapCards, recent transactions, account cards, net worth chart, account breakdown chart, and cash flow trend all on one page. The issue requests splitting it into:

- A **true dashboard** with an overview of transactions, balances, income/expenses, investments, budget, etc. — mostly charts. Must always allow quick income/expense insertion.
- A **proper transactions page** (the recent transactions section becomes unnecessary).

### Solution Approach
**Create two distinct pages:**

#### A. New Dashboard (`DashboardPage.tsx`)
- Keep the title + welcome text + mileage reminder
- **Top row:** RecapCards (current balance, total income, total expenses, monthly delta) — already exists
- **Charts section:** Move existing charts from right column and enhance:
  - Keep NetWorthChart and AccountBreakdownChart
  - Keep Charts (cash flow trend)
  - Add investment portfolio summary (if investment tracking enabled)
  - Add budget progress summary (if budget tracking enabled) — savings rate, burn-up
  - Income vs Expense bar chart (monthly comparison)
- **Quick actions:** The FAB (floating action button for New Income/New Expense) already exists in Layout.tsx — ensure it's always visible on dashboard
- Remove: TransactionTable (recent), AccountCards

#### B. Enhanced Transactions Page (`TransactionsPage.tsx`)
- Already exists with filters, category pie chart, paginated transaction list
- No changes needed structurally — it already works well
- The issue says "recent transactions is not so useful" — just remove `TransactionTable` with `limit={8}` from dashboard

### Files to create/modify
- `src/pages/DashboardPage.tsx` — strip transaction table, add investment/budget charts
- `src/pages/TransactionsPage.tsx` — already good, no changes needed

---

## 2. Account Charts in Dialog (UI/UX)

### Problem
AccountCards (individual account detail cards with sparklines) and net worth charts are on the dashboard taking space. The issue requests placing them in a dialog (possibly full-page).

### Solution Approach
- Remove `AccountCard` components from DashboardPage (they're gated by `accountDetails` toggle)
- Create a new `AccountDetailDialog` component (full-screen dialog) triggered from the dashboard or RecapCards
- The dialog shows:
  - All account cards with current balance, initial balance, sparkline history
  - NetWorthChart
  - AccountBreakdownChart
- Remove the `accountDetails` toggle from RecapCards — replace with a button/link that opens the dialog

### Files to create/modify
- `src/components/dashboard/AccountDetailDialog.tsx` — new component
- `src/pages/DashboardPage.tsx` — remove account details toggle, add dialog trigger
- `src/components/dashboard/RecapCards.tsx` — update toggle button to dialog trigger

---

## 3. More Charts (UI/UX)

### Problem
Evaluate adding more useful charts to the dashboard.

### Solution Approach
- **Investment portfolio chart** (if `investmentTracking` enabled): Show portfolio value over time from portfolio snapshots
- **Budget progress chart** (if `budgetTracking` enabled): Show burn-up trend, savings rate gauge
- **Income vs Expense monthly bars** (already exists in Insights as MonthlyComparisonChart — reuse)
- All of these exist already in the analytics layer (`src/analytics/`) or in budget/investment components — just need to integrate into the new dashboard layout

### Files to modify
- `src/pages/DashboardPage.tsx` — add conditional investment/budget charts

---

## 4. Menu Bar: Vertical Sidebar (UI/UX)

### Problem
The top horizontal bar has direct buttons for each module, plus a "Finance" dropdown for Salary and Insights. The issue requests a vertical left sidebar, with Finance/Investments/Projections grouped together.

### Solution Approach
This is a significant layout change to `Layout.tsx`:

- **Replace top AppBar** with a persistent left sidebar (drawer) on desktop
- **Sidebar items:**
  - Dashboard (always)
  - **Finance group** (collapsible or section header):
    - Salary
    - Insights
  - **Investment group** (collapsible or section header):
    - Investments (if enabled)
    - Projections
  - Budget (if enabled)
  - Car (if enabled)
  - Utilities (if enabled)
  - Separator
  - Settings
  - Logout
- **Top bar** remains minimal — just logo/app title + user avatar
- On mobile, keep the existing swipeable drawer pattern

### Implementation considerations
- Use MUI's permanent `Drawer` for desktop (left side)
- Move navigation items from AppBar to drawer
- Group Finance and Investment sections with `ListSubheader` or nested `List`
- Keep the AppBar but simplify it to just logo + user menu
- The FAB (new income/expense) stays in layout

### Files to create/modify
- `src/components/layout/Layout.tsx` — major refactor
- `src/components/layout/Sidebar.tsx` — new component for the sidebar
- Maybe `src/components/layout/AppTopBar.tsx` — simplified top bar

---

## 5. Bug: Car Statistics Year (Bug)

### Problem
Line 444 of `CarPage.tsx`:
```tsx
<Typography variant="h6" sx={{ fontWeight: 800 }}>{t('car.statistics', { year: selectedYearFilter })}</Typography>
```

The translation files have:
- EN: `"car.statistics": "Statistics {year}"`
- IT: `"car.statistics": "Statistiche {year}"`

i18next uses **`{{year}}`** (double braces) for interpolation by default. The translation values use single braces `{year}`, so the interpolation variable is never replaced — the UI shows the literal `"Statistics {year}"` instead of `"Statistics 2026"`.

Same issue affects `utilities.total` key: `"Total {title}"` instead of `"Total {{title}}"`.

### Fix
Change `{year}` → `{{year}}` and `{title}` → `{{title}}` in both `en.json` and `it.json`:
- `car.statistics`
- `utilities.total`
- `insights.financialTrendTitle`
- Any other keys using interpolation

### Files to modify
- `src/locales/en.json` — fix interpolation syntax
- `src/locales/it.json` — fix interpolation syntax

---

## 6. Complete Translations ENG - ITA (Other)

### Problem
Several strings in `Layout.tsx` are hardcoded instead of using `t()`:

| Location | Hardcoded String | Fix |
|----------|-----------------|-----|
| Layout.tsx:185 | `Finance` | New key: `nav.finance` |
| Layout.tsx:299 | `Impostazioni` | Use `t('navigation.config')` |
| Layout.tsx:302 | `Logout` | Use `t('common.logout')` |
| Layout.tsx:350 | `Dashboard` (breadcrumb) | Use `t('navigation.dashboard')` |
| Layout.tsx:439 | `New Income` | New key: `common.newIncome` |
| Layout.tsx:456 | `New Expense` | New key: `common.newExpense` |
| DashboardPage.tsx:112 | `Accounts Detail` | Already has `t('dashboard.accountsDetail')` — just not used |

### Files to modify
- `src/components/layout/Layout.tsx` — replace hardcoded strings with `t()`
- `src/locales/en.json` — add missing keys
- `src/locales/it.json` — add missing keys

---

## 7. Reduce Card Padding (Other)

### Problem
Various components use high padding values (`p: 3`=24px, `p: 2.5`=20px, `p: 2`=16px). The issue requests reducing all card/box padding to 12px (`p: 1.5`) or less.

### Components affected
| File | Current | Target |
|------|---------|--------|
| `RecapCards.tsx` line 246 | `p: 3` (24px) | `p: 1.5` (12px) |
| `Charts.tsx` line 44 | `p: 2` (16px) | `p: 1.5` (12px) |
| `AccountCard.component.tsx` line 21 | `p: 2.5` (20px) | `p: 1.5` (12px) |
| `CarPage.tsx` card `p: 3` | 24px | 12px |
| `InvestmentPage.tsx` cards | `p: 3` | 12px |
| `ProjectionControls.tsx` / `ProjectionSummary.tsx` | `p: 3` | 12px |
| `CashInterestCard.tsx` / `PortfolioStats.tsx` | `p: 3` | 12px |
| `HoldingsTable.tsx` | `p: 3` | 12px |
| `TransactionModal.tsx` DialogActions | `p: 3` | `p: 1.5` |
| `BrokerSettingsModal.tsx` DialogActions | `p: 3` | `p: 1.5` |
| Various dialogs `p: 3` | 24px | 12px |
| `CardContent` spacing | gap: 3 | gap: 1.5 |

### Approach
Systematic reduction across all components. Search for `p: 3`, `px: 3`, `py: 3`, `p: 2.5` in component files and reduce proportionally. Keep the visual hierarchy (more important cards can still have slightly more padding, just at a lower baseline).

### Files to modify
~20+ component files — do this in a single wave to ensure consistency.

---

## Implementation Order

| Priority | Item | Effort | Dependencies |
|----------|------|--------|-------------|
| P0 | **Bug: Car Statistics Year** | Trivial (~2 files) | None |
| P0 | **Hardcoded strings → translations** | Small (~3 files) | None |
| P1 | **Reduce card padding** | Medium (~20 files) | None |
| P1 | **Account Detail Dialog** | Medium (2 new, 2 modified) | Dashboard split may affect placement |
| P2 | **Dashboard Split** | Large (~3 files) | Account dialog, charts placement |
| P2 | **More charts on dashboard** | Medium (~1 file) | Dashboard split |
| P3 | **Vertical sidebar menu** | Large (~2 new, 1 modified) | None (independent) |

---

## Summary

This review covers **7 distinct work items** across 3 categories:

- **UI/UX** (Dashboard split, Account dialog, More charts, Vertical sidebar) — major layout changes
- **Bug fix** (Car statistics interpolation) — trivial fix
- **Polish** (Translations, Padding) — broad but mechanical changes
