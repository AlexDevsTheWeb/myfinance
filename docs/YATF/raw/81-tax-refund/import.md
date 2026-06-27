## Feature: ETF Portfolio Tracking & Charting

### Objective
Implement a robust mechanism to track ETF holdings and render performance charts without direct broker integration, relying on user-provided transaction data and public financial APIs.

### 1. Data Ingestion (Transactions)
Provide two methods for the user to log historical purchases:
* **Manual Form:** Fields for `Date`, `Ticker/ISIN`, `Shares Cooperated (Float)`, `Price per Share`, and `Fees (if any)`.
* **File Parser (CSV/PDF):** A drag-and-drop component to parse monthly statements exported from the broker to automatically extract transaction rows.

### 2. Live Market Data Integration
* **Action:** The system must fetch current and historical close prices using a public financial API (e.g., Yahoo Finance or Alpha Vantage) using the asset's Ticker/ISIN.
* **Frequency:** Fetch data on portfolio view initialization or via a manual "Refresh" button to prevent API rate-limiting.

### 3. Charting & Metrics Requirements
* **Metrics to Calculate:**
  * **Total Invested:** $\sum (\text{Shares} \times \text{Purchase Price})$
  * **Current Value:** $\sum (\text{Total Shares Owned} \times \text{Live Market Price})$
  * **Total Return (% and Absolute):** $\text{Current Value} - \text{Total Invested}$
* **UI Components (Material UI + Chart Library like Recharts/Chart.js):**
  - [ ] **Line Chart:** Displaying the historical portfolio value over time (1M, 6M, 1Y, ALL).
  - [ ] **Donut Chart:** Asset allocation breakdown (even if starting with 100% Global ETF, structured to support multiple assets later).

---

## Updated Todo List
- [ ] Create the database schema/store slice for `etf_transactions` and `portfolio_snapshots`.
- [ ] Implement the Manual Transaction Form.
- [ ] Integrate a free financial API client to fetch historical and live ticker prices.
- [ ] Build the Portfolio Dashboard UI using Material UI Cards and interactive charts.
- [ ] [Optional/Future] Implement the CSV parser logic for automated statement uploads.