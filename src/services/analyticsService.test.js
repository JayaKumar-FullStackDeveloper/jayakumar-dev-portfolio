import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { markAdminDevice, recordOutboundClick, recordView } from './analyticsService';

jest.mock('../lib/firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: { fromDate: jest.fn() },
  where: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  collection.mockReturnValue('analyticsEvents');
  serverTimestamp.mockReturnValue('SERVER_TS');
  addDoc.mockResolvedValue({});
});

test('records a view with only the fields the rules allow', async () => {
  await recordView('p1');
  expect(addDoc).toHaveBeenCalledWith('analyticsEvents', { projectId: 'p1', type: 'view', createdAt: 'SERVER_TS' });
});

test('counts a view once per project per session window', async () => {
  await recordView('p1');
  await recordView('p1');
  await recordView('p2');
  expect(addDoc).toHaveBeenCalledTimes(2);
});

test('records outbound clicks with a bounded target', async () => {
  await recordOutboundClick('p1', `https://example.com/${'x'.repeat(600)}`);
  const event = addDoc.mock.calls[0][1];
  expect(event.type).toBe('outbound_click');
  expect(event.target.length).toBe(500);
});

test('browsers that signed in to the admin area are not counted', async () => {
  markAdminDevice();
  await recordView('p1');
  await recordOutboundClick('p1', 'https://example.com');
  expect(addDoc).not.toHaveBeenCalled();
});

test('a failed write never throws into the page', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  addDoc.mockRejectedValue({ code: 'permission-denied' });
  await expect(recordView('p1')).resolves.toBeUndefined();
});
