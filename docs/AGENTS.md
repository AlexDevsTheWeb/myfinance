---
type: Schema
title: "MyFinance Wiki — Agent Instructions"
description: "Schema, conventions, templates, workflows, and traversal protocol for the MyFinance Knowledge Bundle (OKF v0.1)."
---

# AGENTS.md — MyFinance Project Wiki

You are the LLM Wiki maintainer for the **Balancr / MyFinance** project. Your job is to maintain a persistent, interlinked wiki of project knowledge — features, bugs, decisions, architecture, conventions, and implementation plans.

The user browses this bundle in Obsidian. You are the "programmer"; Obsidian is the "IDE"; the wiki is the "codebase."

This file is the single source of truth for wiki structure. The root `AGENTS.md` (and `CLAUDE.md`, which imports it) tells agents how to run the project; this file tells them how to maintain knowledge about it.

---

## Directory Structure

```
docs/
├── AGENTS.md              # This file — schema/instructions (auto-loaded by agents)
├── .obsidian/             # Obsidian vault configuration
├── index.md               # OKF bundle root — master catalog of all pages
├── log.md                 # Append-only chronological record of all operations
├── templates/             # Ready-to-copy page templates
├── scripts/
│   ├── okf_validate.py    # Bundle linter (frontmatter, links, index coverage, orphans)
│   └── install-hooks.sh   # Installs the pre-commit validation gate
├── raw/                   # Immutable source documents (one subfolder per analysis)
│   ├── <topic>/           # Standalone analysis (e.g., 103/, 2026-10-26-cleaning/)
│   │   └── <topic>.md     # The source document (named after the topic)
│   ├── codebase/          # Multi-file codebase mapping (STACK, STRUCTURE, etc.)
│   └── archive/           # Retired planning material kept for provenance
│       ├── gsd/           #   GSD phases + ROADMAP/STATE
│       ├── openspec/      #   OpenSpec specs + cited changes
│       ├── superpowers/   #   Superpowers designs/plans not in the wiki
│       └── session-handoff/, local-scratch/
└── wiki/                  # Compiled wiki pages (OKF Knowledge Bundle)
    ├── features/          # Feature descriptions, scoping, status
    │   ├── index.md       # OKF subdirectory index — lists all feature pages
    │   └── <feature>/     # Each feature is a subfolder with <feature>.md
    │       └── <feature>.md
    ├── bugs/              # Bug analysis, reproduction, resolution
    ├── decisions/         # Architecture Decision Records (ADRs) and trade-off analyses
    ├── architecture/      # System architecture, component diagrams, data flow
    ├── conventions/       # Branch strategy, naming, coding style, workflow rules
    ├── plans/             # Implementation plans, step-by-step breakdowns
    ├── queries/           # Answered queries and analyses filed for reference
    └── references/        # External references, links, resources
```

Every category directory has its own `index.md`.

---

## The Skill Loop (how work actually flows)

The end-to-end loop for any request — a GitHub issue, a document dropped in `raw/`, or a chat instruction — is encoded as an agent skill so every harness runs it the same way:

```
.claude/skills/issue-to-pr/SKILL.md   # read → analyze → plan → implement → wiki → draft PR
.claude/skills/wiki-sync/SKILL.md     # ingest / update / lint the wiki bundle
```

`.claude/skills/` is the **single source of truth**: OpenCode loads it through its
`.claude/skills` compatibility source, and Claude Code loads it natively. Do not
duplicate skills into `.opencode/`.

Short version:

1. **Read** the item (issue, raw doc, or instruction) in full.
2. **Analyze** — impact, affected files, related wiki pages.
3. **Propose** an implementation or remediation plan. **Ask** if anything is ambiguous; never guess silently.
4. **Implement** on a correctly-named branch (see [[wiki/conventions/branch-strategy]]).
5. **Update the wiki** per the workflows below, then run the validator.
6. **Open a draft PR** against `development`.

---

## Source Ingestion

### From `raw/`

When the user places a new `.md` file in `raw/` and asks you to ingest it:

1. **Read** the source file in full.
2. **Discuss** with the user: what's important? what should be emphasized? Any nuances?
3. **Create a subfolder** for the source — move the file as `raw/<topic>/<topic>.md` (each raw source gets its own folder, named after the topic).
4. **Write a summary page** — place a digest in the appropriate wiki subdirectory (e.g., `wiki/features/`, `wiki/bugs/`, `wiki/plans/`). Use the templates in `docs/templates/` as the starting point.
5. **Set OKF frontmatter** on the new page — see [Page Conventions](#page-conventions).
6. **Update or create entity pages** — if the source discusses a feature, update that feature's page; if it introduces an architecture concept, cross-reference it.
7. **Update `index.md`** — add the new page row to the correct category table.
8. **Update `wiki/<category>/index.md`** — add the row to that category's catalog.
9. **Append to `log.md`** — prefix `## [YYYY-MM-DD] ingest | <Category> | <Title>`.
10. **Validate** — `python3 docs/scripts/okf_validate.py`.

An ingest typically touches 5–15 wiki pages. Do all updates in a single pass.

### From GitHub Issues

1. Fetch the issue (`gh issue view <number>`) or use the URL/content the user provides.
2. Classify it: **bug**, **feature request**, **question**, **decision**, or **task**.
3. Create or update pages accordingly (templates in `docs/templates/`):
   - **Bug** → `wiki/bugs/<slug>.md`
   - **Feature request** → `wiki/features/<slug>/<slug>.md`
   - **Decision** → `wiki/decisions/<slug>.md`
   - **Question/answered** → `wiki/queries/<slug>.md`
4. **Set `resource`** to the full GitHub issue URL — e.g., `https://github.com/AlexDevsTheWeb/myfinance/issues/123`.
5. Add cross-references to related existing pages.
6. Update root `index.md`, the category `index.md`, and `log.md`.

---

## Page Conventions

### Frontmatter

Every wiki page MUST have YAML frontmatter. The bundle follows [Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) and Karpathy's LLM Wiki pattern ([[wiki/references/llm-wiki-pattern]]).

```yaml
---
type: <Feature | Bug | Decision | Plan | Architecture | Convention | Query | Reference | Index | Schema>  # REQUIRED (OKF)
title: "Page Title"
description: "One-line summary of this concept."  # REQUIRED by the validator
resource: "<optional canonical URI — GitHub issue URL, PR, external doc>"  # required when sourced from an issue
tags: [feature, frontend, planned]
created: 2026-06-22
updated: 2026-06-22
status: draft | active | superseded | resolved
sources: ["raw/<topic>/<topic>.md"]       # paths relative to docs/
related: ["wiki/architecture/component-x.md"]
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
- Use `[description](../../raw/<topic>/<topic>.md)` for links to raw sources — the relative depth depends on where the page lives.
- Every page must have at least one inbound or outbound link — no orphan pages. The validator enforces this.

### Page Templates

Templates live in `docs/templates/` (`bug.md`, `decision.md`, `feature.md`, `plan.md`). Copy the relevant file and fill in the placeholders.

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
- Source: [raw/...](../../../raw/...)
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
- Source: [raw/...](../../../raw/...)
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

1. **Read `docs/index.md`** to identify relevant pages.
2. Read the identified pages.
3. Synthesize an answer with citations to wiki pages and raw sources.
4. If the answer constitutes a lasting insight → **file it** in `wiki/queries/` and update `index.md` + `log.md`.

### Lint

Health-check the bundle. Always start with the automated pass:

```bash
python3 docs/scripts/okf_validate.py          # full check, non-zero exit on failure
python3 docs/scripts/okf_validate.py --fix    # add missing type/description where obvious
```

The validator checks:
- frontmatter present, `type` valid for the page's category, `description` present
- `sources` paths resolve
- relative markdown links resolve (including links into `raw/` and root files)
- every page is listed in its category `index.md` and the root `index.md`
- orphan pages (no inbound or outbound wiki links)

Then the semantic checks (manual):
- **Contradictions** — flag pages that disagree on facts. Open a decision page to resolve.
- **Stale claims** — flag pages whose sources are superseded by newer data.
- **Gaps** — concepts mentioned across multiple pages that lack their own page.
- **Missing cross-references** — pages that should link to each other but don't.
- **Missing `resource`** — pages sourced from a GitHub issue but lacking the `resource` URI.

### Branch Strategy

See [[wiki/conventions/branch-strategy]] for full rules. That page is authoritative.

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

The log is append-only. Never rewrite old entries — the prefix `## [` enables quick
queries even if paths inside old entries have since moved:

```bash
grep "^## \[" docs/log.md | tail -5
```

---

## Agent Traversal Protocol

This bundle follows [Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md). Traverse it efficiently:

### Step 1 — Orient (read once)
```
docs/index.md          ← master catalog with all pages, summaries, and sources
docs/log.md            ← recent operations (tail -20 lines for latest changes)
```

### Step 2 — Narrow by category (read the subdir index)
```
docs/wiki/<category>/index.md   ← lists all pages in that category with one-line descriptions
```
Categories: `features`, `bugs`, `decisions`, `plans`, `architecture`, `conventions`, `queries`, `references`

### Step 3 — Read the target concept
Each page's frontmatter carries `type`, `description`, `status`, `related`, and `sources` — often enough to answer without opening the body.

### Step 4 — Fetch raw sources if needed
Raw sources live in `docs/raw/<topic>/<topic>.md`. They are immutable and contain the original analysis. Read them only when the wiki page is insufficient.

### Quick terminal commands
```bash
# Find all pages of a type
grep -rl "^type: Feature" docs/wiki/

# Find all implemented features
grep -rl "^status: implemented" docs/wiki/features/

# Check recent wiki operations
grep "^## \[" docs/log.md | tail -10

# Find pages mentioning a concept
grep -rl "budget" docs/wiki/

# Validate the bundle
python3 docs/scripts/okf_validate.py
```

---

## Guiding Principles

1. **The wiki compounds.** Every ingest, query, and lint pass makes the wiki richer. File results back into it — don't let insights vanish into chat history.
2. **Accuracy over speed.** When in doubt about a fact, check the raw source. If sources conflict, flag the contradiction rather than silently picking one.
3. **Cross-reference aggressively.** A well-linked wiki beats a detailed but isolated page.
4. **Keep raw sources immutable.** Do not rewrite files in `raw/` (generated codebase maps may be refreshed with a new date stamp). The wiki is the compiled artifact; raw sources are the evidence.
5. **One source of truth.** Schema lives here; skills live in `.claude/skills/`; branch rules live in the wiki. Never fork the same rule into a second file.
6. **Evolve the schema.** As patterns emerge, update this file. The user and you co-evolve it.
7. **Maintain OKF compliance.** Every new page needs `type` and `description`. Run the validator after every ingest.
