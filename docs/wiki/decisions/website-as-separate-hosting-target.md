---
type: Decision
title: "Website as an isolated workspace with its own hosting target"
description: "Why apps/website stays fully decoupled from apps/web and deploys to a second Firebase Hosting site rather than sharing the app's."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/193"
tags: [decision, monorepo, website, firebase, ci, isolation]
created: 2026-10-05
updated: 2026-10-05
status: accepted
sources: ["raw/website/website.md", "raw/website/starting-prompt.md"]
related: ["wiki/features/marketing-website/marketing-website", "wiki/architecture/monorepo-layout", "wiki/architecture/release-pipeline", "wiki/decisions/react-native-monorepo", "wiki/plans/monorepo-migration"]
---

# Decision: Website as an isolated workspace with its own hosting target

Status: accepted
Date: 2026-10-05
Issue: [#193](https://github.com/AlexDevsTheWeb/myfinance/issues/193)

## Context

The landing page could have been three things: a route in `apps/web`, a second
Vite app inside `apps/web`, or a workspace. It was going to be deployed alongside
the production app either way.

The constraint that decides it: **the app is under a release train.** Root
`npm run build` delegates into `apps/web`, three workflows invoke it, and
`scripts/generate-version.js` writes a version file consumed by the app. A
marketing page that changes copy should never be able to block, alter, or
piggyback on an app release.

## Decision

1. **`apps/website` is a peer workspace.** It imports nothing from
   `apps/web` — no source, no store, no theme, no config. Sharing would make
   the two apps mutually blocking in exactly the way this decision exists to
   prevent. `@mui/material` is a dependency of both, hoisted from the single
   root lockfile, so isolation costs nothing in install time.
2. **Root scripts are unchanged.** `dev`, `build`, `test`, `preview` still
   delegate to `apps/web` only. The website is verified with
   `npm run build --workspace apps/website`. Root `build`/`test` therefore keep
   meaning exactly one thing, and the app release contract is untouched.
3. **Two hosting targets, both explicit.** `hosting.app` →
   `apps/web/dist`, `hosting.website` → `apps/website/dist`, site
   `balancr-website`. Firebase treats a hosting block as its own site, so a
   config with two blocks is the mechanism — there is no "deploy both" default.
4. **Every deploy names its target.** `version-bump.yml` gains
   `target: app`. Without it, a config that has grown a second site changes
   what the release workflow deploys — silently, on the next release. This is
   the same failure class as the `firebase.json` `"public": "dist"` bug in
   [[wiki/plans/monorepo-migration]], inverted: there the path was unowned, here
   the target is.
5. **CI gets a separate job, and the PR preview workflow gets a separate
   detector.** The preview workflow's hardcoded path list is exactly the
   coupling that silently skips previews (recorded in
   [[wiki/architecture/monorepo-layout]]). Adding `apps/website/**` to that
   list and gating the second preview on it keeps each change type pointing at
   the site it actually changed.
6. **The website does not ride the version train.** No `generate-version.js`,
   no `version.ts`, no release tag. It ships when its own workflow deploys it.

## Alternatives considered

| Option | Rejected because |
|---|---|
| A route in `apps/web` | Couples a copy edit to the app release train, and makes marketing-page bundle regressions indistinguishable from app regressions. Also drags every landing-page visitor through the app's auth/Firebase initialization. |
| A second Vite app inside `apps/web` | Shares the app's tsconfig, Vite config, env handling and test setup by proximity, which is coupling without the benefit of workspace isolation. |
| One Firebase site, `/marketing` as a rewrite | Couples deploy cadence and rollback, and puts a landing page's cache headers on the same hosting config as the authenticated app. Revisit only if the second site becomes operationally annoying — the isolation is cheap now and expensive to unwind. |

## Consequences

- Two bundles, two hosts, two rollback surfaces. Accepted.
- `npm run lint` at the root now covers `apps/website` — free, and it keeps the
  baseline honest. The website's own lint run reports zero problems.
- The 7E/3W baseline must be restated whenever either app adds findings, or it
  becomes a number nobody can reproduce. It is currently unchanged.
- The website's version is unreported in-app. Fine for now; revisit if the
  marketing site ever needs per-release changelog entries.

## Related

- [[wiki/features/marketing-website/marketing-website]]
- [[wiki/decisions/react-native-monorepo]]
- [[wiki/architecture/monorepo-layout]]
- [[wiki/architecture/release-pipeline]]
- [[wiki/plans/monorepo-migration]]
- Source: [raw/website/website.md](../../raw/website/website.md)