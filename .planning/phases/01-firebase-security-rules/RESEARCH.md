# Phase Research: Firebase Firestore Security Rules

**Date:** 2026-04-23
**Phase:** 01-firebase-security-rules

---

## Research Summary

The MyFinance app uses Firebase Auth (Google provider) and Firestore. The security gap is that NO Firestore security rules exist, meaning the client-side auth check is the only protection. This research covers the Firestore security rules approach, testing methodology, and deployment.

---

## 1. Data Architecture

### Current Pattern: Single Document Per User

All data is stored in a single Firestore document per user:

```
/users/{uid}/
  - transactions: Transaction[]
  - categories: Category[]
  - incomeCategories: Category[]
  - accounts: Account[]
  - recurringTransactions: RecurringTransaction[]
  - carMileage: CarMileageRecord[]
  - carInitialMileage: number
  - tireSettings: TireSettings
  - tireChanges: TireChangeRecord[]
  - enabledModules: AppModules
  - balanceStartDate: string
  - deletedRecurringInstances: {recurringLinkId, date}[]
```

### Security Model: User Data Isolation

The security requirement is simple but critical:
- **Authenticated users can only access their own `/users/{uid}` document**
- The document ID matches the Firebase Auth UID

---

## 2. Firestore Security Rules Pattern

### Core Rule (Single Document Per User)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write only their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Key Concepts

| Variable | Description |
|----------|-------------|
| `request.auth` | Firebase Auth context (null if not authenticated) |
| `request.auth.uid` | The authenticated user's unique ID |
| `userId` (wildcard) | The document ID from the path `/users/{userId}` |
| `resource` | The existing document being accessed |
| `request.resource` | The new document being written |

### Rule Granularity Options

| Operation | Granularity Level |
|-----------|------------------|
| `allow read` | Can read existing document |
| `allow write` | Can create/update/delete |
| `allow create` | Can only create new documents |
| `allow update` | Can only update existing documents |
| `allow delete` | Can only delete documents |

For this use case: `allow read, write` is sufficient since each user owns exactly one document.

---

## 3. Enhanced Rules (Recommended)

### With Helper Functions

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function: is the user authenticated?
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function: does the user own this document?
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // User documents: only owner can access
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
  }
}
```

### With Data Validation (Optional Enhancement)

Add field validation to ensure data integrity:

```javascript
// Validate transaction structure
function isValidTransaction(transaction) {
  return transaction.keys().hasAll(['id', 'date', 'description', 'category', 'amount', 'type', 'accountId']);
}

// In the write rule:
allow create: if isOwner(userId) && request.resource.data.keys().hasAll(['transactions', 'categories', 'accounts']);
```

---

## 4. Testing Firestore Security Rules

### Option A: Firebase Console Simulator

1. Go to Firebase Console → Firestore → Rules
2. Click "Rules Playground" or "Simulator"
3. Select operation type (get, list, create, update, delete)
4. Set authentication state (Authenticated/Unauthenticated)
5. Set document path (e.g., `/users/test-user-id`)
6. Test various scenarios

### Option B: Firebase Emulators

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Initialize emulators (one-time)
firebase init emulators

# Run emulators with security rules testing
firebase emulators:exec --only firestore "npm test"

# Or run emulators and test manually
firebase emulators:start --only firestore
```

### Option C: firebase-bolt (Alternative)

A DSL for writing and testing Firestore rules:

```bash
npm install -g firebase-bolt
```

---

## 5. Deployment

### Local Rules File

Create `firestore.rules` in project root:

```bash
# Verify file location
firebase.json references rules path
# Check if "firestore.rules" is configured in firebase.json
```

### Deploy Commands

```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy all rules (if storage.rules also exists)
firebase deploy --only firestore,storage

# Deploy everything
firebase deploy
```

### Verify Deployment

1. Firebase Console → Firestore → Rules
2. Confirm rules match what was deployed
3. Test with actual app behavior

---

## 6. Firebase CLI Configuration

### Current firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

### Needed Addition

```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

Or use default path (`firestore.rules` at root is auto-detected).

---

## 7. Security Considerations

### What's Protected

| Threat | Mitigated By Rules |
|--------|-------------------|
| User A reads User B's data | ✓ Yes |
| User A writes to User B's data | ✓ Yes |
| Unauthenticated access | ✓ Yes |
| User manipulates client state | ✓ Yes (server enforces) |

### What's NOT Protected

| Threat | Requires |
|--------|----------|
| Malicious Firebase Admin | Other measures (IAM, audit logs) |
| Rate limiting | Not covered by rules |
| Data corruption from bugs | Code-level fixes |

### Defense in Depth

Security rules are the **last line of defense**, not the only defense:
1. Client-side auth check (existing)
2. Firestore security rules (this phase)
3. Firebase IAM permissions (Firebase Console)
4. Audit logging (Cloud Logging)

---

## 8. Storage Rules

**Not needed for this app.** The app uses Firestore only, no Firebase Storage. If Storage is added later, the pattern would be:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 9. Implementation Plan

### Task 1: Create firestore.rules
- File: `firestore.rules` in project root
- Content: Standard user isolation rules with helper functions
- Test: Manual review of rule syntax

### Task 2: Update firebase.json (if needed)
- Verify rules path is configured
- Ensure deployment target is correct

### Task 3: Deploy and Verify
- Deploy via `firebase deploy --only firestore:rules`
- Test via Firebase Console simulator

---

## 10. Sources

- Firebase Security Rules Documentation: https://firebase.google.com/docs/rules/basics
- Auth Integration: https://firebase.google.com/docs/rules/rules-and-auth
- Firestore Conditions: https://firebase.google.com/docs/firestore/security/rules-conditions
- OneUptime Blog (2026): https://oneuptime.com/blog/post/2026-02-17-how-to-write-firestore-security-rules-for-user-based-access-control/view
- Jacob Alcock Blog (2025): https://blog.jacobalcock.co.uk/how-to-write-secure-firebase-rules