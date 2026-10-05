---
type: Architecture
title: "Monorepo Layout — apps/ and packages/ Workspace Structure"
description: "Target directory structure for the npm workspaces monorepo and the repo-level couplings that constrain it."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/189"
tags: [architecture, monorepo, workspaces, structure, react-native]
created: 2026-10-04
updated: 2026-10-05
status: active
sources: ["raw/monorepo-migration/monorepo-migration.md", "raw/website/website.md", "package.json", "firebase.json", "tsconfig.json", "apps/website/"]
related: ["wiki/decisions/react-native-monorepo", "wiki/decisions/website-as-separate-hosting-target", "wiki/plans/monorepo-migration", "wiki/architecture/release-pipeline", "wiki/architecture/codebase-structure", "wiki/architecture/tech-stack", "wiki/features/marketing-website/marketing-website"]
---

# Monorepo Layout

Target directory structure for the npm workspaces monorepo, and the
couplings that constrain it. The decision behind this structure is
[[wiki/decisions/react-native-monorepo]].

> **Status: Phases 1 and 5 have landed.** The frontend lives in `apps/web` and
> the marketing site in `apps/website`, as two isolated workspaces with two
> hosting targets. The remaining workspaces (`mobile`, `api`,
> `packages/shared`) are still to come — see [[wiki/plans/monorepo-migration]]
> for what is next and [[wiki/architecture/codebase-structure]] for the live
> layout. The website isolation is justified in
> [[wiki/decisions/website-as-separate-hosting-target]].

---

## Target structure

```
myfinance/
├── apps/
│   ├── web/                    ← ✅ Phase 1: the React app
│   │   ├── package.json        ←   workspace manifest (version pinned 0.0.0)
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── vitest.config.ts
│   │   ├── tsconfig.json       ←   solution -> tsconfig.app.json
│   │   ├── src/
│   │   └── public/
│   ├── website/                ← ✅ Phase 5: Balancr marketing landing page
│   │   ├── package.json        ←   workspace manifest
│   │   ├── index.html          ←   static SEO metadata + font preconnect
│   │   ├── vite.config.ts      ←   port 5174, repo-root envDir
│   │   ├── vitest.config.ts
│   │   ├── tsconfig.json       ←   solution -> tsconfig.app.json
│   │   └── src/
│   │       ├── content/site.ts ←   all copy + the pricing model
│   │       ├── theme/          ←   dark + light palettes, persistence
│   │       └── components/     ←   one file per page section
│   ├── mobile/                 ← React Native (iOS + Android)
│   └── api/                    ← backend service
│
├── packages/
│   └── shared/                 ← domain types, validation, API client
│
├── scripts/                    ← stays at root
│   ├── generate-version.js
│   ├── fix-tsc-bin.js
│   └── ts-eslint-resolve.cjs
│
├── docs/YATF/                  ← stays at root
├── firestore.rules             ← stays at root
├── firebase.json               ← stays at root, path updated
├── package.json                ← version + workspace scripts only
├── package-lock.json           ← single lockfile for all workspaces
└── tsconfig.json               ← solution file referencing every project
```

### What stays at the root, and why

| Path | Reason |
|---|---|
| `package.json` `version` | Single release train; `scripts/generate-version.js` reads `join(__dirname, '..', 'package.json')` and must not change |
| `scripts/` | `postinstall` runs `node scripts/fix-tsc-bin.js` from the root; `prebuild` runs `generate-version.js` |
| `firebase.json` | The Firebase CLI is invoked from the repository root by all three workflows |
| `firestore.rules` | Deployed by Firebase config, independent of app layout |
| `docs/` | Cross-cutting documentation |

---

## Workspace orchestration

The root `package.json` becomes a thin orchestrator:

```jsonc
{
  "name": "balancr",
  "version": "2026.16.0",          // MUST stay — generate-version.js reads this
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace apps/web",
    "prebuild": "node scripts/generate-version.js",
    "build": "npm run build --workspace apps/web",
    "lint": "NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs' eslint .",
    "test": "npm run test --workspace apps/web",
    "preview": "npm run preview --workspace apps/web",
    "postinstall": "node scripts/fix-tsc-bin.js"
  }
}
```

**The delegate pattern is the whole trick.** All three workflows call
`npm run build` from the repository root. Because the root `build` delegates
into the web workspace, `ci.yml` and `version-bump.yml` need **zero edits**.

The exception is `firebase-hosting-pull-request.yml`, which hardcodes an
explicit path list to decide whether a preview is needed. That list must be
repointed at `apps/web/` — see [[wiki/plans/monorepo-migration]].

> `prebuild` stays at the root rather than moving into `apps/web`, so that the
> root `build` delegate still triggers version generation. If it moves, the
> root `prebuild` must remain — npm runs `pre<script>` from the directory
> holding the script.

---

## The `website` workspace

Added in Issue #193, five phases ahead of the original plan. It is a **peer** of
`apps/web`, not a child of it:

- imports nothing from `apps/web` — no source, store, theme or config;
- has its own `index.html`, Vite config, tsconfig triple and Vitest config;
- needs no `VITE_*` variables, but uses the same cwd-independent repo-root
  `envDir` as the app so that adding analytics later cannot regress silently;
- is **not** wired into the root `dev` / `build` / `test` / `preview` scripts —
  those still delegate to `apps/web` only, which keeps "root build" meaning
  exactly one thing for the release workflow.

`firebase.json` therefore declares two hosting blocks (`hosting.app` →
`apps/web/dist`, `hosting.website` → `apps/website/dist`) against two sites.
Two consequences had to be handled explicitly, not discovered at release time:

1. `version-bump.yml` pins `target: app`. Adding a hosting block silently
   changes what an unqualified `firebase deploy` does.
2. `ci.yml` gained a separate `verify-website` job, and the PR preview workflow
   gained a separate detector gated on `apps/website/**`.

See [[wiki/decisions/website-as-separate-hosting-target]] and
[[wiki/architecture/release-pipeline]] §10.

---

## Couplings that constrain the move

These were read out of the repository, not assumed. Each is a place where the
migration can silently break production.

| Coupling | Current value | Required change |
|---|---|---|
| **Firebase output** | `firebase.json` → `"public": "dist"` | → `"apps/web/dist"` |
| **Preview detection** | `firebase-hosting-pull-request.yml` diffs a hardcoded path list containing `src/`, `tsconfig.app.json`, `vite.config.ts`, `index.html` | Must point at `apps/web/` — otherwise the preview is **silently skipped** |
| **Version source** | `scripts/generate-version.js` reads root `package.json` | Unchanged — root must keep `version`; output path becomes `apps/web/src/version.ts` |
| **CI entrypoint** | `npm run build` from root ×3 workflows | Unchanged via delegation |
| **tsc solution** | `tsconfig.json` references `tsconfig.app.json` / `tsconfig.node.json` | Must reference `apps/web` and `packages/shared` |
| **Test guard** | `ci.yml` reads `./package.json` scripts | Keep `test` at root (delegate) |
| **`postinstall` hook** | `node scripts/fix-tsc-bin.js` | Must resolve from root; the patched `.bin/tsc` is hoisted, so it still works |
| **ESLint shim** | `NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs'` | Path is root-relative — keep `scripts/` at root |

### The dangerous one

`firebase.json` hardcodes `"public": "dist"`. If it is not updated in the same
PR as the move, the deploy **succeeds** and serves a stale or empty site.
There is no error to notice — the build passes, CI is green, and the only
symptom is that the live app does not update.

Mitigation: Phase 1 of the migration must include a Firebase Hosting preview
check (a PR preview or a manual `firebase deploy --only hosting`) verifying the
deployed bundle is the freshly built one.

---

## Lockfile strategy

**One `package-lock.json` at the root.** Not per-workspace.

`npm ci` is load-bearing in the release pipeline — it is what caught the
`main`/`development` dependency drift that caused the lockfile conflicts fixed
in PR #185. A single root lockfile is what makes that check meaningful. Splitting
locks per workspace would reintroduce exactly the class of bug that pipeline
hardening removed.

---

## Versioning strategy

One version at the root, one tag, one changelog, one deploy — no per-workspace
versions. See [[wiki/architecture/versioning]].

---

## Future notes

- **Metro** will need `watchFolders` and `nodeModulesPaths` pointing at the root
  `node_modules`, since npm workspaces hoist. Deferred to the mobile phase and
  verified empirically there.
- **`packages/shared`** should ship source, not a build output, unless a
  consumer requires compiled JS. TypeScript path mapping plus `"exports"` is
  usually enough for RN's Metro and Vite simultaneously.
- **API contract first.** `apps/api` does not exist. Defining its types in
  `packages/shared` before writing the service lets web and mobile consume one
  source of truth, and generates clients for a non-TypeScript backend if the
  language choice changes later.

---

## Related

- [[wiki/decisions/react-native-monorepo]] — the decision this implements
- [[wiki/decisions/website-as-separate-hosting-target]] — the website's isolation
- [[wiki/features/marketing-website/marketing-website]] — what now lives in `apps/website`
- [[wiki/plans/monorepo-migration]] — phased execution
- [[wiki/architecture/release-pipeline]] — must stay green through the move
- [[wiki/architecture/codebase-structure]] — current (pre-migration) layout
- [[wiki/architecture/versioning]] — single-version release train
