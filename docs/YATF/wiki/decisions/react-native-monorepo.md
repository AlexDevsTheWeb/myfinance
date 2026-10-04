---
type: Decision
title: "Repository Organisation — React Native Monorepo with npm Workspaces"
description: "Adopt a single repository with npm workspaces for web, mobile, website and backend, using React Native for the native app; explicitly reject nested sub-repositories and pnpm."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/189"
tags: [decision, architecture, monorepo, react-native, mobile, strategy]
created: 2026-10-04
updated: 2026-10-04
status: accepted
sources: ["raw/monorepo-migration/monorepo-migration.md"]
related: ["wiki/decisions/pwa-strategy", "wiki/architecture/monorepo-layout", "wiki/plans/monorepo-migration", "wiki/architecture/release-pipeline", "wiki/architecture/tech-stack"]
---

# Decision: Repository Organisation — React Native Monorepo with npm Workspaces

Status: `accepted`
Date: 2026-10-04

## Context

The project is expanding from a single React web app into four products:

1. The existing web frontend
2. A native iOS/Android app
3. A marketing website with subscription and payments
4. A backend service (not yet started)

The question was how to organise these in version control. The initial
proposal was to keep `myfinance` as an umbrella directory containing
`fe/`, `website/` and `backend/` as **standalone git repositories nested
inside** it.

A second question determined the shape of the answer: **React Native or
Flutter** for the native app.

## Options Considered

### Option A — Nested standalone repositories (the original proposal)

**Rejected.** A directory containing its own `.git` is opaque to the parent
repository.

- `git add` records only a **gitlink** (mode `160000`) with no
  `.gitmodules` entry — a broken submodule.
- Cloning the parent produces **empty directories**.
- Parent CI, lint config and TypeScript project references never see the
  child's source.
- No atomic commits or cross-project refactors.
- Moving or deleting the parent breaks every child silently.

The correct form of "separate repositories" is **siblings grouped under a
GitHub organisation**, not nesting:

```
~/code/myfinance-web
~/code/myfinance-mobile
~/code/myfinance-website
~/code/myfinance-api
```

This remains the fallback if the monorepo is ever abandoned.

### Option B — Flutter for the native app

**Rejected.** Flutter means Dart: a second language, a second test runner,
and **zero code reuse** with the existing TypeScript frontend. That removes
most of the benefit of colocating the code, and would make a monorepo largely
ceremonial.

### Option C — React Native in a pnpm workspace monorepo

**Rejected — specifically because of `npm ci`.**

pnpm is the better workspace tool in general, but two hard constraints rule
it out here:

1. **`npm ci` is load-bearing.** The release pipeline relies on `npm ci`
   validating the committed lockfile. This is not incidental: `npm ci` is
   exactly what caught the `main`/`development` dependency drift behind the
   `package-lock.json` conflict fixed in PR #185. The previous
   `rm -rf package-lock.json && npm install` silently regenerated the
   lockfile and dropped test dependencies. Moving to pnpm means rewriting
   `ci.yml`, `version-bump.yml`, the Firebase preview workflow and every
   `npm ci`.
2. **Metro + pnpm friction.** Metro historically needs hoisting
   (`node-linker=hoisted` / `shamefully-hoist`) to resolve pnpm's symlinked
   `node_modules`. It works, but it is an avoidable class of failure for a
   solo maintainer.

### Option D — React Native in an npm workspace monorepo ✅

**Chosen.**

## Decision

Adopt a **single repository using npm workspaces**, with **React Native** for
the native app.

```
myfinance/
├── apps/
│   ├── web/          ← existing React frontend, moved from the repo root
│   ├── website/      ← landing page + subscription/payments
│   ├── mobile/       ← React Native
│   └── api/          ← backend service
├── packages/
│   └── shared/       ← domain types, validation, API client
├── scripts/          ← stays at root
├── docs/YATF/        ← stays at root
└── package.json      ← version + workspace scripts only
```

Supporting decisions:

- **npm workspaces, not pnpm** — preserves `npm ci` and avoids Metro hoisting.
- **One version at the repository root**, not per-workspace versions — single
  release train, and `scripts/generate-version.js` keeps working untouched.
- **Root `build` script stays a thin delegate** (`npm run build --workspace
  apps/web`) so that `ci.yml`, `version-bump.yml` and the Firebase preview
  workflow need **no edits**.

## Consequences

### Positive

- Web and mobile share domain types, validation and the API client — the main
  reason to prefer React Native over Flutter.
- One CI configuration, one lint config, one set of conventions.
- Atomic commits and refactors that span web and mobile.
- The API contract can be defined once in `packages/shared` and consumed by
  every client, because the backend does not exist yet and retrofitting that
  later is far more work.

### Negative / accepted costs

- One `npm ci` installs every workspace, so mobile and backend dependencies
  slow down web-only CI as they accumulate.
- Metro requires monorepo configuration (`watchFolders`, `nodeModulesPaths`).
- Nesting depth increases; tooling assumptions about a flat root must be
  re-checked (this is precisely why the migration is phased).

### Supersedes

This decision **supersedes** [[wiki/decisions/pwa-strategy]], which chose a
PWA-first strategy with Flutter deferred to a later scaling phase. The native
app is now planned as React Native inside a monorepo. The PWA work is not
necessarily wasted — a PWA remains complementary — but the mobile roadmap
anchor has moved.

## Related

- [[wiki/architecture/monorepo-layout]] — target directory structure and the
  constraints that shape it
- [[wiki/plans/monorepo-migration]] — phased migration plan
- [[wiki/architecture/release-pipeline]] — the CI/release pipeline this
  migration must not break
- [[wiki/decisions/pwa-strategy]] — superseded decision
- Source: [raw/monorepo-migration/monorepo-migration.md](raw/monorepo-migration/monorepo-migration.md)
