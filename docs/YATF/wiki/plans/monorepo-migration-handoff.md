---
type: Plan
title: "Monorepo Migration — Handoff (end of 2026-10-04)"
description: "Stop point for Issue #189: Phase 1 shipped to development, one app-breaking regression found and fixed, and the verified starting conditions for Phase 2."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/189"
tags: [plan, monorepo, handoff]
created: 2026-10-04
updated: 2026-10-04
status: in-progress
sources: ["raw/monorepo-migration/monorepo-migration.md", "raw/monorepo-migration/envdir-regression.md"]
related: ["plans/monorepo-migration", "architecture/monorepo-layout", "architecture/codebase-structure", "decisions/react-native-monorepo", "architecture/release-pipeline"]
---

# Plan: Monorepo Migration — Handoff

**Read this first when resuming.** It records the exact stop point at the end of
2026-10-04 so the next session does not have to reconstruct state from git log.

Resumption target: [[wiki/plans/monorepo-migration]] is the authoritative plan.
This page is only the "where we left off" marker.

---

## Where we are

| | |
|---|---|
| Branch | `development` (clean, in sync with origin) |
| HEAD | `ad64bd2` |
| `origin/development` | `ad64bd2` |
| `origin/main` | `7e78d09` — still the `v2026.16.0` release |
| Root version | `2026.16.0` (root `package.json` is authoritative) |
| Tests | 198/198 across 12 files |
| Lint | 7 errors / 3 warnings — unchanged baseline |
| Deploy status | **Production serves the pre-move build.** Expected — see below |

Phase 1 is **complete**. Phases 2–5 are untouched.

---

## What shipped

| PR | Commit | What |
|---|---|---|
| [#190](https://github.com/AlexDevsTheWeb/myfinance/pull/190) | `ef3d380` | Monorepo docs: plan, layout, RN decision, release-pipeline page |
| [#191](https://github.com/AlexDevsTheWeb/myfinance/pull/191) | `82550d7` | **Phase 1** — frontend moved to `apps/web` as an npm workspace |
| [#192](https://github.com/AlexDevsTheWeb/myfinance/pull/192) | `ad64bd2` | **P0 fix** — `envDir` regression that broke the app |

### Phase 1 substance

`git mv` of the whole frontend into `apps/web`, with
`git diff --numstat -M` confirming **zero source or public content changes** —
so lint and tests were unaffected by construction, not by luck. Root
`package.json` became an orchestrator (`workspaces: ["apps/*", "packages/*"]`,
all scripts delegating to `apps/web`). Root keeps `version` because
`scripts/generate-version.js` reads it; `standard-version` and the ESLint
toolchain stay at root because the release workflow runs from root.

### The regression (#192) — read this before trusting any green check

`.env*` files live at the **repository root** and are **gitignored**, so the
move could not carry them into `apps/web`. Vite's `envDir` defaults to the
project root, which became `apps/web` → **0 of 8** vars resolved →
`getEnvVar()` threw at import time and **the app did not boot at all**.

Fixed via `fileURLToPath(new URL('../..', import.meta.url))` in
`apps/web/vite.config.ts`. Full analysis:
[[raw/monorepo-migration/envdir-regression.md]].

Two traps worth remembering:

- **`envDir: '..'` does not work.** It resolves against Vite's `root`, not the
  config file's directory, landing on `<repo>/apps` — still 0 vars, failing
  exactly as silently as the original bug.
- **A relative `envDir` is cwd-dependent**, because `root` defaults to
  `process.cwd()`.

---

## The pattern to carry forward

**Three quiet failures in one migration**, all the same shape — a step that
*succeeds* while producing something broken:

| # | Failure | Symptom |
|---|---|---|
| 1 | `firebase.json` still pointed at `dist` | deploy succeeds, serves a **stale site** |
| 2 | Preview workflow pathspec still `src/` | preview **silently skipped**, CI green |
| 3 | `envDir` not repointed | build succeeds, **app does not boot** |

Only #3 was caught by a human noticing a console error. **None** were caught by
any automated check — including checks written specifically to catch them.

The verification gap that mattered: asserting *the build emits
`dist/index.html`* says nothing about *whether the bundle works*. For future
phases, verify behavior, not artifact existence.

---

## Open items

### 1. Production still serves the pre-move build — expected, not a bug

`origin/main` is at `7e78d09` (`v2026.16.0`). The move lives only on
`development`. This is the correct consequence of the PR-to-`development` rule,
so the Phase 1 criterion "deployed site confirmed fresh" is **deliberately left
unticked** in the plan.

It becomes checkable when a release PRs `development` → `main`. At that point:

- [ ] Confirm `apps/web/dist/index.html` is what `main` builds
- [ ] Load the deployed site and confirm the app **boots** (the #192 class of
      check — a 200 on `/` is not enough)

### 2. CI cannot verify env wiring

`ci.yml` supplies no `VITE_*` vars, and `.env` is gitignored, so **CI has always
built a bundle with undefined keys**. Harmless today because CI discards its
build output, but it means CI structurally cannot catch bug #3.

Options, none taken yet: inject non-secret Firebase web config into CI; or add
a build-time assertion that required `VITE_*` keys are present and fail
explicitly. The assertion is the stronger fix — it converts a runtime throw into
a build failure.

### 3. Stashed redesign work — expect conflicts

```
stash@{0}: On feat/YATF-redesign: WIP: redesign draft (fonts/shell alignment discussion)
```

Touches `src/theme/theme.ts`, `src/pages/DashboardPage.tsx`,
`src/components/layout/Sidebar.tsx`. These paths **moved to `apps/web/src/`**,
so `git stash pop` will conflict and needs path resolution.

Untracked mockups, leave unmodified:
`docs/YATF/raw/redesign/dahboard-dark.html`, `dashboard-light.html`,
`addtransaction-form-dark.html` (note the `dahboard` typo is in the filename).

---

## Next: Phase 2 — `packages/shared`

**Start here.** Phases 3–5 (mobile, api, website) are deliberately sequenced
after it.

Goal: extract the pure domain layer so web and mobile can both consume it.
Must stay framework-agnostic — no React, no Vite, no web-only Firestore
assumptions. Ship as source + `"exports"` + TS path mapping; no compile step
until a consumer needs one.

### Verified groundwork

The best first candidates are already framework-agnostic — none of these import
React or Firebase:

| Path | Test count |
|---|---|
| `apps/web/src/store/validation/` | 36 |
| `apps/web/src/store/sanitization/` | 19 |
| **Total tests that would move** | **55** |

Validation/sanitization holds the domain rules with no UI coupling, which makes
it the natural first extraction.

One correction to the plan's wording: it says "Zod schemas currently colocated
in `apps/web/src`". **Zod is not used by app code** — nothing under
`apps/web/src` imports it, and it is not a dependency of either manifest. It
appears in `node_modules` only as a transitive dep of `eslint-plugin-react-hooks`.
The schemas are **hand-rolled** returning `{ valid, error? }`. Fix that line in
the plan when starting Phase 2 — it would otherwise send someone hunting for
schemas that do not exist.

### Phase 2 constraints

- Keep **198/198** tests passing — tests for extracted logic **move with it**,
  never get deleted to go green
- Lint must not exceed the 7E/3W baseline
- `apps/web` imports shared code through the path mapping; it must not fork logic
- `packages/*` is already in the root `workspaces` array — no root change needed

### First concrete step

```bash
git checkout -b feat/YATF-189-packages-shared
mkdir -p packages/shared/src/{validation,sanitization}
# move (not copy) the modules + their tests, then add exports + tsconfig paths
npm test    # must still be 198/198
npm run build
```

---

## Working rules (unchanged, worth restating)

- **Never** commit or push directly to `main`. It is protected, requires
  `Typecheck, build, lint, test`, and GitHub Apps cannot bypass it — so
  releases go through PRs.
- Branch `feat/YATF-{n}` or `fix/YATF-{n}`, PR → `development`.
- Merge with **Create a merge commit**. Squash or rebase breaks the ancestry
  that lets the release sync-back fast-forward.
- Root `npm ci` and root `npm run build` must keep working — that is what lets
  the workflows stay untouched. **Any config change that makes a workflow need
  editing is a signal to reconsider, not to patch all three.**
- One root `package-lock.json`. `npm ci` is load-bearing.
- Any new feature, bug, or decision gets written up: raw notes in
  `docs/YATF/raw/`, then `index.md`, `log.md`, and the category index updated.
  Run `python3 docs/YATF/scripts/okf_migrate.py --check`.

## Related

- [[wiki/plans/monorepo-migration]] — the authoritative 5-phase plan
- [[wiki/architecture/monorepo-layout]] — target structure and coupling constraints
- [[wiki/architecture/codebase-structure]] — live layout
- [[wiki/decisions/react-native-monorepo]] — why React Native + npm workspaces
- [[wiki/architecture/release-pipeline]] — how code reaches production
- [[wiki/conventions/branch-strategy]] — branch and merge rules
