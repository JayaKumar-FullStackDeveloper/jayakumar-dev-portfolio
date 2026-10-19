// Public Firebase web-app configuration. These values ship in the browser bundle by design;
// access control is enforced by Firestore Security Rules (firestore.rules), not by hiding them.
// Never put service-account keys or other secrets in REACT_APP_* variables.
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
