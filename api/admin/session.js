import { handle, send, requireAdmin, storageMode } from '../_lib.js';

export default handle(async (req, res) => {
  requireAdmin(req);
  send(res, 200, { ok: true, storage: storageMode() });
});
