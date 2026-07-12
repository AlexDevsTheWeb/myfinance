---
title: "Error Boundary"
tags: [feature, stability, go-to-market]
created: 2026-07-12
updated: 2026-07-12
status: implemented
sources: ["openspec/changes/go-to-market-phase-0/"]
related: ["wiki/plans/go-to-market", "wiki/architecture/system-architecture"]
---

# Feature: Error Boundary

Status: `implemented`

## Description

React error boundary that catches unhandled render crashes and displays a professional fallback UI instead of a white screen. Wraps the entire app at the root level in `main.tsx`.

## Implementation

- File: `src/components/ErrorBoundary.tsx`
- Class component using `componentDidCatch` + `getDerivedStateFromError`
- Fallback: centered Paper card with `ErrorOutlined` icon, Italian error message ("Qualcosa è andato storto"), and "Riprova" retry button
- Retry resets error state, re-renders children
- Wraps `<App />` in `src/main.tsx`

## Motivation

First beta user hits a crash = lost beta user. Essential for [#138](https://github.com/AlexDevsTheWeb/myfinance/issues/138) Go-to-Market Phase 0.

## Related

- [[wiki/plans/go-to-market]]
- Source: [openspec/go-to-market-phase-0](openspec/changes/go-to-market-phase-0/)
