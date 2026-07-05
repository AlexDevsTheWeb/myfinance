---
title: "User Settings Architecture — Configurable Rates"
tags: [architecture, settings, projections, draft]
created: 2026-07-05
updated: 2026-07-05
status: draft
sources: ["raw/103.md"]
related: ["features/user-configurable-rates", "features/tax-inflation-modeling", "features/financial-projections", "plans/user-configurable-rates-implementation", "architecture/financial-projections-architecture", "architecture/project-state"]
---

# Architecture: User Settings — Configurable Inflation & Tax Rates

## Overview

Introduces a lightweight user-preferences system for storing configurable inflation and tax rates used in financial projections. This is the first instance of a user-settings pattern in the app and should be designed for extensibility.

## Data Flow

```
User fills SettingsForm
        │
        ▼
useUserSettingsStore.updateSettings(settings)
        │
        ├─► Firestore: write to userSettings subcollection
        ├─► localStorage: cache for offline/hydration
        │
        ▼
useUserSettingsStore state updated
        │
        ▼
ProjectionsPage re-reads rates from store
        │
        ▼
useProjections passes rates to generateFinancialProjection()
        │
        ▼
MonthlySnapshot[] computed with user values
```

### Startup Flow

```
App mounts → user authenticated?
  ├─ Yes → fetchSettings() from Firestore
  │         ├─ Found → populate store + cache
  │         └─ Not found → use defaults (inflation: 3%, tax: 20%)
  └─ No → no settings loaded (projections use defaults)
```

## Firestore Schema

### Option A: Subcollection (recommended)

```
users/{userId}/settings/default
  ├─ inflationRate: number (0.03 = 3%)
  ├─ taxRate: number (0.20 = 20%)
  └─ updatedAt: Timestamp
```

### Option B: Extended user doc

```
users/{userId}
  ├─ ...existing fields...
  ├─ settings.inflationRate: number
  └─ settings.taxRate: number
```

**Recommendation:** Option A (subcollection) for cleaner separation and easier future extension with additional settings.

### Firestore Security Rules

```
match /users/{userId}/settings/{doc} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## State Management

### `useUserSettingsStore` (Zustand)

```typescript
interface UserSettingsStore {
  inflationRate: number;
  taxRate: number;
  isLoaded: boolean;

  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Pick<UserSettingsStore, 'inflationRate' | 'taxRate'>>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}
```

- Hydrated on app startup after auth state resolves
- Writes are optimistic: update local state + cache first, then Firestore, rollback on failure
- `localStorage` cache as fallback for offline/slow connections

## Component Tree (New/Modified)

```
SettingsPage (route: /settings) [NEW]
  └── SettingsForm [NEW]
        ├── NumberField: Inflation Rate (%)
        ├── NumberField: Tax Rate (%)
        ├── Save Button
        └── Reset to Defaults Button

ProjectionsPage [MODIFIED]
  └── useProjections [MODIFIED]
        └── reads inflationRate + taxRate from useUserSettingsStore
```

## API / Firebase Layer

| Function | Purpose |
|----------|---------|
| `fetchUserSettings(userId)` | Read settings from Firestore, return defaults if none |
| `updateUserSettings(userId, settings)` | Write settings to Firestore |
| `resetUserSettings(userId)` | Delete settings doc (triggers default fallback) |

## Default Values

| Rate | Value | Notes |
|------|-------|-------|
| Inflation | 3% (0.03) | Slightly above current hardcoded 2% for broader geographic applicability |
| Tax | 20% (0.20) | Below current hardcoded 26% (Italian-specific) for broader applicability |

Current hardcoded values (2% inflation, 26% tax) remain as application constants but are no longer the user-facing defaults.

## Impact on Existing Architecture

| Layer | Change |
|-------|--------|
| `compoundInterestUtils.ts` | Accept `inflationRate` and `taxRate` as function parameters |
| `useProjections.ts` | Read from `useUserSettingsStore` instead of constants |
| `ProjectionControls.tsx` | Inflation toggle label shows user's configured rate |
| `financial-projections-architecture` | The "no persistence" design decision is partially amended — engine remains pure function, but inputs come from persistent settings |

## Extensibility

This architecture is designed to be the foundation for future user preferences:

- Theme toggle (light/dark)
- Currency/regional settings
- Notification preferences
- Dashboard layout preferences

Future settings can be added as new fields in the same settings doc without structural changes.

## Related

- [[features/user-configurable-rates]] — Feature spec
- [[plans/user-configurable-rates-implementation]] — Implementation plan
- [[features/tax-inflation-modeling]] — Current implementation (will be updated)
- [[features/financial-projections]] — Consumer of settings
- [[architecture/financial-projections-architecture]] — Projections architecture (will be updated)
- [[architecture/external-integrations]] — Firebase config
