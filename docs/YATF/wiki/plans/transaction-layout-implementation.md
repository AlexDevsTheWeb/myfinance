---
type: Plan
description: "Implementation plan for restructuring the transaction page layout."
title: "Transaction Layout Improvement Implementation Plan"
tags: [plans, implementation, transactions, frontend]
created: 2026-06-22
updated: 2026-06-22
status: planned
sources: ["https://github.com/AlexDevsTheWeb/myfinance/issues/80"]
related: ["features/transaction-layout-improvement", "architecture/tech-stack"]
---

# Plan: Transaction Layout Improvement Implementation

Status: planned

## Goal

Restructure the `/transactions` page into a two-column layout: filter card + pie chart on the left (4/12), transaction table on the right (8/12), with category/subcategory on the same row.

## Architecture

Single-page React component in TransactionsPage.tsx using MUI Grid2.

## Tasks

### Task 1: Restructure Layout
- Remove the outer Grid container that has the 8/4 split (main + sidebar)
- Make the header span full width
- Create a new Grid container with 4/8 left/right split
- Move the filters into the left column (was inside the 8-col inner grid)
- Move the pie chart into the left column below the filter card (was in the 4-col sidebar)

### Task 2: Compact Filter Form
- Change category and subcategory Grid items from `xs:12` each to `xs:12, sm:6` each (same row)
- Filter card continues to have `borderRadius: 0` and glass background styling

### Task 3: Pie Chart Sizing
- Remove the sticky positioning (was `position: 'sticky', top: 24`)
- Reduce chart height from 320px to ~280px to fit the narrower column

### Task 4: Build Verification
- Run `npm run build`
- Visual check of layout on different screen sizes

## Dependencies

- [[wiki/features/transaction-layout-improvement/transaction-layout-improvement]]
- [[wiki/conventions/coding-conventions]]

## Verification

- `npm run build` passes
- Two-column layout renders correctly at md+ breakpoints
- Category + subcategory on same row
- Pie chart visible below filter card in left column
- Transaction table in right column
