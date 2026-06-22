---
title: "Branch Strategy"
tags: [conventions, git, workflow, branch]
created: 2026-06-22
updated: 2026-06-22
status: active
related: ["../AGENTS.md", "conventions/coding-conventions"]
---

# Branch Strategy

## Rules

1. **Never push or commit directly to `development` or `main`** unless explicitly authorized.
2. **Always create a new branch** for new features and bug fixes.
3. **Branch naming convention:**
   - `feat/YATF-{number}` — new feature (from GitHub issue)
   - `fix/YATF-{number}` — bug fix (from GitHub issue)
   - If no issue exists, use a descriptive kebab-case slug, e.g., `feat/add-monthly-averages` or `fix/recurring-duplicates`
4. **Write specific commit messages** — conventional commits format (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
5. **Create a PR against `development`** with a descriptive message containing context and change summary.

## Workflow

```
issue/feature → feat/YATF-42 or fix/YATF-42 → commits → PR → development → (authorized) → main
```

1. Branch off `development`
2. Implement changes with atomic commits
3. Open PR to `development` with descriptive message
4. Merge into `development`
5. Only PR `development` → `main` when explicitly requested

## Related

- [[conventions/coding-conventions]]
- `AGENTS.md` at project root
