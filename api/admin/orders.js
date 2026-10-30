import { handle, send, readBody, readData, writeData, requireAdmin, bad, ORDER_STATUSES } from '../_lib.js';

export default handle(async (req, res) => {
  requireAdmin(req);
  const orders = await readData('orders', []);
  if (req.method === 'GET') return send(res, 200, { orders, statuses: ORDER_STATUSES });
  if (req.method === 'PATCH') {
    const { id, status } = await readBody(req);
    if (!ORDER_STATUSES.includes(status)) throw bad('Unknown status.');
    const o = orders.find((x) => x.id === id);
    if (!o) throw bad('Order not found.', 404);
    o.status = status;
    o.updatedAt = new Date().toISOString();
    await writeData('orders', orders);
    return send(res, 200, { order: o });
  }
  send(res, 405, { error: 'Method not allowed' });
});
