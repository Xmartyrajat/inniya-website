import { handle, send, readBody, requireAdmin, saveImage, bad } from '../_lib.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export default handle(async (req, res) => {
  requireAdmin(req);
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const { filename, dataUrl } = await readBody(req);
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(dataUrl || ''));
  if (!m) throw bad('Please upload a JPG, PNG or WebP image.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4 * 1024 * 1024) throw bad('Image is too large (max 4 MB).');
  const name = String(filename || 'product').replace(/\.[a-z0-9]+$/i, '') + '.' + TYPES[m[1]];
  const url = await saveImage(name, buf, m[1]);
  send(res, 201, { url });
});
