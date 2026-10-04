---
type: Architecture
title: "Release Pipeline — CI, Branch Protection, PR-Based Releases and Sync-Back"
description: "How code reaches production: blocking CI, main branch protection, conventional-commit releases via PR, Firebase deploys, and automatic main-to-development sync-back."
resource: ""
tags: [architecture, ci, cd, release, github-actions, firebase, versioning]
created: 2026-10-04
updated: 2026-10-04
status: active
sources: ["raw/monorepo-migration/monorepo-migration.md", ".github/workflows/ci.yml", ".github/workflows/version-bump.yml", ".github/workflows/firebase-hosting-pull-request.yml"]
related: ["wiki/architecture/versioning", "wiki/architecture/external-integrations", "wiki/conventions/branch-strategy", "wiki/plans/monorepo-migration", "wiki/architecture/concerns-and-tech-debt"]
---

# Release Pipeline

How a commit in `development` becomes a live deploy on Firebase Hosting, and
what keeps `main` and `development` from drifting apart again.

This page supersedes the short pipeline description previously in
[[wiki/architecture/versioning]], which predates branch protection and
sync-back.

---

## 1. The problem this solved

Until October 2026 the two long-lived branches had **diverged**: 23 commits on
`main`, 61 on `development`, from a shared base of `0b45219`.

`package.json` read `2026.15.1` on `main` and `2026.10.1` on `development`.
`development` carried Vitest and testing-library dependencies that `main` had
never seen. **Every** `development` → `main` PR conflicted in
`package-lock.json`.

The root cause was in the release workflow itself:

```yaml
# Was
- run: rm -rf node_modules package-lock.json && npm install
```

This deleted the committed lockfile and regenerated it from whatever
`package.json` happened to contain, on **every release**. It silently dropped
any dependency `main` did not know about. The same line also ran on Node 24
while CI and local development used `.nvmrc`.

---

## 2. Branch protection on `main`

Configured via the GitHub API:

| Setting | Value | Why |
|---|---|---|
| `required_status_checks.contexts` | `Typecheck, build, lint, test` | Nothing reaches production unverified |
| `required_status_checks.strict` | `false` | Avoids a deadlock when `development` has moved ahead |
| `enforce_admins` | `true` | The maintainer is the admin; the rule applies to them too |
| `required_pull_request_reviews` | **none** | Solo repository — self-approval is impossible, so requiring review would deadlock every PR |
| `allow_force_pushes` | `false` | Protect release history |
| `allow_deletions` | `false` | |
| `required_conversation_resolution` | `true` | Hygiene |

### The constraint this exposed

**GitHub Apps are not exempt from branch protection, and personal repositories
cannot add a bypass actor.**

This was verified empirically rather than assumed, using a throwaway workflow
that ran `git push --dry-run origin HEAD:main`:

```
PROBE_RESULT=BOT_BLOCKED
```

Since the release workflow pushed directly to `main` via `GITHUB_TOKEN`,
enabling protection would have **failed every future release**. The fix was to
change the workflow (§4), not to weaken the protection.

Two further repository settings were required:

| Setting | Value | Why |
|---|---|---|
| `actions/permissions/workflow.can_approve_pull_request_reviews` | `true` | Without it `GITHUB_TOKEN` cannot open the release PR |
| `allow_auto_merge` | `true` | So the release PR merges itself once CI is green |

---

## 3. CI

`.github/workflows/ci.yml` runs on **every PR regardless of target**, plus
pushes to `main` and `development`.

| Step | Blocking | Notes |
|---|---|---|
| `npm ci` | yes | Validates the committed lockfile |
| `npm run build` | yes | Runs `tsc -b` first, so type errors fail before tests |
| `npm run lint` | **no** (`continue-on-error`) | 7 pre-existing errors / 3 warnings |
| `npm test` | yes | Skipped when the branch has no `test` script |

Two details worth preserving:

- **Lint is deliberately non-blocking.** The repository carries 7 pre-existing
  errors (React hook correctness in `BudgetTargetDialog`, `TransactionForm`,
  `EtfTransactionModal`, `TransactionModal`, plus `prefer-const` and
  `no-useless-assignment`). Flipping it blocking before that baseline is fixed
  would block every PR. This is tracked in
  [[wiki/architecture/concerns-and-tech-debt]].
- **The test step is conditional.** The guard skips `npm test` when
  `package.json` has no `test` script. It was added because `main` had no test
  setup, so a docs-only PR against `main` failed with `Missing script: test` —
  a false failure rather than a real one. Since `main` received the test setup
  via the `v2026.16.0` release the guard is now a no-op, but it is kept as a
  safety net for branches that predate the test suite.

Before this workflow existed, the only check on PRs was a **build** in the
Firebase preview workflow, which covered `main` only. Nothing verified tests or
lint.

---

## 4. Releases go through a PR

Because the bot cannot push to protected `main`, the version bump is pushed to
a per-release branch and merged back through an ordinary PR:

```
push to main
   └─ version-bump.yml
        ├─ detect feat/fix/breaking since the newest reachable tag
        ├─ standard-version → bump + tag
        ├─ push release/v{version} branch and the tag
        ├─ build
        ├─ deploy to Firebase "live"          ← production updated here
        ├─ open release PR → main
        ├─ enable auto-merge
        ├─ create GitHub Release
        └─ sync main back into development
```

**The deploy is ordered before the release PR steps on purpose.** An earlier
ordering let PR mechanics gate production: when
`can_approve_pull_request_reviews` was off, the `Open release PR` step failed
and every later step — including the deploy — was skipped. `main` was left
carrying merged code at `2026.15.1` while the `v2026.16.0` tag existed and
**nothing was deployed**. Deploying first means production is updated even if
bookkeeping fails.

Recovery from that half-failed release: delete the orphaned tag and branch,
enable the setting, and re-run. The result was `v2026.16.0` deployed and
`main` at `2026.16.0`.

### Merge strategy requirement

**Merge with "Create a merge commit"** — not squash, not rebase.

A merge commit gives `main` parents `(old main, development)`, which keeps
`development` an **ancestor of `main`**. That ancestry is exactly what lets
sync-back fast-forward instead of opening a PR. Squash or rebase breaks it, and
every future release falls back to a manual sync PR.

---

## 5. Sync-back

The last step keeps `development` a descendant of `main`:

```bash
git fetch origin main development
if [ "$main" = "$development" ]; then
  echo "already in sync"
elif git merge-base --is-ancestor origin/development origin/main; then
  git push origin origin/main:development        # fast-forward
else
  gh pr create --base development --head main    # diverged or raced
fi
```

Properties, each verified by running the extracted workflow logic against
throwaway git repositories:

| Scenario | Behaviour |
|---|---|
| `main` ahead of `development` | Fast-forwards `development` |
| Already in sync | No-op, no push |
| `development` diverged | Opens a sync PR; **no** destructive push |
| `development` moved mid-run | Push rejected → falls back to a sync PR; competing commit survives |

It runs with `if: always()` so it still executes when the deploy fails — the
version bump on `main` causes the drift, not the deploy.

---

## 6. Release detection, and a double-release bug

The check decides whether a release is needed by listing commits between the
newest tag reachable from `HEAD` and `HEAD`, then grepping for
`feat` / `fix` / breaking-change subjects.

It originally used `HEAD~1` as the baseline:

```bash
# Was — buggy
PREV_TAG=$(git describe --tags --abbrev=0 HEAD~1)
```

`HEAD~1` follows **only a merge commit's first parent**. After a release PR
merged into `main`, that found the tag *before* the release commit and
re-counted already-shipped commits — releasing **twice per merge**. It now
resolves from `HEAD`, which reaches the new tag through the second parent.

Verified across: `feat` (releases), `fix` (releases), `docs` (does not), a
release PR merging (does not re-trigger), and a `feat` after a release
(releases again).

Non-releasing commit types — `docs`, `test`, `ci`, `refactor`, `chore`,
`build` — build but do not deploy. This is what makes it safe to merge
documentation and tooling-only work to `main` without burning a production
deploy.

---

## 7. Toolchain unification

| Workflow | Node | Install |
|---|---|---|
| `ci.yml` | `.nvmrc` (22.19.0) | `npm ci` |
| `version-bump.yml` | `.nvmrc` (was hardcoded 24) | `npm ci` (was `rm -rf` + `npm install`) |
| `firebase-hosting-pull-request.yml` | `.nvmrc` (had no `setup-node`) | `npm ci` |

`actions/create-release@v1` (Node 12, unmaintained) was replaced with
`gh release create --generate-notes`.

---

## 8. End-to-end flow

```
feat/YATF-123  ──commits──►  PR  ──CI──►  development
                                              │
                                              ▼
                              PR: development → main
                                   (fast-forward)
                                    + Firebase preview
                                              │
                                              ▼
                                     merge → main
                                              │
                                              ▼
                              version-bump.yml
                                ├─ bump + tag
                                ├─ deploy live
                                ├─ release PR (auto-merged)
                                └─ sync main → development
```

Every step of this was exercised end-to-end through the `v2026.16.0` release.

---

## 9. Constraints for future changes

- Anything that moves build output **must** update `firebase.json`
  (`"public": "apps/web/dist"`), or the deploy silently serves nothing. This is
  the single most dangerous coupling in the pipeline.
- Any workflow that needs to open a PR requires
  `can_approve_pull_request_reviews: true`.
- Any workflow that pushes to `main` will be **blocked** — route it through a PR.
- Keep `npm run build` working from the repository root. Three workflows
  depend on it.

---

## Related

- [[wiki/architecture/versioning]] — semver scheme and `standard-version`
- [[wiki/architecture/external-integrations]] — Firebase configuration
- [[wiki/conventions/branch-strategy]] — branch and PR rules
- [[wiki/plans/monorepo-migration]] — must not break any of the above
- [[wiki/architecture/concerns-and-tech-debt]] — the 7 pre-existing lint errors
