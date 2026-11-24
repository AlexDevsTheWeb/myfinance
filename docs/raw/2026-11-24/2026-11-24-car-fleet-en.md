# OpenCode Prompt: Car & Fleet Analytics Page (React + MUI v9)

## Objective
Rebuild and enhance the **Car & Fleet Analytics** page (`/car` / `CarPage.tsx`) adhering strictly to the **Executive Dark / Swiss-Tech** design system (`#0B0E14` background, `#131B2E` cards, `#1E293B` borders, `JetBrains Mono` monospaced typography for all numeric metrics).

---

## Key Functional & Architectural Requirements

### 1. Vehicle Scoping & Strict Isolation
- **Vehicle Selector Header Bar**:
  - Filter by Vehicle: `Auto Principale`, `Scooter / Moto`, `Noleggio / Viaggi`, `Tutti`.
  - Filter by Year: `2026`, `2025`, `All`.
- **Strict Metric Isolation**:
  - Efficiency (`km / L`) and Cost/km (`€ / km`) **MUST be calculated strictly per selected vehicle**.
  - Rented cars or scooter fuel fills MUST NOT pollute the main vehicle's average mileage or efficiency math.

### 2. High-Density KPI Summary Cards (4 Cards Grid)
- **Card 1: Total Fuel & Vehicle Spend (€)**: Total amount in monospaced font with YoY Δ% badge.
- **Card 2: Distance Driven (km)**: Total odometer distance logged for the selected vehicle + monthly average km.
- **Card 3: Real Cost per Kilometer (€ / km)**: Weighted unit rate `Total Vehicle Spend ÷ Total Distance Driven` displayed in **JetBrains Mono** (e.g. `€ 0,142 / km`). Includes breakdowns for Fuel vs Maintenance/Fees.
- **Card 4: Fuel Efficiency (km / L)**: Real-world average consumption in **`km / L`** (Kilometers per Liter, e.g. `16,4 km/L`).

### 3. Analytics & Charts (`@mui/x-charts` v9)
- **Chart 1: Dual-Axis Fuel Spend vs Cost/Km**:
  - **Left Axis (Stacked Bars - €)**: Fuel Spend (Amber/Orange) + Maintenance/Fixed Fees (Slate).
  - **Right Axis (Line - €/km)**: Weighted Cost per Kilometer trend line across months.
- **Chart 2: Year-over-Year (YoY) Monthly Distance Comparison**:
  - Compare monthly kilometers driven (e.g., **2026 solid curve vs 2025 dashed curve**) over 12 months to analyze seasonal driving patterns.

### 4. Expense Types Support
- Expand transactions to support vehicle specific fields:
  - `vehicleId` / `vehicleName` (e.g. "Peugeot 208", "Scooter Vespa", "Rental Ireland")
  - `odometerKm` (Current odometer reading)
  - `liters` (Liters filled)
  - `pricePerLiter` (€/L rate)
  - `expenseType` (`Rifornimento`, `Tagliando / Manutenzione`, `Bollo / Assicurazione`)

### 5. High-Density Refueling & Maintenance Table
- Table featuring: Date, Vehicle Badge, Expense Type, Odometer (km), Liters (L), Price/L (€/L), Total (€), Calculated `km/L` for fuel rows, and Row Actions (Duplicate/Delete).
- Fully searchable, filterable by expense type/vehicle, and CSV exportable.

### 6. Drawer Integration
- Utilize the unified `useNewTransaction()` hook to seed the `Car / Carburante` preset into the global Slide-Over Drawer with odometer, liters, price per liter, and vehicle selector fields.

---

## Technical Workflow for OpenCode
1. Extend `ITransaction` in `store/types/finance.types.ts` with optional additive fields (`odometerKm`, `liters`, `pricePerLiter`, `vehicleName`).
2. Update converters, sanitizers, and drawer utils.
3. Build pure helper utilities with unit tests (`components/car/car.utils.ts`).
4. Implement `CarPage.tsx` using MUI v9 components (`Grid`, `Card`, `@mui/x-charts`).
5. Run build checks (`npm run build`, `npm test`) and open PR `#204`.
