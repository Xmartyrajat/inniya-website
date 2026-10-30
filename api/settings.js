import { handle, send, getSettings } from './_lib.js';

export default handle(async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  const s = await getSettings();
  send(res, 200, { settings: s }, { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=120' });
});
