# INNIYA website

**A Better Choice, Every Day.** The website for INNIYA: food is live now, and fashion, home and lifestyle are coming soon.

- Static site: `index.html`, `styles.css`, `assets/site.js`
- 3D hero built with [Three.js](https://threejs.org): source in `src/hero.js`, bundled to `assets/hero.js`
- Orders go through WhatsApp: +91 74820 33299
- Instagram: [@inniya_official](https://instagram.com/inniya_official)

## Edit and rebuild

```bash
npm install
npm run bundle   # rebuilds assets/hero.js after changing src/hero.js
npm run dev      # local preview
```

Deployed on Vercel. Every push to `main` deploys automatically.
