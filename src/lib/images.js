// Responsive image helpers. Project thumbnails are 16:9; upload covers at 1600×900
// (minimum 1280×720) so they stay sharp on the detail page and on retina screens.

const CLOUDINARY_IMAGE = /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\//i;
export const CARD_WIDTHS = [320, 640, 960];
export const DETAIL_WIDTHS = [960, 1280, 1600];

// Cloudinary URL for a 16:9 crop (anchored at the top) at the given width, in the best format
// the browser supports. Other hosts can't be resized, so their URL is returned unchanged.
export function cardImageUrl(url, width) {
  if (!CLOUDINARY_IMAGE.test(url || '')) return url;
  const height = Math.round((width * 9) / 16);
  return url.replace('/image/upload/', `/image/upload/c_fill,g_north,w_${width},h_${height},f_auto,q_auto/`);
}

export function cardImageSrcSet(url, widths = CARD_WIDTHS) {
  if (!CLOUDINARY_IMAGE.test(url || '')) return undefined;
  return widths.map((w) => `${cardImageUrl(url, w)} ${w}w`).join(', ');
}
