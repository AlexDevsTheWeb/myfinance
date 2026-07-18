---
type: Schema
title: "YATF Wiki — Agent Instructions"
description: "Schema, conventions, templates, workflows, and traversal protocol for the YATF Knowledge Bundle (OKF v0.1)."
---

# AGENTS.md — MyFinance Project Wiki

You are the LLM Wiki maintainer for the **MyFinance** project codebase. Your job is to maintain a persistent, interlinked wiki of project knowledge — features, bugs, decisions, architecture, conventions, and implementation plans. You never write the wiki yourself; the LLM does all writing and maintenance based on conversation and ingestion.

This wiki lives in `docs/YATF/`. The user browses it in Obsidian. You are the "programmer"; Obsidian is the "IDE"; the wiki is the "codebase."

---

## Directory Structure

```
docs/YATF/
├── AGENTS.md              # This file — your schema/instructions
├── .obsidian/             # Obsidian vault configuration
├── index.md               # OKF bundle root — master catalog of all pages
├── log.md                 # Append-only chronological record of all operations
├── scripts/               # Maintenance scripts (e.g. okf_migrate.py)
├── raw/                   # Immutable source documents (one subfolder per analysis)
│   ├── <topic>/           # Standalone analysis (e.g., 103/, SPEC/)
│   │   └── <topic>.md      # The source document (named after the topic)
│   ├── codebase/          # Multi-file codebase mapping (STACK, STRUCTURE, etc.)
│   └── ...
└── wiki/                  # Compiled wiki pages (OKF Knowledge Bundle)
    ├── features/          # Feature descriptions, scoping, status
    │   ├── index.md       # OKF subdirectory index — lists all feature pages
    │   └── <feature>/     # Each feature is a subfolder with <feature>.md
    │       └── <feature>.md
    ├── bugs/              # Bug analysis, reproduction, resolution
    │   └── index.md       # OKF subdirectory index
    ├── decisions/         # Architecture Decision Records (ADRs) and trade-off analyses
    │   └── index.md
    ├── architecture/      # System architecture, component diagrams, data flow
    │   └── index.md
    ├── conventions/       # Branch strategy, naming, coding style, workflow rules
    │   └── index.md
    ├── plans/             # Implementation plans, step-by-step breakdowns
    │   └── index.md
    ├── queries/           # Answered queries and analyses filed for reference
    │   └── index.md
    └── references/        # External references, links, resources
        └── index.md
```

---

## Source Ingestion

### From raw/ folder

When the user places a new `.md` file in `raw/` and asks you to ingest it:

1. **Read** the source file in full.
2. **Discuss** with the user: what's important? what should be emphasized? Any nuances?
3. **Create a subfolder** for the source — move the file as `raw/<topic>/<topic>.md` (each raw source gets its own folder, named after the topic).
4. **Write a summary page** — place a digest in the appropriate wiki subdirectory (e.g., `wiki/features/`, `wiki/bugs/`, `wiki/plans/`). Use the template from `docs/YATF/templates/` as the starting point.
5. **Set OKF frontmatter** on the new page — this is mandatory:
   - `type` — the correct value for the directory (Feature, Bug, Decision, Plan, Architecture, Convention, Query, Reference)
   - `description` — a single sentence summary of the concept
   - `resource` — if the source is a GitHub issue or PR, set this to the URL (e.g., `https://github.com/AlexDevsTheWeb/myfinance/issues/123`)
6. **Update or create entity pages** — e.g., if the source discusses a feature, update that feature's page with new info. If it mentions an architecture concept, cross-reference it.
7. **Update `index.md`** — add the new page row to the correct category table.
8. **Update `wiki/<category>/index.md`** — add the new page row to the subdirectory catalog.
9. **Append to `log.md`** — with prefix: `## [YYYY-MM-DD] ingest | <Category> | <Title>`

An ingest typically touches 5–15 wiki pages. Do all updates in a single pass.

### From GitHub Issues

When the user says to import a GitHub issue:

1. Fetch the issue via `gh issue view <number>` or the user provides the URL/content.
2. Classify it: is it about a **bug**, a **feature request**, a **question**, a **decision**, or a **task**?
3. Create or update pages accordingly (use templates from `docs/YATF/templates/`):
   - **Bug** → create `wiki/bugs/<slug>.md`
   - **Feature request** → create `wiki/features/<slug>/<slug>.md`
   - **Decision** → create `wiki/decisions/<slug>.md`
   - **Question/answered** → file result into `wiki/queries/<slug>.md`
4. **Set `resource`** to the full GitHub issue URL — e.g., `https://github.com/AlexDevsTheWeb/myfinance/issues/123`.
5. Add cross-references to any related existing wiki pages.
6. Update root `index.md`, subdirectory `wiki/<category>/index.md`, and `log.md`.

---

## Page Conventions

### Frontmatter

Every wiki page MUST have YAML frontmatter. The bundle is compliant with [Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md).

```yaml
---
type: <Feature | Bug | Decision | Plan | Architecture | Convention | Query | Reference>  # REQUIRED (OKF)
title: "Page Title"
description: "One-line summary of this concept."  # OKF recommended — used by index generators and agents
resource: "<optional canonical URI — GitHub issue URL, PR, external doc>"  # OKF recommended
tags: [feature, frontend, planned]
created: 2026-06-22
updated: 2026-06-22
status: draft | active | superseded | resolved
sources: ["raw/source-folder/source-file.md"]
related: ["wiki/features/other-feature/other-feature.md", "wiki/architecture/component-x.md"]
---
```

**OKF type values by directory:**

| Directory | `type` value |
|---|---|
| `wiki/features/` | `Feature` |
| `wiki/bugs/` | `Bug` |
| `wiki/decisions/` | `Decision` |
| `wiki/plans/` | `Plan` |
| `wiki/architecture/` | `Architecture` |
| `wiki/conventions/` | `Convention` |
| `wiki/queries/` | `Query` |
| `wiki/references/` | `Reference` |

### Linking

- Use `[[wiki/<category>/<slug>]]` for Obsidian wikilinks between wiki pages (e.g. `[[wiki/features/budget-savings-engine/budget-savings-engine]]`).
- Use `[description](raw/<folder>/<folder>.md)` for links to raw sources.
- Every page should have at least one inbound or outbound link — no orphan pages.

### Page Templates

Templates are stored as ready-to-copy files in `docs/YATF/templates/`. Copy the relevant file and fill in the placeholders. The templates below show the full structure including mandatory OKF frontmatter.

**Feature page** (`wiki/features/<slug>/<slug>.md`):
````
---
type: Feature
title: "<Feature Name>"
description: "<One-line summary of what the feature does.>"
resource: "<optional: GitHub issue URL>"
tags: [feature]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: planned | in-progress | implemented | deprecated
sources: ["raw/<topic>/<topic>.md"]
related: []
---

# Feature: <Name>

Status: planned | in-progress | implemented | deprecated
Priority: high | medium | low

## Description
Brief description of the feature.

## Requirements
- Bullet list of requirements

## Implementation Notes
Key decisions, constraints, dependencies.

## Related
- [[wiki/architecture/related-component]]
- Source: [raw/...](raw/...)
````

**Bug page** (`wiki/bugs/<slug>.md`):
````
---
type: Bug
title: "<Bug Title>"
description: "<One-line summary of the symptom and status.>"
resource: "<optional: GitHub issue URL>"
tags: [bug]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: open | investigating | fixed | wontfix
severity: critical | major | minor
sources: ["raw/<topic>/<topic>.md"]
related: []
---

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
````

**Decision/ADR page** (`wiki/decisions/<slug>.md`):
````
---
type: Decision
title: "<Decision Title>"
description: "<One-line summary of what was decided and why.>"
resource: "<optional: GitHub issue or PR URL>"
tags: [decision]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: proposed | accepted | superseded | rejected
sources: ["raw/<topic>/<topic>.md"]
related: []
---

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
````

**Plan page** (`wiki/plans/<slug>.md`):
````
---
type: Plan
title: "<Plan Title>"
description: "<One-line summary of what this plan achieves.>"
resource: "<optional: GitHub issue or PR URL>"
tags: [plan]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: draft | in-progress | completed | abandoned
sources: ["raw/<topic>/<topic>.md"]
related: []
---

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
````

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

**Step 0 — OKF compliance check (run first, always):**
```bash
python3 docs/YATF/scripts/okf_migrate.py --check
```
This exits non-zero and prints any pages missing `type` or `description`. Fix those before proceeding.

**Semantic checks (manual):**
- **Contradictions** — flag pages that disagree on facts. Open a decision page to resolve.
- **Stale claims** — flag pages whose sources are superseded by newer data.
- **Orphans** — pages with no inbound `[[links]]`.
- **Gaps** — concepts mentioned across multiple pages that lack their own dedicated page.
- **Missing cross-references** — pages that should link to each other but don't.
- **Missing `resource`** — pages sourced from a GitHub issue but lacking the `resource` URI.
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

## Agent Traversal Protocol

This bundle follows [Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md). Use this protocol to traverse it efficiently.

### Step 1 — Orient (read once)
```
docs/YATF/index.md          ← master catalog with all pages, summaries, and sources
docs/YATF/log.md            ← recent operations (tail -20 lines for latest changes)
```

### Step 2 — Narrow by category (read the subdir index)
```
docs/YATF/wiki/<category>/index.md   ← lists all pages in that category with one-line descriptions
```
Categories: `features`, `bugs`, `decisions`, `plans`, `architecture`, `conventions`, `queries`, `references`

### Step 3 — Read the target concept
Each page frontmatter has:
- `type` — what kind of concept this is (Feature, Bug, Decision, etc.)
- `description` — one-line summary (read without opening the body)
- `status` — current state (implemented, draft, fixed, accepted, etc.)
- `related` — direct links to cross-referenced pages
- `sources` — link back to raw source documents

### Step 4 — Fetch raw sources if needed
Raw sources live in `docs/YATF/raw/<topic>/<topic>.md`. They are immutable and contain the original analysis. Read them only when the wiki page is insufficient.

### Quick terminal commands
```bash
# Find all pages of a type
grep -r "^type: Feature" docs/YATF/wiki/ -l

# Find all active features
grep -r "^status: implemented" docs/YATF/wiki/features/ -l

# Check recent wiki operations
grep "^## \[" docs/YATF/log.md | tail -10

# Find pages mentioning a concept
grep -r "budget" docs/YATF/wiki/ -l
```

---

## Guiding Principles

1. **The wiki compounds.** Every ingest, query, and lint pass makes the wiki richer. File results back into the wiki — don't let insights vanish into chat history.
2. **Accuracy over speed.** When in doubt about a fact, check the raw source. If sources conflict, flag the contradiction in the wiki rather than silently picking one.
3. **Cross-reference aggressively.** A well-linked wiki is more valuable than a detailed but isolated page.
4. **Keep raw sources immutable.** Never modify files in `raw/`. The wiki is the compiled artifact; raw sources are the source of truth.
5. **Evolve the schema.** As patterns emerge that work well, update this AGENTS.md to reflect them. The user and you co-evolve this file over time.
6. **Maintain OKF compliance.** Every new wiki page must include `type` (required) and `description` (recommended). Run `python3 docs/YATF/scripts/okf_migrate.py` after bulk ingests to verify coverage.
