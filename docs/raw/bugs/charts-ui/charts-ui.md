# Charts UI 

## Description
All the charts in the webapp are not well formatted, some use too much space, some have too much padding or empty space, and other cut off the labels. I will write every problem I see for every charts we have.

## PAGES

### HOME PAGE

#### CHART: Cash Flow Trend
- the chart left too much unused space between the border of the container and the start of the chart itself, the y-axis has too much space to the left. 
- I think there is another label below this one and I think it's cutted off by the container: I can see some labels (but it's just some pixels and they are "IncomeExpe") and selected them. Maybe it's something related to this very chart, and if it is this label has too much space above it and it is not readable.

#### CHART: Portfolio Value
- there is the same main problem of the Cash Flow Trend chart, too much space on the left and also the labels are cutted off (we now have just two labels on the x-axis and the one on the right is not readable: I just see a "2...")

#### Investments button
- in the home page the investments button send the user to a "/invest" route that doesn't exist, instead exists "/investments" and we should use this one

#### Accounts Detail subpage
- same problems of the left empty space in the charts of this page
- same problems of the cutted labels
- Account Breakdown chart has labels completely cutted off and they are too far away from the pie itself

### TRANSACTIONS

#### CHART: Spending by Category
- same problems of the other charts: labels are cutted off and not readable, also the labels are also too far away from the pie itself

### FINANCE - SALARY TAB

#### CHART: Monthly Salary Trend
- same problem of the other charts: too much empty space on the left

### FINANCE - INSIGHT TAB

#### CHART: All charts
- same problems for all charts: too much empty space on the left, labels not readable and for pie charts also too much space between pie and labels

### INVESTMENTS - CASH BALANCE TAB

#### CHART: Portfolio Value
- same problems: too much empty space on the left, labels not readable

### INVESTMENTS - INVESTED CAPITAL TAB

#### CHART: Allocation
- same problems: too much empty space between pie and labels, labels not readable

#### CHART: Portfolio Value
- same problems: too much empty space on the left, labels not readable

### CAR
- same problems for all charts of all tabs: too much empty space to the left, labels not readable

### UTILITIES
- same problems for all charts of all tabs: too much empty space to the left, labels not readable

---

## Follow-up (2026-10-01) — dashboard: equal heights + invisible axis labels

New report after the dashboard calendar work: Cash Flow Trend shorter than Portfolio Value
(280 vs 300) and "some strings are not visible".

Analysis of `@mui/x-charts` 9.2.0 internals:

1. `shortenLabels.js` — tick labels are **ellipsized** to the space around their tick; with
   `margin.left: 15` (WIP commit `b7e4f39` reduced 35 → 15) y-axis money labels only had ~15px.
2. `ChartsXAxis.js` — `tickLabelInterval: 'auto'` **removes labels that would overlap** the
   previous one ("closer than `tickLabelMinGap` (4px) → hidden"). 12 × "Oct 2025" ≈ 624px in a
   ~500px half-card → every other month dropped. `disableTicks` only affects tick marks.
3. `ChartsWrapper` — grid = `[chart 1fr, legend auto]`; passing `height` to
   `ChartsDataProvider` fixes the SVG height only, so legend row stacked *outside* it and
   overflowed the fixed `<Box>`.

Fix applied to `src/components/dashboard/Charts.tsx` + `src/components/investment/PortfolioLineChart.tsx`:

- Both boxes `height: 320`; `height` prop removed from `ChartsDataProvider` → v9 measures the
  container instead (`extendVertically` wrapper 100% + `ChartsLayerContainer` 100% of the chart
  grid cell via ResizeObserver); legend renders inside the box.
- `margin: { left: 60, bottom: 60 }` on both (was 15/20 + 50).
- x labels rotated: `tickLabelStyle: { angle: -45, textAnchor: 'end' }` → footprint
  `text × cos45°` ≈ 37px, all 12 months fit; dense portfolio ranges still sub-sample.

Verified: tsc clean, 162/162 tests, lint baseline (9 errors), build OK.
