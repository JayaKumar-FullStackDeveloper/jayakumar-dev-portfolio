import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auditWrite } from './auditService';
import { deleteCloudinaryFile, uploadToCloudinary } from './mediaService';

/* Resumes: PDFs in Cloudinary, metadata in Firestore.
   - resumes/{id}           every uploaded resume (admin only)
   - siteSettings/resume    the ONE published resume, read by the public site
   Publishing replaces the pointer, so only one resume can ever be live. Security Rules check the
   pointer names an existing resume with the same URL, and refuse deleting the published one. */

const resumesCol = () => collection(db, 'resumes');
const pointerRef = () => doc(db, 'siteSettings', 'resume');
export const RESUME_TITLE_MAX = 120;

export function validateResumeTitle(title) {
  const value = (title || '').trim();
  if (!value) return 'Give the resume a name, e.g. "UI/UX Designer resume 2026".';
  if (value.length > RESUME_TITLE_MAX) return `Keep the name under ${RESUME_TITLE_MAX} characters.`;
  return null;
}

function checkTitle(title) {
  const error = validateResumeTitle(title);
  if (error) throw new Error(error);
  return title.trim();
}

/* ---------- Admin ---------- */

export async function listResumes() {
  const [snap, pointer] = await Promise.all([getDocs(query(resumesCol(), orderBy('createdAt', 'desc'))), getDoc(pointerRef())]);
  const publishedId = pointer.exists() ? pointer.data().resumeId : null;
  return {
    publishedId,
    resumes: snap.docs.map((d) => ({ id: d.id, ...d.data(), published: d.id === publishedId })),
  };
}

export async function uploadResume(file, title, uid, { onProgress } = {}) {
  const name = checkTitle(title);
  const uploaded = await uploadToCloudinary(file, { expectedType: 'raw', onProgress });
  try {
    const ref = await addDoc(resumesCol(), {
      title: name,
      fileName: file.name.slice(0, 200),
      url: uploaded.url,
      publicId: uploaded.publicId,
      sizeBytes: uploaded.bytes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: uid,
      updatedBy: uid,
    });
    const batch = writeBatch(db);
    batch.set(...auditWrite(uid, 'upload', 'resume', ref.id));
    await batch.commit();
    return ref.id;
  } catch (err) {
    // Don't leave an orphaned file in Cloudinary if the record couldn't be saved.
    await deleteCloudinaryFile('raw', uploaded.publicId).catch(() => {});
    throw err;
  }
}

export async function renameResume(resume, title, uid) {
  const name = checkTitle(title);
  const batch = writeBatch(db);
  batch.update(doc(db, 'resumes', resume.id), { title: name, updatedAt: serverTimestamp(), updatedBy: uid });
  if (resume.published) {
    batch.update(pointerRef(), { title: name, updatedAt: serverTimestamp(), updatedBy: uid });
  }
  batch.set(...auditWrite(uid, 'rename', 'resume', resume.id));
  await batch.commit();
}

// Makes this resume the public one, replacing whichever was published before.
export async function publishResume(resume, uid) {
  const batch = writeBatch(db);
  batch.set(pointerRef(), {
    resumeId: resume.id,
    title: resume.title,
    url: resume.url,
    fileName: resume.fileName,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  });
  batch.set(...auditWrite(uid, 'publish', 'resume', resume.id));
  await batch.commit();
}

export async function unpublishResume(resume, uid) {
  const batch = writeBatch(db);
  batch.delete(pointerRef());
  batch.set(...auditWrite(uid, 'unpublish', 'resume', resume.id));
  await batch.commit();
}

export async function deleteResume(resume, uid) {
  if (resume.published) throw new Error('Unpublish this resume, or publish another one, before deleting it.');
  await deleteCloudinaryFile('raw', resume.publicId);
  await deleteDoc(doc(db, 'resumes', resume.id));
  const batch = writeBatch(db);
  batch.set(...auditWrite(uid, 'delete', 'resume', resume.id));
  await batch.commit();
}
