import { handle, send, readBody, checkPassword, loginCookie, adminConfigured, bad } from '../_lib.js';

export default handle(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!adminConfigured()) throw bad('Admin is not set up yet. Add ADMIN_PASSWORD in Vercel project settings.', 503);
  const { password } = await readBody(req);
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600));
    throw bad('Wrong password.', 401);
  }
  send(res, 200, { ok: true }, { 'Set-Cookie': loginCookie() });
});
