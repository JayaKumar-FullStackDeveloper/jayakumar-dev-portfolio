// Run with: npm run test:functions (kept outside netlify/functions so it is never deployed)
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const { createHandler, cloudinarySignature } = require('../functions/cloudinary');

const PROJECT = 'portfolio-test';
const NOW = 1_800_000_000_000;
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256' };

function makeToken(overrides = {}, key = privateKey) {
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const header = enc({ alg: 'RS256', kid: 'k1' });
  const payload = enc({
    aud: PROJECT,
    iss: `https://securetoken.google.com/${PROJECT}`,
    sub: 'admin-uid',
    iat: NOW / 1000 - 10,
    exp: NOW / 1000 + 3600,
    ...overrides,
  });
  const signature = crypto.sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), key).toString('base64url');
  return `${header}.${payload}.${signature}`;
}

const env = {
  FIREBASE_PROJECT_ID: PROJECT,
  CLOUDINARY_CLOUD_NAME: 'demo',
  CLOUDINARY_API_KEY: 'key123',
  CLOUDINARY_API_SECRET: 'secret456',
};

const response = (body, ok = true, status = 200) => ({ ok, status, json: async () => body, headers: { get: () => 'max-age=600' } });

function setup({ adminFields = { role: { stringValue: 'admin' }, active: { booleanValue: true } }, asset } = {}) {
  const calls = [];
  const fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.includes('securetoken')) return response({ keys: [jwk] });
    if (url.includes('firestore.googleapis.com')) return adminFields ? response({ fields: adminFields }) : response({}, false, 403);
    if (url.includes('/resources/')) return response(asset);
    if (url.endsWith('/destroy')) return response({ result: 'ok' });
    throw new Error(`unexpected fetch ${url}`);
  };
  return { handler: createHandler({ fetch, env, now: () => NOW }), calls };
}

const call = (handler, body, token = makeToken()) =>
  handler({ httpMethod: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(body) }).then((r) => ({
    status: r.statusCode,
    body: JSON.parse(r.body),
  }));

test('rejects requests without a valid token', async () => {
  const { handler } = setup();
  assert.equal((await call(handler, { action: 'sign', resourceType: 'image' }, '')).status, 401);
  const otherKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
  assert.equal((await call(handler, { action: 'sign', resourceType: 'image' }, makeToken({}, otherKey))).status, 401);
  assert.equal((await call(handler, { action: 'sign', resourceType: 'image' }, makeToken({ aud: 'other-project' }))).status, 401);
  assert.equal((await call(handler, { action: 'sign', resourceType: 'image' }, makeToken({ exp: NOW / 1000 - 1 }))).status, 401);
});

test('rejects signed-in users without an active admin record', async () => {
  assert.equal((await call(setup({ adminFields: null }).handler, { action: 'sign', resourceType: 'image' })).status, 403);
  const inactive = { role: { stringValue: 'admin' }, active: { booleanValue: false } };
  assert.equal((await call(setup({ adminFields: inactive }).handler, { action: 'sign', resourceType: 'image' })).status, 403);
});

test('admin check uses the caller token against Firestore', async () => {
  const { handler, calls } = setup();
  const token = makeToken();
  await call(handler, { action: 'sign', resourceType: 'image' }, token);
  const firestoreCall = calls.find((c) => c.url.includes('firestore.googleapis.com'));
  assert.match(firestoreCall.url, /\/admins\/admin-uid$/);
  assert.equal(firestoreCall.options.headers.Authorization, `Bearer ${token}`);
});

test('signs uploads into the portfolio folder without exposing the secret', async () => {
  const { status, body } = await call(setup().handler, { action: 'sign', resourceType: 'image' });
  assert.equal(status, 200);
  assert.equal(body.folder, 'portfolio');
  assert.equal(body.allowed_formats, 'jpg,jpeg,png,webp,avif,gif');
  assert.equal(
    body.signature,
    cloudinarySignature({ allowed_formats: body.allowed_formats, folder: 'portfolio', timestamp: body.timestamp }, 'secret456')
  );
  assert.ok(!JSON.stringify(body).includes('secret456'));
});

test('verify deletes oversized uploads and returns metadata for valid ones', async () => {
  const big = setup({ asset: { public_id: 'portfolio/a', bytes: 11 * 1024 * 1024, format: 'png' } });
  const rejected = await call(big.handler, { action: 'verify', resourceType: 'image', publicId: 'portfolio/a' });
  assert.equal(rejected.status, 422);
  assert.ok(big.calls.some((c) => c.url.endsWith('/image/destroy')));

  const ok = setup({ asset: { public_id: 'portfolio/b', secure_url: 'https://res.cloudinary.com/demo/image/upload/b.png', bytes: 1000, format: 'png', width: 10, height: 20 } });
  const accepted = await call(ok.handler, { action: 'verify', resourceType: 'image', publicId: 'portfolio/b' });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.url, 'https://res.cloudinary.com/demo/image/upload/b.png');
});

test('refuses to touch assets outside the portfolio folder', async () => {
  const { handler, calls } = setup();
  for (const publicId of ['other/x', 'portfolio/../secret', '']) {
    assert.equal((await call(handler, { action: 'delete', resourceType: 'image', publicId })).status, 400);
  }
  assert.ok(!calls.some((c) => c.url.endsWith('/destroy')));
});

test('only POST is accepted', async () => {
  const res = await setup().handler({ httpMethod: 'GET', headers: {} });
  assert.equal(res.statusCode, 405);
});
