---
type: Decision
title: "Wiki Reorganization — docs/ Bundle Layout"
description: "The knowledge bundle moved from docs/YATF/ to docs/{raw,wiki}, legacy GSD/OpenSpec/Superpowers material was archived, and agent skills were consolidated into .claude/skills/."
resource: "raw/2026-10-26-cleaning/2026-10-26-cleaning.md"
tags: [decision, documentation, wiki, tooling, cleanup]
created: 2026-10-26
updated: 2026-10-26
status: accepted
sources: ["raw/2026-10-26-cleaning/2026-10-26-cleaning.md"]
related: ["wiki/conventions/branch-strategy", "wiki/references/llm-wiki-pattern", "wiki/architecture/codebase-structure"]
---

# Decision: Wiki Reorganization — docs/ Bundle Layout

Status: accepted (2026-10-26)

## Context

Knowledge had accumulated in six competing places:

| Location | Problem |
|---|---|
| `docs/YATF/` | Wiki named after the retired "Yet Another Finance Tracker" branding; a bundle root nested inside `docs/`. |
| `docs/superpowers/` | Designs and plans from a workflow no longer used. |
| `.superpowers/` | Local-only execution scratch (briefs, diffs, reports) — untracked noise. |
| `.opencode/` | Only OpenSpec commands/skills; OpenSpec itself was abandoned. |
| `.planning/` | GSD phase artifacts duplicating the wiki, including a codebase map identical to `raw/codebase/`. |
| `openspec/` | Formal specs for features already documented in the wiki. |

Root also carried four markdown reports that duplicated `raw/` sources verbatim,
plus prototype agent scripts.

## Decision

**One bundle, one root: `docs/`.**

```
docs/
├── AGENTS.md      # schema + agent instructions
├── index.md       # master catalog
├── log.md         # append-only log
├── templates/
├── scripts/       # okf_validate.py + install-hooks.sh
├── raw/           # immutable sources
│   └── archive/   # retired GSD / OpenSpec / Superpowers material
└── wiki/          # compiled pages (8 categories)
```

1. `docs/YATF/` was dissolved: `raw/`, `wiki/`, `index.md`, `log.md`,
   `templates/`, `scripts/`, and `.obsidian/` now sit directly under `docs/`.
   `AGENTS.md` moved to `docs/AGENTS.md`.
2. Legacy material that had no wiki coverage was **archived**, not deleted:
   GSD phases 01–12, the four OpenSpec specs, the Superpowers designs, the
   session handoff, and the agent prototypes. See `docs/raw/archive/README.md`.
3. `.planning/codebase/` was deleted — byte-identical to `docs/raw/codebase/`.
4. `.superpowers/`, `.opencode/`, `openspec/`, `.planning/` no longer exist.
5. Root duplicates (`go-to-market-plan.md`, `myfinance-app-review.md`,
   `saas-readiness-analysis.md`, `clear_auth.html`) were removed; the first three
   were exact copies of files already in `raw/`.
6. **Agent skills have a single home: `.claude/skills/`.** OpenCode discovers it
   through its `.claude/skills` compatibility source; Claude Code reads it
   natively. Two skills encode the working loop: `issue-to-pr` and `wiki-sync`.
7. `src`-relative link breakage introduced by the move was repaired, and existing
   broken links found during the audit were fixed.
8. Validation moved from `scripts/okf_migrate.py` to
   **`docs/scripts/okf_validate.py`**, which checks frontmatter, `type` vs
   directory, `description`, `sources` resolution, relative links, wikilinks, and
   index coverage. It is wired into `npm run docs:validate` and an installable
   pre-commit hook (`.githooks/pre-commit`).

## Alternatives Considered

1. **Keep `docs/YATF/` and just rename the folder per project** — still leaves a
   bundle root nested inside `docs/`, and the name returns with the next project.
2. **Delete all legacy folders outright** — smallest tree, but loses the GSD
   research and the only copy of three designs. Archiving costs little.
3. **Skills duplicated in `.opencode/skills/` and `.claude/skills/`** — rejected
   by the user: one source of truth, no forked instructions.

## Consequences

- Every path moves: old links of the form `docs/YATF/wiki/<cat>` are now
  `docs/wiki/<cat>`, and `docs/YATF/raw` is `docs/raw`. Historical `docs/log.md`
  entries intentionally keep the old paths — the log is append-only.
- Obsidian vault root is now `docs/`; wikilinks were normalized to the
  `[[wiki/<category>/<slug>]]` form in all category indexes.
- The wiki is machine-checked: a red `npm run docs:validate` blocks commits that
  touch the bundle once `npm run hooks:install` has been run.
- There is exactly one place to add a skill, and exactly one place to read the
  schema.
- Archived material is indexed: [[wiki/references/legacy-planning-archive]] maps
  every retired document to the wiki page that now carries its knowledge, and
  lists the five things that were planned but never shipped.

## Related

- [[wiki/conventions/branch-strategy]]
- [[wiki/references/llm-wiki-pattern]]
- [[wiki/architecture/codebase-structure]]
- Raw request: [raw/2026-10-26-cleaning/2026-10-26-cleaning.md](../../raw/2026-10-26-cleaning/2026-10-26-cleaning.md)
