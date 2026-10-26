# CLAUDE.md

This repository keeps a single source of truth for agent instructions. Claude
Code reads this file; OpenCode reads `AGENTS.md`. Both point at the same content.

@AGENTS.md
@docs/AGENTS.md

## Skills

Project skills live in `.claude/skills/` (also discovered by OpenCode):

- `issue-to-pr` — read → analyze → plan → implement → wiki → draft PR
- `wiki-sync` — ingest, update, and validate the `docs/` knowledge bundle
