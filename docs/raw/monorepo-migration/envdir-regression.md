# envDir regression after the apps/web move

**Date:** 2026-10-04
**Severity:** App-breaking in local dev; invisible to every automated check
**Status:** Fixed

## Symptom

```
variables.utils.tsx:4 Uncaught Error: Environment variable VITE_FIREBASE_API_KEY is not defined.
    at getEnvVar (variables.utils.tsx:4:9)
    at firebase.ts:5:16
```

## Root cause

`.env`, `.env.development` and `.env.production` live at the **repository
root** and are gitignored (`.gitignore:14`). PR #191 moved the frontend to
`apps/web`, and gitignored files are invisible to `git mv`, so they stayed at
the root.

Vite's default `envDir` is the **project root** — now `apps/web`. So Vite
looked for env files in `apps/web/`, found none, and every `getEnvVar()` call
inlined `undefined`.

Measured with `loadEnv()`:

| envDir | VITE_ vars found |
|---|---|
| `<repo>/apps/web` (the default after the move) | **0** |
| `<repo>` (where the files actually are) | **8** |

## Why nothing caught it

This is the same failure class as the preview-pathspec bug in
[[wiki/plans/monorepo-migration]]: **it fails quietly, and it fails in
production-adjacent paths that CI never executes.**

- `npm run build` **succeeded**, because `import.meta.env.X` for an undefined
  key inlines as `undefined` rather than erroring. The throw happens at
  *runtime*, when `firebase.ts` is imported by the browser.
- All 198 tests passed.
- Lint was unchanged at the 7E/3W baseline.
- The Phase 1 PR was reviewed, merged, and had its acceptance criteria
  individually verified — and still shipped a completely broken app.

The verification gap: I asserted "the build emits `apps/web/dist/index.html`"
but never asserted that the emitted bundle was *functional*. `index.html`
existing says nothing about whether the JS in it can boot.

Note the CI build is a **separate, pre-existing** exposure: `ci.yml` supplies
no `VITE_*` vars and `.env` is gitignored, so CI has always built a bundle
with `undefined` keys. That is harmless today because CI's build output is
discarded — but it means **CI cannot be used to verify env wiring** without
injecting secrets. The release workflow (`version-bump.yml:97-104`) *does*
inject them, which is why production was never affected.

## The trap in the obvious fix

The natural fix is `envDir: '..'`. That is **wrong**, and silently so:

| envDir | resolved to | vars |
|---|---|---|
| `'..'` | `<repo>/apps` | **0** |
| `'../..'` | `<repo>` | 8 |

A relative `envDir` resolves against Vite's `root`, not against the config
file's location. Verified with `resolveConfig()`.

Worse, `'../..'` only works while `root` happens to equal `apps/web`. `root`
defaults to `process.cwd()`, so the same config produces a different
`envDir` depending on where the command was invoked from — a latent trap for
anyone running `vite` directly.

## Fix

Derive the path from the config file's own URL, which is cwd-independent:

```ts
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
export default defineConfig({ envDir: repoRoot, ... })
```

Verified `envDir` resolves to `<repo>` when invoked from the repo root and
from `apps/web`.

## Verification

| Check | Result |
|---|---|
| `npm run dev` → served `variables.utils.tsx` | all 7 Firebase vars present in `import.meta.env` |
| `npm run build` → `AIza` inlined in `dist` | present |
| Release simulation: secrets as process env, `.env*` hidden | inlined correctly — **fix does not shadow GitHub secrets** |
| `resolveConfig` from repo root and from `apps/web` | `envDir` identical |
| Tests / lint / typecheck | 198/198, 7E/3W unchanged, clean build |

The release-simulation check matters most: a naive `envDir` change could have
been shadowed by, or could have shadowed, the injected secrets and broken
production while local dev looked fine.
