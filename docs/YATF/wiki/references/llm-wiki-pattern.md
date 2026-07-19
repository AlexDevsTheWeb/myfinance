---
type: Reference
description: "Karpathy's LLM Wiki pattern — original article and rationale behind this wiki's design."
title: "LLM Wiki Pattern — Karpathy"
tags: [references, methodology, llm-wiki]
created: 2026-06-22
updated: 2026-06-22
status: active
sources: ["raw/original-llm-wiki/original-llm-wiki.md"]
related: ["../AGENTS.md"]
---

# LLM Wiki Pattern

*By Andrej Karpathy — see [`raw/original-llm-wiki/original-llm-wiki.md`](../raw/original-llm-wiki/original-llm-wiki.md) for the full article.*

## Core Idea

Instead of RAG (retrieving from raw documents at query time), the LLM **incrementally builds and maintains a persistent wiki** — structured, interlinked markdown files that sit between you and the raw sources. Knowledge is compiled once and kept current, not re-derived on every query.

## Three Layers

1. **Raw sources** — immutable source documents (in `raw/`)
2. **The wiki** — LLM-generated markdown pages (this wiki)
3. **The schema** — configuration file telling the LLM how to maintain the wiki (`AGENTS.md`)

## Operations

- **Ingest:** Read source → discuss with user → write/update wiki pages → update index → log
- **Query:** Search index → read pages → synthesize answer → file insights back into wiki
- **Lint:** Health-check for contradictions, stale claims, orphans, gaps, missing cross-refs

## Key Files

- `index.md` — content-oriented catalog of all pages
- `log.md` — append-only chronological record with grep-able prefixes

## This Wiki

This wiki follows the LLM Wiki pattern for the MyFinance project. See [[../AGENTS.md]] for the schema that governs its maintenance.
