import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

// Single Firebase initialisation for the whole app. Import `auth` and `db` from here only.
const app = isFirebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

// Email/password only: initialise Auth without the popup/redirect resolver that getAuth() adds,
// so startup doesn't wait on the auth-domain iframe.
function createAuth(firebaseApp) {
  try {
    return initializeAuth(firebaseApp, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] });
  } catch {
    return getAuth(firebaseApp); // already initialised (e.g. hot reload)
  }
}

export const auth = app ? createAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export { isFirebaseConfigured };
