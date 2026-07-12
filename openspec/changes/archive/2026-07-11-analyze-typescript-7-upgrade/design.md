## Context

Current project uses TypeScript ~6.0.3 with `tsc -b` for type-checking. TS 7.0 was released July 8, 2026 — a Go rewrite ("Corsa") delivering ~10x faster type-checking. The project has clean modern config (`strict: true`, `moduleResolution: bundler`, etc.) so surface-level compatibility should be good. Need to systematically analyze before committing to upgrade.

## Goals / Non-Goals

**Goals:**
- Quantify TS 7.0 speedup on this specific codebase
- Identify any TS 7.0 errors or type-checking differences
- Verify ecosystem tooling compatibility (typescript-eslint, Vite, MUI)
- Produce a clear go/no-go recommendation with rationale

**Non-Goals:**
- Fixing TS 7.0 errors (deferred to follow-up implementation)
- Upgrading typescript-eslint or other tooling
- Changing any source code

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Install method | `npm install -D typescript@rc` | Pin to 7.0 RC (latest stable at analysis time) via npm alias, keeping 6.0 available if rollback needed |
| Side-by-side compare | Keep TS 6.0 via `@typescript/typescript6` | Official compatibility package; allows running both compilers and comparing diagnostic output |
| Benchmark approach | `hyperfine` or `time` for `tsc --noEmit` | Measure cold/warm type-check times for both versions on identical code |
| Analysis scope | Single session | This is purely investigative — no code changes, no merge |

## Risks / Trade-offs

- [typescript-eslint compat] typescript-eslint depends on the TS programmatic API which is unavailable until TS 7.1. If typescript-eslint cannot consume TS 7.0, we cannot upgrade the `typescript` package for the project without breaking linting. Mitigation: `@typescript/typescript6` allows TS 6.0 API to coexist.
- [False negatives] The Go compiler may have different narrowing behavior for complex conditional types. Mitigation: compare full diagnostic output between TS 6.0 and 7.0.
- [Edge cases] `tsc -b` (build mode) with project references may behave differently in the Go rewrite. Mitigation: test `npm run build` end-to-end.
