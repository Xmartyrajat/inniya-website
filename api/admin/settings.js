import { handle, send, readBody, writeData, getSettings, requireAdmin, str, CATEGORIES } from '../_lib.js';

export default handle(async (req, res) => {
  requireAdmin(req);
  const current = await getSettings();
  if (req.method === 'GET') return send(res, 200, { settings: current });
  if (req.method !== 'PUT') return send(res, 405, { error: 'Method not allowed' });
  const b = await readBody(req);
  const categories = { ...current.categories };
  if (b.categories) for (const c of CATEGORIES) if (c in b.categories) categories[c] = !!b.categories[c];
  const next = {
    ...current,
    announcement: b.announcement !== undefined ? str(b.announcement, 160) : current.announcement,
    whatsapp: b.whatsapp !== undefined ? (str(b.whatsapp, 15).replace(/\D/g, '') || current.whatsapp) : current.whatsapp,
    instagram: b.instagram !== undefined ? (str(b.instagram, 40).replace(/[^\w.]/g, '') || current.instagram) : current.instagram,
    categories,
  };
  await writeData('settings', next);
  send(res, 200, { settings: next });
});
