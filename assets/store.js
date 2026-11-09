(function () {
  'use strict';

  var CATS = { food: 'Food & Grocery', fashion: 'Fashion', home: 'Home & Living', lifestyle: 'Lifestyle', essentials: 'Everyday Essentials' };
  var state = { settings: null, products: null };
  var page = document.body.getAttribute('data-page');

  // ---------- utils ----------
  function $(s, el) { return (el || document).querySelector(s); }
  function $all(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 0 });
  function money(n) { return inr.format(Number(n) || 0); }
  function waNumber() { return (state.settings && state.settings.whatsapp) || '917482033299'; }
  function waLink(text) { return 'https://wa.me/' + waNumber() + '?text=' + encodeURIComponent(text); }

  var toastTimer;
  function toast(msg) {
    var t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  }

  function getJSON(url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
        return data;
      });
    });
  }

  // ---------- settings ----------
  function loadSettings() {
    return getJSON('/api/settings').then(function (d) { state.settings = d.settings; return d.settings; })
      .catch(function () {
        state.settings = { whatsapp: '917482033299', categories: { food: true, fashion: false, home: false, lifestyle: false } };
        return state.settings;
      });
  }
  function isLive(cat) { return !!(state.settings && state.settings.categories && state.settings.categories[cat]); }

  function applySettings() {
    var s = state.settings;
    if (s.announcement) $all('[data-announcement]').forEach(function (el) { el.textContent = s.announcement; });
    $all('[data-wa]').forEach(function (a) { a.href = waLink(a.getAttribute('data-wa')); });

    Object.keys(CATS).forEach(function (cat) {
      var live = isLive(cat);
      var shopUrl = cat === 'food' ? '/shop' : '/shop?cat=' + cat;
      $all('[data-cat-link="' + cat + '"], [data-cat-card="' + cat + '"], [data-tab="' + cat + '"]').forEach(function (el) {
        $all('[data-soon]', el).forEach(function (b) { b.hidden = live; });
        if (live && el.tagName === 'A') el.href = shopUrl;
      });
    });
    var liveCount = Object.keys(CATS).filter(isLive).length;
    $all('[data-cat-summary]').forEach(function (el) {
      el.textContent = liveCount + ' open now · ' + (5 - liveCount) + ' on the way';
    });

    var coming = $('[data-coming]');
    if (coming && isLive(coming.getAttribute('data-coming'))) {
      location.replace('/shop?cat=' + coming.getAttribute('data-coming'));
    }
  }

  // ---------- cart ----------
  var CART_KEY = 'inniya_cart_v1';
  function readCart() {
    try { var c = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(c) ? c : []; }
    catch (e) { return []; }
  }
  function writeCart(c) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) { /* storage unavailable */ }
    updateCartCount();
  }
  function cartQty() { return readCart().reduce(function (s, i) { return s + i.qty; }, 0); }
  function addToCart(id, qty) {
    var c = readCart();
    var it = c.find(function (x) { return x.id === id; });
    if (it) it.qty = Math.min(99, it.qty + qty); else c.push({ id: id, qty: qty });
    writeCart(c);
  }
  function setQty(id, qty) {
    var c = readCart().map(function (x) { return x.id === id ? { id: x.id, qty: Math.max(0, Math.min(99, qty)) } : x; })
      .filter(function (x) { return x.qty > 0; });
    writeCart(c);
  }
  function updateCartCount() {
    var n = cartQty();
    $all('[data-cart-count]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    $all('[data-cart-btn]').forEach(function (el) { el.setAttribute('aria-label', 'Cart, ' + n + (n === 1 ? ' item' : ' items')); });
  }

  // ---------- wishlist ----------
  var WISH_KEY = 'inniya_wish_v1';
  function readWish() {
    try { var w = JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); return Array.isArray(w) ? w : []; }
    catch (e) { return []; }
  }
  function isWished(id) { return readWish().indexOf(id) >= 0; }
  function toggleWish(id) {
    var w = readWish();
    var i = w.indexOf(id);
    if (i >= 0) w.splice(i, 1); else w.push(id);
    try { localStorage.setItem(WISH_KEY, JSON.stringify(w)); } catch (e) { /* ignore */ }
    updateWishCount();
    return i < 0;
  }
  function updateWishCount() {
    var n = readWish().length;
    $all('[data-wish-count]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    $all('[data-wish-btn]').forEach(function (el) { el.setAttribute('aria-label', 'Wishlist, ' + n + (n === 1 ? ' item' : ' items')); });
  }
  var HEART = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
  function wishBtn(p) {
    var on = isWished(p.id);
    return '<button class="wish" type="button" data-wish="' + esc(p.id) + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Remove ' : 'Save ') + esc(p.name) + (on ? ' from' : ' to') + ' wishlist">' + HEART + '</button>';
  }
  function bindWish(root) {
    $all('[data-wish]', root).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        var p = byId(b.getAttribute('data-wish'));
        var on = toggleWish(b.getAttribute('data-wish'));
        b.setAttribute('aria-pressed', String(on));
        if (p) { b.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + p.name + (on ? ' from' : ' to') + ' wishlist'); toast(on ? 'Saved to wishlist' : 'Removed from wishlist'); }
        if (page === 'wishlist' && !on) initWishlist();
      });
    });
  }

  // ---------- products ----------
  function loadProducts() {
    if (state.products) return Promise.resolve(state.products);
    return getJSON('/api/products').then(function (d) { state.products = d.products || []; return state.products; })
      .catch(function () { state.products = []; return state.products; });
  }
  function visible(list) { return list.filter(function (p) { return isLive(p.category); }); }
  function bySlug(slug) { return (state.products || []).find(function (p) { return p.slug === slug || p.id === slug; }); }
  function byId(id) { return (state.products || []).find(function (p) { return p.id === id; }); }

  function media(p, cls) {
    if (p.image) return '<img class="' + cls + '" src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">';
    return '<div class="' + cls + ' ph" aria-hidden="true"><span>' + esc((p.name || '?').charAt(0)) + '</span></div>';
  }
  function priceHTML(p) {
    var off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    return '<span class="price">' + money(p.price) + '</span>' +
      (off ? ' <s class="mrp">' + money(p.mrp) + '</s> <span class="off">' + off + '% off</span>' : '');
  }
  function cardHTML(p) {
    var out = p.inStock === false;
    var off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    return '<article class="card">' + wishBtn(p) +
      '<a class="card__link" href="/product/' + encodeURIComponent(p.slug) + '">' +
        '<div class="card__media">' + media(p, 'card__img') + (out ? '<span class="badge">Out of stock</span>' : (off ? '<span class="badge badge--deal">' + off + '% off</span>' : '')) + '</div>' +
        '<div class="card__body"><h3 class="card__name">' + esc(p.name) + '</h3>' +
        (p.unit ? '<p class="card__unit">' + esc(p.unit) + '</p>' : '') +
        '<p class="card__price">' + priceHTML(p) + '</p></div>' +
      '</a>' +
      '<button class="btn btn--line btn--sm" type="button" data-add="' + esc(p.id) + '"' + (out ? ' disabled' : '') + '>' +
        (out ? 'Out of stock' : 'Add to cart') + '</button>' +
    '</article>';
  }
  function bindAdd(root) {
    bindWish(root);
    $all('[data-add]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var p = byId(b.getAttribute('data-add'));
        if (!p) return;
        addToCart(p.id, 1);
        toast(p.name + ' added to cart');
        b.textContent = 'Added ✓';
        setTimeout(function () { b.textContent = 'Add to cart'; }, 1400);
      });
    });
  }
  function revealNow(root) {
    // newly injected .reveal elements: show them right away
    $all('.reveal', root).forEach(function (el) { el.classList.add('is-in'); });
  }

  // ---------- pages ----------
  function initHome() {
    loadProducts().then(function (all) {
      var list = visible(all).filter(function (p) { return p.inStock !== false; });
      var feat = list.filter(function (p) { return p.featured; });
      var show = (feat.length ? feat : list).slice(0, 4);
      if (!show.length) return;
      var wrap = $('#featured');
      var grid = $('[data-featured]');
      grid.innerHTML = show.map(cardHTML).join('');
      wrap.hidden = false;
      revealNow(wrap);
      bindAdd(grid);
    });
  }

  function initShop() {
    var params = new URLSearchParams(location.search);
    var cat = CATS[params.get('cat')] ? params.get('cat') : 'food';
    var q = (params.get('q') || '').trim();
    var deals = params.get('deals') === '1';
    var sort = 'featured';
    var titleEl = $('[data-shop-title]');
    var grid = $('[data-grid]');
    var empty = $('[data-empty]');
    var count = $('[data-count]');

    function setTab(c) {
      cat = c;
      $all('[data-tab]').forEach(function (t) {
        var on = t.getAttribute('data-tab') === c;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      var qs = new URLSearchParams();
      if (c !== 'food') qs.set('cat', c);
      if (q) qs.set('q', q);
      if (deals) qs.set('deals', '1');
      history.replaceState(null, '', '/shop' + (qs.toString() ? '?' + qs : ''));
      if (titleEl) titleEl.textContent = deals ? 'deals & offers' : CATS[c];
      render();
    }

    function render() {
      if (!isLive(cat)) {
        grid.innerHTML = '';
        count.textContent = '';
        empty.hidden = false;
        empty.innerHTML = '<h2><em>' + CATS[cat] + '</em> is coming soon.</h2><p>We’re picking every piece with care. Want to know the day it opens?</p>' +
          '<a class="btn btn--green" href="' + waLink('Hi INNIYA, please tell me when ' + CATS[cat] + ' launches.') + '" target="_blank" rel="noopener">Notify me on WhatsApp</a>';
        return;
      }
      var list = (state.products || []).filter(function (p) { return q ? isLive(p.category) : p.category === cat; });
      if (deals) list = list.filter(function (p) { return p.mrp && p.mrp > p.price; });
      if (q) {
        var needle = q.toLowerCase();
        list = list.filter(function (p) { return (p.name + ' ' + (p.description || '') + ' ' + (p.unit || '')).toLowerCase().indexOf(needle) >= 0; });
      }
      list = list.slice();
      if (sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
      else if (sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
      else if (sort === 'discount') list.sort(function (a, b) { return ((b.mrp ? 1 - b.price / b.mrp : 0) - (a.mrp ? 1 - a.price / a.mrp : 0)); });
      else if (sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      else list.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || ((a.inStock === false) - (b.inStock === false)); });

      if (!list.length) {
        grid.innerHTML = '';
        count.textContent = '';
        empty.hidden = false;
        empty.innerHTML = q
          ? '<h2>No matches for “' + esc(q) + '”.</h2><p>Try another word, or ask us on WhatsApp.</p>'
          : deals ? '<h2>No deals right now.</h2><p>Check back soon, or browse everything in the shop.</p>'
          : '<h2>Our ' + CATS[cat].toLowerCase() + ' list is being updated.</h2><p>Message us on WhatsApp and we’ll share today’s list with you.</p>' +
            '<a class="btn btn--green" href="' + waLink('Hi INNIYA, please share today’s ' + CATS[cat].toLowerCase() + ' list.') + '" target="_blank" rel="noopener">Get today’s list</a>';
        return;
      }
      empty.hidden = true;
      count.textContent = list.length + (list.length === 1 ? ' product' : ' products');
      grid.innerHTML = list.map(cardHTML).join('');
      revealNow(grid);
      bindAdd(grid);
    }

    $all('[data-tab]').forEach(function (t) {
      t.setAttribute('role', 'tab');
      t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
    });
    var search = $('[data-search]');
    search.value = q;
    var headerQ = $('#q'); if (headerQ) headerQ.value = q;
    var dealsBox = $('[data-deals]');
    dealsBox.checked = deals;
    dealsBox.addEventListener('change', function () { deals = dealsBox.checked; setTab(cat); });
    var timer;
    search.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { q = search.value.trim(); setTab(cat); }, 200); });
    $('[data-sort]').addEventListener('change', function (e) { sort = e.target.value; render(); });

    loadProducts().then(function () { setTab(cat); });
  }

  function initProduct() {
    var root = $('[data-product]');
    var slug = decodeURIComponent((location.pathname.match(/^\/product\/([^/]+)/) || [])[1] || new URLSearchParams(location.search).get('p') || '');
    loadProducts().then(function () {
      var p = bySlug(slug);
      if (!p || !isLive(p.category)) {
        root.innerHTML = '<div class="empty"><h2>We couldn’t find that product.</h2><p>It may have sold out or moved.</p><a class="btn btn--green" href="/shop">Back to the shop</a></div>';
        return;
      }
      document.title = p.name + ' · INNIYA';
      var out = p.inStock === false;
      root.innerHTML =
        '<div class="product__media">' + media(p, 'product__img') + wishBtn(p) + '</div>' +
        '<div class="product__info">' +
          '<a class="crumb" href="/shop' + (p.category === 'food' ? '' : '?cat=' + p.category) + '">← ' + CATS[p.category] + '</a>' +
          '<h1 class="product__name">' + esc(p.name) + '</h1>' +
          (p.unit ? '<p class="product__unit">' + esc(p.unit) + '</p>' : '') +
          '<p class="product__price">' + priceHTML(p) + '</p>' +
          (p.description ? '<div class="product__desc">' + esc(p.description).split(/\n+/).map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</div>' : '') +
          (out ? '<p class="badge badge--inline">Out of stock</p>' :
          '<div class="buy">' +
            '<div class="qty" role="group" aria-label="Quantity"><button type="button" data-q="-1" aria-label="Decrease quantity">−</button><output data-qty>1</output><button type="button" data-q="1" aria-label="Increase quantity">+</button></div>' +
            '<button class="btn btn--green" type="button" data-buy>Add to cart</button>' +
          '</div>') +
          '<a class="btn btn--line btn--block" href="' + waLink('Hi INNIYA, I have a question about ' + p.name + '.') + '" target="_blank" rel="noopener">Ask about this on WhatsApp</a>' +
          '<ul class="product__perks"><li>Pan India delivery</li><li>Assured quality</li><li>Secure packaging</li><li>Confirmed on WhatsApp</li></ul>' +
        '</div>';
      bindWish(root);
      var qty = 1;
      $all('[data-q]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          qty = Math.max(1, Math.min(99, qty + Number(b.getAttribute('data-q'))));
          $('[data-qty]', root).textContent = qty;
        });
      });
      var buy = $('[data-buy]', root);
      if (buy) buy.addEventListener('click', function () {
        addToCart(p.id, qty);
        toast(qty + ' × ' + p.name + ' added to cart');
        buy.textContent = 'Added ✓';
        setTimeout(function () { buy.textContent = 'Add to cart'; }, 1400);
      });

      var related = visible(state.products).filter(function (x) { return x.category === p.category && x.id !== p.id; }).slice(0, 4);
      if (related.length) {
        $('[data-related]').innerHTML = related.map(cardHTML).join('');
        $('[data-related-wrap]').hidden = false;
        revealNow($('[data-related-wrap]'));
        bindAdd($('[data-related]'));
      }
    });
  }

  function initCart() {
    var itemsEl = $('[data-cart-items]');
    var side = $('[data-cart-side]');
    var form = $('[data-checkout]');
    var errEl = $('[data-form-error]');

    function lines() {
      return readCart().map(function (c) {
        var p = byId(c.id);
        return p && isLive(p.category) ? { p: p, qty: c.qty } : null;
      }).filter(Boolean);
    }

    function render() {
      var ls = lines();
      if (!ls.length) {
        side.hidden = true;
        itemsEl.innerHTML = '<div class="empty"><h2>Your cart is empty.</h2><p>Let’s fix that.</p><a class="btn btn--green" href="/shop">Shop Food</a></div>';
        return;
      }
      side.hidden = false;
      itemsEl.innerHTML = ls.map(function (l) {
        var p = l.p;
        return '<div class="cline">' +
          '<a class="cline__media" href="/product/' + encodeURIComponent(p.slug) + '">' + media(p, 'cline__img') + '</a>' +
          '<div class="cline__info"><a class="cline__name" href="/product/' + encodeURIComponent(p.slug) + '">' + esc(p.name) + '</a>' +
          (p.unit ? '<p class="cline__unit">' + esc(p.unit) + '</p>' : '') +
          (p.inStock === false ? '<p class="cline__warn">Out of stock. Please remove it.</p>' : '') +
          '<p class="cline__price">' + money(p.price) + '</p></div>' +
          '<div class="cline__ctrl">' +
            '<div class="qty qty--sm" role="group" aria-label="Quantity for ' + esc(p.name) + '"><button type="button" data-dec="' + esc(p.id) + '" aria-label="Decrease">−</button><output>' + l.qty + '</output><button type="button" data-inc="' + esc(p.id) + '" aria-label="Increase">+</button></div>' +
            '<button class="cline__remove" type="button" data-rm="' + esc(p.id) + '">Remove</button>' +
          '</div>' +
          '<p class="cline__total">' + money(p.price * l.qty) + '</p>' +
        '</div>';
      }).join('');
      var count = ls.reduce(function (s, l) { return s + l.qty; }, 0);
      var subtotal = ls.reduce(function (s, l) { return s + l.p.price * l.qty; }, 0);
      $('[data-sum-items]').textContent = count;
      $('[data-sum-subtotal]').textContent = money(subtotal);
      $('[data-sum-total]').textContent = money(subtotal);

      $all('[data-dec]', itemsEl).forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-dec'); var c = readCart().find(function (x) { return x.id === id; }); setQty(id, (c ? c.qty : 1) - 1); render(); }); });
      $all('[data-inc]', itemsEl).forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-inc'); var c = readCart().find(function (x) { return x.id === id; }); setQty(id, (c ? c.qty : 0) + 1); render(); }); });
      $all('[data-rm]', itemsEl).forEach(function (b) { b.addEventListener('click', function () { setQty(b.getAttribute('data-rm'), 0); render(); }); });
    }

    // remember details for next time
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('inniya_customer') || '{}'); } catch (e) { saved = {}; }
    ['name', 'phone', 'address', 'city', 'pincode'].forEach(function (k) { if (saved[k] && form.elements[k]) form.elements[k].value = saved[k]; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errEl.hidden = true;
      var f = form.elements;
      var customer = { name: f.name.value, phone: f.phone.value, address: f.address.value, city: f.city.value, pincode: f.pincode.value, note: f.note.value };
      var btn = $('[data-place]');
      btn.disabled = true;
      btn.textContent = 'Placing order…';
      getJSON('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: customer, items: readCart(), website: f.website.value }),
      }).then(function (d) {
        try { localStorage.setItem('inniya_customer', JSON.stringify(customer)); } catch (err) { /* ignore */ }
        writeCart([]);
        showDone(d.order);
      }).catch(function (err) {
        errEl.textContent = err.message;
        errEl.hidden = false;
        btn.disabled = false;
        btn.textContent = 'Place order';
      });
    });

    function showDone(o) {
      var msg = 'Hi INNIYA! I just placed order ' + o.number + '.\n\n' +
        o.items.map(function (i) { return i.qty + ' × ' + i.name + (i.unit ? ' (' + i.unit + ')' : '') + ' = ' + money(i.lineTotal); }).join('\n') +
        '\n\nTotal: ' + money(o.total) +
        '\n\nName: ' + o.customer.name + '\nPhone: ' + o.customer.phone +
        '\nAddress: ' + o.customer.address + ', ' + o.customer.city + ' - ' + o.customer.pincode +
        (o.customer.note ? '\nNote: ' + o.customer.note : '');
      $('[data-cart]').hidden = true;
      var done = $('[data-done]');
      done.hidden = false;
      done.innerHTML = '<div class="done__card">' +
        '<p class="pill"><span class="pill__dot"></span>Order ' + esc(o.number) + ' received</p>' +
        '<h2>One last step: <em>send it on WhatsApp.</em></h2>' +
        '<p>Tap the button below to send your order to us. We’ll confirm delivery and payment with you there.</p>' +
        '<a class="btn btn--green btn--lg" href="' + waLink(msg) + '" target="_blank" rel="noopener">Send order on WhatsApp</a>' +
        '<p class="done__total">' + o.items.length + (o.items.length === 1 ? ' item' : ' items') + ' · ' + money(o.total) + '</p>' +
        '<a class="link-arrow" href="/shop">Continue shopping →</a></div>';
      document.querySelector('.page-hero h1').innerHTML = 'Thank <em>you.</em>';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadProducts().then(render);
  }

  function initWishlist() {
    loadProducts().then(function () {
      var ids = readWish();
      var list = ids.map(byId).filter(function (p) { return p && isLive(p.category); });
      var grid = $('[data-wish-grid]');
      grid.innerHTML = list.map(cardHTML).join('');
      $('[data-wish-empty]').hidden = list.length > 0;
      bindAdd(grid);
    });
  }

  function initTrack() {
    var f = $('[data-track]');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var no = f.elements.number.value.trim().toUpperCase();
      var phone = f.elements.phone.value.replace(/[^\d]/g, '');
      var err = $('[data-track-error]');
      if (!/^INN-?\d{3,}$/.test(no)) { err.textContent = 'Please enter your order number, like INN-1001.'; err.hidden = false; return; }
      if (phone.length < 10) { err.textContent = 'Please enter the phone number you used for the order.'; err.hidden = false; return; }
      err.hidden = true;
      window.open(waLink('Hi INNIYA, please share the status of my order ' + no.replace(/^INN-?/, 'INN-') + '. Phone: ' + phone), '_blank', 'noopener');
    });
  }

  // ---------- boot ----------
  updateCartCount();
  updateWishCount();
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) updateCartCount(); if (e.key === WISH_KEY) updateWishCount(); });
  if (page === 'track') initTrack();
  loadSettings().then(function () {
    applySettings();
    if (page === 'index') initHome();
    else if (page === 'wishlist') initWishlist();
    else if (page === 'shop' && $('[data-grid]')) initShop();
    else if ($('[data-product]')) initProduct();
    else if (page === 'cart') initCart();
  });
})();
