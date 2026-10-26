# `docs/raw/archive/` — retired planning material

This folder holds source material from tooling the project no longer uses. It is
kept for provenance only: **do not add new files here**.

| Folder | Origin | Why it is here |
|---|---|---|
| `gsd/` | `.planning/` (GSD workflow) | Phase plans, summaries, research, `ROADMAP.md`, `STATE.md` for phases 01–12. The compiled outcome lives in `docs/wiki/plans/` and `docs/wiki/architecture/`. |
| `openspec/` | `openspec/` | Formal specs for shipped features (`card-plafond-tracking`, `pac-state-persistence`, `recurring-dedup`, `transaction-sub-collection`) plus the go-to-market Phase 0 change. Each has a wiki page. |
| `superpowers/` | `docs/superpowers/` | Store-refactor, analytics-charts, and test-infrastructure designs/plans that were never compiled into the wiki (test infrastructure itself has a wiki page). |
| `session-handoff/` | root `session-handoff.md` | 2026-07-12 handoff note from the go-to-market Phase 0/1 work. Superseded by the wiki. |
| `local-scratch/` | root `agent_hub.py`, `run_agent.sh` | Early prototype of the issue→wiki→PR loop, replaced by `.claude/skills/issue-to-pr`. Not maintained. |

Consolidated on 2026-10-26 — see
[`docs/wiki/decisions/wiki-reorganization.md`](../../wiki/decisions/wiki-reorganization.md).
