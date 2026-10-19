/* Uploads every built-in tech-stack logo to Cloudinary and records the URLs in
 * src/data/techLogoAssets.json, which the site then uses for built-in logos.
 *
 *   npm run upload:logos            (reads CLOUDINARY_URL from .env.local or the environment)
 *
 * Each logo has two files:
 *   PortFolio/tech-stack/default/default-<key>.svg   white version (at rest)
 *   PortFolio/tech-stack/hover/hover-<key>.svg       original colours (on hover)
 * Public IDs are fixed, so re-running overwrites the same files instead of adding copies.
 * The SVGs come from BuiltInLogo in src/components/techIcon.jsx (same drawings as the site).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'src/data/techLogoAssets.json');

// ---- Load the JSX source with Babel (same preset as the app), ignoring CSS imports ----
process.env.BABEL_ENV = process.env.BABEL_ENV || 'test';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const babel = require('@babel/core');
const { addHook } = require('pirates');
addHook(() => '', { exts: ['.css'] });
addHook(
  (code, filename) =>
    babel.transformSync(code, {
      filename,
      babelrc: false,
      configFile: false,
      presets: [[require.resolve('babel-preset-react-app'), { runtime: 'automatic' }]],
    }).code,
  { exts: ['.js', '.jsx'], ignoreNodeModules: true }
);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { BuiltInLogo, SKILL_ICONS } = require(path.join(ROOT, 'src/components/techIcon.jsx'));

// ---- Credentials ----
function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((line) => /^[A-Z0-9_]+=/.test(line))
      .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).trim()])
  );
}
const env = { ...readEnvFile(path.join(ROOT, '.env.local')), ...process.env };
const match = /^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)$/.exec((env.CLOUDINARY_URL || '').trim());
const cloudName = env.CLOUDINARY_CLOUD_NAME || match?.[3];
const apiKey = env.CLOUDINARY_API_KEY || match?.[1];
const apiSecret = env.CLOUDINARY_API_SECRET || (match?.[2] && decodeURIComponent(match[2]));
const rootFolder = env.CLOUDINARY_FOLDER || 'PortFolio';
if (!cloudName || !apiKey || !apiSecret) {
  console.error('Set CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET) in .env.local.');
  process.exit(1);
}

const sign = (params) =>
  crypto
    .createHash('sha1')
    .update(
      Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&') + apiSecret
    )
    .digest('hex');

function logoSvg(key, variant) {
  return renderToStaticMarkup(
    React.createElement(BuiltInLogo, { iconKey: key, colored: variant === 'hover', size: 64, gradientId: `g-${key}` })
  ).replace(/ aria-hidden="true"| focusable="false"/g, '');
}

async function upload(svg, variant, key) {
  const params = {
    folder: `${rootFolder}/tech-stack/${variant}`,
    public_id: `${variant}-${key}`,
    overwrite: 'true',
    invalidate: 'true',
    timestamp: Math.floor(Date.now() / 1000),
  };
  const form = new FormData();
  Object.entries(params).forEach(([k, v]) => form.append(k, String(v)));
  form.append('api_key', apiKey);
  form.append('signature', sign(params));
  form.append('file', new Blob([svg], { type: 'image/svg+xml' }), `${variant}-${key}.svg`);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error?.message || `HTTP ${res.status}`);
  return { url: body.secure_url, publicId: body.public_id };
}

(async () => {
  const keys = Object.keys(SKILL_ICONS);
  if (process.argv.includes('--dry')) {
    // Generate only: writes the SVGs to the given folder (default: build/tech-logos) for review.
    const out = path.resolve(process.argv[process.argv.indexOf('--dry') + 1] || path.join(ROOT, 'build/tech-logos'));
    fs.mkdirSync(out, { recursive: true });
    keys.forEach((key) => ['default', 'hover'].forEach((v) => fs.writeFileSync(path.join(out, `${v}-${key}.svg`), logoSvg(key, v))));
    console.log(`${keys.length * 2} SVGs written to ${out}`);
    return;
  }
  const manifest = {};
  const failures = [];
  for (const key of keys) {
    try {
      const entry = {};
      for (const variant of ['default', 'hover']) entry[variant] = await upload(logoSvg(key, variant), variant, key);
      manifest[key] = entry;
      console.log(`ok   ${key}`);
    } catch (err) {
      failures.push(key);
      console.log(`FAIL ${key}: ${err.message}`);
    }
  }
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n${Object.keys(manifest).length}/${keys.length} logos uploaded. Manifest: src/data/techLogoAssets.json`);
  if (failures.length) process.exit(1);
})();
