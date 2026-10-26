---
type: Architecture
description: "Versioning scheme using conventional commits and the standard-version release pipeline."
title: "Versioning"
tags: [architecture, versioning, ci, release]
created: 2026-06-22
updated: 2026-10-04
status: active
sources: [".versionrc", "package.json", "scripts/generate-version.js", ".github/workflows/version-bump.yml"]
related: ["architecture/release-pipeline", "architecture/external-integrations", "conventions/branch-strategy", "architecture/monorepo-layout"]
---

# Versioning

## Scheme

The project uses standard [semver](https://semver.org/) with a `v` tag prefix:

```
MAJOR.MINOR.PATCH
```

In practice the first segment tracks the year:

| Segment | Meaning | Example |
|---------|---------|---------|
| `MAJOR` | Year (e.g. `2026`) | `2026.5.0` |
| `MINOR` | Feature release | `2026.5.0` |
| `PATCH` | Bug fix / chore | `2026.4.2` |

## How it works

### Conventional Commits

Version bumps are triggered by conventional commit messages:

```
feat: add transaction export        → minor bump (2026.5.0 → 2026.6.0)
fix: fix date filter off-by-one     → patch bump (2026.5.0 → 2026.5.1)
feat!: breaking API change          → major bump (2026.5.0 → 2027.1.0)
```

### `.versionrc` mapping

| Commit type | Bump |
|-------------|------|
| `feat` | minor |
| `fix`, `perf`, `refactor`, `docs`, `style`, `test`, `build` | patch |
| Breaking change (`!` or `BREAKING CHANGE:` footer) | major |

### Tool

- **`standard-version`** (`^9.5.0`) — reads `package.json` version, bumps according to `.versionrc` rules, creates a git tag and updates `CHANGELOG.md`.
- Tag prefix: `v` (e.g. `v2026.5.0`)
- Release commit message: `chore(release): {{currentTag}}`

### Build-time injection

The `prebuild` script (`scripts/generate-version.js`):

1. Reads `version` from `package.json`
2. Gets current ISO date and short git commit hash (`git rev-parse --short HEAD`)
3. Writes `src/version.ts` with three exports: `version`, `buildDate`, `commit`

This file is consumed by the app at runtime (e.g. displayed in a settings/about section).

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

## Related

- [[wiki/architecture/release-pipeline]] — CI, protection, releases, sync-back
- [[wiki/architecture/external-integrations]] — Firebase configuration
- [[wiki/architecture/monorepo-layout]] — how this stays true in the monorepo
- [[wiki/conventions/branch-strategy]] — merge strategy requirements
