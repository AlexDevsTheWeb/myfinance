import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export class DeleteAccountRequiresPasswordError extends Error {
  constructor() {
    super('Password required to reauthenticate');
    this.name = 'DeleteAccountRequiresPasswordError';
  }
}

const BATCH_LIMIT = 450;

async function deleteSubcollection(uid: string, sub: 'transactions' | 'portfolio_history'): Promise<void> {
  const ref = collection(db, 'users', uid, sub);
  const snapshot = await getDocs(ref);
  if (snapshot.empty) return;

  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    docs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

/**
 * Deletes the currently signed-in user's account and all associated data:
 * re-authenticates (Firebase requires recent login for deleteUser), bulk-deletes
 * the transactions + portfolio_history subcollections, deletes users/{uid}, then
 * removes the Firebase Auth account and local storage.
 *
 * Order matters: auth removal must come LAST, otherwise the Firestore token is
 * revoked and the bulk delete fails.
 */
export async function deleteUserAccount(password?: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');

  if (isGoogle) {
    await reauthenticateWithPopup(user, googleProvider);
  } else if (password && user.email) {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } else {
    throw new DeleteAccountRequiresPasswordError();
  }

  const uid = user.uid;

  await deleteSubcollection(uid, 'transactions');
  await deleteSubcollection(uid, 'portfolio_history');
  await deleteDoc(doc(db, 'users', uid));

  const current = auth.currentUser;
  if (current) {
    await deleteUser(current);
  }

  localStorage.removeItem(`finance-storage-${uid}`);
}
