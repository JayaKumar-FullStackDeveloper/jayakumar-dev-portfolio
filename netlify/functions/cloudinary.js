/* Netlify Function: signed Cloudinary uploads for the portfolio admin.
 *
 * POST /.netlify/functions/cloudinary   Authorization: Bearer <Firebase ID token>
 *   { action: 'sign',   resourceType: 'image' | 'video' }        -> upload signature
 *   { action: 'verify', resourceType, publicId }                -> checked asset metadata (bad uploads are deleted)
 *   { action: 'delete', resourceType, publicId }                -> removes an asset in the portfolio folder
 *
 * Every request must carry a valid Firebase ID token for this project whose user has an
 * active admins/{uid} record. The record is read through the Firestore REST API with the
 * caller's own token, so Firestore Security Rules decide (no service account needed).
 *
 * Server-side environment (Netlify → Site configuration → Environment variables):
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *   FIREBASE_PROJECT_ID (falls back to REACT_APP_FIREBASE_PROJECT_ID)
 *   CLOUDINARY_FOLDER (optional, default "portfolio")
 * No dependencies: Node's crypto and fetch only.
 */
const crypto = require('crypto');

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const LIMITS = {
  image: { maxBytes: 10 * 1024 * 1024, formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'] },
  video: { maxBytes: 100 * 1024 * 1024, formats: ['mp4', 'webm', 'mov'] },
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

const base64UrlJson = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

// Cloudinary signature: SHA-1 of the sorted "key=value" params joined with "&", followed by the API secret.
function cloudinarySignature(params, apiSecret) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(payload + apiSecret).digest('hex');
}

function createHandler({ fetch = globalThis.fetch, env = process.env, now = () => Date.now() } = {}) {
  let jwksCache = { keys: null, expires: 0 };

  async function getJwks() {
    if (jwksCache.keys && jwksCache.expires > now()) return jwksCache.keys;
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new HttpError(503, 'Could not reach the sign-in service.');
    const maxAge = Number(/max-age=(\d+)/.exec(res.headers?.get?.('cache-control') || '')?.[1] || 3600);
    jwksCache = { keys: (await res.json()).keys, expires: now() + maxAge * 1000 };
    return jwksCache.keys;
  }

  async function verifyIdToken(token, projectId) {
    const parts = (token || '').split('.');
    if (parts.length !== 3) throw new HttpError(401, 'Sign in again to continue.');
    let header;
    let payload;
    try {
      header = base64UrlJson(parts[0]);
      payload = base64UrlJson(parts[1]);
    } catch {
      throw new HttpError(401, 'Sign in again to continue.');
    }
    if (header.alg !== 'RS256') throw new HttpError(401, 'Sign in again to continue.');

    const jwk = (await getJwks()).find((key) => key.kid === header.kid);
    if (!jwk) throw new HttpError(401, 'Sign in again to continue.');
    const valid = crypto.verify(
      'RSA-SHA256',
      Buffer.from(`${parts[0]}.${parts[1]}`),
      crypto.createPublicKey({ key: jwk, format: 'jwk' }),
      Buffer.from(parts[2], 'base64url')
    );
    const seconds = now() / 1000;
    if (
      !valid ||
      payload.aud !== projectId ||
      payload.iss !== `https://securetoken.google.com/${projectId}` ||
      typeof payload.sub !== 'string' ||
      !payload.sub ||
      payload.exp <= seconds ||
      payload.iat > seconds + 300
    ) {
      throw new HttpError(401, 'Sign in again to continue.');
    }
    return payload.sub;
  }

  async function assertActiveAdmin(uid, token, projectId) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${encodeURIComponent(uid)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new HttpError(403, 'This account does not have admin access.');
    const fields = (await res.json()).fields || {};
    if (fields.role?.stringValue !== 'admin' || fields.active?.booleanValue !== true) {
      throw new HttpError(403, 'This account does not have admin access.');
    }
  }

  return async function handler(event) {
    try {
      if (event.httpMethod !== 'POST') throw new HttpError(405, 'Method not allowed.');

      const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
      const cloudName = env.CLOUDINARY_CLOUD_NAME;
      const apiKey = env.CLOUDINARY_API_KEY;
      const apiSecret = env.CLOUDINARY_API_SECRET;
      const folder = env.CLOUDINARY_FOLDER || 'portfolio';
      if (!projectId || !cloudName || !apiKey || !apiSecret) {
        throw new HttpError(500, 'Uploads are not configured on the server yet.');
      }

      const token = (event.headers?.authorization || event.headers?.Authorization || '').replace(/^Bearer\s+/i, '');
      const uid = await verifyIdToken(token, projectId);
      await assertActiveAdmin(uid, token, projectId);

      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        throw new HttpError(400, 'Invalid request.');
      }
      const limits = LIMITS[body.resourceType];
      if (!limits) throw new HttpError(400, 'Unsupported media type.');

      const inFolder = (publicId) =>
        typeof publicId === 'string' && publicId.startsWith(`${folder}/`) && !publicId.includes('..') && publicId.length <= 255;

      if (body.action === 'sign') {
        const params = {
          allowed_formats: limits.formats.join(','),
          folder,
          timestamp: Math.floor(now() / 1000),
        };
        return json(200, {
          cloudName,
          apiKey,
          ...params,
          signature: cloudinarySignature(params, apiSecret),
        });
      }

      if (!inFolder(body.publicId)) throw new HttpError(400, 'Invalid asset.');
      const basicAuth = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;
      const destroy = async () => {
        const params = { public_id: body.publicId, timestamp: Math.floor(now() / 1000) };
        const form = new URLSearchParams({ ...params, api_key: apiKey, signature: cloudinarySignature(params, apiSecret) });
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${body.resourceType}/destroy`, {
          method: 'POST',
          body: form,
        });
        const result = res.ok ? await res.json() : {};
        return result.result === 'ok' || result.result === 'not found';
      };

      if (body.action === 'verify') {
        const path = body.publicId.split('/').map(encodeURIComponent).join('/');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/${body.resourceType}/upload/${path}`, {
          headers: { Authorization: basicAuth },
        });
        if (!res.ok) throw new HttpError(404, 'The uploaded file was not found.');
        const asset = await res.json();
        const problem =
          asset.bytes > limits.maxBytes
            ? `File is too large (max ${limits.maxBytes / 1024 / 1024} MB).`
            : !limits.formats.includes(String(asset.format).toLowerCase())
              ? 'This file type is not allowed.'
              : null;
        if (problem) {
          await destroy();
          throw new HttpError(422, problem);
        }
        return json(200, {
          publicId: asset.public_id,
          url: asset.secure_url,
          format: asset.format,
          bytes: asset.bytes,
          width: asset.width ?? null,
          height: asset.height ?? null,
          duration: asset.duration ?? null,
        });
      }

      if (body.action === 'delete') {
        if (!(await destroy())) throw new HttpError(502, 'Cloudinary could not delete the file. Try again.');
        return json(200, { deleted: true });
      }

      throw new HttpError(400, 'Unknown action.');
    } catch (err) {
      if (err instanceof HttpError) return json(err.status, { error: err.message });
      console.error('cloudinary function error', err);
      return json(500, { error: 'Something went wrong. Try again.' });
    }
  };
}

exports.handler = createHandler();
exports.createHandler = createHandler;
exports.cloudinarySignature = cloudinarySignature;
exports.LIMITS = LIMITS;
