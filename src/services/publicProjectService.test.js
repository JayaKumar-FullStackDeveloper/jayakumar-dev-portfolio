import { collection, getDocs, query, where } from 'firebase/firestore';
import { fetchActiveCategories } from './categoryService';
import { fetchPublicPortfolio } from './publicProjectService';

jest.mock('../lib/firebase', () => ({ db: {} }));
// CRA resets mock implementations before each test, so they are set inside the test.
jest.mock('./categoryService', () => ({ fetchActiveCategories: jest.fn() }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), where: jest.fn(), query: jest.fn(), getDocs: jest.fn() }));

const snap = (id, data) => ({ id, data: () => data });

beforeEach(() => {
  collection.mockImplementation((db, name) => ({ name }));
  where.mockImplementation((field, op, value) => ({ field, op, value }));
  query.mockImplementation((col, ...constraints) => ({ col, constraints }));
  fetchActiveCategories.mockResolvedValue([{ id: 'web', name: 'Web Apps', projectTypes: ['Development'] }]);
});

test('public portfolio queries published projects only and exposes allowlisted fields', async () => {
  getDocs.mockResolvedValue({
    docs: [
      snap('b', {
        slug: 'second',
        type: 'Development',
        title: 'Second',
        shortDescription: 'Short',
        coverMedia: { url: 'https://img.example/b.png', alt: 'B' },
        techStack: ['React'],
        projectUrl: 'javascript:alert(1)',
        categoryIds: ['web'],
        sortOrder: 2,
        createdBy: 'admin-uid',
      }),
      snap('a', { slug: 'first', type: 'Development', title: 'First', shortDescription: 'Short', featured: true, sortOrder: 5, projectUrl: 'https://first.example' }),
    ],
  });

  const { projects, categories } = await fetchPublicPortfolio();

  expect(query).toHaveBeenCalledWith({ name: 'projects' }, { field: 'status', op: '==', value: 'published' });
  expect(projects.map((p) => p.id)).toEqual(['a', 'b']); // featured first
  expect(projects[0].href).toBe('https://first.example'); // cards open the primary link directly
  expect(projects[0].display).toBe('link');
  const b = projects[1];
  expect(b.href).toBeNull(); // unsafe URL dropped
  expect(b.thumbnail).toBe('https://img.example/b.png');
  expect(b).not.toHaveProperty('createdBy');
  expect(categories).toHaveLength(1);
});

test('posts expose safe gallery images, links and video for the popup', async () => {
  getDocs.mockResolvedValue({
    docs: [
      snap('p', {
        slug: 'summer-poster',
        type: 'Design',
        title: 'Summer poster',
        shortDescription: 'Poster series',
        display: 'gallery',
        gallery: [
          { url: 'https://res.cloudinary.com/demo/image/upload/a.png', alt: 'Front' },
          { url: 'javascript:alert(1)', alt: 'Bad' },
          { url: 'https://res.cloudinary.com/demo/image/upload/b.png' },
        ],
        links: [
          { label: 'Behance', url: 'https://www.behance.net/x' },
          { label: 'Bad', url: 'http://insecure.example' },
        ],
        media: [{ type: 'video', provider: 'youtube', videoId: 'dQw4w9WgXcQ' }],
      }),
    ],
  });

  const [post] = (await fetchPublicPortfolio()).projects;
  expect(post.display).toBe('gallery');
  expect(post.gallery).toEqual([
    { url: 'https://res.cloudinary.com/demo/image/upload/a.png', alt: 'Front' },
    { url: 'https://res.cloudinary.com/demo/image/upload/b.png', alt: '' },
  ]);
  expect(post.links.map((l) => l.label)).toEqual(['Behance']);
  expect(post.videoEmbedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
});
