import { handle, send, logoutCookie } from '../_lib.js';

export default handle(async (req, res) => {
  send(res, 200, { ok: true }, { 'Set-Cookie': logoutCookie() });
});
