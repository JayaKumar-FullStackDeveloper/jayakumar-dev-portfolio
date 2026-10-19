import { deleteDoc, doc } from 'firebase/firestore';
import { checkFile, deleteMedia, findMediaUsage } from './mediaService';

jest.mock('../lib/firebase', () => ({ db: {}, auth: { currentUser: { getIdToken: () => Promise.resolve('id-token') } } }));
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(),
  updateDoc: jest.fn(),
}));

const file = (type, size, name = 'f') => ({ type, size, name });
const item = { id: 'm1', url: 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/a.png', publicId: 'portfolio/a', resourceType: 'image' };

test('checkFile accepts supported files and rejects others before upload', () => {
  expect(checkFile(file('image/png', 1000))).toBe('image');
  expect(checkFile(file('video/mp4', 50 * 1024 * 1024))).toBe('video');
  expect(() => checkFile(file('image/svg+xml', 1000))).toThrow(/Unsupported/);
  expect(() => checkFile(file('application/x-msdownload', 1000))).toThrow(/Unsupported/);
  expect(() => checkFile(file('image/png', 11 * 1024 * 1024))).toThrow(/too large/);
  expect(() => checkFile(file('video/mp4', 1000), 'image')).toThrow(/Choose an image file/);
  expect(checkFile(file('application/pdf', 1000), 'raw')).toBe('raw');
  expect(() => checkFile(file('image/png', 1000), 'raw')).toThrow(/Choose a PDF file/);
  expect(() => checkFile(file('application/pdf', 11 * 1024 * 1024), 'raw')).toThrow(/too large/);
});

test('findMediaUsage finds cover and video references', () => {
  const projects = [
    { title: 'Cover user', coverMedia: { url: item.url } },
    { title: 'Video user', media: [{ type: 'video', url: item.url }] },
    { title: 'Unrelated', coverMedia: { url: 'https://res.cloudinary.com/demo/image/upload/b.png' } },
  ];
  expect(findMediaUsage(item, projects).map((p) => p.title)).toEqual(['Cover user', 'Video user']);
});

test('deleteMedia refuses files in use and removes unused files from Cloudinary first', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ deleted: true }) }));
  doc.mockReturnValue('media-ref');

  await expect(deleteMedia(item, [{ title: 'Live', coverMedia: { url: item.url } }])).rejects.toThrow(/used by "Live"/);
  expect(global.fetch).not.toHaveBeenCalled();

  await deleteMedia(item, []);
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe('/.netlify/functions/cloudinary');
  expect(options.headers.Authorization).toBe('Bearer id-token');
  expect(JSON.parse(options.body)).toEqual({ action: 'delete', resourceType: 'image', publicId: 'portfolio/a' });
  expect(deleteDoc).toHaveBeenCalledWith('media-ref');
});

test('a failed Cloudinary delete keeps the library record', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 502, json: () => Promise.resolve({ error: 'Cloudinary could not delete the file.' }) }));
  await expect(deleteMedia(item, [])).rejects.toThrow(/could not delete/);
  expect(deleteDoc).not.toHaveBeenCalled();
});
