import { collection, getDocs, query, where } from 'firebase/firestore';
import { fetchActiveCategories } from './categoryService';
import { fetchPublicPortfolio, fetchPublishedProjectBySlug } from './publicProjectService';

jest.mock('../lib/firebase', () => ({ db: {} }));
// CRA resets mock implementations before each test, so they are set inside the test.
jest.mock('./categoryService', () => ({ fetchActiveCategories: jest.fn() }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), where: jest.fn(), query: jest.fn(), getDocs: jest.fn(), limit: jest.fn() }));

const snap = (id, data) => ({ id, data: () => data });

test('public portfolio queries published projects only and exposes allowlisted fields', async () => {
  collection.mockImplementation((db, name) => ({ name }));
  where.mockImplementation((field, op, value) => ({ field, op, value }));
  query.mockImplementation((col, ...constraints) => ({ col, constraints }));
  fetchActiveCategories.mockResolvedValue([{ id: 'web', name: 'Web Apps', projectTypes: ['Development'] }]);
  getDocs.mockResolvedValue({
    docs: [
      snap('b', {
        type: 'Development',
        title: 'Second',
        shortDescription: 'Short',
        description: 'Private case study draft',
        coverMedia: { url: 'https://img.example/b.png', alt: 'B' },
        techStack: ['React'],
        projectUrl: 'javascript:alert(1)',
        categoryIds: ['web'],
        sortOrder: 2,
        createdBy: 'admin-uid',
      }),
      snap('a', { slug: 'first', type: 'Development', title: 'First', shortDescription: 'Short', featured: true, sortOrder: 5 }),
    ],
  });

  const { projects, categories } = await fetchPublicPortfolio();

  expect(query).toHaveBeenCalledWith({ name: 'projects' }, { field: 'status', op: '==', value: 'published' });
  expect(projects.map((p) => p.id)).toEqual(['a', 'b']); // featured first
  const b = projects[1];
  expect(projects[0].href).toBe('/projects/first'); // cards open the detail page
  expect(b.href).toBeNull(); // no valid slug, no link
  expect(b.thumbnail).toBe('https://img.example/b.png');
  expect(b).not.toHaveProperty('createdBy');
  expect(b).not.toHaveProperty('description', 'Private case study draft');
  expect(categories).toHaveLength(1);
});

test('detail page returns null for invalid slugs and drops unsafe links', async () => {
  collection.mockImplementation((db, name) => ({ name }));
  where.mockImplementation((field, op, value) => ({ field, op, value }));
  query.mockImplementation((col, ...constraints) => ({ col, constraints }));
  fetchActiveCategories.mockResolvedValue([{ id: 'web', name: 'Web Apps', projectTypes: ['Development'] }]);

  expect(await fetchPublishedProjectBySlug('../admins')).toBeNull();
  expect(getDocs).not.toHaveBeenCalled();

  getDocs.mockResolvedValue({ empty: true, docs: [] });
  expect(await fetchPublishedProjectBySlug('draft-project')).toBeNull();
  expect(where).toHaveBeenCalledWith('status', '==', 'published');

  getDocs.mockResolvedValue({
    empty: false,
    docs: [
      snap('x', {
        slug: 'laya',
        type: 'Development',
        title: 'Laya',
        shortDescription: 'Short',
        description: 'Full case study',
        categoryIds: ['web', 'removed'],
        projectUrl: 'https://laya.example',
        links: [
          { label: 'Repo', type: 'Repository', url: 'https://github.com/x/y' },
          { label: 'Bad', type: 'Other', url: 'javascript:alert(1)' },
        ],
        media: [{ type: 'video', provider: 'youtube', videoId: 'dQw4w9WgXcQ' }],
      }),
    ],
  });
  const project = await fetchPublishedProjectBySlug('laya');
  expect(project.links.map((l) => l.label)).toEqual(['Repo']);
  expect(project.videoEmbedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  expect(project.categoryNames).toEqual(['Web Apps']);
  expect(project.fullDescription).toBe('Full case study');
});
