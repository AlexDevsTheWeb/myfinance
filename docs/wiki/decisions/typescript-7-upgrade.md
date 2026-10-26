---
type: Decision
description: "TypeScript 7.0 Go-rewrite adoption with ESLint linting workaround via @typescript/typescript6."
title: "Decision: TypeScript 7.0 Go-Rewrite Upgrade"
tags: [decision, build, tooling, typescript]
created: 2026-07-11
updated: 2026-07-11
status: accepted
sources: ["raw/typescript-7-upgrade/typescript-7-upgrade.md", "raw/typescript-7-upgrade/proposal.md", "raw/typescript-7-upgrade/design.md", "raw/typescript-7-upgrade/tasks.md"]
related: ["architecture/tech-stack", "architecture/codebase-structure"]
---

# Decision: TypeScript 7.0 Go-Rewrite Upgrade

Status: **accepted**
Date: 2026-07-11

## Context

TypeScript 7.0 was released July 8, 2026 — a major milestone with the compiler rewritten in Go ("Corsa"), delivering ~10x faster type-checking via native parallelism on large codebases. The project was on TS ~6.0.3.

Decision was driven by an OpenSpec change ([`analyze-typescript-7-upgrade`](raw/typescript-7-upgrade/proposal.md)) that systematically analyzed feasibility before committing.

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **TS 7.0 with workaround** (chosen) | Faster builds, future-proof, zero type errors | ESLint needs TS 6 compat shim until TS 7.1 |
| **Stay on TS 6.0** | No workarounds needed | Miss speed gains, stuck on transition release |
| **TS 7.0 without workaround** | Cleanest setup | ESLint completely broken — no programmatic API in TS 7.0 |

## Decision

**Adopt TS 7.0** with a linting workaround: pin `typescript-eslint` to use `@typescript/typescript6` for the programmatic API, while the rest of the build uses TS 7.0.

Key findings from the analysis:
- **Zero config changes needed** — all breaking changes already accommodated by modern tsconfig
- **Zero diagnostic differences** — TS 6.0 and 7.0 produce identical error output
- **Build pipeline works** — `tsc -b && vite build` and `vite dev` both pass
- **Benchmarks:** 1.13–1.29x speedup (modest due to small project size)

## Consequences

1. **Build workflow**: `npm run build` uses TS 7.0 (`tsc -b`) — ~10-30% faster type-checking
2. **Linting workflow**: `npm run lint` uses TS 6.0 via `@typescript/typescript6` — resolved via `scripts/ts-eslint-resolve.cjs` NODE_OPTIONS hook
3. **Postinstall fix**: `scripts/fix-tsc-bin.js` ensures `node_modules/.bin/tsc` points to TS 7 binary
4. **Peer dep warnings**: i18next shows harmless peer dep warnings (`^5 || ^6` range)
5. **When TS 7.1 ships**: Remove workarounds, switch `typescript` to `latest` tag

## Related

- [[wiki/architecture/tech-stack]]
- [[wiki/architecture/codebase-structure]]
- Source: [raw/typescript-7-upgrade/](raw/typescript-7-upgrade/)
