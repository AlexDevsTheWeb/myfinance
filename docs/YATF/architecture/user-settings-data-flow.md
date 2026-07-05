---
title: "User Settings Architecture — Configurable Rates"
tags: [architecture, settings, projections, active]
created: 2026-07-05
updated: 2026-07-05
status: active
sources: ["raw/103.md"]
related: ["features/user-configurable-rates", "features/tax-inflation-modeling", "features/financial-projections", "plans/user-configurable-rates-implementation", "architecture/financial-projections-architecture", "architecture/project-state"]
---

# Architecture: User Settings — Configurable Inflation & Tax Rates

## Overview

A lightweight user-preferences system for storing configurable inflation and tax rates used in financial projections. Settings are stored as a `projectionSettings` field on the existing `users/{userId}` Firestore doc, consumed by the `useProjections` hook.

## Data Flow

```
User fills form in ConfigPage > Projections tab
        │
        ▼
useProjectionSettingsStore.saveSettings(settings)
        │
        ├─► Firestore: updateDoc projectionSettings on users/{userId}
        │
        ▼
Store state updated (optimistic)
        │
        ▼
ProjectionsPage / useProjections re-reads rates from store
        │
        ▼
setInflationToggle(enabled) sets adjustForInflation + inflationRate
estimatedTaxes computed with user taxRate
```

### Load Flow

```
User visits ConfigPage > Projections tab, or ProjectionsPage
        │
        ▼
useProjectionSettingsStore.loadSettings()
        │
        ├─► getDoc(users/{userId})
        │    ├─ projectionSettings found → populate store
        │    └─ not found → use defaults (2%, 26%)
        └─► loaded = true
```

## Firestore Schema

Stored as a field on the existing `users/{userId}` doc (no new collection):

```
users/{userId}
  ├─ ...existing fields (transactions, accounts, etc.)...
  └─ projectionSettings: {
        inflationRate: number,  // 0.02 = 2%
        taxRate: number         // 0.26 = 26%
      }
```

No Firestore security rule changes needed — the existing user doc rules cover the field.

## Store — `useProjectionSettingsStore` (Zustand)

```typescript
interface ProjectionSettingsStore {
  inflationRate: number;
  taxRate: number;
  loaded: boolean;

  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<Pick<ProjectionSettingsStore, 'inflationRate' | 'taxRate'>>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}
```

- Loaded lazily (not on app startup) — triggered when ConfigPage or ProjectionsPage is visited
- Optimistic writes: update local state first, then Firestore, rollback on error
- Defaults: inflation 2% (0.02), tax 26% (0.26) — matching the original hardcoded values

## Component Integration

```
ConfigPage (route: /settings) [MODIFIED]
  └── Tab index 6: Projections [NEW]
        ├── NumberField: Inflation Rate (%) with % adornment
        ├── NumberField: Tax Rate (%) with % adornment
        ├── Save button → saveSettings
        └── Reset to Defaults → resetToDefaults

ProjectionsPage [UNCHANGED]
  └── useProjections [MODIFIED]
        └── reads inflationRate + taxRate from useProjectionSettingsStore
```

## Default Values

| Rate | Default | Notes |
|------|---------|-------|
| Inflation | 2% (0.02) | Matches original hardcoded value |
| Tax | 26% (0.26) | Matches original hardcoded value (Italian capital gains) |

## Impact on Existing Architecture

| Layer | Change |
|-------|--------|
| `useProjections.ts` | Reads `inflationRate` and `taxRate` from settings store instead of hardcoded constants |
| `ProjectionControls.tsx` | Inflation toggle uses user's configured rate (no change to component itself — hook handles it) |
| `financial-projections-architecture` | The "no persistence" design decision is partially amended — engine remains pure, but inputs come from persistent settings |

## Files

| File | Role |
|------|------|
| `src/store/useProjectionSettingsStore.ts` | Zustand store with Firestore read/write |
| `src/pages/ConfigPage.tsx` | Projections tab with form (index 6) |
| `src/hooks/useProjections.ts` | Reads settings store for rates |

## Extensibility

This store pattern can be extended for future user preferences by adding fields to the same `projectionSettings` object:

- Currency/regional settings
- Theme preference
- Dashboard layout preferences
- Notification preferences

## Related

- [[features/user-configurable-rates]] — Feature spec (implemented)
- [[plans/user-configurable-rates-implementation]] — Implementation plan (completed)
- [[features/tax-inflation-modeling]] — Current implementation (updated)
- [[features/financial-projections]] — Consumer of settings
- [[architecture/financial-projections-architecture]] — Projections architecture
- [[architecture/external-integrations]] — Firebase config
