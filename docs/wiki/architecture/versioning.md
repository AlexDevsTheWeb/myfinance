---
type: Architecture
description: "SemVer versioning with conventional commits and the standard-version release pipeline — 1.0.0-beta.1 onward, after the year-prefixed CalVer line."
title: "Versioning"
tags: [architecture, versioning, ci, release, semver]
created: 2026-06-22
updated: 2026-11-24
status: active
sources: [".versionrc", "package.json", "scripts/generate-version.js", ".github/workflows/version-bump.yml"]
related: ["wiki/architecture/release-pipeline", "wiki/architecture/external-integrations", "wiki/conventions/branch-strategy", "wiki/architecture/monorepo-layout", "wiki/decisions/semver-1-0-adoption", "wiki/plans/v1.0.0-beta.1-release"]
---

# Versioning

## Scheme

The project uses [SemVer](https://semver.org/) with a `v` tag prefix:

```
MAJOR.MINOR.PATCH[-prerelease]
```

The current line is **`1.0.0-beta.1`** — the public beta that follows the last
CalVer release.

| Segment | Meaning | Example |
|---------|---------|---------|
| `MAJOR` | Breaking change to data model, backup format or public behaviour | `2.0.0` |
| `MINOR` | New backwards-compatible feature | `1.1.0` |
| `PATCH` | Fix, refactor or chore | `1.0.1` |
| `-beta.N` | Pre-release of the next stable version | `1.0.0-beta.2` |

### Why not CalVer any more

Until 2026-11 the first segment was the **year**: `2026.16.0`, tagged
`v2026.16.0`. That expressed nothing about compatibility and had no way to name
a beta line. The switch is recorded in
[[wiki/decisions/semver-1-0-adoption]]; the CalVer tags remain valid history and
must not be deleted or re-pointed.

Because `git describe --tags --abbrev=0` orders by **ancestry**, not by version
string, the CalVer and SemVer tags coexist safely: whichever tag is nearest to
`HEAD` is the baseline. After `v1.0.0-beta.1` is tagged on `development`, it is
the baseline for every later commit that descends from it.

## How it works

### Conventional Commits

Version bumps are triggered by conventional commit messages:

```
feat: add transaction export         → minor bump (1.0.0 → 1.1.0)
fix: fix date filter off-by-one      → patch bump (1.0.0 → 1.0.1)
feat!: change the backup schema      → major bump (1.0.0 → 2.0.0)
```

### `.versionrc` mapping

| Commit type | Bump |
|-------------|------|
| `feat` | minor |
| `fix`, `perf`, `refactor`, `docs`, `style`, `test`, `build` | patch |
| Breaking change (`!` in the subject) | major |

`chore` and `ci` are deliberately absent: they neither bump nor appear in the
changelog. That is what lets documentation and tooling commits land on `main`
without burning a release.

### Pre-releases

`standard-version` derives the next version from `package.json`:

| Current | Command | Result |
|---|---|---|
| `1.0.0-beta.1` | `npx standard-version` (feat or fix present) | `1.0.0` — graduates the beta |
| `1.0.0-beta.1` | `npx standard-version --prerelease beta` | `1.0.0-beta.2` |
| `1.0.0` | `npx standard-version --prerelease beta` | `1.0.1-beta.0` |

The automated workflow is intentionally **not** configured with
`--prerelease`: a normal `feat`/`fix` on `main` graduates the beta to `1.0.0`.
Advancing a beta line is a deliberate manual step (`--prerelease beta`), not
something a merge should do by accident.

### Tool

- **`standard-version`** (`^9.5.0`) — reads `package.json` version, bumps
  according to `.versionrc` rules, creates a git tag and updates `CHANGELOG.md`.
- Tag prefix: `v` (e.g. `v1.0.0-beta.1`)
- Release commit message: `chore(release): {{currentTag}}`

### Release detection

`.github/workflows/version-bump.yml` greps commit **subjects** between the newest
reachable tag and `HEAD`:

```bash
^(feat|fix)(\(.+\))?!?:|^BREAKING CHANGE:
```

Two constraints follow from that:

- The `!` marker **must be in the subject** (`feat!:`, `fix(scope)!:`). Because
  the workflow reads `--format=%s`, a `BREAKING CHANGE:` footer alone is not
  seen. Put the `!` in the subject.
- The pattern previously read `(feat|fix| BREAK CHANGE)` and never matched
  `feat!:` at all, so breaking commits were silently not released. Fixed with
  the SemVer switch, where a missed major bump is much more damaging.

### Build-time injection

The `prebuild` script (`scripts/generate-version.js`):

1. Reads `version` from `package.json`
2. Gets current ISO date and short git commit hash (`git rev-parse --short HEAD`)
3. Writes `src/version.ts` with three exports: `version`, `buildDate`, `commit`

This file is consumed by the app at runtime (e.g. displayed in a settings/about
section).

## Release pipeline

**Full details: [[wiki/architecture/release-pipeline]]** — that page covers
branch protection, CI, the PR-based release flow and the automatic
`main` → `development` sync-back, all of which post-date this summary.

In short:

1. A merge to `main` triggers `version-bump.yml`
2. The workflow parses commits since the newest tag reachable from `HEAD`
3. If a `feat`/`fix`/breaking commit is found, `standard-version` bumps the version
4. The bump goes to a `release/<tag>` branch and lands on `main` through a PR
   (required because `main` is branch-protected and GitHub Apps cannot bypass it)
5. Build + deploy to Firebase Hosting `live`
6. A GitHub Release is created, and `main` is synced back into `development`

Non-releasing commit types (`docs`, `test`, `ci`, `refactor`, `chore`, `build`)
build but do not deploy.

> **Single version at the root.** During the
> [[wiki/plans/monorepo-migration]] the root `package.json` keeps ownership of
> the `version` field and `scripts/generate-version.js` keeps reading it. This
> page's build-time injection assumptions are therefore preserved.

> **`v1.0.0-beta.1` is a development checkpoint.** It is tagged on
> `development`, so it does not deploy anything by itself. Production moves on
> the next `development → main` merge that carries a releasing commit. See
> [[wiki/plans/v1.0.0-beta.1-release]].

## Related

- [[wiki/decisions/semver-1-0-adoption]] — why SemVer replaced CalVer
- [[wiki/plans/v1.0.0-beta.1-release]] — the beta milestone and its notes
- [[wiki/architecture/release-pipeline]] — CI, protection, releases, sync-back
- [[wiki/architecture/external-integrations]] — Firebase configuration
- [[wiki/architecture/monorepo-layout]] — how this stays true in the monorepo
- [[wiki/conventions/branch-strategy]] — merge strategy requirements
