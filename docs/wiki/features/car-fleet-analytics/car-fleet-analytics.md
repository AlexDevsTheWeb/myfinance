---
type: Feature
title: "Car & Fleet Analytics"
description: "Rebuilt /car as a vehicle-scoped fleet analytics page: four KPI cards, dual-axis spend/cost chart, YoY distance, a dense expense table with CSV, and a car block in the transaction drawer."
tags: [feature, frontend, car, analytics, fleet, semver]
created: 2026-11-24
updated: 2026-11-24
status: implemented
sources: ["raw/2026-11-24/2026-11-24-car-fleet-en.md"]
related: ["wiki/features/car-management-redesign/car-management-redesign", "wiki/features/add-transaction-drawer/add-transaction-drawer", "wiki/features/utilities-consumption-page/utilities-consumption-page", "wiki/architecture/store-architecture"]
---

# Feature: Car & Fleet Analytics

Status: implemented
Priority: high

## Description

`/car` is now a fleet analytics surface instead of three tabs. A scope bar selects
a vehicle and a year; four KPI cards summarise spend, distance, real €/km and
km/L; two charts show monthly spend against cost per km and month-by-month
distance versus the previous year; a dense ledger lists every vehicle expense
with search, type filter, sort, pagination, duplicate/delete and CSV export.

The old **Tires** and manual **Mileage** management is preserved below the
analytics in a collapsible *Vehicle log*, so no data or capability was lost.

Before this change the page was a Mileage/Tires/Fuel tab set with hardcoded
Italian month names, legacy blue gradients and fuel detection by
`category === 'Trasporti'`. There was no vehicle concept at all.

## Data model

Six **optional, additive** fields on `ITransaction`. No migration: documents
written by older versions read back unchanged, and every reader falls back to
keyword inference when a field is missing.

| Field | Type | Purpose |
|---|---|---|
| `vehicleName` | `string` | Free-text vehicle, e.g. `Peugeot 208`. The selector lists the values present in the data. |
| `vehicleType` | `'car' \| 'scooter' \| 'rental' \| 'other'` | Class used for the badge and grouping. Missing is treated as `car`. |
| `odometerKm` | `number` | Odometer reading at the expense date. The only source of distance. |
| `liters` | `number` | Fuel volume. Deliberately separate from the utility `consumption` field. |
| `pricePerLiter` | `number` | €/L. Derived from amount ÷ litres when absent. |
| `expenseType` | `'fuel' \| 'maintenance' \| 'tax'` | Stable enum; labels are localised. Absent means infer from category keywords. |

`ICarMileageRecord` also gained an optional `vehicleName`. Records written
before it existed are untagged and attributed to the primary vehicle.

## What counts as a car expense

`Trasporti` is shared with public transport, so the category alone cannot decide.
A transaction is a car expense when:

1. it carries a **strong car field** — `odometerKm`, `liters`, `pricePerLiter`
   or an explicit `expenseType`;
2. or an explicit `vehicleName` / `vehicleType`;
3. or it sits in a vehicle category **and** matches a car keyword (fuel,
   maintenance, tax, parking, toll, rental, car wash).

**Public transport is excluded** — `Trasporto pubblico`, train, metro, bus, tram,
flight, taxi, ferry, transport subscriptions and tickets — even when the `/car`
preset auto-set `vehicleType: 'car'`. A generic `Trasporti/Bagaglio` row without
a vehicle tag is excluded too. Those rows stay in the normal transaction ledger;
they are simply not vehicle running costs.

Parking, tolls and rentals **are** kept as car costs and classified as
`maintenance` (the non-fuel running-cost bucket). No category or subcategory data
needs to change.

Expense type is explicit: `Auto (inferred)` lets the category decide, `No type`
persists `none` and suppresses inference, and fuel/maintenance/tax override it.
Vehicle type is optional and shows as *Not set* in the ledger when absent.

Why `vehicleName` and not a registry: the schema stays lightweight and additive,
and the selector is built from the values that actually appear. A vehicle
becomes visible on the page the moment an expense is tagged with it.

Why `liters` and not `consumption`: `consumption` is the utility volume (kWh,
SMC, m³, L) and is read by the utilities page. Keeping fuel in its own field
lets the car block and the utility block stay independent in the drawer.

## Distance and efficiency math

All arithmetic lives in `components/car/car.utils.ts` and is unit tested.

**Odometer deltas, per vehicle.** Readings are grouped by vehicle, sorted by date
then by odometer, and each reading is compared only with the previous reading of
the **same vehicle**:

```
delta = reading[n] − reading[n − 1]        (only when delta > 0)
```

- The first reading of a vehicle is a **baseline** and yields no distance.
- A decreasing reading (reset, typo) is ignored rather than producing negative
  distance.
- The delta belongs to the later transaction, so a fill records the km driven
  since the previous fill of that vehicle.

Consequences that are deliberate:

- A rental or scooter can never move the main car's distance, €/km or km/L.
- Expenses without a `vehicleName` share an **Unassigned** bucket. If several
  real vehicles are untagged, their readings are grouped together — tag the
  expenses to isolate them.
- A year filter can attribute km driven in the previous December to a January
  fill: that is what consecutive odometer readings measure.

**KPIs.**

```
distance   = Σ positive deltas in scope
spend      = Σ |amount| of car expenses in scope
€/km       = spend ÷ distance          (null when distance is 0)
km/L       = distance ÷ litres         (null without fuel litres)
avg km/mo  = distance ÷ months with a delta
fuel share = fuel spend ÷ total spend
```

### Legacy data fallback

Existing accounts have no `odometerKm` or `liters` on their transactions, and
their manual `carMileage` records were written before a vehicle field existed.

- **Distance** — a vehicle uses the manual log only while it has **no
  transaction-level odometer deltas** in the selected period. It is a fallback,
  never additive, so the same km cannot be counted twice.
- **Vehicle attribution** — a mileage record belongs to its `vehicleName` when
  present. Untagged records (all pre-2026 data) belong to the **primary
  vehicle**: the most-used car, falling back to the most-used named vehicle.
  That is why selecting `Peugeot 3008` shows readings recorded before the field
  existed. New readings can be assigned in the *Vehicle log*.
- **Litres** — `liters` wins; otherwise the legacy `consumption` field on fuel
  rows is used, because the old drawer stored fuel volume there.
- **Baseline** — an unset initial mileage (`0`) is unknown, so the first reading
  is the baseline instead of a huge delta.

The default period is the **latest year with either source**, so a 2025-only
account does not land on an empty 2026 page. While the fallback is active the
charts show a note that distance comes from the manual log.

## Page structure

```
apps/web/src/
├── pages/CarPage.tsx                          # scope, filters, CSV, dialogs
└── components/car/
    ├── car.utils.ts                           # classification, deltas, totals, series, legacy fallback
    ├── car.utils.test.ts                      # 39 tests
    ├── types.ts                               # colours, sort/expense types
    ├── CarScopeBar.tsx                        # vehicle select + year pills
    ├── CarSummaryCards.tsx                    # 4 KPIs with YoY badge
    ├── CarAnalyticsCharts.tsx                 # dual-axis spend/€-km + YoY distance
    ├── CarExpenseTable.tsx                    # dense ledger, row menu, pagination
    └── CarMileageTiresSection.tsx             # preserved mileage + tire management
```

## Filters

- **Vehicle** — `All vehicles` plus every distinct `vehicleName`, with the type
  and row count in the menu. Strictly per vehicle.
- **Year** — `All years` plus every year that has car data (and the current
  year), as pills.
- **Expense type** — all / fuel / maintenance / tax, in the table toolbar.
- **Search** — description, vehicle, category and subcategory.

## Drawer integration

`AddTransactionDrawer` gained a **Vehicle & fuel** accordion, shown when the
category is a vehicle category or the drawer was opened from `/car` with the car
preset. It contains:

- vehicle name (free text with autocomplete from existing names),
- vehicle type and expense type,
- odometer, litres and price per litre,
- a live €/L preview derived from the amount.

When the car block is active the **utility accordion is hidden**, so a fuel fill
never shows supplier/meter/fixed-quota fields. `useNewTransaction()` seeds the
vehicle category and `vehicleType: 'car'` on `/car`, and the TopBar CTA remains
the single create entry point — no duplicate page CTA.

## Backwards compatibility

- Old fuel rows with no car fields are still recognised by category/subcategory
  keywords (`Trasporti`, `Carburante`, `Benzina`, `Gasolio`, …) and appear in the
  ledger. Their type is inferred; their distance is unknown until an odometer
  reading is added.
- Utility bills are excluded even if a shared word appears, because
  `utilityType` wins and the utility categories are not vehicle categories.
- The manual mileage/tire data is untouched and still powers the *Vehicle log*.
  It also supplies distance when no transaction odometer exists, as a fallback
  (not additive).

## Related

- [[wiki/features/car-management-redesign/car-management-redesign]] — the previous car page (superseded)
- [[wiki/features/add-transaction-drawer/add-transaction-drawer]] — the drawer that now records car fields
- [[wiki/features/utilities-consumption-page/utilities-consumption-page]] — the dual-axis chart and enum pattern this page follows
- [[wiki/architecture/store-architecture]] — transaction persistence
- Implementation report: [[wiki/features/car-fleet-analytics/report-2026-11-24]]
- Source: [raw/2026-11-24/2026-11-24-car-fleet-en.md](../../../raw/2026-11-24/2026-11-24-car-fleet-en.md)
