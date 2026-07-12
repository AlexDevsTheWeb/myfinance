# Go-to-Market Plan — MyFinance (YAFT)

> Based on the strategic roadmap: secure data → soft beta → monetize. No Stripe before validation.

---

## Phase 0: Quick Wins ✅

**Status: Complete.** Delivered on `feat/YATF-138` branch, PR #140 merged to `development`.

| Task | Status | PR |
|---|---|---|
| **Fix ticker bug** — `BrokerAccount.ticker` not persisted | ✅ Fixed (issue #108, separate branch) | `fix/YATF-108` |
| **Add error boundary** — wrap the app so a render crash shows a message instead of a white screen | ✅ `src/components/ErrorBoundary.tsx` | #140 |
| **Swap `alert()`/`confirm()` → MUI dialogs** in ConfigPage | ✅ `ConfirmDialog` + `AlertSnackbar` | #140 |
| **Add loading states** — skeleton/spinner on Dashboard, Transactions, Investments pages | ✅ `isLoading` in both stores, CircularProgress on all pages | #140 |

**Deliverable:** App is demo-ready without immediate embarrassment.

---

## Phase 1: Secure the Data ✅

**Status: Complete.** Delivered on `feat/YATF-138-sub-collection` branch, PR #141 (ready for review).

### 1.1 Migrate Transactions to Sub-collection ✅

**Problem:** `users/{uid}` is a single doc with a 1 MiB Firestore limit. All transactions live in an array field. Every write rewrites the whole array.

**Solution (4 phases):**
1. ✅ **Phase A (Dual-write):** All CRUD ops write to both array + sub-collection
2. ✅ **Phase B (Backfill):** `backfillTransactionsToSubCollection()` utility — batch copies array → sub-collection
3. ✅ **Phase C (Flip reads):** `useSyncFinance` listens to sub-collection `onSnapshot` instead of doc field
4. ✅ **Phase D (Remove legacy):** `transactions` removed from `UserDoc` interface, converter, all CRUD ops, sync listener. Sub-collection is sole persistence layer.

**Risk mitigated:** Tested with real data. Backup/restore verified compatible. Single user with backups confirmed safe.

**Bonus:** Sub-collections enable trivial pagination (Firestore `limit()` + `startAfter()`).

### 1.2 Move PAC State from localStorage to Firestore ✅

**Problem:** `pendingPacTransaction` lives in localStorage. Clearing browser data loses the automation trail. No cross-device sync.

**Solution:**
- `PacState` type + `pacState` field on `UserDoc`
- `usePacAutomation` reads/writes Firestore instead of localStorage
- `confirmPacTransaction` persists to Firestore
- localStorage→Firestore migration on first mount

### 1.3 Fix Recurring Transaction Race Condition ✅

**Problem:** Wiki documents a race condition in `checkRecurring()` — called on every load and on recurring CRUD without debouncing, can generate duplicate transactions.

**Solution:**
- `lastGeneratedUpTo` field on `IRecurringTransaction` — Firestore-side dedup
- Timestamp cooldown guard
- Session debounce in `useSyncFinance` — `checkRecurring()` runs at most once per session

---

## Phase 2: Soft Beta Launch (Next — Week 4)

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
Week 1    ██████  QUICK WINS ✅ + Phase 1 (ticker, error boundary, loading states, MUI dialogs)
Week 2-3  ████████████████  Phase 1 complete (sub-collection migration, PAC fix, recurring race condition)
Week 4    ██  Beta launch — 10-15 testers, feedback channel ⬅️ YOU ARE HERE
Week 5-8  ████  Validation period — watch retention, collect feedback
Week 9+   ████  Monetization — Stripe, landing page, pricing
Ongoing   ████  Code cleanup, test coverage, feature requests
```

---

## What You Need to Do Right Now

1. [x] Fix the ticker bug — ✅ done
2. [x] Add error boundary — ✅ done
3. [x] Sub-collection migration + PAC fix + recurring dedup — ✅ Phase 1 done
4. [ ] Draft the "beta invitation" post for r/ItaliaPersonalFinance — **next step**
5. [ ] Set up a Telegram group or Discord server for beta feedback — **next step**
6. [ ] Deploy to Firebase Hosting for beta access

Want me to draft the Reddit post for the beta launch?
