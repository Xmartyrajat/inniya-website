# INNIYA website

**A Better Choice, Every Day.** Online store for INNIYA. Food is live now; Fashion, Home and Lifestyle are coming soon.

## Pages
`/` home (3D hero) · `/shop` · `/product/<name>` · `/cart` (checkout → WhatsApp) · `/about` · `/contact` ·
`/fashion` `/home-decor` `/lifestyle` (coming soon until switched on) · `/shipping-returns` `/privacy` `/terms` · `/admin`

## Admin (`/admin`)
- **Orders:** every order placed on the site, with customer details, items, total and status (New → Confirmed → Shipped → Delivered / Cancelled). There's a one-tap WhatsApp button for each customer.
- **Products:** add, edit or delete products, upload photos, set price/MRP, mark out of stock, feature on the home page, hide.
- **Settings:** switch categories live, edit the announcement bar, WhatsApp number and Instagram.

### Production setup (Vercel)
1. **Environment variable:** `ADMIN_PASSWORD`, your admin password.
2. **Storage:** Project › Storage › create/connect a **Blob** store. This adds `BLOB_READ_WRITE_TOKEN`. Products, orders and settings are saved there.
3. Redeploy.

## Develop
```bash
npm install
ADMIN_PASSWORD=test npm run dev   # http://localhost:3000 (saves data to .data/)
npm run pages                     # regenerate HTML pages from scripts/build-pages.mjs
npm run bundle                    # rebuild the 3D hero from src/hero.js
```
Edit shared header/footer and page text in `scripts/build-pages.mjs`, then run `npm run pages`.
