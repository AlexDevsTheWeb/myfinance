---
title: "Transaction Layout Improvement"
tags: [feature, frontend, transactions, planned]
created: 2026-06-22
updated: 2026-06-22
status: planned
sources: ["https://github.com/AlexDevsTheWeb/myfinance/issues/80"]
related: ["plans/transaction-layout-implementation", "architecture/tech-stack"]
---

# Feature: Better Transaction Layout

Status: planned
Priority: medium

## Description

Improve the `/transactions` route layout: move the Spending by Category chart from the right sidebar into the main content area (under the search form), adopt a clear two-column layout, and make the filter form more compact.

## Requirements

- Two-column layout with left column (4/12) and right column (8/12)
- Filters card on the left (with category + subcategory on the same row to save vertical space)
- Spending by Category pie chart placed directly below the filter card in the left column
- Transaction table remains on the right column (8/12)
- Header/title spans full width above the two columns
- No sticky positioning on the chart — natural scroll flow
- Pie chart sizing adapts to the narrower left column

## Design

### Layout Structure

Breakpoints: stacks on mobile (`xs:12` each), 4/8 split at `md`+ (`md:4` / `md:8`).

```
[Full width: Title / Header]
─────────────────────────────────────────────
|  Left Column (4/12)      |  Right Column (8/12) |
|  ┌─────────────────┐      |  ┌──────────────────┐ |
|  │ Filters Card     │      |  │ Transaction Table │ |
|  │ Search           │      |  │                   │ |
|  │ From │ To        │      |  │                   │ |
|  │ Cat  │ Subcat    │      |  │                   │ |
|  │ [sort buttons]   │      |  └──────────────────┘ |
|  └─────────────────┘      |                        |
|  ┌─────────────────┐      |                        |
|  │ Spending by      │      |                        |
|  │ Category (Pie)   │      |                        |
|  └─────────────────┘      |                        |
─────────────────────────────
```

### Filter Form Changes

- Category and Subcategory fields move from separate rows to the same row (6 cols each)
- All other filter fields remain unchanged
- Pie chart height reduced from 320px to ~280px to fit the narrower column

## Implementation Notes

- Single file change: `src/pages/TransactionsPage.tsx`
- Uses MUI Grid2 for layout
- The CategoryPieChart component stays unchanged
- The CategoryPieChart moves from the outer right column to inside the left filter column, below the filter card

## Related

- [[plans/transaction-layout-implementation]]
- [[architecture/tech-stack]]
- [[conventions/coding-conventions]]
