# TypeScript 7.0 Upgrade Analysis

**Date:** 2026-07-11
**Change:** `analyze-typescript-7-upgrade`
**TS 7.0:** 7.0.1-rc (released July 8, 2026)
**TS 6.0 (current):** 6.0.3

## Summary

TypeScript 7.0 is a Go rewrite ("Corsa") that delivers dramatic speedups through native code and shared-memory parallelism. On this project, type-checking is **1.13–1.29x faster** (modest gains due to small project size). Full build pipeline (`tsc -b && vite build`) works with zero errors.

**Verdict: CONDITIONAL GO** — Upgrade is safe but requires a linting workaround.

---

## Breaking Change Audit

| TS 7.0 Breaking Change | Status |
|---|---|
| `strict: true` default | ✅ Already `true` |
| `module: esnext` default | ✅ Already `ESNext` |
| `target` defaults to latest ES | ⚠️ Currently `ES2022` — no errors, may update later |
| `noUncheckedSideEffectImports: true` default | ✅ Already `true` |
| `stableTypeOrdering: true` forced | ✅ No impact |
| `rootDir` defaults to `./` | ✅ Not set explicitly, works fine |
| `types` defaults to `[]` | ✅ Explicitly set to `["vite/client"]` |
| `baseUrl` removed | ✅ Not used |
| `moduleResolution: node/classic` removed | ✅ Using `bundler` |
| `module: amd/umd/systemjs/none` removed | ✅ Using `ESNext` |
| `esModuleInterop` cannot be `false` | ✅ Not set (defaults true) |
| `alwaysStrict` cannot be `false` | ✅ Not set (defaults true) |

**No config changes needed** for the current tsconfig.

## Diagnostic Comparison

- **TS 6.0 `--noEmit`:** 0 errors, 0 warnings
- **TS 7.0 `--noEmit`:** 0 errors, 0 warnings
- **Diff:** Identical — no new, removed, or changed diagnostics

## Ecosystem Compatibility

| Tool | Result | Details |
|---|---|---|
| `tsc --noEmit` | ✅ PASS | Zero errors |
| `tsc -b` (project refs) | ✅ PASS | Works with TS 7.0 |
| `vite build` | ✅ PASS | Bundles successfully |
| `npm run dev` (Vite HMR) | ✅ PASS | HTTP 200, hot reload works |
| `eslint` (typescript-eslint) | ❌ FAIL | `ERR_PACKAGE_PATH_NOT_EXPORTED` — TS 7.0 Go rewrite doesn't expose programmatic API |

## Performance Benchmarks

| Scenario | TS 6.0 (s) | TS 7.0 (s) | Speedup |
|---|---|---|---|
| Cold type-check | 0.401 | 0.310 | **1.29x** |
| Warm type-check | 0.313 | 0.276 | **1.13x** |

Speedups are modest because this is a small project (~14k modules). The 10x improvement Microsoft advertises applies to large multi-million-line codebases.

## Key Blocker

**typescript-eslint cannot consume TS 7.0.** The Go rewrite ships as a native binary and does not expose the JS programmatic API (`ts.createProgram()` etc.). This will be fixed in TS 7.1 (ETA "several months").

**Workaround:** Pin `typescript-eslint` to use `@typescript/typescript6` (which re-exports TS 6.0 API) while the rest of the build uses TS 7.0. This requires configuring typescript-eslint's `parserOptions.typescript` or package resolution to point at `@typescript/typescript6`.

## Recommendation

**CONDITIONAL GO** — Upgrade to TS 7.0 is safe and beneficial, with a caveat:

**For:** 
- Faster type-checking (even modest gains add up)
- Future-proofing (TS 6.0 is a transition release)
- Full build pipeline compatibility confirmed
- Zero type errors or diagnostic differences

**Against:**
- typescript-eslint needs a workaround until TS 7.1
- Peer dep warnings from i18next (`^5 || ^6` range)
- `@typescript/typescript6` bin resolution conflict (tsc symlink may need manual fix after install)

**Next steps to proceed:**
1. Keep `typescript@rc` for `tsc` (build + type-checking)
2. Pin linting to use `@typescript/typescript6` for the programmatic API
3. Add a postinstall script to fix the `tsc` bin symlink if needed
4. Update `package.json` when TS 7.0 stable releases on `latest` tag
