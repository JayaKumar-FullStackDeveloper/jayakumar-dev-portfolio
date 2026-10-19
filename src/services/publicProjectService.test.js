import { collection, getDocs, query, where } from 'firebase/firestore';
import { fetchActiveCategories } from './categoryService';
import { fetchPublicPortfolio } from './publicProjectService';

jest.mock('../lib/firebase', () => ({ db: {} }));
// CRA resets mock implementations before each test, so they are set inside the test.
jest.mock('./categoryService', () => ({ fetchActiveCategories: jest.fn() }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), where: jest.fn(), query: jest.fn(), getDocs: jest.fn() }));

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
      snap('a', { type: 'Development', title: 'First', shortDescription: 'Short', featured: true, sortOrder: 5 }),
    ],
  });

  const { projects, categories } = await fetchPublicPortfolio();

  expect(query).toHaveBeenCalledWith({ name: 'projects' }, { field: 'status', op: '==', value: 'published' });
  expect(projects.map((p) => p.id)).toEqual(['a', 'b']); // featured first
  const b = projects[1];
  expect(b.href).toBeNull(); // unsafe URL dropped
  expect(b.thumbnail).toBe('https://img.example/b.png');
  expect(b).not.toHaveProperty('createdBy');
  expect(b).not.toHaveProperty('description', 'Private case study draft');
  expect(categories).toHaveLength(1);
});
