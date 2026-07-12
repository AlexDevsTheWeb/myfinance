---
title: "Go-to-Market Plan"
tags: [plan, strategy, go-to-market, saas]
created: 2026-07-11
updated: 2026-07-11
status: active
sources: ["raw/go-to-market/go-to-market.md"]
related: ["wiki/plans/roadmap", "wiki/architecture/concerns-and-tech-debt", "wiki/decisions/saas-readiness", "wiki/queries/app-review"]
---

# Plan: Go-to-Market

Status: `active`
Priority: **maximum**

## Goal

Turn MyFinance (YAFT) into a validated SaaS product. Ship fast, validate with real users, monetize only after proven retention.

## Phases

### Phase 0 — Quick Wins (Week 1)

Fix immediate embarrassments before showing the app to anyone.

- [x] Fix ticker bug — `BrokerAccount.ticker` not persisted
- [x] Add error boundary — wrap app to catch render crashes
- [x] Swap `alert()`/`confirm()` → MUI dialogs in ConfigPage
- [x] Add loading states (skeletons/spinners) on Dashboard, Transactions, Investments

### Phase 1 — Secure the Data (Weeks 2-3)

Architectural hardening to prevent data loss.

- [ ] Migrate transactions from `users/{uid}` array → `users/{uid}/transactions/{txnId}` sub-collection
- [ ] One-time migration script (array → sub-collection)
- [ ] Update `useSyncFinance` listener
- [ ] Update all write operations to target sub-collection
- [ ] Move PAC state from localStorage → Firestore
- [ ] Fix recurring transaction race condition in `checkRecurring()` — timestamp-based dedup + session debounce

### Phase 2 — Soft Beta Launch (Week 4)

- [ ] Recruit 10-15 beta testers from: r/ItaliaPersonalFinance, r/ETFs_Italia, Forum FinanzaOnline, dev Twitter/LinkedIn, personal network
- [ ] Beta deal: free access in exchange for bug reports + feature feedback
- [ ] Set up feedback channel (Telegram or Discord)
- [ ] Weekly check-in with testers
- [ ] Public changelog so testers see progress

### Phase 3 — Validate (Weeks 5-8)

Do NOT monetize until these signals appear:

- [ ] At least 5 users logging in weekly after 1 month
- [ ] Users adding transactions regularly
- [ ] Investment tracking being actively used
- [ ] Users asking "when can I pay?" or "can I invite someone?"
- [ ] Critical bug reports slowed to a trickle

If validation fails → pause, interview users, find the gap, iterate.
If validation passes → proceed to Phase 4.

### Phase 4 — Monetization (Week 9+)

- [ ] Stripe integration — €5-7/mo subscription
- [ ] Free tier: limited (50 txn/mo or 1 account)
- [ ] Annual discount (~€50-60/yr)
- [ ] Grandfather beta users — lifetime 50% discount or "Founder's Plan"
- [ ] Landing page: hero + screenshots + pricing + "Inizia gratis" CTA

### Phase 5 — Clean Up (Ongoing, Post-Revenue)

Only after revenue validates the effort:

- [ ] Split ConfigPage (~1054 lines)
- [ ] Split CarPage (~695 lines)
- [ ] Remove `any` types in 19 files
- [ ] Write tests for new features moving forward
- [ ] Set up CI/CD

## References

- Issue: [#138](https://github.com/AlexDevsTheWeb/myfinance/issues/138)
- Source: [raw/go-to-market/go-to-market.md](raw/go-to-market/go-to-market.md)
- Related: [[wiki/decisions/saas-readiness]], [[wiki/queries/app-review]], [[wiki/architecture/concerns-and-tech-debt]]
