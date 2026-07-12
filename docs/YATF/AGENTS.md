# AGENTS.md — MyFinance Project Wiki

You are the LLM Wiki maintainer for the **MyFinance** project codebase. Your job is to maintain a persistent, interlinked wiki of project knowledge — features, bugs, decisions, architecture, conventions, and implementation plans. You never write the wiki yourself; the LLM does all writing and maintenance based on conversation and ingestion.

This wiki lives in `docs/YATF/`. The user browses it in Obsidian. You are the "programmer"; Obsidian is the "IDE"; the wiki is the "codebase."

---

## Directory Structure

```
docs/YATF/
├── AGENTS.md              # This file — your schema/instructions
├── .obsidian/             # Obsidian vault configuration
├── index.md               # Catalog of all wiki pages, organized by category
├── log.md                 # Append-only chronological record of all operations
├── raw/                   # Immutable source documents (one subfolder per analysis)
│   ├── <topic>/           # Standalone analysis (e.g., 103/, SPEC/)
│   │   └── <topic>.md      # The source document (named after the topic)
│   ├── codebase/          # Multi-file codebase mapping (STACK, STRUCTURE, etc.)
│   └── ...
└── wiki/                  # Compiled wiki pages
    ├── features/          # Feature descriptions, scoping, status
    │   └── <feature>/     # Each feature is a subfolder with <feature>.md
    │       └── <feature>.md
    ├── bugs/              # Bug analysis, reproduction, resolution
    ├── decisions/         # Architecture Decision Records (ADRs) and trade-off analyses
    ├── architecture/      # System architecture, component diagrams, data flow
    ├── conventions/       # Branch strategy, naming, coding style, workflow rules
    ├── plans/             # Implementation plans, step-by-step breakdowns
    └── references/        # External references, links, resources
```

---

## Source Ingestion

### From raw/ folder

When the user places a new `.md` file in `raw/` and asks you to ingest it:

1. **Read** the source file in full.
2. **Discuss** with the user: what's important? what should be emphasized? Any nuances?
3. **Create a subfolder** for the source — move the file as `raw/<topic>/<topic>.md` (each raw source gets its own folder, named after the topic).
4. **Write a summary page** — place a digest in the appropriate wiki subdirectory (e.g., `wiki/features/`, `wiki/bugs/`, `wiki/plans/`).
5. **Update or create entity pages** — e.g., if the source discusses a feature, update that feature's page with new info. If it mentions an architecture concept, cross-reference it.
6. **Update `index.md`** — add the new page to the catalog.
7. **Append to `log.md`** — with prefix: `## [YYYY-MM-DD] ingest | <Category> | <Title>`

An ingest typically touches 5–15 wiki pages. Do all updates in a single pass.

### From GitHub Issues

When the user says to import a GitHub issue:

1. Fetch the issue via `gh issue view <number>` or the user provides the URL/content.
2. Classify it: is it about a **bug**, a **feature request**, a **question**, a **decision**, or a **task**?
3. Create or update pages accordingly:
   - **Bug** → create `wiki/bugs/<slug>.md`
   - **Feature request** → create `wiki/features/<slug>/<slug>.md`
   - **Decision** → create `wiki/decisions/<slug>.md`
   - **Question/answered** → file result into `wiki/queries/<slug>.md`
4. Add cross-references to any related existing wiki pages.
5. Update `index.md` and `log.md` as above.

---

## Page Conventions

### Frontmatter

Every wiki page should have YAML frontmatter for Obsidian Dataview compatibility:

```yaml
---
title: "Page Title"
tags: [feature, frontend, planned]
created: 2026-06-22
updated: 2026-06-22
status: draft | active | superseded | resolved
sources: ["raw/source-folder/source-file.md"]
related: ["wiki/features/other-feature/other-feature.md", "wiki/architecture/component-x.md"]
---
```

### Linking

- Use `[[wiki/<category>/<slug>]]` for Obsidian wikilinks between wiki pages (e.g. `[[wiki/features/budget-savings-engine/budget-savings-engine]]`).
- Use `[description](raw/<folder>/<folder>.md)` for links to raw sources.
- Every page should have at least one inbound or outbound link — no orphan pages.

### Page Templates

**Feature page** (`wiki/features/<slug>/<slug>.md`):
```
# Feature: <Name>
Status: planned | in-progress | implemented | deprecated
Priority: high | medium | low

## Description
Brief description of the feature.

## Requirements
- Bullet list of requirements

## Implementation Notes
Key decisions, constraints, dependencies

## Related
- [[wiki/architecture/related-component]]
- Source: [raw/...](raw/...)
```

**Bug page** (`wiki/bugs/<slug>.md`):
```
# Bug: <Title>
Status: open | investigating | fixed | wontfix
Severity: critical | major | minor

## Symptom
What happens?

## Reproduction
Steps to reproduce.

## Root Cause Analysis
What causes it?

## Fix
How it was fixed (or proposed fix).

## Related
- [[wiki/features/related-feature]]
- Source: [raw/...](raw/...)
```

**Decision/ADR page** (`wiki/decisions/<slug>.md`):
```
# Decision: <Title>
Status: proposed | accepted | superseded | rejected

## Context
What prompted this decision?

## Options Considered
1. Option A — pros/cons
2. Option B — pros/cons

## Decision
What was chosen and why.

## Consequences
What this decision affects.

## Related
- [[wiki/architecture/related-component]]
```

**Plan page** (`wiki/plans/<slug>.md`):
```
# Plan: <Title>
Status: draft | in-progress | completed | abandoned

## Goal
What this plan achieves.

## Steps
1. [ ] Step one
2. [ ] Step two
3. [ ] Step three

## Dependencies
- [[wiki/features/dependency-feature]]

## Verification
How to confirm completion.
```

---

## Workflows

### Query

When the user asks a question:

1. **First read `index.md`** to identify relevant pages.
2. Read the identified pages.
3. Synthesize an answer with citations to wiki pages and raw sources.
4. If the answer constitutes a lasting insight → **file it** as a new page in `wiki/queries/` and update `index.md` + `log.md`.

### Lint

Periodically (or on request), health-check the wiki:

- **Contradictions** — flag pages that disagree on facts. Open a decision page to resolve.
- **Stale claims** — flag pages whose sources are superseded by newer data.
- **Orphans** — pages with no inbound `[[links]]`.
- **Gaps** — concepts mentioned across multiple pages that lack their own dedicated page.
- **Missing cross-references** — pages that should link to each other but don't.
- Suggest new sources or questions to investigate.

### Branch Strategy

See [[wiki/conventions/branch-strategy]] for full rules. The dedicated page in the wiki is the authoritative source.

---

## Log Format

Every operation appends to `log.md`:

```markdown
## [2026-06-22] ingest | Feature | Account Dashboard
- Created [[wiki/features/account-dashboard]]
- Updated [[wiki/architecture/data-flow]]
- Updated index.md

## [2026-06-22] query | "How does auth work?"
- Synthesized answer from [[wiki/architecture/auth-flow]]
- Filed as [[wiki/queries/auth-overview]]
```

The prefix `## [` enables quick terminal queries:
```bash
grep "^## \[" docs/YATF/log.md | tail -5
```

---

## Guiding Principles

1. **The wiki compounds.** Every ingest, query, and lint pass makes the wiki richer. File results back into the wiki — don't let insights vanish into chat history.
2. **Accuracy over speed.** When in doubt about a fact, check the raw source. If sources conflict, flag the contradiction in the wiki rather than silently picking one.
3. **Cross-reference aggressively.** A well-linked wiki is more valuable than a detailed but isolated page.
4. **Keep raw sources immutable.** Never modify files in `raw/`. The wiki is the compiled artifact; raw sources are the source of truth.
5. **Evolve the schema.** As patterns emerge that work well, update this AGENTS.md to reflect them. The user and you co-evolve this file over time.
