---
type: Report
title: "Implementation Report — <what shipped>"
description: "<One sentence on what changed and how it was verified.>"
resource: "<PR or branch URL>"
tags: [report]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: shipped
sources: ["raw/<topic>/<topic>.md"]
related: ["wiki/features/<slug>/<slug>"]
---

# Implementation Report — <Title>

**Branch:** `<branch>` · **PR:** <link> · **Status:** shipped | partially-shipped | reverted

## Context

What triggered the work, the state before it, and the item it came from (issue,
raw doc, chat request).

## Changes

Grouped by area — not a raw diff dump. Files and behaviours, with the "why" only
where it is not obvious from the name.

| Area | What changed |
|---|---|
| ... | ... |

## Decisions

What was chosen, what was rejected, and why. Link to a decision page if one was
created.

## Deviations

Where the implementation differs from the request, prototype or design — and
whether that was agreed with the user or a judgement call. Write "None" if there
are none.

## Verification

The commands actually run and their real outcome. Include failures that were
fixed during the work; they are evidence the checks are load-bearing.

```bash
# commands + outcome
```

## Not verified / deferred

Be specific and honest. "Not verified: pixel comparison against the prototype —
no screenshot available." Write "None" if there is genuinely nothing.

## Wiki pages touched

- Created `wiki/...`
- Updated `wiki/...`
- Raw sources added `raw/...`

## Related

- Parent: [[wiki/features/<slug>/<slug>]]
- Sources: [raw/...](../../../raw/...)
