---
title: "Balancr Identity System — Linked Hexagons"
tags: [decision, branding, identity, design]
created: 2026-07-18
updated: 2026-07-18
status: accepted
sources: ["raw/balancr-identity-system/balancr-identity-system.md"]
related: ["wiki/features/balancr-branding/balancr-branding"]
---

# Decision: Balancr Identity System — Linked Hexagons

Status: **accepted**

## Context

The app was originally named "YAFT - Yet Another Finance Tracker" with a generic identity. GitHub issue #82 requested a complete rebrand to Balancr with a professional visual identity suitable for a modern financial tracking application.

## Options Considered

1. **Keep existing name** — but "Yet Another Finance Tracker" sounds amateur and doesn't differentiate
2. **Partial rename** — rename app but keep old colors/icons — inconsistent
3. **Complete rebrand** — new name, logo, color system, favicon — chosen

## Decision

Adopt the **Balancr** identity system based on the **Linked Hexagons** concept:

- The name "Balancr" (portfolio of "balance" + tracker) conveys financial stability and precision
- Two interlocking hexagons represent the duality of financial tracking: stability/liquidity (left, blue) and growth/assets (right, cyan/teal)
- Dark theme palette optimized for modern financial dashboards

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Deep Background (Main) | Night blue | `#0b0f19` |
| Surface / Grid | Slate blue | `#111827` |
| Left Hex (Stability) | Deep → Electric → Light Cyan | `#0052d4` → `#4364f7` → `#6fb1fc` |
| Right Hex (Growth) | Bright Cyan → Teal Mint | `#00c9ff` → `#92fe9d` |

### Logo

The SVG logo features two interlocking hexagons with neon glow effects and overlapping coupling segments for a 3D interlacing effect.

## Consequences

- All user-facing branding updated to Balancr
- Old backups remain importable (backward compatibility layer)
- localStorage keys migrated gracefully
- Firebase project and Firestore database IDs remain unchanged (infrastructure-level)
- Internal wiki directory (`docs/YATF/`) retained as-is

## Related
- [[wiki/features/balancr-branding/balancr-branding]]
- Source: [raw/balancr-identity-system/balancr-identity-system.md](raw/balancr-identity-system/balancr-identity-system.md)
