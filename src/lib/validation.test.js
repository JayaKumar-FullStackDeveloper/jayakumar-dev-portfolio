import {
  isSafeUrl,
  parseTags,
  parseVideoUrl,
  slugify,
  validateCategory,
  validateProject,
  videoEmbedUrl,
  videoWatchUrl,
} from './validation';

const categories = [
  { id: 'web-app', active: true, projectTypes: ['Design'] },
  { id: 'web', active: true, projectTypes: ['Development'] },
  { id: 'old', active: false, projectTypes: ['Design'] },
];

const validDraft = {
  title: 'Laya redesign',
  slug: 'laya-redesign',
  type: 'Design',
  shortDescription: 'An e-commerce redesign.',
  categoryIds: ['web-app'],
  techStack: ['Figma'],
  coverMedia: { url: '', alt: '' },
  links: [],
  sortOrder: 0,
};

test('slugify builds URL-safe slugs', () => {
  expect(slugify('  Why Weds: Wedding App!  ')).toBe('why-weds-wedding-app');
  expect(slugify('Café Déjà Vu')).toBe('cafe-deja-vu');
  expect(slugify('')).toBe('');
});

test('isSafeUrl only accepts https URLs', () => {
  expect(isSafeUrl('https://www.behance.net/x')).toBe(true);
  expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  expect(isSafeUrl('data:text/html,hi')).toBe(false);
  expect(isSafeUrl('http://example.com')).toBe(false);
  expect(isSafeUrl('not a url')).toBe(false);
  expect(isSafeUrl(undefined)).toBe(false);
});

test('parseTags trims and de-duplicates case-insensitively', () => {
  expect(parseTags('React, Tailwind CSS, react, , MongoDB ')).toEqual(['React', 'Tailwind CSS', 'MongoDB']);
});

test('a valid draft passes without a cover image', () => {
  expect(validateProject(validDraft, { categories })).toEqual({});
});

test('publishing requires a cover image with alt text', () => {
  expect(validateProject(validDraft, { publish: true, categories })).toHaveProperty('coverUrl');
  const withCover = { ...validDraft, coverMedia: { url: 'https://img.example/cover.png', alt: '' } };
  expect(validateProject(withCover, { publish: true, categories })).toHaveProperty('coverAlt');
  const complete = { ...validDraft, coverMedia: { url: 'https://img.example/cover.png', alt: 'Home screen' } };
  expect(validateProject(complete, { publish: true, categories })).toEqual({});
});

test('categories must be active and match the project type', () => {
  expect(validateProject({ ...validDraft, categoryIds: ['web'] }, { categories })).toHaveProperty('categoryIds');
  expect(validateProject({ ...validDraft, categoryIds: ['old'] }, { categories })).toHaveProperty('categoryIds');
  expect(validateProject({ ...validDraft, categoryIds: [] }, { categories })).toHaveProperty('categoryIds');
});

test('unsafe links and bad slugs are rejected', () => {
  const errors = validateProject(
    {
      ...validDraft,
      slug: 'Bad Slug',
      projectUrl: 'javascript:alert(1)',
      links: [{ label: 'Demo', type: 'Live Demo', url: 'http://insecure.example' }],
    },
    { categories }
  );
  expect(errors).toHaveProperty('slug');
  expect(errors).toHaveProperty('projectUrl');
  expect(errors).toHaveProperty('link-0');
});

test('validateCategory requires name, slug and a project type', () => {
  expect(validateCategory({ name: '', slug: 'x y', projectTypes: [], sortOrder: 1 })).toEqual(
    expect.objectContaining({ name: expect.any(String), slug: expect.any(String), projectTypes: expect.any(String) })
  );
  expect(validateCategory({ name: 'Web App', slug: 'web-app', projectTypes: ['Design'], sortOrder: 1 })).toEqual({});
});

test('parseVideoUrl accepts YouTube/Vimeo links and rejects everything else', () => {
  const yt = { provider: 'youtube', videoId: 'dQw4w9WgXcQ' };
  expect(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10')).toEqual(yt);
  expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toEqual(yt);
  expect(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toEqual(yt);
  expect(parseVideoUrl('https://vimeo.com/76979871')).toEqual({ provider: 'vimeo', videoId: '76979871' });
  expect(parseVideoUrl('https://player.vimeo.com/video/76979871')).toEqual({ provider: 'vimeo', videoId: '76979871' });

  expect(parseVideoUrl('https://evil.example/embed/dQw4w9WgXcQ')).toBeNull();
  expect(parseVideoUrl('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ')).toBeNull();
  expect(parseVideoUrl('https://www.youtube.com/watch?v=<script>')).toBeNull();
  expect(parseVideoUrl('javascript:alert(1)')).toBeNull();
});

test('embed URLs are rebuilt from validated IDs only', () => {
  expect(videoEmbedUrl({ provider: 'youtube', videoId: 'dQw4w9WgXcQ' })).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  expect(videoEmbedUrl({ provider: 'vimeo', videoId: '76979871' })).toBe('https://player.vimeo.com/video/76979871?dnt=1');
  expect(videoEmbedUrl({ provider: 'youtube', videoId: '../../evil' })).toBeNull();
  expect(videoEmbedUrl({ provider: 'other', videoId: '123456' })).toBeNull();
  expect(videoWatchUrl({ provider: 'vimeo', videoId: '76979871' })).toBe('https://vimeo.com/76979871');
  expect(validateProject({ ...validDraft, videoUrl: 'https://example.com/video.mp4' }, { categories })).toHaveProperty('videoUrl');
});
