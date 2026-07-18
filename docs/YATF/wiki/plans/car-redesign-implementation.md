---
type: Plan
description: "Step-by-step implementation plan for the car management page redesign."
title: "Car Management Redesign Implementation Plan"
tags: [plans, implementation, car, frontend]
created: 2026-06-22
updated: 2026-06-22
status: planned
sources: ["raw/PLANS.md"]
related: ["features/car-management-redesign", "architecture/project-state"]
---

# Plan: Car Management Redesign Implementation

Status: planned

## Goal

Redesign Car page with bento grid layout, add monthly averages, maintain all charts.

## Architecture

Single-page React component in CarPage.tsx with bento grid using MUI Grid2.

## Tasks

### Task 1: Historical Averages Calculation
- Add `historicalStats` useMemo computing per-year totals, averages, and months recorded
- Sort descending by year
- **File:** `src/pages/CarPage.tsx`

### Task 2: Bento Grid for Mileage Tab
- Total Odometer (gradient card, spans full)
- Current Year Stats
- Avg With Data + Avg Full Year stat cards
- Historical mini-table (top 3 years)
- New Reading Form
- Statistics Table (monthly breakdown)
- Mileage Trend Chart (line, blue #3b82f6, preserved)

### Task 3: Bento Grid for Tires Tab
- Summer Total (amber accent card)
- Winter Total (blue accent card)
- Current Tires stat card
- New Tire Change Form
- History Table
- Tire Usage Chart (improved, replaces placeholder)

### Task 4: Bento Grid for Fuel Tab
- Total Spent (green gradient card)
- Efficiency (€/km)
- Total Km
- Monthly Details Table
- Fuel Efficiency Trend Chart (green #10b981, preserved)

### Task 5: Build Verification
- Run `npm run build`
- Commit remaining changes

## Dependencies

- [[wiki/features/car-management-redesign/car-management-redesign]]
- [[wiki/conventions/coding-conventions]]

## Verification

- `npm run build` passes
- All acceptance criteria from SPEC.md met
