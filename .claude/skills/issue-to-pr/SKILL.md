---
name: Issue to Draft PR
description: Run the full delivery loop for a GitHub issue, raw document, or chat request — read, analyze, propose a plan, implement on a correctly named branch, update the docs wiki, validate it, and open a draft PR. Use whenever the user asks to implement, fix, or ship something in this repo.
---

# Issue → Draft PR

The standard delivery loop for **Balancr / MyFinance**. Read the referenced files
before acting; they are the source of truth, this skill only sequences them.

| Topic | Source of truth |
|---|---|
| Branch names, PR flow | `docs/wiki/conventions/branch-strategy.md` |
| Coding style | `docs/wiki/conventions/coding-conventions.md` |
| Tests | `docs/wiki/conventions/testing-guide.md` |
| Wiki schema | `docs/AGENTS.md` |
| Implementation reports | `docs/AGENTS.md` → *Implementation Reports* |
| Wiki ingest/lint procedure | `.claude/skills/wiki-sync/SKILL.md` |

## 0. Orient

- Read `docs/index.md` (master catalog) and `tail -20 docs/log.md`.
- Read the relevant `docs/wiki/<category>/index.md` for the area you are touching.
- Read root `AGENTS.md` for commands and repository layout.

## 1. Read the item

Input is one of:

- **GitHub issue** — `gh issue view <n> --comments`. Note labels, linked PRs, and
  prior discussion. Set `resource:` to the issue URL later.
- **Raw document** — a file in `docs/raw/<topic>/`, or a path the user gives you.
- **Chat instruction** — the user's message itself.

Read it in full. Do not summarize from the title.

## 2. Analyze

Produce a short written analysis before planning:

- What the change actually requires (behavior, data, schema, UI).
- Which files/modules are affected — verify by reading code, not by guessing.
- Which existing wiki pages describe this area, and whether they are **stale**.
- Risks: data migration, Firestore rules, breaking changes, test coverage gaps.

## 3. Ask when unclear

**Stop and ask** the user if any of these is true:

- The requirement can be satisfied in more than one materially different way.
- A convention (branch name, schema field, UX pattern) is ambiguous.
- The change would invalidate an existing decision page.
- You cannot verify an assumption from code or wiki.

Ask at most 3 focused questions with a recommended option for each. Never invent
requirements; never silently pick one of two plausible designs.

## 4. Propose the plan

Present, in chat:

1. Goal in one sentence.
2. Ordered steps, each mapped to files.
3. Wiki pages to create/update.
4. Verification (commands + manual checks).
5. Branch name following the convention (`feat/YATF-<n>`, `fix/YATF-<n>`, or a
   descriptive kebab-case slug when no issue exists).

Wait for approval before implementing unless the user already told you to proceed
autonomously.

## 5. Implement

```bash
git checkout development && git pull
git checkout -b <branch>
```

- Follow existing patterns; read a neighbouring file before writing a new one.
- Atomic commits, conventional commit messages (`feat:`, `fix:`, `refactor:`,
  `docs:`).
- Run `npm run lint`, `npm run build`, and `npm test` before declaring done.
- Never commit to `development` or `main`.

## 6. Write the implementation report

**Mandatory for every branch that reaches a PR — no exceptions.** A one-line CSS
fix still gets a report; it is just shorter.

Follow `.claude/skills/wiki-sync/SKILL.md` → *Implementation reports*:

- Place it beside the parent concept: `wiki/features/<slug>/report-YYYY-MM-DD.md`
  inside a folder concept, `wiki/<category>/<slug>-report-YYYY-MM-DD.md` for a
  flat one (bugs, plans, decisions, …).
- Frontmatter: `type: Report`, `resource:` = PR URL (use the branch URL for now if
  the PR does not exist yet), `status:` = shipped / partially-shipped / reverted.
- Cover **Context · Changes · Decisions · Deviations · Verification ·
  Not verified/deferred · Wiki pages touched · Related**.
- Link it from the parent page's `## Related`. Do **not** add it to
  `docs/index.md` or the category index.
- After `gh pr create`, set `resource:` to the PR URL and include it in the same
  PR (amend or follow-up commit).

## 7. Update the wiki

Follow `.claude/skills/wiki-sync/SKILL.md`:

- Write raw notes to `docs/raw/<topic>/<topic>.md`.
- Create/update the compiled page(s) in `docs/wiki/`.
- Update `docs/index.md`, the category index, and append to `docs/log.md`.
- Validate: `python3 docs/scripts/okf_validate.py`.

## 8. Open the draft PR

```bash
git push -u origin <branch>
gh pr create --draft --base development \
  --title "<type>: <summary>" \
  --body "<context, what changed, how it was verified, issue link>"
```

The PR body must include: the problem, the approach, the wiki pages touched, a
link to the implementation report, the verification commands run, and
`Closes #<n>` when applicable. Then update the report's `resource:` to this PR
URL and push that change to the same branch.

## 9. Report back

Summarize: branch, commits, PR URL, wiki pages and report path, verification
results, and anything intentionally deferred.
