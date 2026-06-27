# Architectural & UX Enhancements — Investment Tracking V2

This document analyzes the current limitations of the `/invest` and `/projections` modules and defines the technical and UX requirements to evolve the application into a robust, multi-asset financial platform.

---

## 1. Automation of Recurring PAC Transactions
*Addressing: "Automatizzare i 200€ al mese dal fondo verso il PAC"*

### Current Limitation
The user must manually log a `Buy` transaction every month, even though the PAC is statically configured in the settings.

### Requirements
* **Deterministic Automated Generation:** Implement a background worker or an initialization hook (via Zustand/Firestore) that checks the current date against the configured PAC day.
* **Virtual Ledger:** If the real date has passed the execution day, the system should automatically generate a recurring `System-Generated Buy` transaction.
* **Cash Balance Impact:** This transaction must automatically decrement the `Broker Cash Balance` and increment the `Invested Capital` units based on the *latest fetched market price* or a pending status until prices are updated.
* **User Confirmation UI:** Display a small notification badge: *"1 automated PAC transaction pending confirmation"* allowing the user to approve or adjust the exact purchase price with a single click.

---

## 2. Full CRUD Operations for Transactions & Settings
*Addressing: "Non si possano eliminare o editare le transazione o le impostazioni"*

### Current Limitation
Data mutation is destructive or restricted; mistakes require manual database intervention via the Firestore console.

### Requirements
* **Transaction Table Actions:** Add an `Actions` column to the Holdings/Transactions table featuring standard Material UI icons (`Edit` / `Delete`).
* **Safe Deletion Logic:** Deleting a transaction must trigger a cascading state recalculation:
  * Revert the units from the `Invested Capital` pool.
  * Recalculate the Average Cost Basis (PMC) dynamically using the remaining historical transactions.
  * Restore the corresponding capital to the `Broker Cash Balance`.
* **Settings Persistence:** The Broker Settings modal must allow full updates without wiping historical snapshots.

---

## 3. Multi-Broker & Multi-Asset Architecture (Portfolio Diversification)
*Addressing: "Il mono broker e il mono etf non mi fa impazzire"*

### Current Limitation
The current database schema and store logic are hardcoded for a single broker and a single ETF ticker, preventing future expansion.

### Database Schema Target
Per sbloccare il multi-broker, i tipi TypeScript dovranno essere rifattorizzati trasformando l'oggetto singolo in collezioni:

```typescript
// From Single-Object to Collections
interface BrokerAccount {
  id: string;
  name: string;          // e.g., Trade Republic, Degiro, Fineco
  baseLumpSum: number;
  interestRate: number;
}

interface AssetHolding {
  ticker: string;        // e.g., SWDA.MI, VWCE.DE
  brokerId: string;      // Linked to the specific broker account
  units: number;
}
```
### UI Adaptation Requirements
**Account Filtering:** Replace the static text elements with a `<Select />` dropdown to filter the dashboard by a specific Broker or view an "All Brokers (Aggregated)" Net Worth perspective.

**Dynamic Distribution:** The Donut Chart will instantly scale from a 100% single-asset view to a real percentage breakdown of multiple ETFs across different brokers.

## 4. Additional Crucial Enhancements (The "Missed Pieces")

### A. Historical Snapshot Persistence

* **The Problem:** The current implementation states: _"Historic prices are not stored; the chart uses the value at the time each snapshot was recorded"_*. If the user clears local states or opens a new device, historical portfolio performance is lost.

* **Solution:** Implement a daily or monthly task that saves the computed Net Worth and ETF Value into a portfolio_history collection in Firestore. This ensures robust, persistent, multi-device charting.

### B. Smart Tax & Fee Modeling

* **The Problem:** Projections use a flat 26% Italian tax rate on nominal gains, but ignore inflation and tracking fees (TER).

* **Solution:** Add a toggle in /projections called Adjust for Inflation (2%). This will automatically calculate the "Real Value" vs "Nominal Value" of the future capital, giving a much more accurate representation of future purchasing power.

### C. Yahoo Finance Ticker Localized Validation
* **The Problem:** Tickers differ by stock exchange (e.g., Milan .MI vs Xetra .DE). Manual entry can cause broken API calls.

* **Solution:** Implement a simple validation regex or a quick test-fetch when saving broker configurations to ensure the user-entered ticker is valid and reachable on Yahoo Finance.