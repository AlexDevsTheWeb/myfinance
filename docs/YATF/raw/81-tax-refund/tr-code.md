## Overview
This issue tracks the implementation of a dynamic investment strategy workflow in the Home Finance App. The goal is to properly log an initial lump-sum deposit (e.g., extraordinary income combined with existing liquidity) transferred to a broker account. From there, a configurable monthly automated allocation (PAC) will purchase an Accumulating ETF.

The system must handle this dynamically based on user inputs, without marking the transfer as an "expense." It is strictly an asset reallocation that increases the "investment reservoir" while keeping the global Net Worth intact.

## Workflow to Implement / Track

### 1. Income Logging (Inflow)
* **Action:** Log the arrival of extraordinary funds on the main bank account.
* **Category:** `Extraordinary Income` (Entrate Straordinarie).
* **Impact:** Increases the main bank account balance dynamically by `[Input: Income Amount]`.

### 2. Internal Transfer (Giroconto / Asset Transfer)
* **Action:** Record the single lump-sum transfer of `[Input: Transfer Amount]` from the main bank to the broker.
* **Transaction Type:** `Internal Transfer` (Giroconto).
* **Impact:** 
  * Decreases main bank balance by `[Input: Transfer Amount]`.
  * Increases Broker `Cash Balance` by `[Input: Transfer Amount]`.
  * **Crucial (Zustand Store):** This state update must be handled atomically. It must *not* be flagged as an expense, ensuring the global Net Worth calculation remains perfectly unchanged.

### 3. PAC Allocation (Monthly Outflow into Assets)
* **Action:** The investment logic must recognize the Broker `Cash Balance` as an available funding source.
* **Execution:** Log the monthly PAC deduction (`[Input: Monthly PAC Amount]`) moving from the Broker `Cash Balance` to the `Invested Capital` (Accumulating ETF).
* **Asset Tracking:** Increase the number of ETF units owned and update the Average Cost Basis (PMC - Prezzo Medio di Carico).

---

## System Variables & User Inputs
To make this feature fully reusable, the following parameters must be configurable by the user via the UI/Settings:

- **Broker Name:** (e.g., Trade Republic, Scalable Capital)
- **Initial Lump-Sum Inflow:** `[Numeric Input]`
- **Monthly PAC Amount:** `[Numeric Input]`
- **Target Asset / Ticker:** (e.g., Global Accumulating ETF / SWDA.MI)
- **Active Interest Rate (%):** `[Numeric Input]` (Annual percentage yield applied to the uninvested Cash Balance)

---

## Technical Note: Asset Allocation vs. Expense Tracking

### Context
Since the primary goal of this app is to calculate and monitor **real monthly expenses**, any initial lump-sum transfer to the broker must be handled strictly in the data layer as an asset movement.

### Implementation Rules
* **Transaction Classification:** The transfer must be explicitly excluded from the monthly expense reducers/metrics. If the core algorithm accidentally flags this deposit as a standard expense, it will artificially spike the expenditure charts.
* **Net Worth Logic:** From an accounting perspective, the money is simply moving between different financial containers (Liquidity -> Investment Reservoir).
* **Interest Yield Calculation:** Implement a utility function or store selector to calculate the monthly accrued interest based on the user-defined **Active Interest Rate (%)** applied to the remaining `Cash Balance`.

### UI/UX & Metrics Requirements
- [ ] Create a configuration modal/form to accept the dynamic parameters (`Transfer Amount`, `PAC Amount`, `Interest Rate %`).
- [ ] Ensure that the main "Monthly Spending" chart/KPI strictly filters out any transactions categorized under `Internal Transfer`.
- [ ] Use Material UI components (e.g., Tabs or distinct Cards) to clearly separate the Broker view into two sections: "Cash Balance" (showing dynamic accrued interest) and "Invested Capital" (ETF value).
- [ ] Implement the PMC (Average Cost Basis) calculation logic for the ETF component.

---

## Todo List
- [ ] Build the settings/input form for the dynamic PAC variables and Interest Rate.
- [ ] Ensure `Internal Transfer` functionality is completely decoupled from the expense budget logic.
- [ ] Implement the Broker account split view (Cash vs Invested) utilizing standard UI components.
- [ ] Write tests covering the workflow with arbitrary mock values (e.g., Transfer = X, PAC = Y, Interest = Z%), asserting that Net Worth == Initial Net Worth and Monthly Expense == 0.}
