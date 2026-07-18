---
title: "Balancr — Complete Rebranding"
tags: [feature, frontend, branding, identity]
created: 2026-07-18
updated: 2026-07-18
status: implemented
sources: ["raw/balancr-identity-system/balancr-identity-system.md"]
related: ["wiki/decisions/balancr-identity-system"]
---

# Feature: Balancr — Complete Rebranding

Status: **implemented**

## Description

Complete app rebranding from "YAFT - Yet Another Finance Tracker" to **Balancr** — a premium financial tracking application with a new visual identity based on the **Linked Hexagons** concept.

## Changes

### Identity System
- New app name: **Balancr** (stylized as BALANCR)
- New logo: Linked Hexagons SVG mark with neon gradients
- New color palette: Deep dark backgrounds (`#0b0f19`, `#111827`) with cyan/blue neon gradients
- Dark mode optimized, high-contrast interface

### Code Changes
- Environment variable `VITE_REACT_APP_TITLE` → `BALANCR`
- `index.html` title and favicon references updated to `balancr-*`
- Favicon files renamed from `yatf-*` → `balancr-*`
- `package.json` name updated
- Theme colors aligned to new palette
- Backup system now uses `app: 'balancr'` with backward compatibility for `'myfinance'` backups
- localStorage key migrated from `myfinance_language` → `balancr_language`
- New `BalancrLogo` SVG component integrated in Sidebar and LoginPage

### Backward Compatibility
- Old backups with `app: 'myfinance'` are still accepted during import
- Old localStorage key `myfinance_language` is migrated to `balancr_language` on first load

## Implementation Notes
- Wiki directory `docs/YATF/` retained as internal organizational structure
- Branch naming convention `feat/YATF-{n}` / `fix/YATF-{n}` retained for historical continuity
- SVG logo created as reusable React component
- Color palette applied to MUI theme

## Related
- Issue: [#82](https://github.com/AlexDevsTheWeb/myfinance/issues/82)
- Source: [raw/balancr-identity-system/balancr-identity-system.md](raw/balancr-identity-system/balancr-identity-system.md)
