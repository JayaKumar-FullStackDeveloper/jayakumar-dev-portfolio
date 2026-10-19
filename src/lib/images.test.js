import { cardImageSrcSet, cardImageUrl } from './images';

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

test('detail covers use larger widths', () => {
  const srcSet = cardImageSrcSet('https://res.cloudinary.com/demo/image/upload/v1/a.png', [960, 1280, 1600]);
  expect(srcSet).toContain('w_1600,h_900');
  expect(srcSet).not.toContain('w_320');
});
