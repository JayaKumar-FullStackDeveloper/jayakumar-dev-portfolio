import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isSafeUrl, SLUG_PATTERN, videoEmbedUrl } from '../lib/validation';
import { fetchActiveCategories } from './categoryService';

// Maps a published project document to the fields the public card needs.
function toPublicProject(snap) {
  const data = snap.data();
  return {
    id: snap.id,
    slug: data.slug,
    type: data.type,
    title: data.title,
    description: data.shortDescription,
    thumbnail: isSafeUrl(data.coverMedia?.url) ? data.coverMedia.url : null,
    thumbnailAlt: data.coverMedia?.alt || '',
    tags: Array.isArray(data.techStack) ? data.techStack : [],
    href: SLUG_PATTERN.test(data.slug || '') ? `/projects/${data.slug}` : null,
    categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
    featured: Boolean(data.featured),
    sortOrder: Number(data.sortOrder) || 0,
  };
}

// Extra fields for the project detail page. Unsafe links and unknown video providers are dropped.
function toPublicDetail(snap) {
  const data = snap.data();
  const video = (data.media || []).find((m) => m.type === 'video');
  return {
    ...toPublicProject(snap),
    fullDescription: typeof data.description === 'string' ? data.description : '',
    projectUrl: isSafeUrl(data.projectUrl) ? data.projectUrl : null,
    links: (Array.isArray(data.links) ? data.links : [])
      .filter((link) => isSafeUrl(link.url) && link.label)
      .map((link) => ({ label: link.label, type: link.type, url: link.url })),
    videoEmbedUrl: videoEmbedUrl(video),
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

// Returns null for unknown, draft, archived or deleted projects.
export async function fetchPublishedProjectBySlug(slug) {
  if (!SLUG_PATTERN.test(slug || '')) return null;
  const [snap, categories] = await Promise.all([
    getDocs(query(collection(db, 'projects'), where('status', '==', 'published'), where('slug', '==', slug), limit(1))),
    fetchActiveCategories(),
  ]);
  if (snap.empty) return null;
  const project = toPublicDetail(snap.docs[0]);
  return {
    ...project,
    categoryNames: project.categoryIds.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean),
  };
}
