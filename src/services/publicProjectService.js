import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isSafeUrl } from '../lib/validation';
import { fetchActiveCategories } from './categoryService';

// Maps a published project document to the fields the public card needs.
function toPublicProject(snap) {
  const data = snap.data();
  return {
    id: snap.id,
    type: data.type,
    title: data.title,
    description: data.shortDescription,
    thumbnail: isSafeUrl(data.coverMedia?.url) ? data.coverMedia.url : null,
    thumbnailAlt: data.coverMedia?.alt || '',
    tags: Array.isArray(data.techStack) ? data.techStack : [],
    href: isSafeUrl(data.projectUrl) ? data.projectUrl : null,
    categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
    featured: Boolean(data.featured),
    sortOrder: Number(data.sortOrder) || 0,
  };
}

const byDisplayOrder = (a, b) =>
  Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder || a.title.localeCompare(b.title);

export async function fetchPublicPortfolio() {
  const [projectSnap, categories] = await Promise.all([
    // The status filter is required: Security Rules reject queries that could return drafts.
    getDocs(query(collection(db, 'projects'), where('status', '==', 'published'))),
    fetchActiveCategories(),
  ]);
  return {
    projects: projectSnap.docs.map(toPublicProject).sort(byDisplayOrder),
    categories,
  };
}
