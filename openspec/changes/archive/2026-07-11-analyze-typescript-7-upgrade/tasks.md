## 1. Setup

- [x] 1.1 Install TS 7.0 RC alongside current version: `npm install -D typescript@rc`
- [x] 1.2 Install compatibility package for side-by-side comparison: `npm install -D @typescript/typescript6`
- [x] 1.3 Verify both compilers are available: `npx tsc --version` (7.x) and `npx tsc6 --version` (6.x)

## 2. Breaking Change Audit

- [x] 2.1 Audit current tsconfig compilerOptions against TS 7.0 removed/deprecated options list
- [x] 2.2 Run `npx tsc --noEmit` with TS 7.0 and capture full diagnostic output
- [x] 2.3 Run `npx tsc6 --noEmit` with TS 6.0 and capture full diagnostic output
- [x] 2.4 Diff the two outputs — document any new, removed, or changed diagnostics

## 3. Ecosystem Compatibility

- [x] 3.1 Run `npm run lint` (ESLint + typescript-eslint) with TS 7.0 installed — **FAILS**: `ERR_PACKAGE_PATH_NOT_EXPORTED` — TS 7.0 Go rewrite doesn't expose programmatic API; typescript-eslint cannot load it. Workaround: pin `typescript` to `@typescript/typescript6` for linting.
- [x] 3.2 Run `npm run build` (`tsc -b && vite build`) with TS 7.0 — **PASSES**: full build succeeds (tsc -b + Vite)
- [x] 3.3 Run `npm run dev` (Vite dev server) with TS 7.0 — **PASSES**: dev server starts, returns HTTP 200

## 4. Performance Benchmark

- [x] 4.1 Clear `.tsbuildinfo` cache and time `npx tsc6 --noEmit` (cold, TS 6.0) — **0.401s**
- [x] 4.2 Clear `.tsbuildinfo` cache and time `npx tsc --noEmit` (cold, TS 7.0) — **0.310s** (1.29x faster)
- [x] 4.3 Time `npx tsc6 --noEmit` (warm, TS 6.0) — **0.313s**
- [x] 4.4 Time `npx tsc --noEmit` (warm, TS 7.0) — **0.276s** (1.13x faster)
- [x] 4.5 Record results and compute speedup ratio

## 5. Report

- [x] 5.1 Write analysis report at `docs/YATF/raw/typescript-7-upgrade/typescript-7-upgrade.md` with findings
- [x] 5.2 Include go/no-go recommendation with rationale and any blockers identified
