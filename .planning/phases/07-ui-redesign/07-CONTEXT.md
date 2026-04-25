# Phase 07: UI Redesign - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning
**Source:** User design feedback via plan-phase orchestration

---

<decisions>
## Design Decisions

### Layout
- **D-01:** DashboardPage uses two-column grid layout
  - Left column: Balance indicator + transaction list
  - Right column: Cash flow trend chart + additional metrics/charts
- **D-02:** Reduce space around main central section — increase component density
- **D-03:** Transaction list on left side of dashboard (below balance)

### Visual Style
- **D-04:** Border-radius: reduce all `borderRadius` values from 12px/8px/4px to 2px (sharp, minimal corners)
- **D-05:** Apply reduced border-radius globally to: Paper, Button, Dialog, Card components
- **D-06:** Modal border-radius: change from 16px (borderRadius 4) to 2px

### Color Palette
- **D-07:** Desaturate primary color — reduce `#6366f1` indigo saturation (move toward slate-blue `~#475569` or muted indigo `~#5b6cb8`)
- **D-08:** Neutralize background — move from `#1e293b` toward slightly darker slate `~#161b2e` or `#0f1523`
- **D-09:** Reduce cartoonish look — remove high-opacity color backgrounds (`rgba(99,102,241,0.1)` style) on recap cards
- **D-10:** Keep functional colors (income green `#10b981`, expense red `#ef4444`) but reduce their backgrounds

### Space Utilization
- **D-11:** RecapCards: compact cards (reduce padding from `p: 2` to `p: 1.5`)
- **D-12:** Charts: reduce height from 350px to 280px
- **D-13:** Reduce margins between sections (`mt: 4` → `mt: 3`)

### Implementation Order
- **D-14:** Theme changes first (border-radius + palette) — affects ALL components automatically
- **D-15:** DashboardPage layout second — only touches dashboard
- **D-16:** Component-level fine-tuning last — adjust RecapCards, Charts, TransactionTable padding/margins

</decisions>

<canonical_refs>
## Canonical References

- `src/theme/theme.ts` — Global MUI theme with palette and border-radius
- `src/pages/DashboardPage.tsx` — Main dashboard to restructure with two-column grid
- `src/components/dashboard/RecapCards.tsx` — Balance/income/expense cards
- `src/components/dashboard/Charts.tsx` — Cash flow trend chart
- `src/components/dashboard/TransactionTable.tsx` — Recent transactions list
- `src/components/modals/TransactionModal.tsx` — Transaction add/edit modal
</canonical_refs>

<deferred>
## Deferred Ideas

- Additional charts (expense breakdown pie, category trends) — Phase 08
- Responsive mobile layout adjustments — Phase 08
- Custom component library with design tokens — future infrastructure phase
</deferred>

---

*Phase: 07-ui-redesign*
*Context gathered: 2026-04-23 via plan-phase orchestration*