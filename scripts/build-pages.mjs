// Generates every public page from shared layout pieces.
// Run: npm run pages
import fs from 'node:fs/promises';

const WA = '917482033299';
const wa = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
const YEAR = 2026;

const icon = {
  cart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.4A8.5 8.5 0 1 1 21 11.5z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a5 5 0 0 1-2.8-2.8l.9-1-1-2z"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
};

function head({ title, description, path, noindex }) {
  const full = title ? `${title} · INNIYA` : 'INNIYA — A Better Choice, Every Day.';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${full}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#0F3D2A">
  ${noindex ? '<meta name="robots" content="noindex">' : ''}
  <meta property="og:title" content="${full}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="/assets/logo.png">
  <meta property="og:type" content="website">
  <link rel="icon" type="image/png" href="/assets/logo.png">
  <link rel="apple-touch-icon" href="/assets/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <script>document.documentElement.classList.add('js')</script>
</head>`;
}

function header(active) {
  const a = (key) => (active === key ? ' aria-current="page"' : '');
  return `<body data-page="${active}">
  <a class="skip" href="#main">Skip to content</a>
  <div class="announce">
    <p><span data-announcement>INNIYA Food is now live · Delivering across India</span> <span aria-hidden="true">·</span>
      <a data-wa="Hi INNIYA, I'd like to order food." href="${wa("Hi INNIYA, I'd like to order food.")}" target="_blank" rel="noopener">Order on WhatsApp</a></p>
  </div>
  <header class="header" id="top">
    <div class="wrap header__inner">
      <a class="brand" href="/" aria-label="INNIYA home">
        <img src="/assets/logo.png" alt="" width="44" height="44">
        <span>INNIYA</span>
      </a>
      <div class="header__right">
        <nav class="nav" id="nav" aria-label="Main">
          <a href="/shop"${a('shop')} data-cat-link="food">Food</a>
          <a href="/fashion"${a('fashion')} data-cat-link="fashion">Fashion <em>Soon</em></a>
          <a href="/home-decor"${a('home')} data-cat-link="home">Home <em>Soon</em></a>
          <a href="/lifestyle"${a('lifestyle')} data-cat-link="lifestyle">Lifestyle <em>Soon</em></a>
          <a href="/about"${a('about')}>About</a>
          <a href="/contact"${a('contact')}>Contact</a>
        </nav>
        <a class="cart-btn" href="/cart" aria-label="Cart, 0 items" data-cart-btn>${icon.cart}<span class="cart-btn__count" data-cart-count hidden>0</span></a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><span></span><span></span></button>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `
  <footer class="footer">
    <div class="wrap footer__grid">
      <div class="footer__brand">
        <div class="brand brand--foot"><img src="/assets/logo.png" alt="" width="40" height="40"><span>INNIYA</span></div>
        <p class="footer__tag"><em>A better choice, every day.</em></p>
      </div>
      <div>
        <h2 class="footer__h">Shop</h2>
        <ul class="footer__list">
          <li><a href="/shop">Food</a></li>
          <li><a href="/fashion">Fashion</a></li>
          <li><a href="/home-decor">Home</a></li>
          <li><a href="/lifestyle">Lifestyle</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer__h">INNIYA</h2>
        <ul class="footer__list">
          <li><a href="/about">Our story</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/cart">Cart</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer__h">Help</h2>
        <ul class="footer__list">
          <li><a href="/shipping-returns">Shipping &amp; returns</a></li>
          <li><a href="/privacy">Privacy policy</a></li>
          <li><a href="/terms">Terms of use</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer__h">Talk to us</h2>
        <ul class="footer__list">
          <li><a data-wa="Hi INNIYA!" href="${wa('Hi INNIYA!')}" target="_blank" rel="noopener">WhatsApp · +91 74820 33299</a></li>
          <li><a href="https://instagram.com/inniya_official" target="_blank" rel="noopener">Instagram · @inniya_official</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer__bottom"><p>© ${YEAR} INNIYA. All rights reserved.</p><p>Delivering across India</p></div>
  </footer>

  <a class="wa-float" data-wa="Hi INNIYA!" href="${wa('Hi INNIYA!')}" target="_blank" rel="noopener" aria-label="Chat with INNIYA on WhatsApp">${icon.chat}</a>
  <div class="toast" role="status" aria-live="polite" data-toast></div>
  <script src="/assets/site.js" defer></script>
  <script src="/assets/store.js" defer></script>`;
}

const end = '\n</body>\n</html>\n';

function page({ file, title, description, active, body, extraScripts = '', noindex }) {
  return { file, html: head({ title, description, noindex }) + '\n' + header(active) + '\n  <main id="main">\n' + body + '\n  </main>' + footer() + extraScripts + end };
}

function pageHero(eyebrow, title, lead) {
  return `
    <section class="page-hero wrap">
      ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
      <h1>${title}</h1>
      ${lead ? `<p class="page-hero__lead">${lead}</p>` : ''}
    </section>`;
}

// ---------------- Pages ----------------
const pages = [];

// Home
pages.push(page({
  file: 'index.html', active: 'home-page', description: 'INNIYA is one brand for your whole day. Our food store is now open, delivering across India. Fashion, home and lifestyle are coming soon.',
  body: `
    <section class="hero wrap">
      <div class="hero__copy">
        <p class="pill"><span class="pill__dot"></span>Now live · INNIYA Food</p>
        <h1 class="hero__title">
          <span class="line"><span>Why settle</span></span>
          <span class="line"><span>for <em>okay?</em></span></span>
        </h1>
        <p class="hero__lead">Everyday food, picked better. Our food store is open today, delivering across India. Fashion, home and lifestyle are on their way.</p>
        <div class="hero__actions">
          <a class="btn btn--dark" href="/shop">Shop Food <span aria-hidden="true">→</span></a>
          <a class="btn btn--line" data-wa="Hi INNIYA!" href="${wa('Hi INNIYA!')}" target="_blank" rel="noopener">Chat on WhatsApp</a>
        </div>
      </div>
      <div class="hero__stage" id="stage">
        <span class="stage__word" aria-hidden="true">inniya</span>
        <canvas id="hero-canvas" aria-label="A rotating 3D INNIYA box showing our categories: Food now live, Fashion, Home and Lifestyle coming soon" role="img"></canvas>
        <div class="stage__fallback" aria-hidden="true"><img src="/assets/logo.png" alt=""></div>
        <p class="stage__chip stage__chip--a">Delivering across India</p>
        <p class="stage__chip stage__chip--b">A better choice, every day.</p>
        <p class="stage__hint">Drag or move to explore</p>
      </div>
    </section>

    <div class="marquee" aria-hidden="true">
      <div class="marquee__track">
        <span>Food <i>now live</i></span><b>✦</b><span>Fashion <i>coming soon</i></span><b>✦</b><span>Home <i>coming soon</i></span><b>✦</b><span>Lifestyle <i>coming soon</i></span><b>✦</b>
        <span>Food <i>now live</i></span><b>✦</b><span>Fashion <i>coming soon</i></span><b>✦</b><span>Home <i>coming soon</i></span><b>✦</b><span>Lifestyle <i>coming soon</i></span><b>✦</b>
      </div>
    </div>

    <section class="section wrap" id="featured" hidden>
      <div class="section__head reveal">
        <h2>Fresh in the <em>food store.</em></h2>
        <a class="link-arrow" href="/shop">See everything →</a>
      </div>
      <div class="grid" data-featured></div>
    </section>

    <section class="section wrap" id="categories">
      <div class="section__head reveal">
        <h2>One brand for <em>your whole day.</em></h2>
        <p data-cat-summary>1 open now · 3 on the way</p>
      </div>
      <div class="cats">
        <a class="cat cat--live reveal" href="/shop" data-cat-card="food">
          <span class="tag tag--gold">Now live</span>
          <div><h3>Food</h3><p>Morning chai to midnight snacks.</p><span class="cat__link">Shop now →</span></div>
        </a>
        <a class="cat reveal" href="/fashion" data-cat-card="fashion">
          <span class="tag">Coming soon</span>
          <div><h3><em>Fashion</em></h3><p>For your Monday outfit and beyond.</p><span class="cat__link">Get notified →</span></div>
        </a>
        <a class="cat reveal" href="/home-decor" data-cat-card="home">
          <span class="tag">Coming soon</span>
          <div><h3><em>Home</em></h3><p>For slow Sundays at home.</p><span class="cat__link">Get notified →</span></div>
        </a>
        <a class="cat reveal" href="/lifestyle" data-cat-card="lifestyle">
          <span class="tag">Coming soon</span>
          <div><h3><em>Lifestyle</em></h3><p>For everything in between.</p><span class="cat__link">Get notified →</span></div>
        </a>
      </div>
    </section>

    <section class="section wrap" id="how">
      <div class="order">
        <div class="order__intro reveal">
          <p class="eyebrow">How ordering works</p>
          <h2>Order in three <em>easy steps.</em></h2>
          <p>No app, no sign-up.</p>
          <a class="btn btn--dark" href="/shop">Start shopping <span aria-hidden="true">→</span></a>
        </div>
        <ol class="steps">
          <li class="step reveal"><span class="step__num">01</span><div><h3>Fill your cart</h3><p>Pick what you love from the food store.</p></div></li>
          <li class="step reveal"><span class="step__num">02</span><div><h3>Confirm on WhatsApp</h3><p>Send your order to us in one tap. We confirm it with you personally.</p></div></li>
          <li class="step reveal"><span class="step__num">03</span><div><h3>Delivered to your door</h3><p>Anywhere across India.</p></div></li>
        </ol>
      </div>
    </section>

    <section class="story" id="story">
      <div class="wrap story__inner">
        <h2 class="reveal">Good enough is everywhere. <em>Better is rare.</em></h2>
        <div class="story__points">
          <div class="reveal"><h3>Picked with care</h3><p>Every product earns its place before it reaches you.</p></div>
          <div class="reveal"><h3>One brand, every day</h3><p>Food today. Fashion, home and lifestyle next.</p></div>
          <div class="reveal"><h3>Across India</h3><p>Ordered in minutes, delivered to your door.</p></div>
        </div>
      </div>
    </section>

    <section class="section wrap">
      <div class="soon reveal">
        <div>
          <h2>Fashion, Home &amp; Lifestyle <em>are on their way.</em></h2>
          <p>Say hi on WhatsApp and we'll tell you the day they open.</p>
        </div>
        <a class="btn btn--dark btn--lg" data-wa="Hi INNIYA, please tell me when new categories launch." href="${wa('Hi INNIYA, please tell me when new categories launch.')}" target="_blank" rel="noopener">+91 74820 33299</a>
      </div>
    </section>`,
  extraScripts: '\n  <script type="module" src="/assets/hero.js"></script>',
}));

// Shop
pages.push(page({
  file: 'shop.html', active: 'shop', title: 'Shop Food', description: 'Shop INNIYA Food. Everyday food, picked better, delivered across India.',
  body: `${pageHero('INNIYA Store', 'Shop <em>food.</em>', 'Everyday food, picked better. Add to cart and confirm your order on WhatsApp.')}
    <section class="wrap shop">
      <div class="shop__bar">
        <div class="tabs" role="tablist" aria-label="Categories" data-tabs>
          <button class="tab is-active" type="button" data-tab="food">Food</button>
          <button class="tab" type="button" data-tab="fashion">Fashion <em>Soon</em></button>
          <button class="tab" type="button" data-tab="home">Home <em>Soon</em></button>
          <button class="tab" type="button" data-tab="lifestyle">Lifestyle <em>Soon</em></button>
        </div>
        <div class="shop__tools">
          <label class="search">${icon.search}<span class="sr-only">Search products</span><input type="search" placeholder="Search" data-search></label>
          <label class="select"><span class="sr-only">Sort</span>
            <select data-sort>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
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

// Product
pages.push(page({
  file: 'product.html', active: 'shop', title: 'Product', description: 'INNIYA product details.',
  body: `
    <section class="wrap product" data-product>
      <div class="product__media card--skeleton"></div>
      <div class="product__info"><div class="skeleton-line"></div><div class="skeleton-line skeleton-line--short"></div></div>
    </section>
    <section class="section wrap" data-related-wrap hidden>
      <div class="section__head"><h2>You may also <em>like.</em></h2></div>
      <div class="grid" data-related></div>
    </section>`,
}));

// Cart
pages.push(page({
  file: 'cart.html', active: 'cart', title: 'Your cart', description: 'Your INNIYA cart.',
  body: `${pageHero('', 'Your <em>cart.</em>', '')}
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
          <button class="btn btn--dark btn--block" type="submit" data-place>Place order</button>
          <p class="checkout__note">Next, you'll send the order to us on WhatsApp. We'll confirm delivery charges and payment (UPI or other options) there.</p>
        </form>
      </aside>
    </section>
    <section class="wrap done" data-done hidden></section>`,
}));

// About
pages.push(page({
  file: 'about.html', active: 'about', title: 'Our story', description: 'Why INNIYA exists: a better choice, every day.',
  body: `${pageHero('Our story', 'Good enough is everywhere. <em>Better is rare.</em>', '')}
    <section class="wrap prose-grid">
      <div class="prose reveal">
        <p class="prose__big">INNIYA started with a simple question: why do everyday things so often feel like a compromise?</p>
        <p>We're building one brand you can trust for your whole day. We pick every product with care and bring it to you without the noise.</p>
        <p>We're starting with food, because that's where every day begins. Fashion, home and lifestyle come next, chosen with the same care.</p>
      </div>
      <div class="values">
        <div class="value reveal"><span class="step__num">01</span><div><h3>Picked with care</h3><p>Every product earns its place before it reaches you.</p></div></div>
        <div class="value reveal"><span class="step__num">02</span><div><h3>Honest and simple</h3><p>Clear prices, real people on WhatsApp, no tricks.</p></div></div>
        <div class="value reveal"><span class="step__num">03</span><div><h3>For every day</h3><p>Food today. Fashion, home and lifestyle next.</p></div></div>
      </div>
    </section>
    <section class="section wrap">
      <div class="soon reveal">
        <div><h2>Start with <em>food.</em></h2><p>Our food store is open now, delivering across India.</p></div>
        <a class="btn btn--dark btn--lg" href="/shop">Shop Food →</a>
      </div>
    </section>`,
}));

// Contact
pages.push(page({
  file: 'contact.html', active: 'contact', title: 'Contact', description: 'Talk to INNIYA on WhatsApp or Instagram.',
  body: `${pageHero('Contact', 'Talk to a <em>real person.</em>', 'The fastest way to reach us is WhatsApp. We reply personally.')}
    <section class="wrap contact">
      <a class="contact__card contact__card--dark reveal" data-wa="Hi INNIYA!" href="${wa('Hi INNIYA!')}" target="_blank" rel="noopener">
        <span class="eyebrow">WhatsApp</span>
        <span class="contact__big">+91 74820 33299</span>
        <span class="cat__link">Start a chat →</span>
      </a>
      <a class="contact__card reveal" href="https://instagram.com/inniya_official" target="_blank" rel="noopener">
        <span class="eyebrow">Instagram</span>
        <span class="contact__big">@inniya_official</span>
        <span class="cat__link">Follow along →</span>
      </a>
      <div class="contact__card reveal">
        <span class="eyebrow">Orders</span>
        <span class="contact__big contact__big--sm">Have an order number like INN-1001?</span>
        <p>Send it to us on WhatsApp and we'll update you on its status.</p>
      </div>
    </section>`,
}));

// Coming soon categories
const soon = [
  { file: 'fashion.html', key: 'fashion', name: 'Fashion', line: 'For your Monday outfit and beyond.' },
  { file: 'home-decor.html', key: 'home', name: 'Home', line: 'For slow Sundays at home.' },
  { file: 'lifestyle.html', key: 'lifestyle', name: 'Lifestyle', line: 'For everything in between.' },
];
for (const s of soon) {
  pages.push(page({
    file: s.file, active: s.key, title: s.name, description: `INNIYA ${s.name} is coming soon. ${s.line}`,
    body: `
    <section class="wrap coming" data-coming="${s.key}">
      <div class="coming__copy">
        <p class="pill">Coming soon</p>
        <h1 class="coming__title">INNIYA <em>${s.name}</em></h1>
        <p class="hero__lead">${s.line} We're picking every piece with care, and it's nearly ready.</p>
        <div class="hero__actions">
          <a class="btn btn--dark" data-wa="Hi INNIYA, please tell me when ${s.name} launches." href="${wa(`Hi INNIYA, please tell me when ${s.name} launches.`)}" target="_blank" rel="noopener">Notify me on WhatsApp</a>
          <a class="btn btn--line" href="/shop">Shop Food meanwhile</a>
        </div>
      </div>
      <div class="coming__art" aria-hidden="true"><span>${s.name}</span></div>
    </section>`,
  }));
}

// Policies (plain, review before relying on them)
const policy = (file, key, title, intro, sections) => pages.push(page({
  file, active: key, title, description: `${title} for INNIYA.`,
  body: `${pageHero('Help', title, intro)}
    <section class="wrap policy">
      ${sections.map(([h, p]) => `<div class="policy__block"><h2>${h}</h2>${p.map((x) => `<p>${x}</p>`).join('')}</div>`).join('\n      ')}
      <p class="policy__updated">Last updated: October ${YEAR}. Questions? Message us on WhatsApp at +91 74820 33299.</p>
    </section>`,
}));

policy('shipping-returns.html', 'help', 'Shipping & returns', 'How delivery and returns work at INNIYA.', [
  ['Where we deliver', ['We deliver across India. When you place an order, we confirm on WhatsApp whether we can deliver to your PIN code, plus the delivery charge and expected timeline.']],
  ['Order confirmation', ['Your order is confirmed only after we reply to you on WhatsApp. If an item is unavailable, we will tell you before anything is charged.']],
  ['Damaged or incorrect items', ['If something arrives damaged or isn’t what you ordered, message us on WhatsApp with your order number and a photo as soon as possible after delivery. We will arrange a replacement or refund.']],
  ['Food items', ['For hygiene and safety reasons, opened food items cannot be returned unless they arrived damaged, spoiled or incorrect.']],
  ['Cancellations', ['You can cancel any time before your order is shipped by messaging us on WhatsApp.']],
]);
policy('privacy.html', 'help', 'Privacy policy', 'What we collect and how we use it.', [
  ['What we collect', ['When you place an order we collect your name, phone number, delivery address, city, PIN code and any note you add, plus the products you order.']],
  ['How we use it', ['We use these details only to confirm, deliver and support your order, and to contact you about it on WhatsApp. We do not sell your information.']],
  ['Who sees it', ['Only the INNIYA team and the delivery partners needed to get your order to you.']],
  ['Your cart', ['Your cart is stored in your own browser so it stays there between visits. You can clear it at any time.']],
  ['Your choices', ['You can ask us to update or delete your details at any time by messaging us on WhatsApp.']],
]);
policy('terms.html', 'help', 'Terms of use', 'The simple rules for using this website.', [
  ['Orders', ['Placing an order on this website is a request to buy. A contract is formed only when we confirm the order with you on WhatsApp.']],
  ['Prices and availability', ['Prices are in Indian Rupees. We work hard to keep prices and stock accurate. If we make a mistake, we will tell you before confirming your order.']],
  ['Brand and content', ['The INNIYA name, logo and website content belong to INNIYA. Please don’t reuse them without permission.']],
  ['Changes', ['We may update these terms from time to time. The latest version is always on this page.']],
]);

// 404
pages.push(page({
  file: '404.html', active: 'none', title: 'Page not found', description: 'This page could not be found.',
  body: `${pageHero('404', 'This page went <em>missing.</em>', 'Let’s get you back to something good.')}
    <section class="wrap"><div class="hero__actions"><a class="btn btn--dark" href="/">Go home</a><a class="btn btn--line" href="/shop">Shop Food</a></div></section>`,
}));

for (const p of pages) await fs.writeFile(new URL('../' + p.file, import.meta.url), p.html);
console.log('Wrote', pages.map((p) => p.file).join(', '));
