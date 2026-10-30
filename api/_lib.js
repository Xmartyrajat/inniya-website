// Shared helpers for INNIYA API routes.
// Storage: Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production),
// local files in .data/ for development, read-only seed data otherwise.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SEED_DIR = path.join(ROOT, 'data');
const LOCAL_DIR = path.join(ROOT, '.data');

export const CATEGORIES = ['food', 'fashion', 'home', 'lifestyle'];
export const ORDER_STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const isLocal = () => !process.env.VERCEL && !hasBlob();
export const storageMode = () => (hasBlob() ? 'blob' : isLocal() ? 'local' : 'readonly');

async function readSeed(name) {
  try { return JSON.parse(await fs.readFile(path.join(SEED_DIR, name + '.json'), 'utf8')); }
  catch { return null; }
}

export async function readData(name, fallback) {
  const mode = storageMode();
  if (mode === 'blob') {
    const { get } = await import('@vercel/blob');
    try {
      const res = await get(`data/${name}.json`, { access: 'private', useCache: false });
      if (res && res.statusCode === 200) {
        const text = await new Response(res.stream).text();
        return JSON.parse(text);
      }
    } catch (e) {
      if (!/not found/i.test(String(e && e.message))) console.error('readData', name, e);
    }
    return (await readSeed(name)) ?? fallback;
  }
  if (mode === 'local') {
    try { return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, name + '.json'), 'utf8')); }
    catch { return (await readSeed(name)) ?? fallback; }
  }
  return (await readSeed(name)) ?? fallback;
}

export async function writeData(name, value) {
  const mode = storageMode();
  const body = JSON.stringify(value, null, 2);
  if (mode === 'blob') {
    const { put } = await import('@vercel/blob');
    await put(`data/${name}.json`, body, {
      access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
    });
    return;
  }
  if (mode === 'local') {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_DIR, name + '.json'), body);
    return;
  }
  const err = new Error('Storage is not connected yet. Connect a Vercel Blob store to this project.');
  err.status = 503;
  throw err;
}

export async function saveImage(filename, buffer, contentType) {
  const safe = String(filename || 'image').toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(-60);
  const key = `products/${Date.now()}-${safe}`;
  const mode = storageMode();
  if (mode === 'blob') {
    const { put } = await import('@vercel/blob');
    const out = await put(key, buffer, { access: 'public', contentType, addRandomSuffix: true });
    return out.url;
  }
  if (mode === 'local') {
    const dir = path.join(LOCAL_DIR, 'uploads');
    await fs.mkdir(dir, { recursive: true });
    const name = key.replace('/', '_');
    await fs.writeFile(path.join(dir, name), buffer);
    return `/.data/uploads/${name}`;
  }
  const err = new Error('Storage is not connected yet. Connect a Vercel Blob store to this project.');
  err.status = 503;
  throw err;
}

// ---------- Defaults ----------
export const DEFAULT_SETTINGS = {
  whatsapp: '917482033299',
  instagram: 'inniya_official',
  announcement: 'INNIYA Food is now live · Delivering across India',
  categories: { food: true, fashion: false, home: false, lifestyle: false },
};

export async function getSettings() {
  const s = await readData('settings', DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...s, categories: { ...DEFAULT_SETTINGS.categories, ...(s && s.categories) } };
}

// ---------- HTTP helpers ----------
export function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

export async function readBody(req) {
  if (req.body !== undefined && req.body !== null && req.body !== '') {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
    if (Buffer.isBuffer(req.body)) { try { return JSON.parse(req.body.toString('utf8')); } catch { return {}; } }
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 6 * 1024 * 1024) throw Object.assign(new Error('Request too large'), { status: 413 });
    chunks.push(c);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return {}; }
}

export function handle(fn) {
  return async (req, res) => {
    try { await fn(req, res); }
    catch (e) {
      const status = e.status || 500;
      if (status >= 500) console.error(e);
      send(res, status, { error: status >= 500 && !e.status ? 'Something went wrong. Please try again.' : e.message });
    }
  };
}

export function bad(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

// ---------- Admin auth (signed cookie) ----------
const COOKIE = 'inniya_admin';
const secret = () => crypto.createHash('sha256').update('inniya-admin:' + (process.env.ADMIN_PASSWORD || '')).digest();

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  return `${data}.${mac}`;
}
function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [data, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  const a = Buffer.from(mac); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}
function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
const secureFlag = () => (process.env.VERCEL ? '; Secure' : '');

export function adminConfigured() { return !!process.env.ADMIN_PASSWORD; }

export function checkPassword(pw) {
  if (!adminConfigured()) return false;
  const a = crypto.createHash('sha256').update(String(pw || '')).digest();
  const b = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

export function loginCookie() {
  const days = 7;
  const token = sign({ role: 'admin', exp: Date.now() + days * 864e5 });
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${days * 86400}${secureFlag()}`;
}
export function logoutCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureFlag()}`;
}
export function requireAdmin(req) {
  if (!adminConfigured()) throw bad('Admin is not set up yet. Add ADMIN_PASSWORD in Vercel project settings.', 503);
  if (!verify(cookies(req)[COOKIE])) throw bad('Please log in again.', 401);
}

// ---------- Validation helpers ----------
export const str = (v, max = 500) => String(v ?? '').trim().slice(0, max);
export const num = (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };
export const slugify = (s) => str(s, 120).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
export const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
