---
title: "SaaS Readiness — Hard Blockers vs Ship-As-Is"
tags: [decision, strategy, saas, go-to-market]
created: 2026-07-11
updated: 2026-07-11
status: accepted
sources: ["raw/saas-readiness/saas-readiness.md"]
related: ["wiki/plans/go-to-market", "wiki/architecture/concerns-and-tech-debt", "wiki/queries/app-review"]
---

# Decision: SaaS Readiness — Hard Blockers vs Ship-As-Is

Status: `accepted`

## Context

After a full codebase review, the question arose: should the app be polished to perfection before launching as a SaaS, or should it ship with known gaps and iterate based on real feedback?

## Options Considered

1. **Fix everything first** — months of refactoring, testing, and feature completion before any monetization
2. **Ship now with hard blockers fixed** — fix only data-corrupting issues, launch a paid beta, iterate on feedback

## Decision

**Option 2 — Ship now with hard blockers fixed.**

## Hard Blockers (Fix Before Launch)

| Issue | Risk | Effort |
|---|---|---|
| Single Firestore doc 1 MiB limit — sub-collection migration | Data loss / silent failure | ~2 weeks |
| No error boundary — render crash = white screen | Complete app outage | ~1 day |
| Zero tests on critical paths (auth, transactions, sync, investments) | Regression risk | ~1 week |
| PAC automation in localStorage — lost on browser clear | State loss | ~2 days |
| No loading/empty states — blank pages before data arrives | First-impression fail | ~2 days |
| `alert()`/`confirm()` in ConfigPage — native browser dialogs | UX credibility | ~1 day |

## Ship As-Is (Iterate With Feedback)

| Gap | Rationale |
|---|---|
| Desktop-first, no mobile | Early SaaS = power users on desktop |
| No onboarding flow | Early adopters are self-sufficient |
| No CSV/bank import | Manual entry is baseline; import is retention, not acquisition |
| No multi-currency | Target Italian market first (EUR-only is fine) |
| Italian bias in defaults | Own the Italian niche — no good Italian finance SaaS exists |
| No notifications/push alerts | Email summaries can ship in a weekend later |
| No CI/CD | You're solo; manual deploy is fine |
| `standard-version` deprecated | Still works; not critical |

## Consequences

- Faster time to market (~4 weeks vs 6+ months)
- Real feedback shapes feature priorities instead of guessing
- Risk of losing early users if hard blockers aren't fixed thoroughly
- Italian market positioning gives a clear competitive advantage

## Related

- Source: [raw/saas-readiness/saas-readiness.md](raw/saas-readiness/saas-readiness.md)
- Plan: [[wiki/plans/go-to-market]]
- App review: [[wiki/queries/app-review]]
