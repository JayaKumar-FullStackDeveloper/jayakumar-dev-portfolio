import { cardImageSrcSet, cardImageUrl, fitImageSrcSet, fitImageUrl } from './images';

const cloud = 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/cover.png';

test('Cloudinary covers are requested as 16:9 crops at the card size', () => {
  expect(cardImageUrl(cloud, 640)).toBe(
    'https://res.cloudinary.com/demo/image/upload/c_fill,g_north,w_640,h_360,f_auto,q_auto/v1/portfolio/cover.png'
  );
  expect(cardImageSrcSet(cloud)).toContain('w_320,h_180');
  expect(cardImageSrcSet(cloud)).toContain(' 960w');
});

test('other hosts are left unchanged', () => {
  const other = 'https://images.example.com/cover.png';
  expect(cardImageUrl(other, 640)).toBe(other);
  expect(cardImageSrcSet(other)).toBeUndefined();
});

test('posters are scaled to fit without cropping', () => {
  expect(fitImageUrl('https://res.cloudinary.com/demo/image/upload/v1/a.png', 640, 360)).toBe(
    'https://res.cloudinary.com/demo/image/upload/c_limit,w_640,h_360,f_auto,q_auto/v1/a.png'
  );
  expect(fitImageSrcSet('https://res.cloudinary.com/demo/image/upload/v1/a.png')).toContain(' 1080w');
  expect(fitImageUrl('https://images.example.com/a.png', 640)).toBe('https://images.example.com/a.png');
});
