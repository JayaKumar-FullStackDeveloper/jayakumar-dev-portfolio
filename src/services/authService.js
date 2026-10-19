import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Wrong email and wrong password share one message so the form can't be used to discover accounts.
const SIGN_IN_ERRORS = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/invalid-email': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signIn(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  } catch (err) {
    throw new Error(SIGN_IN_ERRORS[err.code] || 'Sign-in failed. Please try again.');
  }
}

export function signOutUser() {
  return signOut(auth);
}

export async function requestPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  } catch (err) {
    if (err.code === 'auth/network-request-failed' || err.code === 'auth/too-many-requests') {
      throw new Error(SIGN_IN_ERRORS[err.code]);
    }
    // Any other outcome (including unknown accounts) gets the same generic confirmation.
  }
}

// UX check only: Firestore Security Rules enforce the same admin record on every request.
export async function isActiveAdmin(uid) {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists() && snap.data().active === true && snap.data().role === 'admin';
}
