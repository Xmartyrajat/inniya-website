import { handle, send, storageMode } from './_lib.js';

// Serves product photos from the private Blob store.
export default handle(async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  const p = new URL(req.url, 'http://x').searchParams.get('p') || '';
  if (!/^products\/[\w.\-]+$/.test(p) || storageMode() !== 'blob') return send(res, 404, { error: 'Not found' });
  const { get } = await import('@vercel/blob');
  let out;
  try { out = await get(p, { access: 'private' }); } catch { out = null; }
  if (!out || out.statusCode !== 200) return send(res, 404, { error: 'Not found' });
  res.statusCode = 200;
  res.setHeader('Content-Type', out.blob?.contentType || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable');
  const buf = Buffer.from(await new Response(out.stream).arrayBuffer());
  res.end(buf);
});
