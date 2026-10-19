// A sample Design post, created from the admin "Add sample post" button so the
// Instagram-style popup can be tried out. Images are Cloudinary's public demo assets,
// cropped to 4:5. Delete the post once you've added your own.
const demo = (file) => `https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_1080,h_1350/${file}`;

export const SAMPLE_POST = {
  title: 'Sample Poster Series - Summer Campaign',
  slug: 'sample-poster-series',
  type: 'Design',
  shortDescription: 'A sample three-poster carousel to preview the post popup. Replace it with your own posters.',
  description:
    'This is a sample post created from the admin.\n\nOpen it to try the carousel: use the arrows, dots, arrow keys or swipe on a phone. Delete it once your own posters are in.',
  categoryIds: ['others'],
  techStack: ['Photoshop', 'Illustrator', 'Poster Design'],
  coverMedia: { url: '', alt: '' },
  display: 'gallery',
  gallery: [
    { url: demo('cld-sample.jpg'), alt: 'Sample poster 1: portrait with a dog on a pink background' },
    { url: demo('cld-sample-2.jpg'), alt: 'Sample poster 2: mountain peaks above the clouds' },
    { url: demo('cld-sample-3.jpg'), alt: 'Sample poster 3: city street scene' },
  ],
  links: [],
  projectUrl: 'https://www.behance.net/Jayakumar_JK',
  featured: false,
  sortOrder: 0,
};
