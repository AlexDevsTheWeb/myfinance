---
type: Plan
title: "Plan — Monorepo Migration"
description: "Phased plan to move the frontend into an npm workspaces monorepo and add React Native, website and backend apps without breaking CI or production."
resource: ""
tags: [plan, monorepo, migration, react-native, infrastructure]
created: 2026-10-04
updated: 2026-10-04
status: draft
sources: ["raw/monorepo-migration/monorepo-migration.md"]
related: ["wiki/decisions/react-native-monorepo", "wiki/architecture/monorepo-layout", "wiki/architecture/release-pipeline", "wiki/conventions/branch-strategy"]
---

# Plan: Monorepo Migration

Phased plan to restructure the repository into an npm workspaces monorepo and
add the React Native app, landing website and backend — **without breaking CI,
the release pipeline, or the live site**.

Implements [[wiki/decisions/react-native-monorepo]].
Structure defined in [[wiki/architecture/monorepo-layout]].

> **Status: draft — not started.** Phase 1 is not yet in a branch.

---

## Guiding constraint

This is a **mechanical refactor of a working production app**. The web app has
real users on Firebase `live`. Every phase must satisfy:

1. `npm ci` succeeds at the root
2. `npm run build` succeeds at the root (typecheck + bundle)
3. `npm test` passes (198 tests, 12 files)
4. `npm run lint` introduces **no new** errors over the baseline (7 errors /
   3 warnings)
5. CI is green on the PR, including the `Typecheck, build, lint, test` check
6. The deployed Firebase site is byte-identical in behaviour

No phase may merge to `main` without a passing release.

---

## Phase 1 — Workspace move (the only risky phase)

Move the existing frontend into `apps/web`. Nothing else. No `mobile/`, no
`api/`, no `website/`, no `packages/shared` yet.

This is the only phase that touches production plumbing, so it is isolated on
its own.

### Tasks

| # | Task | Notes |
|---|---|---|
| 1.1 | `git mv src apps/web/src`, same for `public`, `index.html`, `vite.config.ts` | Use `git mv` to preserve history |
| 1.2 | Move config into `apps/web`: `tsconfig.app.json`, `tsconfig.node.json`, ESLint config, Vitest config | Keep `tsconfig.json` at root as the solution file |
| 1.3 | Create `apps/web/package.json` | Move `dependencies`/`devDependencies` here; **no** `version` field |
| 1.4 | Root `package.json`: add `"private": true` + `"workspaces": ["apps/*", "packages/*"]` | Keep root `version` |
| 1.5 | Root scripts delegate to `apps/web` | `dev`, `build`, `test`, `preview`, `lint`, `prebuild`, `postinstall` |
| 1.6 | **`firebase.json`: `"public"` → `"apps/web/dist"`** | Highest-risk single line in the migration |
| 1.7 | Root `tsconfig.json` references the workspace projects | Root stays a solution file with no `files`/`include` |
| 1.8 | Verify `scripts/generate-version.js` writes to `apps/web/src/version.ts` | Its output path must follow the move |
| 1.9 | Regenerate lockfile via `npm install`, then verify `npm ci` | Do **not** hand-edit the lockfile |
| 1.10 | Update CI/CD docs | No workflow *code* changes expected |

### Expected workflow impact

**None.** `ci.yml`, `version-bump.yml` and `firebase-hosting-pull-request.yml`
all invoke root `npm ci` + `npm run build`, both of which keep working via
delegation. If any of them needs editing, that is a signal the delegation is
wrong — stop and reconsider rather than patching all three.

### Verification

```bash
npm ci
npm run build          # tsc -b && vite build → apps/web/dist
npm test               # 198 passing
npm run lint           # no NEW errors over 7/3
ls apps/web/dist/index.html
```

Plus a **deployment check**: `firebase.json` must point at the directory that
actually receives the bundle. Verify with a Hosting preview or a manual
`firebase deploy --only hosting --project <preview project>` and confirm the
served bundle is the new one.

### Rollback

Revert the PR. `git mv` preserves history, so a revert is clean. No data
migration, no backend, no user-visible state is involved.

---

## Phase 2 — `packages/shared`

Extract the pure domain layer so it can be consumed by web and mobile alike.

- Shared types: transactions, budgets, ETF/investment records, cards, brokers
- Shared validation (Zod schemas currently colocated in `apps/web/src`)
- Shared API client / Firestore access helpers
- Shared formatting (currency, dates, percentages)

Constraints: must stay framework-agnostic. No React, no Vite, no Firestore
assumptions that only hold for the web build. Keep the existing 198 tests
passing — tests for extracted logic move with it, they are not deleted.

Ship as source + `"exports"` + TS path mapping; avoid a compile step until a
consumer actually requires it.

---

## Phase 3 — `apps/mobile` (React Native)

- Scaffold React Native into `apps/mobile`
- Configure Metro for the workspace root (`watchFolders`, `nodeModulesPaths`
  pointing at the root hoisted `node_modules`)
- Consume `packages/shared` for types, validation and the API client
- Reuse the existing Firestore backend — no new backend required to start
- Store secrets via native secure storage / Firebase config, **not** committed
  `.env` files

---

## Phase 4 — `apps/api`

- Define the API contract **in `packages/shared` first**, then implement
- If the backend is not TypeScript, generate clients from the shared contract
  rather than sharing source
- Do not weaken the Firestore rules while adding a server — see
  [[wiki/bugs/firestore-rules-drift]]

---

## Phase 5 — `apps/website`

- Marketing/landing site, separate lifecycle from the app
- Subscription + payments
- Separate Firebase project or Hosting site so an outage or billing deploy
  cannot take down the finance app
- Separate release cadence

---

## Sequencing rationale

Mobile, website and backend are **after** Phase 1 deliberately. Each is
independently valuable, but stacking all four in one PR set would make any
breakage ambiguous. Phase 1 alone proves the restructure; everything after it
is additive.

The reverse order is what the old plan implied — scaffolding four apps and then
restructuring — and that is what created the current risk.

---

## Definition of done

### Phase 1
- [ ] `apps/web` contains all frontend source
- [ ] Root `npm ci`, `npm run build`, `npm test` all pass
- [ ] 198 tests still pass, none deleted or skipped to go green
- [ ] Lint errors ≤ baseline (7)
- [ ] `apps/web/dist/index.html` exists after build
- [ ] `firebase.json` points at `apps/web/dist`
- [ ] Deployed site confirmed fresh and functional
- [ ] CI green, including `Typecheck, build, lint, test`
- [ ] No changes needed in any workflow file

### Overall
- [ ] Monorepo serves the web app in production
- [ ] Mobile app builds and shares `packages/shared`
- [ ] API contract defined once, consumed by all clients
- [ ] Website deployable independently of the app

---

## Open questions

- Payment provider for the website (Stripe is the obvious default — undecided)
- `apps/api` language: TypeScript (shares source directly) vs generated clients
- Whether `packages/shared` needs a build step or can ship TypeScript source
- Metro config specifics — decided empirically in Phase 3

---

## Related

- [[wiki/decisions/react-native-monorepo]] — decision and rejected alternatives
- [[wiki/architecture/monorepo-layout]] — target structure and couplings
- [[wiki/architecture/release-pipeline]] — what must not break
- [[wiki/conventions/branch-strategy]] — one branch and PR per phase
- Source: [raw/monorepo-migration/monorepo-migration.md](raw/monorepo-migration/monorepo-migration.md)
