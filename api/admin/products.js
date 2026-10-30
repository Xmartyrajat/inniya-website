import { handle, send, readBody, readData, writeData, requireAdmin, bad, str, num, slugify, newId, CATEGORIES } from '../_lib.js';

function clean(input, existing = {}) {
  const name = str(input.name ?? existing.name, 120);
  if (name.length < 2) throw bad('Product name is required.');
  const category = CATEGORIES.includes(input.category) ? input.category : (existing.category || 'food');
  const price = num(input.price ?? existing.price);
  if (price === null || price <= 0) throw bad('Enter a valid price.');
  const mrpRaw = input.mrp ?? existing.mrp;
  const mrp = mrpRaw === '' || mrpRaw === null || mrpRaw === undefined ? null : num(mrpRaw);
  return {
    name,
    category,
    price,
    mrp: mrp && mrp > price ? mrp : null,
    unit: str(input.unit ?? existing.unit, 40),
    description: str(input.description ?? existing.description, 2000),
    image: str(input.image ?? existing.image, 600),
    inStock: input.inStock === undefined ? existing.inStock !== false : !!input.inStock,
    featured: input.featured === undefined ? !!existing.featured : !!input.featured,
    active: input.active === undefined ? existing.active !== false : !!input.active,
  };
}

export default handle(async (req, res) => {
  requireAdmin(req);
  const products = await readData('products', []);

  if (req.method === 'GET') return send(res, 200, { products });

  const body = req.method === 'DELETE' ? {} : await readBody(req);
  const url = new URL(req.url, 'http://x');
  const id = url.searchParams.get('id') || body.id;

  if (req.method === 'POST') {
    const data = clean(body);
    const now = new Date().toISOString();
    let slug = slugify(data.name);
    while (products.some((p) => p.slug === slug)) slug += '-' + Math.random().toString(36).slice(2, 5);
    const product = { id: newId('prd'), slug, ...data, createdAt: now, updatedAt: now };
    products.unshift(product);
    await writeData('products', products);
    return send(res, 201, { product });
  }

  const idx = products.findIndex((p) => p.id === id);
  if (idx < 0) throw bad('Product not found.', 404);

  if (req.method === 'PUT') {
    products[idx] = { ...products[idx], ...clean(body, products[idx]), updatedAt: new Date().toISOString() };
    await writeData('products', products);
    return send(res, 200, { product: products[idx] });
  }
  if (req.method === 'DELETE') {
    const [removed] = products.splice(idx, 1);
    await writeData('products', products);
    return send(res, 200, { ok: true, id: removed.id });
  }
  send(res, 405, { error: 'Method not allowed' });
});
