import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_CATEGORIES } from '../data/legacyProjects';
import { auditWrite } from './auditService';

const categoriesCol = () => collection(db, 'categories');
const toCategory = (snap) => ({ id: snap.id, ...snap.data() });
const bySortOrder = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);

function categoryFields(input) {
  return {
    name: input.name.trim(),
    slug: input.slug,
    description: (input.description || '').trim(),
    projectTypes: input.projectTypes,
    active: Boolean(input.active),
    sortOrder: Number(input.sortOrder) || 0,
  };
}

// Public: active categories only (the query must match the rule; rules are not filters).
export async function fetchActiveCategories() {
  const snap = await getDocs(query(categoriesCol(), where('active', '==', true)));
  return snap.docs.map(toCategory).sort(bySortOrder);
}

// Admin: every category, including inactive ones.
export async function listCategories() {
  const snap = await getDocs(categoriesCol());
  return snap.docs.map(toCategory).sort(bySortOrder);
}

// The document ID is the slug, which keeps slugs unique.
export async function createCategory(input, uid) {
  const ref = doc(db, 'categories', input.slug);
  if ((await getDoc(ref)).exists()) throw new Error(`A category with the slug "${input.slug}" already exists.`);
  const batch = writeBatch(db);
  batch.set(ref, { ...categoryFields(input), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  batch.set(...auditWrite(uid, 'create', 'category', ref.id));
  await batch.commit();
}

export async function updateCategory(id, input, uid) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'categories', id), { ...categoryFields({ ...input, slug: id }), updatedAt: serverTimestamp() });
  batch.set(...auditWrite(uid, 'update', 'category', id));
  await batch.commit();
}

export async function isCategoryInUse(id) {
  const snap = await getDocs(query(collection(db, 'projects'), where('categoryIds', 'array-contains', id), limit(1)));
  return !snap.empty;
}

export async function deleteCategory(id, uid) {
  if (await isCategoryInUse(id)) {
    throw new Error('This category is used by at least one project. Move those projects to another category first, or deactivate it instead.');
  }
  const batch = writeBatch(db);
  batch.delete(doc(db, 'categories', id));
  batch.set(...auditWrite(uid, 'delete', 'category', id));
  await batch.commit();
}

// Creates any missing default categories. Existing categories are left untouched.
export async function seedDefaultCategories(uid) {
  const existing = new Set((await listCategories()).map((c) => c.id));
  const missing = DEFAULT_CATEGORIES.filter((c) => !existing.has(c.id));
  if (missing.length === 0) return 0;
  const batch = writeBatch(db);
  missing.forEach((category) => {
    batch.set(doc(db, 'categories', category.id), {
      ...categoryFields(category),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(...auditWrite(uid, 'create', 'category', category.id));
  });
  await batch.commit();
  return missing.length;
}
