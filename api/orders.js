import { handle, send, readBody, readData, writeData, getSettings, bad, str, newId } from './_lib.js';

export default handle(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const body = await readBody(req);
  if (body.website) return send(res, 200, { ok: true }); // honeypot

  const c = body.customer || {};
  const customer = {
    name: str(c.name, 80),
    phone: str(c.phone, 20).replace(/[^\d+]/g, ''),
    address: str(c.address, 300),
    city: str(c.city, 60),
    pincode: str(c.pincode, 10).replace(/\D/g, ''),
    note: str(c.note, 300),
  };
  if (customer.name.length < 2) throw bad('Please enter your name.');
  const digits = customer.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) throw bad('Please enter a valid phone number.');
  if (customer.address.length < 5) throw bad('Please enter your delivery address.');
  if (customer.city.length < 2) throw bad('Please enter your city.');
  if (!/^\d{6}$/.test(customer.pincode)) throw bad('Please enter a 6-digit PIN code.');

  const settings = await getSettings();
  const products = await readData('products', []);
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = [];
  for (const it of Array.isArray(body.items) ? body.items.slice(0, 50) : []) {
    const p = byId.get(String(it.id));
    const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
    if (!p || p.active === false) continue;
    if (!settings.categories[p.category]) continue;
    if (p.inStock === false) throw bad(`${p.name} is out of stock. Please remove it from your cart.`);
    items.push({ id: p.id, name: p.name, unit: p.unit || '', price: p.price, qty, lineTotal: Math.round(p.price * qty * 100) / 100 });
  }
  if (!items.length) throw bad('Your cart is empty.');
  const total = Math.round(items.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;

  const orders = await readData('orders', []);
  const maxNo = orders.reduce((m, o) => Math.max(m, o.no || 1000), 1000);
  const order = {
    id: newId('ord'), no: maxNo + 1, number: `INN-${maxNo + 1}`,
    createdAt: new Date().toISOString(), status: 'new', customer, items, total,
  };
  orders.unshift(order);
  await writeData('orders', orders);
  send(res, 201, { ok: true, order: { number: order.number, items, total, customer } });
});
