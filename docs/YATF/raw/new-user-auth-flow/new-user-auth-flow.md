# New User Auth Flow — Codebase Analysis

## Question

What actually happens when a new user logs in (via Google Auth)? Is there any risk of data corruption, broken flows, or leaking other users' data?

---

## The Full Auth Flow (Step by Step)

### 1. Login Page (`src/pages/LoginPage.tsx`)

User clicks "Sign in with Google" → calls `signInWithPopup(auth, googleProvider)` at line 40.

- Uses Firebase Auth's `signInWithPopup` — no redirect, no custom token handling
- On success, Firebase Auth SDK handles everything (token, session persistence, etc.)
- On error: caught and logged to console only — **no user-facing error message**
- After successful auth, `onAuthStateChanged` fires (see step 2)

### 2. Auth State Listener (`src/App.tsx:53-59`)

```ts
onAuthStateChanged(auth, (user: User | null) => {
  setUser(user);
  setLoading(false);
});
```

This is the **sole bridge** between Firebase Auth and the app:

- Fires immediately when auth state changes (login, logout, token refresh)
- `setUser(user)` stores the Firebase `User` object in `useAuthStore`
- `setLoading(false)` stops the loading spinner → `ProtectedRoute` renders `Layout`

### 3. ProtectedRoute (`src/App.tsx:24-40`)

Checks `user`, `loading`, `isLoggingOut`:

- `loading=true` → shows `CircularProgress`
- `user=null` → redirects to `/` (LoginPage)
- `user` present → renders `<Layout>{children}</Layout>`

### 4. Three Sync Hooks Fire Simultaneously

In `App.tsx:45-47`:

```ts
useSyncFinance();
useInvestmentSync();
useBudgetSync();
```

Each is a custom hook that:
1. Checks for `user` — if null, resets refs and returns
2. Guards against duplicate init with `isInitializing` ref
3. Runs `runTransaction(db, ...)` to read or create `users/{uid}` document
4. Sets up `onSnapshot` for real-time sync

#### 4a. Race Condition — Three Transactions on the Same Doc

All three hooks hit Firestore concurrently. Each does:

```ts
await runTransaction(db, async (transaction) => {
  const remoteDoc = await transaction.get(docRef);
  if (remoteDoc.exists()) {
    // read data → populate store
  } else {
    const defaultConfig = getDefaultUserConfig();
    transaction.set(docRef, defaultConfig);  // NEW USER: creates doc
    // populate store with defaults
  }
});
```

**Behavior:** Firestore transactions are optimistic. Only the first `transaction.set(docRef, ...)` succeeds. The other two transactions fail on commit (stale snapshot — doc now exists), then **retry automatically**. On retry, they see the doc exists and read the data.

**Verdict:** Safe — Firestore handles the concurrency. Minor overhead from 2 retried transactions, but no corruption.

### 5. Default User Document Created (`src/store/sync/index.ts:8-32`)

`getDefaultUserConfig()` returns a `UserDoc` with:

| Field | Value | Source |
|-------|-------|--------|
| `initialBalance` | `0` | `Defaults.DEFAULT_INITIAL_BALANCE` |
| `accounts` | `[{ id: 'default-main', name: 'Conto Principale', ... }]` | `Defaults.DEFAULT_ACCOUNTS` |
| `categories` | 11 Italian-language categories | `Defaults.DEFAULT_CATEGORIES` |
| `incomeCategories` | 3 Italian categories | `Defaults.DEFAULT_INCOME_CATEGORIES` |
| `recurringTransactions` | `[]` | Empty |
| `carMileage` | `[]` | Empty |
| `carInitialMileage` | `0` | `Defaults.DEFAULT_CAR_INITIAL_MILEAGE` |
| `tireSettings` | `{ summerModel: '', winterModel: '', initialTireType: 'summer' }` | Default |
| `tireChanges` | `[]` | Empty |
| `enabledModules` | `{ financeTracker: true, carManagement: false, utilityTracker: false, investmentTracking: false, budgetTracking: false }` | `Defaults.DEFAULT_ENABLED_MODULES` |
| `balanceStartDate` | First of current month | Computed |
| `etfTransactions` | `[]` | Empty |
| `portfolioSnapshots` | `[]` | Empty |
| `brokerAccounts` | `[{ id: 'broker-1', name: 'Trade Republic', ticker: 'SWDA.MI', ... }]` | Default |
| `brokerConfig` | Legacy single-broker config | Default |
| `assetHoldings` | `[]` | Empty |
| `cashAdjustments` | `[]` | Empty |
| `dividendEntries` | `[]` | Empty |
| `budgetTargets` | `[]` | Empty |
| `pacState` | `{ lastGenerationDate: null, pendingTransaction: null, perBrokerLastGeneration: {} }` | Default |

No `transactions` subcollection documents are created (transactions are created via CRUD actions only).

### 6. `_migrateToMultiAccount` Runs (`App.tsx:49-51`)

```ts
useEffect(() => {
  _migrateToMultiAccount();
}, [_migrateToMultiAccount]);
```

This checks if any transaction or recurring transaction lacks an `accountId` field. For new users with empty arrays:

```ts
state.transactions.some(t => !t.accountId)  // false (empty array)
state.recurringTransactions.some(r => !r.accountId)  // false (empty array)
```

Early returns — **no write to Firestore**. Safe.

### 7. Startup Complete

User sees DashboardPage with default empty state. No onboarding, no tutorial, no welcome message.

---

## Data Isolation Assessment

### Firestore Security Rules (`firestore.rules`)

```text
match /users/{userId} {
  allow read: if isOwner(userId);
  allow write: if isOwner(userId);
}
```

Where `isOwner(userId)` = `request.auth.uid == userId`.

**This is the critical line.** It means:
- User A can ONLY access documents at `users/{A's uid}/...`
- User A can NEVER access `users/{B's uid}/...`
- This applies to ALL subcollections (transactions, portfolio_history, dividends, tax_events)

**Verdict: Data isolation is solid.** The Firestore security rules enforce strict per-user partitioning at the database level. No amount of client-side bugs can leak data between users because Firestore enforces the rule server-side.

### Client-Side Data Access

All writes use:

```ts
const userId = useAuthStore.getState().user?.uid;
const docRef = doc(db, 'users', userId);
```

The user's `uid` is always read from the authenticated Firebase `User` object — never from user input, URL params, or any untrusted source. Even if a bug caused the wrong `uid` to be used, Firestore rules would reject the unauthorized access.

**Verdict: Safe.** The `uid` is always sourced from Firebase Auth, not from user-controllable inputs.

---

## Concerns & Problems

| # | Concern | Risk | Verdict |
|---|---------|------|---------|
| 1 | **Three concurrent Firestore transactions on new user init** | All three hooks try to create the same doc simultaneously. Two will fail and retry. | **Low** — Firestore transactions handle this correctly. Minor latency. |
| 2 | **No error feedback on login failure** | Google sign-in errors are silently caught and logged (`console.error`). User sees nothing. | **Medium** — Popup blockers, network errors, or account issues leave user staring at a login button that silently did nothing. |
| 3 | **Email/password errors also silent** | `createUserWithEmailAndPassword` / `signInWithEmailAndPassword` errors are caught but only logged. Commented-out `alert()` suggests this was temporary. | **Medium** — Users trying email auth get no feedback on wrong passwords, existing accounts, etc. |
| 4 | **No onboarding/welcome UX** | New user lands on Dashboard with default Italian categories, no guidance, no tutorial. | **Low** — Acceptable for early SaaS (documented in saas-readiness.md as "ship as-is"). |
| 5 | **Italian-language defaults for all users** | Categories, accounts, and balance start date are in Italian regardless of user locale or Google account language. | **Low** — App targets Italian market per strategy. |
| 6 | **No email verification check** | Firebase Auth supports email verification but the app never checks `user.emailVerified`. Any email can register. | **Low** — Google Auth verifies email via OAuth. Email/password users could register with fake emails, but this is a personal finance app, not a public forum. |
| 7 | **No account deletion functionality** | Users cannot delete their own account or data. No Firestore cleanup on auth account deletion. | **Medium** — Orphaned Firestore data accumulates. No GDPR compliance path. |
| 8 | **No rate limiting on Firestore writes** | Authenticated users can write unlimited data. No client-side or rules-level throttling. | **Low-Medium** — For a personal app, not a practical concern. For SaaS, it's an abuse vector. |
| 9 | **`_migrateToMultiAccount` runs every mount** | Though it early-returns for new users, it still runs synchronously on every app mount. Accesses `getState()` which triggers Zustand subscription. | **Low** — Minimal overhead. Zero-value operation for new users. |
| 10 | **Bootstrap defaults include brokerage data** | New users get a default `brokerAccounts` with `{ id: 'broker-1', name: 'Trade Republic', ticker: 'SWDA.MI' }`. This implies investment tracking even though the module is disabled by default. | **Low** — Harmless stub data. Module must be enabled to see it. |

### False Alarms (Checked, No Concern)

| Checked Item | Finding |
|-------------|---------|
| Can User A see User B's transactions? | **No** — Firestore rules enforce `request.auth.uid == userId` at the server level. |
| Can a buggy client write to wrong user's doc? | **No** — All writes use `user.uid` from Firebase Auth, and Firestore rules would reject if wrong. |
| Do subcollections have proper rules? | **Yes** — `transactions`, `portfolio_history`, `dividends`, `tax_events` all inherit or explicitly check `isOwner(userId)`. |
| Can new user init fail partially? | **Unlikely** — Firestore transactions are atomic. Either the doc is created with all defaults or it fails entirely. |
| Do sync hooks break each other? | **No** — Each reads/writes different store fields. Race condition on doc creation is handled by transactions. |

---

## Conclusion

**New user registration is safe.** Data isolation is enforced at the Firestore rules level, preventing any cross-user data leakage. The main risks are UX-related (silent login errors, no onboarding) rather than security or data integrity issues.

No other user's data is at risk when a new user registers. The Firestore security rules provide a hard server-side boundary between user partitions.
