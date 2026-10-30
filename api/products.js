import { handle, send, readData } from './_lib.js';

export default handle(async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  const all = await readData('products', []);
  const products = all
    .filter((p) => p.active !== false)
    .map(({ id, slug, name, category, price, mrp, unit, description, image, inStock, featured }) =>
      ({ id, slug, name, category, price, mrp, unit, description, image, inStock, featured }));
  send(res, 200, { products }, { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=120' });
});
