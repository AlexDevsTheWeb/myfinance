## Why

TypeScript 7.0 was released July 8, 2026 — a major milestone with the compiler rewritten in Go (~10x faster type-checking via native parallelism). Our project currently uses TS ~6.0.3. Upgrading would significantly reduce build times (currently `tsc -b`), improve CI throughput, and keep us on a supported version. However, the Go rewrite means breaking changes in tooling compatibility (no programmatic API until 7.1) and configuration defaults. This change analyzes the upgrade: pros, cons, risks, and whether it will break anything.

## What Changes

- **[ANALYSIS]** Research TS 7.0 breaking changes vs current tsconfig
- **[ANALYSIS]** Check ecosystem compatibility — typescript-eslint, Vite, MUI
- **[ANALYSIS]** Run TS 7.0 `tsc -b` on current codebase, compare diagnostic output
- **[ANALYSIS]** Benchmark type-check times (TS 6.0 vs 7.0) on this project
- **[OUTPUT]** Document findings with go/no-go recommendation

### Non-goals

- No code changes to fix new TS 7.0 errors (deferred to implementation phase)
- No migration of tooling (typescript-eslint, etc.) — just compatibility check
- No production deployment of TS 7.0

## Capabilities

### New Capabilities
- `typescript-upgrade-analysis`: Analysis of TS 6.0 → 7.0 upgrade feasibility for this project. Covers breaking changes, ecosystem compatibility, performance benchmarking, and risk assessment.

### Modified Capabilities

*(none — this is purely analytical, not changing existing features)*

## Impact

- **devDependencies**: `typescript` version in `package.json` (only if we proceed)
- **Build pipeline**: `npm run build` currently runs `tsc -b && vite build` — TS 7.0 changes `tsc` behavior
- **Linting**: `typescript-eslint` depends on TS programmatic API (unavailable in 7.0 until 7.1)
- **CI**: Faster type-checking could reduce CI times
