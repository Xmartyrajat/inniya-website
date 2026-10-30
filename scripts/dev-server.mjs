// Local preview: static files + /api routes, mimicking Vercel (cleanUrls + rewrites).
// Usage: ADMIN_PASSWORD=test npm run dev
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml' };

async function exists(p) { try { return (await fs.stat(p)).isFile(); } catch { return false; } }

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let p = decodeURIComponent(url.pathname);
  if (p.startsWith('/api/')) {
    const file = path.join(ROOT, p + '.js');
    if (!(await exists(file))) { res.statusCode = 404; return res.end('{"error":"Not found"}'); }
    const mod = await import(pathToFileURL(file).href);
    return mod.default(req, res);
  }
  if (p.startsWith('/product/')) p = '/product.html';
  let file = path.join(ROOT, p);
  if (p === '/') file = path.join(ROOT, 'index.html');
  else if (!path.extname(p)) file = path.join(ROOT, p + '.html');
  if (!(await exists(file))) { res.statusCode = 404; file = path.join(ROOT, '404.html'); }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  res.end(await fs.readFile(file));
}).listen(PORT, () => console.log('INNIYA dev server on http://localhost:' + PORT));
