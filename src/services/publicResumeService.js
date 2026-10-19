import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isSafeUrl } from '../lib/validation';

// The one published resume ({ title, url, fileName }), or null when none is published.
// Kept separate from resumeService so the public site doesn't load the upload code.
export async function fetchPublishedResume() {
  const snap = await getDoc(doc(db, 'siteSettings', 'resume'));
  if (!snap.exists()) return null;
  const { title, url, fileName } = snap.data();
  return isSafeUrl(url) ? { title, url, fileName } : null;
}
