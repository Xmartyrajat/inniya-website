// Generates every public page from shared layout pieces.
// Run: npm run pages
import fs from 'node:fs/promises';

const WA = '917482033299';
const wa = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
const YEAR = 2026;

const CATS = [
  { key: 'food', name: 'Food & Grocery', short: 'Food', href: '/shop', soon: null, img: '/assets/img/products/gur-wide.jpg', line: 'Pantry staples, snacks and everyday food, picked better.' },
  { key: 'fashion', name: 'Fashion', short: 'Fashion', href: '/fashion', img: '/assets/img/cat-fashion.jpg', line: 'For your Monday outfit and beyond.' },
  { key: 'home', name: 'Home & Living', short: 'Home', href: '/home-decor', img: '/assets/img/cat-home.jpg', line: 'For slow Sundays at home.' },
  { key: 'lifestyle', name: 'Lifestyle', short: 'Lifestyle', href: '/lifestyle', img: '/assets/img/cat-lifestyle.jpg', line: 'For everything in between.' },
  { key: 'essentials', name: 'Everyday Essentials', short: 'Essentials', href: '/essentials', img: '/assets/img/cat-essentials.jpg', line: 'The little things you reach for every day.' },
];

// Simple line icons (24px grid, stroke = currentColor)
const sv = (d, size = 22) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  truck: '<path d="M2 6h11v9H2z"/><path d="M13 9h4l3 3v3h-7"/><circle cx="6" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  box: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
  returns: '<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  cart: '<path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  food: '<path d="M5 10h14l-1.5 9h-11z"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  shirt: '<path d="M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  basket: '<path d="M4 9h16l-2 11H6z"/><path d="M9 9l3-5 3 5"/><path d="M9 13v4M15 13v4"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.4A8.5 8.5 0 1 1 21 11.5z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a5 5 0 0 1-2.8-2.8l.9-1-1-2z"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  arrowL: '<path d="M15 5l-7 7 7 7"/>',
  arrowR: '<path d="M9 5l7 7-7 7"/>',
};
const catIcon = { food: I.food, fashion: I.shirt, home: I.home, lifestyle: I.spark, essentials: I.basket };

const leafMark = `<svg class="logo__leaf" viewBox="0 0 48 40" aria-hidden="true"><path d="M23 38C10 36 3 26 5 6c12 3 19 13 18 32z" fill="#B08A3E"/><path d="M25 38C38 36 45 26 43 4 31 7 24 18 25 38z" fill="#0F4D2E"/><path d="M24 37c-1-9-5-16-12-22M24 37c1-10 5-17 13-24" stroke="#F7F3EA" stroke-width="1.2" fill="none" opacity=".55"/></svg>`;
const logo = (cls = '') => `<a class="logo ${cls}" href="/" aria-label="INNIYA home">${leafMark}<span class="logo__text"><span class="logo__name">INNIYA</span><span class="logo__tag">A better choice, every day.</span></span></a>`;

function head({ title, description }) {
  const full = title ? `${title} · INNIYA` : 'INNIYA — A Better Choice, Every Day.';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${full}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#0F4D2E">
  <meta property="og:title" content="${full}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="/assets/img/hero-food.jpg">
  <meta property="og:type" content="website">
  <link rel="icon" type="image/png" href="/assets/logo.png">
  <link rel="apple-touch-icon" href="/assets/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <script>document.documentElement.classList.add('js')</script>
</head>`;
}

function header(active) {
  const cur = (k) => (active === k ? ' aria-current="page"' : '');
  return `<body data-page="${active}">
  <a class="skip" href="#main">Skip to content</a>
  <a class="festbar" href="/product/bihari-mahaprasad-thekuwaa">
    <img src="/assets/img/products/thekuwa.jpg" alt="" width="40" height="40">
    <span class="festbar__text"><b>छठ महापर्व · Chhath Mahaprasad Thekuwaa</b><span class="festbar__sep" aria-hidden="true">·</span><span>Ghat se Ghar tak</span><span class="festbar__sep" aria-hidden="true">·</span><span>Booking open till <b>20 November</b></span></span>
    <span class="festbar__cta">Book now →</span>
  </a>
  <div class="topbar">
    <div class="wrap topbar__inner">
      <ul class="topbar__perks">
        <li>${sv(I.truck, 18)}<span data-announcement>Delivering across India</span></li>
        <li class="hide-sm">${sv(I.shield, 18)}Quality assured</li>
        <li class="hide-sm">${sv(I.check, 18)}Easy returns</li>
      </ul>
      <ul class="topbar__links">
        <li><a href="/track">${sv(I.pin, 16)}Track order</a></li>
        <li><a data-wa="Hi INNIYA, I need help." href="${wa('Hi INNIYA, I need help.')}" target="_blank" rel="noopener">${sv(I.headset, 16)}Support</a></li>
      </ul>
    </div>
  </div>

  <header class="header" id="top">
    <div class="wrap header__main">
      <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="catnav" aria-label="Open menu">${sv(I.menu)}</button>
      ${logo()}
      <form class="search" action="/shop" method="get" role="search">
        <label class="sr-only" for="q">Search products</label>
        <input id="q" name="q" type="search" placeholder="Search for products, categories and more…" autocomplete="off">
        <button type="submit" aria-label="Search">${sv(I.search, 20)}</button>
      </form>
      <nav class="header__actions" aria-label="Account">
        <a class="hact hide-md" href="/track">${sv(I.user, 24)}<span><small>My orders</small>Track order</span></a>
        <a class="hact" href="/wishlist" aria-label="Wishlist" data-wish-btn>${sv(I.heart, 24)}<span class="hide-md">Wishlist</span><b class="count" data-wish-count hidden>0</b></a>
        <a class="hact" href="/cart" aria-label="Cart, 0 items" data-cart-btn>${sv(I.cart, 26)}<b class="count" data-cart-count hidden>0</b></a>
      </nav>
    </div>
    <div class="catbar">
      <nav class="wrap catbar__inner" id="catnav" aria-label="Categories">
        <a class="catbar__all" href="/shop"${cur('shop')}>${sv(I.menu, 20)}All categories</a>
        ${CATS.map((c) => `<a class="catbar__link" href="${c.href}" data-cat-link="${c.key}"${cur(c.key)}>${sv(catIcon[c.key], 22)}<span>${c.name}</span><em data-soon>Soon</em></a>`).join('\n        ')}
        <a class="catbar__deals" href="/shop?deals=1">${sv(I.tag, 20)}Deals &amp; offers</a>
        <div class="catbar__mobile-extra">
          <a href="/about">Our story</a><a href="/contact">Contact</a><a href="/track">Track order</a>
        </div>
      </nav>
    </div>
  </header>`;
}

const trust = `
    <section class="trust" aria-label="Why shop with INNIYA">
      <div class="wrap trust__inner">
        <div class="trust__item">${sv(I.truck, 34)}<p>Pan India<br>delivery</p></div>
        <div class="trust__item">${sv(I.shield, 34)}<p>Assured<br>quality</p></div>
        <div class="trust__item">${sv(I.box, 34)}<p>Secure<br>packaging</p></div>
        <div class="trust__item">${sv(I.returns, 34)}<p>Easy<br>returns</p></div>
        <div class="trust__item">${sv(I.headset, 34)}<p>Dedicated<br>support</p></div>
      </div>
    </section>`;

function footer() {
  return `
  <footer class="footer">
    <div class="footer__cta">
      <div class="wrap footer__cta-inner">
        <div><h2>Be the first to know about new launches.</h2><p>Fashion, Home &amp; Living, Lifestyle and Everyday Essentials are on their way.</p></div>
        <a class="btn btn--gold" data-wa="Hi INNIYA, please tell me when new categories launch." href="${wa('Hi INNIYA, please tell me when new categories launch.')}" target="_blank" rel="noopener">${sv(I.chat, 20)}Get updates on WhatsApp</a>
      </div>
    </div>
    <div class="wrap footer__grid">
      <div class="footer__brand">
        ${logo('logo--light')}
        <p>Your destination for quality products in everyday life. Delivering across India.</p>
      </div>
      <div>
        <h2 class="footer__h">Shop</h2>
        <ul class="footer__list">${CATS.map((c) => `<li><a href="${c.href}">${c.name}</a></li>`).join('')}<li><a href="/shop?deals=1">Deals &amp; offers</a></li></ul>
      </div>
      <div>
        <h2 class="footer__h">Help</h2>
        <ul class="footer__list">
          <li><a href="/track">Track order</a></li>
          <li><a href="/shipping-returns">Shipping &amp; returns</a></li>
          <li><a href="/privacy">Privacy policy</a></li>
          <li><a href="/terms">Terms of use</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer__h">INNIYA</h2>
        <ul class="footer__list">
          <li><a href="/about">Our story</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a data-wa="Hi INNIYA!" href="${wa('Hi INNIYA!')}" target="_blank" rel="noopener">WhatsApp · +91 74820 33299</a></li>
          <li><a href="https://instagram.com/inniya_official" target="_blank" rel="noopener">Instagram · @inniya_official</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer__bottom"><p>© ${YEAR} INNIYA. All rights reserved.</p><p>Made with care in India</p></div>
  </footer>

  <a class="wa-float" data-wa="Hi INNIYA!" href="${wa('Hi INNIYA!')}" target="_blank" rel="noopener" aria-label="Chat with INNIYA on WhatsApp">${sv(I.chat, 28)}</a>
  <div class="toast" role="status" aria-live="polite" data-toast></div>
  <script src="/assets/site.js" defer></script>
  <script src="/assets/store.js" defer></script>`;
}

const end = '\n</body>\n</html>\n';
function page({ file, title, description, active, body }) {
  return { file, html: head({ title, description }) + '\n' + header(active) + '\n  <main id="main">\n' + body + '\n  </main>' + footer() + end };
}
function pageHero(crumb, title, lead) {
  return `
    <section class="page-hero">
      <div class="wrap">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>${crumb}</span></nav>
        <h1>${title}</h1>
        ${lead ? `<p class="page-hero__lead">${lead}</p>` : ''}
      </div>
    </section>`;
}

const pages = [];

// ---------------- Home ----------------
const slides = [
  {
    kicker: 'Chhath Mahaprasad', title: 'Thekuwaa', tag: 'घाट से घर तक · Ghat se Ghar tak',
    text: 'Traditional Bihari Thekuwaa, made the Mahaprasad way. Booking open till 20 November.', img: '/assets/img/products/thekuwa-wide.jpg',
    cta: ['Book Thekuwaa', '/product/bihari-mahaprasad-thekuwaa'],
  },
  {
    kicker: 'Introducing', title: 'INNIYA', tag: 'A better choice, every day.',
    text: 'Your destination for quality products in everyday life.', img: '/assets/img/hero-food.jpg',
    cta: ['Shop now', '/shop'], showCats: true,
  },
  {
    kicker: 'Now live', title: 'Bihar ka Swaad', tag: 'Food &amp; Grocery · Delivered across India',
    text: 'Bihari Makhana, Gur, Thekuwaa and Chura, straight from Bihar. Order in minutes and confirm on WhatsApp.', img: '/assets/img/products/makhana-wide.jpg',
    cta: ['Shop Food &amp; Grocery', '/shop'],
  },
  {
    kicker: 'New', title: 'Bihari Masala Range', tag: 'खेतों से घर तक · शुद्ध मसालों का असली स्वाद',
    text: 'Haldi, Lal Mirch, Dhaniya, Jeera, Garam, Sabji, Meat and Chhole Masala. 100% natural, no added colour, no preservatives.', img: '/assets/img/products/masala-range-wide.jpg',
    cta: ['Shop masalas', '/shop?q=masala'],
  },
  {
    kicker: 'Coming soon', title: 'Home &amp; Living', tag: 'Fashion · Lifestyle · Everyday Essentials',
    text: 'More of your day, the INNIYA way. Get a message the day each category opens.', img: '/assets/img/cat-home.jpg',
    cta: ['Notify me on WhatsApp', wa('Hi INNIYA, please tell me when new categories launch.')], external: true,
  },
];
pages.push(page({
  file: 'index.html', active: 'index', description: 'INNIYA: quality products for everyday life. Food & Grocery now live, delivering across India. Fashion, Home & Living, Lifestyle and Everyday Essentials coming soon.',
  body: `
    <section class="hero" aria-roledescription="carousel" aria-label="Highlights" data-carousel>
      <div class="hero__track">
        ${slides.map((s, i) => `
        <article class="slide${i === 0 ? ' is-active' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}"${i ? ' aria-hidden="true"' : ''}>
          <div class="slide__media"><img src="${s.img}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>
          <div class="wrap slide__inner">
            <div class="slide__copy">
              <p class="slide__kicker">${s.kicker}</p>
              <h${i === 0 ? '1' : '2'} class="slide__title">${s.title}</h${i === 0 ? '1' : '2'}>
              <p class="slide__tag${/[\u0900-\u097F]/.test(s.tag) ? ' slide__tag--hi' : ''}" ${/[\u0900-\u097F]/.test(s.tag) ? 'lang="hi"' : ''}>${s.tag}</p>
              <p class="slide__text">${s.text}</p>
              ${s.showCats ? `<ul class="slide__cats">${CATS.map((c) => `<li><a href="${c.href}"><span>${sv(catIcon[c.key], 24)}</span>${c.name.replace(' & ', ' &amp;<br>').replace('Everyday ', 'Everyday<br>')}</a></li>`).join('')}</ul>` : ''}
              <a class="btn btn--green" href="${s.cta[1]}"${s.external ? ' target="_blank" rel="noopener"' : ''}${i ? ' tabindex="-1"' : ''}>${s.cta[0]} <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </article>`).join('')}
      </div>
      <button class="hero__arrow hero__arrow--prev" type="button" aria-label="Previous slide" data-prev>${sv(I.arrowL, 22)}</button>
      <button class="hero__arrow hero__arrow--next" type="button" aria-label="Next slide" data-next>${sv(I.arrowR, 22)}</button>
      <div class="hero__dots" role="tablist" aria-label="Choose slide">
        ${slides.map((s, i) => `<button type="button" role="tab" aria-label="Slide ${i + 1}" aria-selected="${i === 0}" data-dot="${i}"></button>`).join('')}
      </div>
    </section>
${trust}

    <section class="section wrap" id="categories">
      <div class="section__title"><h2>Shop by Category</h2><span class="section__rule" aria-hidden="true"></span></div>
      <div class="catgrid">
        ${CATS.map((c) => `
        <a class="catcard" href="${c.href}" data-cat-card="${c.key}">
          <div class="catcard__img"><img src="${c.img}" alt="${c.name}" loading="lazy"><span class="catcard__badge" data-soon>Coming soon</span></div>
          <div class="catcard__foot"><h3>${c.name}</h3><span class="catcard__go" aria-hidden="true">${sv(I.arrowR, 16)}</span></div>
        </a>`).join('')}
      </div>
    </section>

    <section class="section wrap" id="featured" hidden>
      <div class="section__head"><h2>Fresh in Food &amp; Grocery</h2><a class="link-arrow" href="/shop">View all →</a></div>
      <div class="grid" data-featured></div>
    </section>

    <section class="section wrap">
      <div class="promo">
        <div class="promo__img"><img src="/assets/img/products/thekuwa-wide.jpg" alt="" loading="lazy"></div>
        <div class="promo__copy">
          <p class="eyebrow">How ordering works</p>
          <h2>Order in three easy steps</h2>
          <ol class="steps">
            <li><b>1</b><div><h3>Fill your cart</h3><p>Pick what you love from our store.</p></div></li>
            <li><b>2</b><div><h3>Confirm on WhatsApp</h3><p>Send your order to us in one tap. We confirm it personally.</p></div></li>
            <li><b>3</b><div><h3>Delivered to your door</h3><p>Anywhere across India.</p></div></li>
          </ol>
          <a class="btn btn--green" href="/shop">Start shopping →</a>
        </div>
      </div>
    </section>

    <section class="section wrap">
      <div class="story">
        <div>
          <p class="eyebrow">Our promise</p>
          <h2>Good enough is everywhere. <em>Better is rare.</em></h2>
          <p>INNIYA brings you one trusted brand for your whole day. We pick every product with care, so choosing well is easy.</p>
          <a class="link-arrow" href="/about">Read our story →</a>
        </div>
        <ul class="story__list">
          <li>${sv(I.shield, 28)}<div><h3>Picked with care</h3><p>Every product earns its place before it reaches you.</p></div></li>
          <li>${sv(I.chat, 28)}<div><h3>Real people, real help</h3><p>Talk to us on WhatsApp, before and after you buy.</p></div></li>
          <li>${sv(I.truck, 28)}<div><h3>Across India</h3><p>Ordered in minutes, delivered to your door.</p></div></li>
        </ul>
      </div>
    </section>`,
}));

// ---------------- Shop ----------------
pages.push(page({
  file: 'shop.html', active: 'shop', title: 'Shop', description: 'Shop INNIYA. Quality products for everyday life, delivered across India.',
  body: `${pageHero('Shop', 'Shop <span data-shop-title>Food &amp; Grocery</span>', '')}
    <section class="wrap shop">
      <div class="shop__bar">
        <div class="tabs" role="tablist" aria-label="Categories" data-tabs>
          ${CATS.map((c, i) => `<button class="tab${i === 0 ? ' is-active' : ''}" type="button" data-tab="${c.key}">${c.name}<em data-soon>Soon</em></button>`).join('\n          ')}
        </div>
        <div class="shop__tools">
          <label class="chip-toggle"><input type="checkbox" data-deals><span>Deals only</span></label>
          <label class="field-search">${sv(I.search, 18)}<span class="sr-only">Search in shop</span><input type="search" placeholder="Search" data-search></label>
          <label class="select"><span class="sr-only">Sort</span>
            <select data-sort>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="discount">Biggest discount</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>
      </div>
      <p class="shop__count" data-count aria-live="polite"></p>
      <div class="grid" data-grid>
        <div class="card card--skeleton"></div><div class="card card--skeleton"></div><div class="card card--skeleton"></div><div class="card card--skeleton"></div>
      </div>
      <div class="empty" data-empty hidden></div>
    </section>`,
}));

// ---------------- Product ----------------
pages.push(page({
  file: 'product.html', active: 'shop', title: 'Product', description: 'INNIYA product details.',
  body: `
    <section class="wrap product" data-product>
      <div class="product__media card--skeleton"></div>
      <div class="product__info"><div class="skeleton-line"></div><div class="skeleton-line skeleton-line--short"></div></div>
    </section>
    <section class="section wrap" data-related-wrap hidden>
      <div class="section__head"><h2>You may also like</h2></div>
      <div class="grid" data-related></div>
    </section>`,
}));

// ---------------- Cart ----------------
pages.push(page({
  file: 'cart.html', active: 'cart', title: 'Your cart', description: 'Your INNIYA cart.',
  body: `${pageHero('Cart', 'Your cart', '')}
    <section class="wrap cart" data-cart>
      <div class="cart__items" data-cart-items></div>
      <aside class="cart__side" data-cart-side hidden>
        <div class="summary">
          <h2>Order summary</h2>
          <dl>
            <div><dt>Items</dt><dd data-sum-items>0</dd></div>
            <div><dt>Subtotal</dt><dd data-sum-subtotal>₹0</dd></div>
            <div><dt>Delivery</dt><dd>Confirmed on WhatsApp</dd></div>
            <div class="summary__total"><dt>Total</dt><dd data-sum-total>₹0</dd></div>
          </dl>
        </div>
        <form class="checkout" data-checkout novalidate>
          <h2>Delivery details</h2>
          <div class="field"><label for="c-name">Full name</label><input id="c-name" name="name" autocomplete="name" required></div>
          <div class="field"><label for="c-phone">Phone (WhatsApp)</label><input id="c-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="10-digit mobile number"></div>
          <div class="field"><label for="c-address">Address</label><textarea id="c-address" name="address" rows="3" autocomplete="street-address" required></textarea></div>
          <div class="field-row">
            <div class="field"><label for="c-city">City</label><input id="c-city" name="city" autocomplete="address-level2" required></div>
            <div class="field"><label for="c-pin">PIN code</label><input id="c-pin" name="pincode" inputmode="numeric" autocomplete="postal-code" maxlength="6" required></div>
          </div>
          <div class="field"><label for="c-note">Note (optional)</label><input id="c-note" name="note"></div>
          <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <p class="form-error" data-form-error role="alert" hidden></p>
          <button class="btn btn--green btn--block" type="submit" data-place>Place order</button>
          <p class="checkout__note">Next, you'll send the order to us on WhatsApp. We'll confirm delivery charges and payment (UPI or other options) there.</p>
        </form>
      </aside>
    </section>
    <section class="wrap done" data-done hidden></section>`,
}));

// ---------------- Wishlist ----------------
pages.push(page({
  file: 'wishlist.html', active: 'wishlist', title: 'Wishlist', description: 'Your saved INNIYA products.',
  body: `${pageHero('Wishlist', 'Your wishlist', 'Products you’ve saved. They stay on this device.')}
    <section class="wrap">
      <div class="grid" data-wish-grid></div>
      <div class="empty" data-wish-empty hidden><h2>Nothing saved yet.</h2><p>Tap the heart on any product to save it here.</p><a class="btn btn--green" href="/shop">Browse the shop</a></div>
    </section>`,
}));

// ---------------- Track ----------------
pages.push(page({
  file: 'track.html', active: 'track', title: 'Track order', description: 'Track your INNIYA order.',
  body: `${pageHero('Track order', 'Track your order', 'Enter your order number and we’ll send you the latest status on WhatsApp.')}
    <section class="wrap narrow">
      <form class="checkout" data-track>
        <div class="field"><label for="t-no">Order number</label><input id="t-no" name="number" placeholder="e.g. INN-1001" required autocomplete="off"></div>
        <div class="field"><label for="t-phone">Phone used for the order</label><input id="t-phone" name="phone" type="tel" inputmode="tel" placeholder="10-digit mobile number" required></div>
        <p class="form-error" data-track-error role="alert" hidden></p>
        <button class="btn btn--green btn--block" type="submit">${sv(I.chat, 20)}Ask on WhatsApp</button>
        <p class="checkout__note">Can’t find your order number? It’s in the WhatsApp message you sent us when you placed the order.</p>
      </form>
    </section>`,
}));

// ---------------- About ----------------
pages.push(page({
  file: 'about.html', active: 'about', title: 'Our story', description: 'Why INNIYA exists: a better choice, every day.',
  body: `${pageHero('Our story', 'A better choice, every day.', 'Good enough is everywhere. Better is rare.')}
    <section class="wrap about">
      <div class="about__img"><img src="/assets/img/hero-food.jpg" alt="INNIYA natural food products on a wooden table" loading="lazy"></div>
      <div class="prose">
        <p class="prose__big">INNIYA started with a simple question: why do everyday things so often feel like a compromise?</p>
        <p>We’re building one brand you can trust for your whole day. We pick every product with care and bring it to you without the noise.</p>
        <p>We’re starting with Food &amp; Grocery, because that’s where every day begins. Fashion, Home &amp; Living, Lifestyle and Everyday Essentials come next, chosen with the same care.</p>
        <a class="btn btn--green" href="/shop">Shop Food &amp; Grocery →</a>
      </div>
    </section>
${trust}`,
}));

// ---------------- Contact ----------------
pages.push(page({
  file: 'contact.html', active: 'contact', title: 'Contact', description: 'Talk to INNIYA on WhatsApp or Instagram.',
  body: `${pageHero('Contact', 'We’re here to help', 'The fastest way to reach us is WhatsApp. We reply personally.')}
    <section class="wrap contact">
      <a class="contact__card contact__card--green" data-wa="Hi INNIYA!" href="${wa('Hi INNIYA!')}" target="_blank" rel="noopener">${sv(I.chat, 34)}<h2>WhatsApp</h2><p>+91 74820 33299</p><span class="link-arrow">Start a chat →</span></a>
      <a class="contact__card" href="https://instagram.com/inniya_official" target="_blank" rel="noopener">${sv('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>', 34)}<h2>Instagram</h2><p>@inniya_official</p><span class="link-arrow">Follow along →</span></a>
      <a class="contact__card" href="/track">${sv(I.pin, 34)}<h2>Your order</h2><p>Have an order number like INN-1001?</p><span class="link-arrow">Track order →</span></a>
    </section>`,
}));

// ---------------- Coming soon categories ----------------
for (const c of CATS.filter((x) => x.key !== 'food')) {
  const file = c.href.slice(1) + '.html';
  pages.push(page({
    file, active: c.key, title: c.name, description: `INNIYA ${c.name} is coming soon. ${c.line}`,
    body: `
    <section class="coming" data-coming="${c.key}">
      <div class="wrap coming__inner">
        <div class="coming__copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>${c.name}</span></nav>
          <p class="slide__kicker">Coming soon</p>
          <h1 class="coming__title">INNIYA ${c.name}</h1>
          <p class="slide__text">${c.line} We’re picking every piece with care, and it’s nearly ready.</p>
          <div class="btn-row">
            <a class="btn btn--green" data-wa="Hi INNIYA, please tell me when ${c.name} launches." href="${wa(`Hi INNIYA, please tell me when ${c.name} launches.`)}" target="_blank" rel="noopener">${sv(I.chat, 20)}Notify me on WhatsApp</a>
            <a class="btn btn--line" href="/shop">Shop Food &amp; Grocery</a>
          </div>
        </div>
        <div class="coming__img"><img src="${c.img}" alt="${c.name}"></div>
      </div>
    </section>
${trust}`,
  }));
}

// ---------------- Policies ----------------
const policy = (file, title, intro, sections) => pages.push(page({
  file, active: 'help', title, description: `${title} for INNIYA.`,
  body: `${pageHero('Help', title, intro)}
    <section class="wrap policy">
      ${sections.map(([h, p]) => `<div class="policy__block"><h2>${h}</h2>${p.map((x) => `<p>${x}</p>`).join('')}</div>`).join('\n      ')}
      <p class="policy__updated">Last updated: November ${YEAR}. Questions? Message us on WhatsApp at +91 74820 33299.</p>
    </section>`,
}));
policy('shipping-returns.html', 'Shipping & returns', 'How delivery and returns work at INNIYA.', [
  ['Where we deliver', ['We deliver across India. When you place an order, we confirm on WhatsApp whether we can deliver to your PIN code, plus the delivery charge and expected timeline.']],
  ['Order confirmation', ['Your order is confirmed only after we reply to you on WhatsApp. If an item is unavailable, we will tell you before anything is charged.']],
  ['Damaged or incorrect items', ['If something arrives damaged or isn’t what you ordered, message us on WhatsApp with your order number and a photo as soon as possible after delivery. We will arrange a replacement or refund.']],
  ['Food items', ['For hygiene and safety reasons, opened food items cannot be returned unless they arrived damaged, spoiled or incorrect.']],
  ['Cancellations', ['You can cancel any time before your order is shipped by messaging us on WhatsApp.']],
]);
policy('privacy.html', 'Privacy policy', 'What we collect and how we use it.', [
  ['What we collect', ['When you place an order we collect your name, phone number, delivery address, city, PIN code and any note you add, plus the products you order.']],
  ['How we use it', ['We use these details only to confirm, deliver and support your order, and to contact you about it on WhatsApp. We do not sell your information.']],
  ['Who sees it', ['Only the INNIYA team and the delivery partners needed to get your order to you.']],
  ['Your cart and wishlist', ['Your cart and wishlist are stored in your own browser so they stay there between visits. You can clear them at any time.']],
  ['Your choices', ['You can ask us to update or delete your details at any time by messaging us on WhatsApp.']],
]);
policy('terms.html', 'Terms of use', 'The simple rules for using this website.', [
  ['Orders', ['Placing an order on this website is a request to buy. A contract is formed only when we confirm the order with you on WhatsApp.']],
  ['Prices and availability', ['Prices are in Indian Rupees. We work hard to keep prices and stock accurate. If we make a mistake, we will tell you before confirming your order.']],
  ['Brand and content', ['The INNIYA name, logo and website content belong to INNIYA. Please don’t reuse them without permission.']],
  ['Changes', ['We may update these terms from time to time. The latest version is always on this page.']],
]);

// ---------------- 404 ----------------
pages.push(page({
  file: '404.html', active: 'none', title: 'Page not found', description: 'This page could not be found.',
  body: `${pageHero('404', 'This page went missing', 'Let’s get you back to something good.')}
    <section class="wrap"><div class="btn-row"><a class="btn btn--green" href="/">Go home</a><a class="btn btn--line" href="/shop">Shop now</a></div></section>`,
}));

await fs.rm(new URL('../home-decor.html', import.meta.url), { force: true });
for (const p of pages) await fs.writeFile(new URL('../' + p.file, import.meta.url), p.html);
console.log('Wrote', pages.map((p) => p.file).join(', '));
