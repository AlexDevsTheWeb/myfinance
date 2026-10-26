---
name: Wiki Sync
description: Ingest raw notes, GitHub issues, or completed work into the docs knowledge bundle and keep it valid. Use when adding or updating wiki pages, when the user says "ingest", "document this", "update the wiki", or before opening a PR that changed behavior.
---

# Wiki Sync

Maintain the knowledge bundle in `docs/`. The full schema lives in
**`docs/AGENTS.md`** — read it before a large ingest. This skill is the procedure.

## Layout

```
docs/
├── AGENTS.md            # schema (source of truth)
├── index.md             # master catalog — every page listed once
├── log.md               # append-only operation log
├── templates/           # bug.md, decision.md, feature.md, plan.md
├── scripts/
│   ├── okf_validate.py  # linter
│   └── install-hooks.sh # enables the pre-commit gate
├── raw/<topic>/<topic>.md       # immutable sources
└── wiki/<category>/             # compiled pages
    └── <slug>/
        ├── <slug>.md            # concept page
        └── report-YYYY-MM-DD.md # implementation report (type: Report)
```

Categories: `features`, `bugs`, `decisions`, `plans`, `architecture`,
`conventions`, `queries`, `references`.

## Ingest a raw source

1. Read the source in full.
2. Confirm with the user which points matter if the source is ambiguous.
3. If the file is loose in `docs/`, move it to `docs/raw/<topic>/<topic>.md`.
4. Create the compiled page in the right category, starting from the matching
   template in `docs/templates/`.
5. Fill the frontmatter:

   ```yaml
   ---
   type: Feature            # must match the directory
   title: "..."
   description: "One sentence."   # required
   resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/<n>"  # if applicable
   tags: [...]
   created: YYYY-MM-DD
   updated: YYYY-MM-DD
   status: ...
   sources: ["raw/<topic>/<topic>.md"]   # relative to docs/
   related: ["wiki/features/..."]
   ---
   ```

6. Cross-link: add `related:` entries **and** inline `[[wiki/...]]` links.
7. Update `docs/index.md` — add a row to the correct category table.
8. Update `docs/wiki/<category>/index.md` — add a row (format:
   `| [[wiki/<category>/<slug>]] | <description> |`).
9. Append to `docs/log.md`:

   ```markdown
   ## [YYYY-MM-DD] ingest | <Category> | <Title>
   - Created [[wiki/<category>/<slug>]]
   - Updated [[wiki/...]]
   - Updated index.md
   ```

10. Validate (see below).

## Implementation reports

**Every implementation that opens a PR gets a report — no exceptions.** It sits
next to the concept it describes, and it is part of the wiki update, not an
optional extra.

### Placement

| Concept layout | Report path |
|---|---|
| Folder concept — `wiki/features/<slug>/<slug>.md` | `wiki/features/<slug>/report-YYYY-MM-DD.md` |
| Flat concept — `wiki/bugs/<slug>.md`, `wiki/plans/<slug>.md`, `wiki/decisions/<slug>.md`, … | `wiki/<category>/<slug>-report-YYYY-MM-DD.md` |

One file per implementation. Never overwrite an older report; a second delivery of
the same feature gets a second date.

### Frontmatter

```yaml
---
type: Report
title: "Implementation Report — <what shipped>"
description: "<one sentence: what changed and how it was verified>"
resource: "<PR URL>"
tags: [report, <area>]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: shipped | partially-shipped | reverted
sources: ["raw/<topic>/<topic>.md"]
related: ["wiki/features/<slug>/<slug>"]
---
```

`resource` is required for reports. `status` matters: a reverted implementation
must not read like a live feature.

### Sections

1. **Context** — trigger and prior state.
2. **Changes** — grouped by area, never a raw diff.
3. **Decisions** — chosen, rejected, why.
4. **Deviations** — from the request/prototype/design; say whether agreed or a
   judgement call. "None" when there are none.
5. **Verification** — commands and real outcomes, including failures found and
   fixed during the work.
6. **Not verified / deferred** — explicit. "None" if genuinely nothing.
7. **Wiki pages touched** — created/updated in the same PR.
8. **Related** — parent concept and raw sources.

### Wiring it in

- Add the report to the parent page's `## Related` (the validator requires an
  inbound link from a non-report page).
- **Do not** list reports in `docs/index.md` or the category `index.md`.
- Append to `docs/log.md` with `## [YYYY-MM-DD] report | <Category> | <Title>`.
- Start from `docs/templates/report.md`.
- Run the validator; it checks the `Report` type, the filename pattern, the
  parent link, and that the required `context`/`verification` sections exist.

## Update an existing page

- Change the body, bump `updated:`.
- If the fact came from a new source, add it to `sources:`.
- If the page contradicts another page, do not silently pick one — flag it and
  open a decision page.

## Lint / validate

```bash
python3 docs/scripts/okf_validate.py            # errors fail, warnings advise
python3 docs/scripts/okf_validate.py --fix      # add missing `type:` fields
python3 docs/scripts/okf_validate.py --orphans  # also report unlinked pages
```

Checks: frontmatter, `type` vs directory, `description`, `sources` resolution,
relative markdown links, `[[wiki/...]]` targets, index coverage.

Then the semantic pass by hand:

- contradictions between pages
- stale claims (source superseded)
- concepts mentioned repeatedly with no page of their own
- wiki pages whose `resource:` issue is closed but `status:` is stale

## Rules

- **Raw is immutable.** Never rewrite files in `docs/raw/` (generated codebase
  maps may be refreshed with a new date stamp). Corrections happen in the wiki.
- **One source of truth.** Schema in `docs/AGENTS.md`, skills in `.claude/skills/`,
  branch rules in the wiki. Never copy the same rule into a second file.
- **No orphans.** Every new page must be linked from an existing page and listed
  in both indexes.
- **Never leave the bundle red.** If the validator fails, fix it before committing.
