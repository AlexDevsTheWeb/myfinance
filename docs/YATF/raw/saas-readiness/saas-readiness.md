# MyFinance — SaaS Readiness Analysis

## The Question

> Should I go to market as a SaaS, iterate on feedback, and fix problems in parallel? Or fix everything first before launching?

---

## Hard Blockers (Fix Before Anyone Pays)

These are non-negotiable. They will cause data loss, corruption, or complete app failure — the kind of bugs that destroy trust instantly and irreversibly.

| # | Issue | Risk | Effort |
|---|---|---|---|
| 1 | **Single Firestore doc 1 MiB limit** — every transaction, account, investment record lives in `users/{uid}`. Power users with 3-5 years of data will hit the limit and silently lose write capability. A finance app that stops recording transactions is dead on arrival. | **Data loss / silent failure** | ~2 weeks (sub-collection migration) |
| 2 | **No error boundary** — any render crash anywhere produces a white screen. No fallback, no recovery, no message. | **Complete app outage** | ~1 day |
| 3 | **Zero tests on critical paths** — no safety net for auth, transactions, sync, or investments. Paying users will find regressions before you do. | **Regression risk** | ~1 week (critical path coverage) |
| 4 | **PAC automation in localStorage** — clearing browser data or switching devices loses the automation trail. Unacceptable for a paid service that claims to automate investments. | **State loss** | ~2 days |
| 5 | **No loading/empty states** — pages render blank before data arrives. Looks broken, feels broken. | **First-impression fail** | ~2 days |
| 6 | **`alert()` / `confirm()` in ConfigPage** — native browser dialogs instead of MUI components. Unprofessional and breaks UX on some browsers. | **UX credibility** | ~1 day |

**Total fix time:** ~3-4 weeks of focused work.

---

## Ship As-Is (Iterate With Feedback)

These are gaps that early adopters will tolerate, and you can close them based on real user signals rather than assumptions.

| Gap | Why It's OK | When to Fix |
|---|---|---|
| **Desktop-first, no mobile** | Early SaaS = power users on desktop. Announce mobile on roadmap. | After 50+ paid users or direct demand |
| **No onboarding flow** | Early adopters are self-sufficient. A blank dashboard is fine if docs are clear. | When churn data shows users bounce |
| **No CSV/bank import** | Manual entry is the baseline. Import is a retention feature, not an acquisition one. | When users ask for it repeatedly |
| **No multi-currency** | Target Italian market first (EUR-only is fine). Expand later. | When you expand to new markets |
| **Italian bias in defaults** | Lean into it — Italy has no good finance SaaS. Own the niche. | Keep as positioning, localize on expansion |
| **No notifications / push alerts** | Nice-to-have. Email summaries can ship in a weekend later. | Post-launch, first feedback cycle |
| **No CI/CD pipeline** | You're the only developer. Manual deploy is fine for now. | When you have a team or 100+ users |
| **`standard-version` deprecated** | It still works. Version bumps are not critical. | When it actually breaks |

---

## Recommendation

**Fix the 6 hard blockers, then launch immediately.**

Don't wait for:
- Mobile responsiveness
- CSV import
- Multi-currency
- Notifications
- CI/CD
- Italian tax enhancements
- Car redesign
- Transaction layout improvements

The feedback loop is more valuable than getting every feature right upfront. This app is already more comprehensive than most personal finance SaaS products on the market — certainly more than anything targeting the Italian market.

The risk isn't "the app is too rough." The risk is "people will love the concept but hit a hard wall when their data grows." Remove that wall first, then put it in front of real users.

### Suggested Timeline

| Phase | Duration | Focus |
|---|---|---|
| **Sprint 0** | Week 1-2 | Sub-collection migration + error boundary + tests on critical paths |
| **Sprint 1** | Week 3 | PAC fix + loading/empty states + `alert()` replacement |
| **Sprint 2** | Week 4 | Polish + pricing page + landing page + beta launch |
| **Post-launch** | Ongoing | Ship features based on real feedback, not guesses |

### Pricing Suggestion

- **Free tier:** 1 account, 50 transactions/month — enough to try
- **Paid tier (€5-7/mo):** Unlimited everything, investment tracking, backup export
- **Beta discount:** 50% off first 6 months for early adopters

This lets you validate willingness-to-pay before investing months in polish.
