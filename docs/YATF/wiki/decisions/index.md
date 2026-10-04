---
type: Index
title: "Decisions — Index"
description: "Architecture Decision Records (ADRs) and trade-off analyses."
timestamp: 2026-07-18
---

# Decisions

Architecture Decision Records (ADRs) and trade-off analyses.

## Pages

| Concept | Description |
|---------|-------------|
| [[decisions/balancr-identity-system|balancr-identity-system]] | Balancr visual identity: Linked Hexagons logo, dark palette, and gradient system. |
| [[decisions/chart-migration-mui|chart-migration-mui]] | Migration of 16 chart components from Recharts to MUI X Charts for theme-awareness. |
| [[decisions/firestore-rate-limiting|firestore-rate-limiting]] | No server-side write rate limiting; client-only app → defer App Check + server-side limiting to paid-tier launch. |
| [[decisions/pwa-strategy|pwa-strategy]] | ⚠️ SUPERSEDED — PWA-first mobile strategy before Flutter; replaced by the React Native monorepo decision. |
| [[decisions/react-native-monorepo|react-native-monorepo]] | ✅ React Native + npm workspaces monorepo for web/mobile/website/backend. Rejects nested sub-repos and pnpm. |
| [[decisions/saas-readiness|saas-readiness]] | Hard blockers vs ship-as-is analysis: fix 6 critical items, launch, iterate with real users. |
| [[decisions/typescript-7-upgrade|typescript-7-upgrade]] | TypeScript 7.0 Go-rewrite adoption with ESLint linting workaround via @typescript/typescript6. |
