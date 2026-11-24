---
type: Decision
title: "Adopt SemVer 1.0 for Balancr"
description: "Replace year-prefixed CalVer (2026.x.y) with SemVer, starting at 1.0.0-beta.1, so the public beta has a stable, comparable version line."
resource: "https://github.com/AlexDevsTheWeb/myfinance/pull/203"
tags: [decision, versioning, release, semver]
created: 2026-11-24
updated: 2026-11-24
status: accepted
sources: ["raw/2026-11-24-versioning/2026-11-24-versioning.md", ".versionrc", "package.json", ".github/workflows/version-bump.yml"]
related: ["wiki/architecture/versioning", "wiki/architecture/release-pipeline", "wiki/plans/v1.0.0-beta.1-release", "wiki/queries/open-issues-inventory-2026-11-24"]
---

# Decision: Adopt SemVer 1.0

Status: accepted (2026-11-24)

## Context

The project has shipped year-prefixed CalVer since the beginning:
`2026.4.0` … `2026.16.0`, tagged `v2026.16.0`. In that scheme the first segment
was the year, the second was a feature release, and the third a fix.

That worked while the app was pre-release and every deploy could carry any
version number. It stops working at the public beta:

- A year-prefixed number says nothing about compatibility. `2026.16.0` and
  `2026.17.0` look equally "major" to a tester.
- There is no way to express a pre-release line (`beta`) or to promise that
  `1.0.0` means "the data model and backup format are stable".
- The roadmap now has milestone names (`v1.0.0-beta.2`, `v1.0.0`) that have to
  match tags, releases and the app's About/version display.

The release was requested as **`v1.0.0-beta.1`**, which is a SemVer prerelease,
not a CalVer value.

## Options Considered

1. **Keep CalVer.** Lowest risk — no config or workflow change. Rejected: the
   beta milestones cannot be expressed, and a `v1.0.0-beta.1` tag next to
   `v2026.16.0` would leave two incompatible schemes in the same tag namespace.
2. **Hybrid (date + SemVer).** Rejected: two authoritative version numbers, and
   `standard-version` understands only one.
3. **Adopt SemVer now, at the beta boundary** ✅. The last CalVer release
   (`v2026.16.0`) remains valid history; everything from `v1.0.0-beta.1` onward
   is SemVer.

## Decision

Adopt [SemVer](https://semver.org/) with the existing `v` tag prefix, starting
at **`1.0.0-beta.1`**:

| Segment | Meaning |
|---|---|
| `MAJOR` | Breaking change to the data model, backup format or public behaviour |
| `MINOR` | New feature, backwards compatible |
| `PATCH` | Fix, refactor or chore, backwards compatible |
| `-beta.N` | Pre-release of the next stable version |

Mechanics:

- `package.json` now holds `1.0.0-beta.1`; `scripts/generate-version.js` already
  reads it, so the in-app version follows automatically.
- `standard-version` and `.versionrc` are unchanged: `feat` → minor, `fix` →
  patch, breaking (`!`) → major. A normal bump out of a prerelease graduates it
  (`1.0.0-beta.1` + minor/patch → `1.0.0`); `npx standard-version --prerelease
  beta` advances the beta line (`1.0.0-beta.2`).
- The release-detection regex in `version-bump.yml` was fixed to recognise the
  `!` breaking marker (`feat!:`, `fix(scope)!:`), which it previously missed
  entirely. Without that, a SemVer major could never be cut automatically.

## Consequences

- **The tag namespace changes.** CalVer tags stay where they are; do not delete
  or re-tag them. `git describe --tags --abbrev=0` will pick whichever tag is
  nearest in history, so ordering is by ancestry, not by version string.
- **`v1.0.0-beta.1` is a development checkpoint, not a production deploy.**
  The release pipeline only deploys when a `feat`/`fix` lands on `main` after
  the newest reachable tag. The tag is created on `development` after this
  change merges; production is updated by the next `development → main` merge
  that carries a releasing commit.
- **Beta testers get a comparable version.** `1.0.0-beta.2` sorts after
  `1.0.0-beta.1`, and `1.0.0` after both.
- **`1.0.0` becomes a promise.** It now means the backup/export schema and the
  public behaviour are stable enough to freeze. Anything that changes them must
  bump the major.
- The wiki's [[wiki/architecture/versioning]] and
  [[wiki/architecture/release-pipeline]] pages are the source of truth for the
  mechanics; this page records the choice and its trade-offs.

## Related

- [[wiki/architecture/versioning]] — the scheme and the tool configuration
- [[wiki/architecture/release-pipeline]] — how a bump becomes a deploy
- [[wiki/plans/v1.0.0-beta.1-release]] — the milestone this decision enables
- [[wiki/queries/open-issues-inventory-2026-11-24]] — what is planned next
- Source: [raw/2026-11-24-versioning/2026-11-24-versioning.md](../../raw/2026-11-24-versioning/2026-11-24-versioning.md)
