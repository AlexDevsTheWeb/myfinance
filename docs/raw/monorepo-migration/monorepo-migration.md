# Monorepo Migration, Mobile App, Website & Backend — Raw Analysis

Date: 2026-10-04
Author: agent session (release hardening + platform planning)

---

## 1. Trigger

Immediately after completing the release-pipeline hardening (see §5), the user
asked how to organise the repository for three upcoming products:

1. The existing frontend (`myfinance`)
2. A native iOS/Android app (React Native **or** Flutter — undecided at this point)
3. A marketing/landing website with subscription + payments
4. A future backend service

The user's initial proposal was to keep `myfinance` as an umbrella folder
containing sub-repositories:

```
myfinance/
  fe/       ← standalone git repo
  website/  ← standalone git repo
  backend/  ← standalone git repo
```

## 2. Question asked

> Can standalone git repositories live *inside* another repository?

### Answer: technically yes, practically no.

A directory containing its own `.git` is **opaque** to the parent repository.
Observed consequences:

- `git add` on such a directory records only a **gitlink** (a submodule
  reference, mode `160000`) with no accompanying `.gitmodules` entry — a
  broken submodule.
- Cloning the parent yields **empty directories** for each child repo.
- The parent's CI, lint config, TypeScript project references and coverage
  tooling never see the child's source.
- No **atomic commits** or cross-project refactors are possible.
- Moving or deleting the parent silently breaks every child.

### Correct form for genuinely separate repositories

Put them as **siblings**, not nested, and group them under a GitHub
organisation so they still read as one product:

```
~/code/myfinance-web
~/code/myfinance-mobile
~/code/myfinance-website
~/code/myfinance-api
```

This is the fallback if a monorepo is rejected.

## 3. Key decision input: React Native vs Flutter

This single choice determines whether a monorepo is worth it at all.

| | React Native | Flutter (Dart) |
|---|---|---|
| Language | TypeScript | Dart |
| Code shared with existing web app | Types, validation, API client, business logic | **None** |
| Monorepo payoff | High | Low |
| Recommendation for this project | **Chosen** | Rejected for now |

The user selected **React Native**. Rationale: the existing codebase is
TypeScript/React with 198 tests; a React Native app can consume the same
domain types, the same Zod-style validation and the same API client, and the
same React idioms. Flutter would mean a second language, a second test runner
and zero code reuse — which would make a monorepo mostly ceremonial.

## 4. Repository layout decision

### Rejected: nested repositories
See §2.

### Rejected: pnpm workspaces

pnpm is the better workspace tool in general, but it was rejected **specifically
for this project** because of two hard constraints discovered during the release
work:

1. **`npm ci` is load-bearing.** The release pipeline depends on `npm ci`
   validating the committed lockfile. This is not incidental — `npm ci` is
   precisely what caught the `main`/`development` dependency drift that caused
   the `package-lock.json` conflict fixed in PR #185. The previous
   `rm -rf package-lock.json && npm install` silently regenerated the lockfile
   and dropped the test dependencies.
   Switching to pnpm means rewriting `ci.yml`, `version-bump.yml`, the Firebase
   preview workflow and every `npm ci` invocation.
2. **Metro + pnpm friction.** React Native's Metro bundler historically needs
   hoisting (`node-linker=hoisted` or `shamefully-hoist`) to resolve
   pnpm's symlinked `node_modules`. It works, but it is an extra class of
   failure for a solo maintainer.

### Chosen: npm workspaces

`npm ci` at the repository root keeps working unchanged with npm workspaces.
No pipeline rewrite. No hoisting configuration. No new tooling.

### Target layout

```
myfinance/
├── apps/
│   ├── web/          ← existing React frontend, moved from the repo root
│   ├── website/      ← landing page + subscription/payments (not started)
│   ├── mobile/       ← React Native (not started)
│   └── api/          ← backend service (not started)
├── packages/
│   └── shared/       ← domain types, validation, API client
├── scripts/          ← stays at root (generate-version.js, fix-tsc-bin.js)
├── docs/YATF/        ← stays at root
├── package.json      ← version + workspace scripts only
└── firebase.json
```

## 5. Constraints discovered by reading the actual repo

These were verified, not assumed. They dictate how invasive the migration is.

| File | Current content | Consequence |
|---|---|---|
| `firebase.json` | `"hosting": { "public": "dist" }` | Hardcoded to repo root. Must become `apps/web/dist`, or the deploy silently serves nothing. |
| `.github/workflows/ci.yml` | `npm ci` then `npm run build` from root | Unchanged **if** root `build` delegates to the web workspace. |
| `.github/workflows/version-bump.yml` | `npm ci`, then `npm run build`, then Firebase deploy | Unchanged under the same condition. |
| `.github/workflows/firebase-hosting-pull-request.yml` | `npm ci && npm run build` | Unchanged under the same condition. |
| `scripts/generate-version.js` | reads `join(__dirname, '..', 'package.json')` | Unchanged **if** the root `package.json` retains the `version` field. |
| `tsconfig.json` | project references solution file | Must gain references to `apps/web` and `packages/shared`. |

### The key insight

Every CI/CD and release workflow invokes `npm run build` **from the repository
root**. If the root `build` script is kept as a thin delegate:

```json
"build": "npm run build --workspace apps/web"
```

then `ci.yml`, `version-bump.yml` and the Firebase preview workflow require
**no edits whatsoever**. Only `firebase.json` needs a one-line path change.

## 6. Versioning strategy

Keep **one version at the repository root**, not per-workspace versions.

- A single release train: one tag, one changelog, one deploy.
- `scripts/generate-version.js` keeps working untouched.
- Per-workspace versions would require independent tags and a much more complex
  `standard-version` configuration for a project with one maintainer.

## 7. Sequencing

The migration is a mechanical refactor with a real risk surface (TypeScript
project references, the ESLint TypeScript 6 workaround, Vite config, Firebase
paths). It should happen **before** any mobile code lands, while it is still a
pure move.

Proposed phases:

1. **Phase 1** — workspace move only. `apps/web` + root orchestration. No
   `mobile/`, no `api/`, no `website/`. Goal: green CI proving the restructure
   is sound.
2. **Phase 2** — `packages/shared` with domain types and validation, consumed
   by `apps/web`.
3. **Phase 3** — `apps/mobile` via React Native, consuming `packages/shared`.
4. **Phase 4** — `apps/api`, defining the shared API contract.
5. **Phase 5** — `apps/website` (landing + payments).

Each phase is a separate PR against `development`, per the branch strategy.

## 8. Why the backend should be in the monorepo

The backend does not exist yet. Defining the API contract **once** in
`packages/shared` and generating clients for web and mobile from it is
straightforward today and painful to retrofit later. Once two clients
disagree on the contract, reconciling them is far more work than starting
from a shared source of truth.

## 9. Open questions deferred

- Which payment provider for the website (Stripe is the obvious default).
- Whether `apps/api` will be Node/TypeScript (shares the contract directly) or
  another language (requires generated clients rather than shared source).
- Whether React Native's Metro config will live in the monorepo root or in
  `apps/mobile` — decided empirically in Phase 3, not now.

## 10. Related prior work

The release-pipeline hardening that preceded this analysis is documented
separately and is a prerequisite for trusting any of the above:

- PR #185 — branch protection, CI, PR-based releases, automatic sync-back
- PR #186 — the `development` → `main` release itself (2026.16.0)
- PR #187 — recovery from a half-failed release
