# Go-to-Market Plan — MyFinance (YAFT)

> Based on the strategic roadmap: secure data → soft beta → monetize. No Stripe before validation.

---

## Phase 0: Quick Wins (Week 1)

Before touching architecture, fix the things that will embarrass you with beta users.

| Task | Why | Effort |
|---|---|---|
| **Fix ticker bug** — `BrokerAccount.ticker` not persisted | Investments are the #1 selling point. If the ticker doesn't save, the feature is broken. | ~2h |
| **Add error boundary** — wrap the app so a render crash shows a message instead of a white screen | First beta user hits a crash = lost beta user. | ~1h |
| **Swap `alert()`/`confirm()` → MUI dialogs** in ConfigPage | Looks unprofessional. Beta users will notice. | ~1h |
| **Add loading states** — skeleton/spinner on Dashboard, Transactions, Investments pages | Blank page on slow load = "is it broken?" | ~1 day |

**Deliverable:** App is demo-ready without immediate embarrassment.

---

## Phase 1: Secure the Data (Weeks 2-3)

Architectural changes to prevent data loss before anyone trusts the app.

### 1.1 Migrate Transactions to Sub-collection

**Problem:** `users/{uid}` is a single doc with a 1 MiB Firestore limit. All transactions live in an array field. Every write rewrites the whole array.

**Solution:**
1. Create `users/{uid}/transactions/{txnId}` sub-collection
2. Write a one-time migration script that reads the array from the user doc and writes each transaction as a document
3. Update `useSyncFinance` to listen to the sub-collection instead of the user doc field
4. Update all write operations (`addTransaction`, `updateTransaction`, `deleteTransaction`) to target the sub-collection
5. Keep the legacy field for backward compatibility during migration; remove after confirming all users migrated

**Risk:** This is the biggest change. Test thoroughly with a copy of real data.

**Bonus:** Once on sub-collections, pagination becomes trivial (Firestore `limit()` + `startAfter()`).

### 1.2 Move PAC State from localStorage to Firestore

**Problem:** `pendingPacTransaction` lives in localStorage. Clearing browser data loses the automation trail. No cross-device sync.

**Solution:**
- Add a `pacState` field (or sub-collection) to the user doc
- Store last PAC generation date, next scheduled date, and any pending confirmation
- Update `usePacAutomation` to read/write from Firestore instead of localStorage

### 1.3 Fix Recurring Transaction Race Condition

**Problem:** Wiki documents a race condition in `checkRecurring()` — called on every load and on recurring CRUD without debouncing, can generate duplicate transactions.

**Solution:**
- Add a generation lock (timestamp-based dedup on the Firestore side)
- Debounce the check to run at most once per session

---

## Phase 2: Soft Beta Launch (Week 4)

### 2.1 Find 10-15 Beta Users

Target communities:

| Community | Why | How to approach |
|---|---|---|
| **r/ItaliaPersonalFinance** (Reddit) | Largest Italian personal finance community. Your app is Italy-focused. | Post a sincere "ho costruito questo tool per me, ora vorrei condividerlo" — no sales pitch |
| **r/ETFs_Italia** | Niche ETF focus matches your investment tracking strength | Same approach, emphasize the PAC automation |
| **Forum di FinanzaOnline** | Established Italian finance forum | Introduce yourself, offer free beta access |
| **Dev community (Twitter/X, LinkedIn)** | Fellow devs are forgiving beta testers and give good technical feedback | "Ho buildato un'alternativa italiana a YNAB/Portfolio Performance" |
| **Your personal network** | Friends, colleagues, ex-colleagues who care about finances | Direct invite, low pressure |

### 2.2 The Beta Deal

```
You get: Free access to the full app (no limits)
You give: Bug reports + feature feedback (1-2 sentence replies to a weekly thread)

That's it. No commitment. Cancel anytime.
```

### 2.3 Setup Minimal Feedback Loop

- **Simple form** (Google Forms or similar) for bug reports — or just a Telegram/Discord group
- **Weekly check-in** — "What broke? What's missing? What's confusing?"
- **Public changelog** — `CHANGELOG.md` exists already from `standard-version`. Push updates visibly so testers see progress.

### 2.4 Remove Friction for Beta Access

- Right now the app requires Firebase Auth with email/password
- For beta: you can either let them create an account normally, or set up a simple invite flow
- Simplest path: give them the URL, they sign up with Google, done

---

## Phase 3: Validate (Weeks 5-8)

### 3.1 Define Validation Criteria

Don't monetize until you see:

| Signal | What to look for |
|---|---|
| **Retention** | At least 5 users logging in weekly after 1 month |
| **Active use** | Users adding transactions regularly, not just logging in once |
| **Feature usage** | Investment tracking is being used (not just transactions) |
| **Organic feedback** | Users ask "when can I pay for this?" or "can I invite my partner?" |
| **Bug reports slow down** | No critical bugs surfaced in the last week |

### 3.2 If Validation Fails

- If nobody uses it after 4 weeks: **pause and interview them**. Ask what's missing, what's confusing, what made them stop.
- If 2-3 power users love it but others don't: **focus on those power users**. They're your real target market.
- If nobody signs up at all: **the problem is positioning or outreach**, not the app. Revisit your pitch.

### 3.3 If Validation Passes

Move to Phase 4.

---

## Phase 4: Monetization (Week 9+)

### 4.1 Stripe Integration

- Monthly subscription: €5-7/mo (as discussed)
- Free tier: limited transactions (50/mo) or limited accounts (1 account) — enough to try but painful long-term
- Annual discount: 2 months free (€50-60/yr)

### 4.2 Convert Beta Users

- Beta users get **lifetime 50% discount** or **6 months free** as a thank-you
- Grandfather them into a "Founder's Plan" — never raise their price

### 4.3 Landing Page

Keep it simple. One page:
- Hero: "Traccia investimenti, budget e spese — pensato per l'Italia"
- Screenshots of the dark theme + investment dashboard
- Pricing table
- "Inizia gratis" CTA → sign-up

No blog, no docs site, no SEO strategy yet. One page, one CTA.

---

## Phase 5: Clean Up (Ongoing, Post-Monetization)

Only now — when revenue validates the effort — invest in codebase quality:

| Task | Why now? |
|---|---|
| **Split ConfigPage (~1054 lines)** | You'll touch it frequently for Stripe settings, plan changes |
| **Split CarPage (~695 lines)** | Low priority unless car tracking is popular |
| **Remove `any` types in 19 files** | Technical debt that slows down feature dev |
| **Add tests for new features** | Don't backfill old tests, but write them for anything you touch |
| **CI/CD** | Manual deploy is fine until you have a team |

---

## Summary Timeline

```
Week 1    ██  Quick wins (ticker fix, error boundary, loading states, MUI dialogs)
Week 2-3  ████  Sub-collection migration, PAC fix, recurring race condition
Week 4    ██  Beta launch — 10-15 testers, feedback channel
Week 5-8  ████  Validation period — watch retention, collect feedback
Week 9+   ████  Monetization — Stripe, landing page, pricing
Ongoing   ████  Code cleanup, test coverage, feature requests
```

---

## What You Need to Do Right Now

1. [ ] Fix the ticker bug — highest priority, unblocks the investment feature
2. [ ] Add error boundary — 1 hour, prevents the worst first impression
3. [ ] Plan the sub-collection migration — the real architectural work starts here
4. [ ] Write the "beta invitation" post for r/ItaliaPersonalFinance (draft it now, publish after Phase 1 is done)
5. [ ] Set up a Telegram group or Discord server for beta feedback

Want me to draft the Reddit post for the beta launch?
