import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Returns a [ref, data] pair so callers can add the audit event to the same batch or
// transaction as the change it records (both succeed or both fail).
export function auditWrite(actor, action, entityType, entityId) {
  return [
    doc(collection(db, 'auditEvents')),
    { actor, action, entityType, entityId, createdAt: serverTimestamp() },
  ];
}
