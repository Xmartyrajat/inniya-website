(function () {
  'use strict';
  var CATS = { food: 'Food & Grocery', fashion: 'Fashion', home: 'Home & Living', lifestyle: 'Lifestyle', essentials: 'Everyday Essentials' };
  var STATUS_LABEL = { new: 'New', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
  var S = { products: [], orders: [], statuses: [], settings: null, filter: 'all', psearch: '', editing: null };

  function $(s, el) { return (el || document).querySelector(s); }
  function $all(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 0 });
  function money(n) { return inr.format(Number(n) || 0); }
  var when = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  var tt;
  function toast(msg) {
    var t = $('[data-toast]');
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('is-on'); }, 2400);
  }

  function api(url, opts) {
    opts = opts || {};
    opts.credentials = 'same-origin';
    if (opts.body && typeof opts.body !== 'string') {
      opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
      opts.body = JSON.stringify(opts.body);
    }
    return fetch(url, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401) { show('login'); throw new Error(d.error || 'Please log in.'); }
        if (!r.ok) throw new Error(d.error || 'Something went wrong.');
        return d;
      });
    });
  }

  function show(view) {
    $all('[data-view]').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== view; });
    if (view === 'login') setTimeout(function () { $('#pw').focus(); }, 50);
  }

  // ---------- login ----------
  $('[data-login]').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('[data-login-error]');
    err.hidden = true;
    var btn = e.target.querySelector('button');
    btn.disabled = true;
    api('/api/admin/login', { method: 'POST', body: { password: e.target.password.value } })
      .then(function () { e.target.reset(); boot(); })
      .catch(function (x) { err.textContent = x.message; err.hidden = false; })
      .then(function () { btn.disabled = false; });
  });
  $('[data-logout]').addEventListener('click', function () {
    api('/api/admin/logout', { method: 'POST' }).catch(function () {}).then(function () { show('login'); });
  });

  // ---------- tabs ----------
  function setTab(name) {
    $all('[data-tab]').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-tab') === name); });
    $all('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== name; });
    try { sessionStorage.setItem('inniya_admin_tab', name); } catch (e) { /* ignore */ }
  }
  $all('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { setTab(b.getAttribute('data-tab')); }); });

  // ---------- orders ----------
  function loadOrders() {
    return api('/api/admin/orders').then(function (d) { S.orders = d.orders || []; S.statuses = d.statuses || []; renderOrders(); });
  }
  function waCustomer(o) {
    var digits = String(o.customer.phone || '').replace(/\D/g, '');
    if (digits.length === 10) digits = '91' + digits;
    var msg = 'Hi ' + o.customer.name + ', this is INNIYA about your order ' + o.number + '.';
    return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(msg);
  }
  function renderOrders() {
    var counts = { all: S.orders.length };
    S.statuses.forEach(function (s) { counts[s] = 0; });
    S.orders.forEach(function (o) { counts[o.status] = (counts[o.status] || 0) + 1; });
    var nc = $('[data-new-count]');
    nc.textContent = counts.new || 0; nc.hidden = !counts.new;

    $('[data-order-filters]').innerHTML = ['all'].concat(S.statuses).map(function (s) {
      return '<button type="button" class="chip' + (S.filter === s ? ' is-active' : '') + '" data-filter="' + s + '">' +
        (s === 'all' ? 'All' : STATUS_LABEL[s]) + ' <span>' + (counts[s] || 0) + '</span></button>';
    }).join('');
    $all('[data-filter]').forEach(function (b) { b.addEventListener('click', function () { S.filter = b.getAttribute('data-filter'); renderOrders(); }); });

    var revenue = S.orders.filter(function (o) { return o.status !== 'cancelled'; }).reduce(function (s, o) { return s + o.total; }, 0);
    $('[data-orders-sub]').textContent = S.orders.length + ' orders · ' + money(revenue) + ' in non-cancelled orders';

    var list = S.orders.filter(function (o) { return S.filter === 'all' || o.status === S.filter; });
    var box = $('[data-orders]');
    if (!list.length) {
      box.innerHTML = '<div class="emptybox"><h2>No orders here yet.</h2><p>New orders from the website appear here. Customers also send them to you on WhatsApp.</p></div>';
      return;
    }
    box.innerHTML = list.map(function (o) {
      var c = o.customer;
      return '<article class="order order--' + o.status + '">' +
        '<div class="order__top">' +
          '<div><h2>' + esc(o.number) + '</h2><p class="muted">' + when.format(new Date(o.createdAt)) + '</p></div>' +
          '<label class="statussel"><span class="sr-only">Status for ' + esc(o.number) + '</span><select data-status="' + esc(o.id) + '">' +
            S.statuses.map(function (s) { return '<option value="' + s + '"' + (s === o.status ? ' selected' : '') + '>' + STATUS_LABEL[s] + '</option>'; }).join('') +
          '</select></label>' +
        '</div>' +
        '<div class="order__grid">' +
          '<div><h3>Customer</h3><p><strong>' + esc(c.name) + '</strong></p><p>' + esc(c.phone) + '</p><p>' + esc(c.address) + '<br>' + esc(c.city) + ' – ' + esc(c.pincode) + '</p>' +
            (c.note ? '<p class="note">“' + esc(c.note) + '”</p>' : '') + '</div>' +
          '<div><h3>Items</h3><ul class="items">' + o.items.map(function (i) {
            return '<li><span>' + i.qty + ' × ' + esc(i.name) + (i.unit ? ' <em>(' + esc(i.unit) + ')</em>' : '') + '</span><span>' + money(i.lineTotal) + '</span></li>';
          }).join('') + '</ul><p class="order__total"><span>Total</span><span>' + money(o.total) + '</span></p></div>' +
        '</div>' +
        '<div class="order__actions"><a class="btn btn--dark btn--sm" href="' + waCustomer(o) + '" target="_blank" rel="noopener">Message customer on WhatsApp</a></div>' +
      '</article>';
    }).join('');
    $all('[data-status]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        api('/api/admin/orders', { method: 'PATCH', body: { id: sel.getAttribute('data-status'), status: sel.value } })
          .then(function (d) {
            var o = S.orders.find(function (x) { return x.id === d.order.id; }); if (o) o.status = d.order.status;
            toast(d.order.number + ' marked ' + STATUS_LABEL[d.order.status].toLowerCase());
            renderOrders();
          }).catch(function (e) { toast(e.message); loadOrders(); });
      });
    });
  }

  // ---------- products ----------
  function loadProducts() {
    return api('/api/admin/products').then(function (d) { S.products = d.products || []; renderProducts(); });
  }
  function renderProducts() {
    var q = S.psearch.toLowerCase();
    var list = S.products.filter(function (p) { return !q || (p.name + ' ' + p.category).toLowerCase().indexOf(q) >= 0; });
    var live = S.products.filter(function (p) { return p.active !== false; }).length;
    $('[data-products-sub]').textContent = S.products.length + ' products · ' + live + ' visible on website';
    var box = $('[data-products]');
    if (!S.products.length) {
      box.innerHTML = '<div class="emptybox"><h2>Add your first product.</h2><p>Add a name, price and photo. It appears on the website right away.</p><button type="button" class="btn btn--dark" data-new-product2>+ Add product</button></div>';
      $('[data-new-product2]').addEventListener('click', function () { openEditor(null); });
      return;
    }
    if (!list.length) { box.innerHTML = '<div class="emptybox"><h2>No matches.</h2></div>'; return; }
    box.innerHTML = list.map(function (p) {
      return '<article class="prow' + (p.active === false ? ' is-hidden' : '') + '">' +
        '<div class="prow__img">' + (p.image ? '<img src="' + esc(p.image) + '" alt="" loading="lazy">' : '<span>' + esc(p.name.charAt(0)) + '</span>') + '</div>' +
        '<div class="prow__main"><h2>' + esc(p.name) + '</h2><p class="muted">' + CATS[p.category] + (p.unit ? ' · ' + esc(p.unit) : '') + '</p>' +
          '<p class="tags">' + (p.active === false ? '<span class="tagx">Hidden</span>' : '') + (p.featured ? '<span class="tagx tagx--gold">Featured</span>' : '') + '</p></div>' +
        '<div class="prow__price"><strong>' + money(p.price) + '</strong>' + (p.mrp ? '<s>' + money(p.mrp) + '</s>' : '') + '</div>' +
        '<label class="switch switch--sm"><input type="checkbox" data-stock="' + esc(p.id) + '"' + (p.inStock !== false ? ' checked' : '') + '><span class="switch__ui"></span><span>In stock</span></label>' +
        '<button type="button" class="btn btn--line btn--sm" data-edit="' + esc(p.id) + '">Edit</button>' +
      '</article>';
    }).join('');
    $all('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { openEditor(S.products.find(function (p) { return p.id === b.getAttribute('data-edit'); })); }); });
    $all('[data-stock]').forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-stock');
        api('/api/admin/products', { method: 'PUT', body: { id: id, inStock: c.checked } })
          .then(function (d) { replaceProduct(d.product); toast(d.product.name + (d.product.inStock ? ' is in stock' : ' marked out of stock')); })
          .catch(function (e) { c.checked = !c.checked; toast(e.message); });
      });
    });
  }
  function replaceProduct(p) {
    var i = S.products.findIndex(function (x) { return x.id === p.id; });
    if (i >= 0) S.products[i] = p; else S.products.unshift(p);
    renderProducts();
  }
  $('[data-new-product]').addEventListener('click', function () { openEditor(null); });
  $('[data-psearch]').addEventListener('input', function (e) { S.psearch = e.target.value.trim(); renderProducts(); });

  // ---------- editor ----------
  var dlg = $('[data-editor]');
  var form = $('[data-product-form]');
  function setImage(url) {
    form.elements.image.value = url || '';
    var img = $('[data-img-preview]');
    img.hidden = !url; if (url) img.src = url;
    $('[data-img-empty]').hidden = !!url;
    $('[data-img-remove]').hidden = !url;
    $('[data-file-label]').textContent = url ? 'Change photo' : 'Upload photo';
  }
  function openEditor(p) {
    S.editing = p;
    form.reset();
    $('[data-ed-error]').hidden = true;
    $('[data-ed-title]').textContent = p ? 'Edit product' : 'Add product';
    $('[data-delete]').hidden = !p;
    var f = form.elements;
    f.name.value = p ? p.name : '';
    f.category.value = p ? p.category : 'food';
    f.unit.value = p ? (p.unit || '') : '';
    f.price.value = p ? p.price : '';
    f.mrp.value = p && p.mrp ? p.mrp : '';
    f.description.value = p ? (p.description || '') : '';
    f.inStock.checked = p ? p.inStock !== false : true;
    f.featured.checked = p ? !!p.featured : false;
    f.active.checked = p ? p.active !== false : true;
    setImage(p ? p.image : '');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    setTimeout(function () { f.name.focus(); }, 30);
  }
  function closeEditor() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  $all('[data-close]').forEach(function (b) { b.addEventListener('click', closeEditor); });
  $('[data-img-remove]').addEventListener('click', function () { setImage(''); });

  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Could not read that file.')); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('That file is not an image we can read.')); };
        img.onload = function () {
          var max = 1400;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  $('[data-file]').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var label = $('[data-file-label]');
    label.textContent = 'Uploading…';
    resizeImage(file)
      .then(function (dataUrl) { return api('/api/admin/upload', { method: 'POST', body: { filename: file.name, dataUrl: dataUrl } }); })
      .then(function (d) { setImage(d.url); toast('Photo uploaded'); })
      .catch(function (x) { $('[data-ed-error]').textContent = x.message; $('[data-ed-error]').hidden = false; setImage(form.elements.image.value); })
      .then(function () { e.target.value = ''; });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var body = {
      name: f.name.value, category: f.category.value, unit: f.unit.value, price: f.price.value, mrp: f.mrp.value,
      description: f.description.value, image: f.image.value, inStock: f.inStock.checked, featured: f.featured.checked, active: f.active.checked,
    };
    var err = $('[data-ed-error]');
    err.hidden = true;
    var save = $('[data-save]');
    save.disabled = true;
    var req = S.editing
      ? api('/api/admin/products', { method: 'PUT', body: Object.assign({ id: S.editing.id }, body) })
      : api('/api/admin/products', { method: 'POST', body: body });
    req.then(function (d) { replaceProduct(d.product); closeEditor(); toast(S.editing ? 'Product saved' : 'Product added'); })
      .catch(function (x) { err.textContent = x.message; err.hidden = false; })
      .then(function () { save.disabled = false; });
  });
  $('[data-delete]').addEventListener('click', function () {
    var p = S.editing;
    if (!p) return;
    if (!window.confirm('Delete "' + p.name + '"? This cannot be undone.')) return;
    api('/api/admin/products?id=' + encodeURIComponent(p.id), { method: 'DELETE' })
      .then(function () { S.products = S.products.filter(function (x) { return x.id !== p.id; }); renderProducts(); closeEditor(); toast('Product deleted'); })
      .catch(function (x) { $('[data-ed-error]').textContent = x.message; $('[data-ed-error]').hidden = false; });
  });

  // ---------- settings ----------
  var sform = $('[data-settings]');
  function loadSettings() {
    return api('/api/admin/settings').then(function (d) {
      S.settings = d.settings;
      var f = sform.elements;
      Object.keys(CATS).forEach(function (c) { f['cat-' + c].checked = !!d.settings.categories[c]; });
      f.announcement.value = d.settings.announcement || '';
      f.whatsapp.value = d.settings.whatsapp || '';
      f.instagram.value = d.settings.instagram || '';
    });
  }
  sform.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = sform.elements;
    var cats = {};
    Object.keys(CATS).forEach(function (c) { cats[c] = f['cat-' + c].checked; });
    var msg = $('[data-settings-msg]');
    api('/api/admin/settings', { method: 'PUT', body: { categories: cats, announcement: f.announcement.value, whatsapp: f.whatsapp.value, instagram: f.instagram.value } })
      .then(function () { msg.className = 'msg msg--ok'; msg.textContent = 'Saved. The website updates within about a minute.'; msg.hidden = false; toast('Settings saved'); })
      .catch(function (x) { msg.className = 'msg msg--error'; msg.textContent = x.message; msg.hidden = false; });
  });

  // ---------- boot ----------
  function boot() {
    api('/api/admin/session').then(function (d) {
      show('app');
      var banner = $('[data-storage-banner]');
      if (d.storage === 'readonly') {
        banner.hidden = false;
        banner.textContent = 'Storage is not connected yet, so changes can’t be saved. In Vercel, open this project › Storage › connect a Blob store, then redeploy.';
      } else if (d.storage === 'local') {
        banner.hidden = false;
        banner.textContent = 'Local test mode: data is saved on this computer only.';
      } else banner.hidden = true;
      var tab = 'orders';
      try { tab = sessionStorage.getItem('inniya_admin_tab') || 'orders'; } catch (e) { /* ignore */ }
      setTab(tab);
      return Promise.all([loadOrders(), loadProducts(), loadSettings()]);
    }).catch(function (e) {
      if (!$('[data-view="login"]').hidden) {
        if (/not set up/i.test(e.message)) { var er = $('[data-login-error]'); er.textContent = e.message; er.hidden = false; }
        return;
      }
      show('login');
      if (/not set up/i.test(e.message)) { var er2 = $('[data-login-error]'); er2.textContent = e.message; er2.hidden = false; }
    });
  }
  boot();
  setInterval(function () { if (!$('[data-view="app"]').hidden && !document.hidden) loadOrders().catch(function () {}); }, 60000);
})();
