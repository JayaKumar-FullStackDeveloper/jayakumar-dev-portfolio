import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

/* First-party analytics: project detail views and outbound link clicks only.
   - No visitor IDs, IP addresses or cookies are stored.
   - A view counts at most once per project per browser session within VIEW_WINDOW_MS.
   - Browsers that have signed in to /admin, and automated browsers, are not counted.
   - Events are written from the browser, so they can be spoofed; treat totals as indicative. */

const VIEW_WINDOW_MS = 30 * 60 * 1000;
const ADMIN_DEVICE_KEY = 'portfolio-admin-device';
export const ADMIN_EVENT_LIMIT = 5000;

// Called when an admin signs in, so the owner's own browsing isn't counted.
export function markAdminDevice() {
  try {
    localStorage.setItem(ADMIN_DEVICE_KEY, '1');
  } catch {
    // Storage unavailable: nothing to remember.
  }
}

function isExcluded() {
  if (typeof navigator !== 'undefined' && navigator.webdriver) return true;
  try {
    return localStorage.getItem(ADMIN_DEVICE_KEY) === '1';
  } catch {
    return false;
  }
}

async function record(projectId, type, target) {
  if (isExcluded()) return;
  const event = { projectId, type, createdAt: serverTimestamp() };
  if (target) event.target = String(target).slice(0, 500);
  try {
    await addDoc(collection(db, 'analyticsEvents'), event);
  } catch (err) {
    // Analytics must never break the page.
    console.warn('Analytics event not recorded:', err.code || err);
  }
}

export function recordView(projectId) {
  const key = `pv:${projectId}`;
  try {
    const last = Number(sessionStorage.getItem(key));
    if (last && Date.now() - last < VIEW_WINDOW_MS) return undefined;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // Without sessionStorage we can't de-duplicate; still record the view.
  }
  return record(projectId, 'view');
}

export function recordOutboundClick(projectId, url) {
  return record(projectId, 'outbound_click', url);
}

// Admin: raw events since a date (Security Rules allow reads for admins only).
export async function fetchEventsSince(since) {
  const snap = await getDocs(
    query(
      collection(db, 'analyticsEvents'),
      where('createdAt', '>=', Timestamp.fromDate(since)),
      orderBy('createdAt', 'desc'),
      limit(ADMIN_EVENT_LIMIT)
    )
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return { projectId: data.projectId, type: data.type, target: data.target || '', at: data.createdAt?.toDate?.() };
  });
}
