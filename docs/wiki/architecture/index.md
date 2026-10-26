---
type: Index
title: "Architecture — Index"
description: "System architecture, component diagrams, data flow, and tech stack."
timestamp: 2026-10-05
---

# Architecture

System architecture, component diagrams, data flow, and tech stack.

## Pages

| Concept | Description |
|---------|-------------|
| [[wiki/architecture/codebase-structure|codebase-structure]] | Directory layout, file naming conventions, and source organization. |
| [[wiki/architecture/concerns-and-tech-debt|concerns-and-tech-debt]] | Known tech debt, open bugs, security gaps, and performance concerns. |
| [[wiki/architecture/external-integrations|external-integrations]] | Firebase configuration, environment variables, and CI/CD integration status. |
| [[wiki/architecture/financial-projections-architecture|financial-projections-architecture]] | Simulation data flow, component tree, design decisions, and integration points. |
| [[wiki/architecture/investment-tracking-architecture|investment-tracking-architecture]] | Investment data flow, V1+V2 Firestore schema, store architecture, and component tree. |
| [[wiki/architecture/monorepo-layout|monorepo-layout]] | `apps/` + `packages/` workspace structure — `apps/web` and `apps/website` live — and the repo-level couplings that constrain the migration. |
| [[wiki/architecture/project-state|project-state]] | Current project state, active focus areas, and next prioritized steps. |
| [[wiki/architecture/release-pipeline|release-pipeline]] | How code reaches production: blocking CI, `main` branch protection, PR-based releases, Firebase deploys (two hosting sites), and `main`→`development` sync-back. |
| [[wiki/architecture/system-architecture|system-architecture]] | System overview, component responsibilities, and end-to-end data flow. |
| [[wiki/architecture/tech-stack|tech-stack]] | Full technology stack with library versions and dependency overview. |
| [[wiki/architecture/testing-status|testing-status]] | Current testing infrastructure status — Vitest across two workspaces: 198 tests in `apps/web`, 59 in `apps/website`. |
| [[wiki/architecture/user-settings-data-flow|user-settings-data-flow]] | User settings architecture: Firestore field, Zustand store, and component tree. |
| [[wiki/architecture/versioning|versioning]] | Versioning scheme using conventional commits and the standard-version release pipeline. |
