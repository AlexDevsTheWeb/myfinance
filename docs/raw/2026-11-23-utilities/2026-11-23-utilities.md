# OpenCode Prompt: Utilities & Consumption Page Implementation (React + MUI v9)

## Objective
Create the **Utilities & Consumption** analytics page (`/utilities` or `src/pages/UtilitiesPage.tsx`) directly in React + Material UI v9 (`@mui/material` v9.0.1, `@mui/x-charts` v9.2.0, `@mui/x-date-pickers` v9.2.0).

This page must follow the **Executive Dark / Swiss-Tech Design System** established in the Dashboard, Transaction Ledger (PR #197), and Settings (PR #201):
- Background: `#0B0E14`
- Cards & Surfaces: `#131B2E`
- Borders & Dividers: `#1E293B`
- Primary Accent: Cyan (`#0EA5E9`) / Emerald Green (`#10B981`)
- Monospace Typography: `JetBrains Mono` or `fontFamily: 'monospace'` for all monetary amounts (€), physical units (**kWh, SMC, m³**), unit rates (**€/kWh, €/SMC, €/m³**), and dates.

---

## Technical Specifications & UI Layout

### 1. Header & Filter Toolbar (`UtilitiesFilterHeader.tsx`)
- **Header**: Title "UTENZE & CONSUMI" + subtitle "Monitoraggio costi, consumi fisici e scomposizione quota fissa vs energia".
- **Primary Action CTA**: Green/Cyan button `+ Nuova Bolletta / Lettura` that triggers the global `AddTransactionDrawer` (with pre-selected category = "Utenze").
- **Toolbar Controls**:
  - **Period / Year Selector**: Pill buttons (`2026`, `2025`, `Tutti`).
  - **Utility Type Filter**: Segmented control / pills (`Tutte le Utenze`, `⚡ Luce (kWh)`, `🔥 Gas (SMC)`, `💧 Acqua (m³)`).
  - **YoY Comparison Toggle**: Switch `Confronto Stagionale Anno su Anno (YoY)`.

---

### 2. KPI Summary Cards (`UtilitiesSummaryCards.tsx`)
4 High-Density KPI Cards in a 4-column Grid (`Grid item xs={12} sm={6} md={3}`):

1. **Spesa Totale Utenze**:
   - Total Amount in € (Large Monospace).
   - YoY Δ% badge vs previous period.
2. **⚡ Luce (Elettricità)**:
   - Total € spend + Total **kWh** volume.
   - Weighted average rate: **`€/kWh`** (e.g., `0,28 €/kWh`).
   - Breakdown badge: **Quota Fissa % vs Quota Energia %**.
3. **🔥 Gas Naturale**:
   - Total € spend + Total **SMC** volume.
   - Weighted average rate: **`€/SMC`** (e.g., `0,95 €/SMC`).
   - Breakdown badge: **Quota Fissa % vs Quota Energia %**.
4. **💧 Acqua**:
   - Total € spend + Total **m³** volume (annual tracking).
   - Weighted average rate: **`€/m³`**.

---

### 3. Hero Charts (`UtilitiesAnalyticsCharts.tsx` - `@mui/x-charts` v9)

- **Chart A: Dual-Axis Spend vs Consumption Breakdown** (`BarChart` + `LineChart` overlay):
  - **Left Y-Axis (EUR €)**: Stacked Bars representing:
    - **Quota Fissa (€)**: Muted Slate Bar (`#334155`).
    - **Quota Energia (€)**: Accent Bar (Amber `#F59E0B` for Luce, Flame `#EF4444` for Gas, Cyan `#0EA5E9` for Acqua).
  - **Right Y-Axis (Physical Units)**: Smooth Line Chart showing physical consumption (**kWh / SMC / m³**).
  - Hover Tooltip showing: Total Bill, Fixed Fee, Energy Fee, Consumption Volume, and Unit Cost (€/unit).

- **Chart B: Seasonal YoY Comparison (12 Months)**:
  - Rendered when YoY toggle is active.
  - Overlaid line curves comparing current year vs previous year monthly consumption to track winter/summer heating & cooling efficiency.

---

### 4. Dense Historical Ledger (`UtilitiesTable.tsx`)
A full-width, high-density data table matching the Transaction Ledger styling:
- **Columns**:
  1. `Data / Periodo` (Monospace date)
  2. `Fornitore / Contratto` (e.g., Enel Energia, Plenitude, Servizio Elettrico)
  3. `Tipo Utenza` (Badge: Luce, Gas, Acqua)
  4. `Importo Totale (€)` (Bold Monospace)
  5. `Quota Fissa (€)` (Muted Monospace)
  6. `Quota Energia (€)` (Accent Monospace)
  7. `Consumo Rilevato` (kWh / SMC / m³)
  8. `Prezzo Effettivo` (€/kWh or €/SMC)
  9. `Azienda / Contatore (POD / PDR)`
  10. `Azioni` (Edit, Duplicate, Delete)
- Pagination, search input, and CSV export action.

---

### 5. Drawer & Store Integration
- Integrate with existing Zustand store (`useFinanceStore`) and ensure transactions with utility readings (`kwh`, `smc`, `waterM3`, `fixedFee`, `energyFee`) map cleanly.
- Ensure `AddTransactionDrawer` populates and saves utility-specific fields accurately.

---

## Execution Workflow for OpenCode
1. Inspect `src/types/` and `src/store/` for transaction data model compatibility with utility metrics (`fixedFee`, `energyFee`, `kwh`, `smc`, `waterM3`).
2. Implement components under `src/components/utilities/` and page `src/pages/UtilitiesPage.tsx`.
3. Add routing entry `/utilities` in `App.tsx` / `Sidebar.tsx`.
4. Create an Implementation Report in `docs/reports/PR-[NUMBER]-utilities-page.md`.
5. Run `npx tsc -b`, `npm run build`, update OKF wiki, commit, push branch `feat/utilities-consumption-page`, and open a Pull Request.
