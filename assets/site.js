(function () {
  // Mobile category menu
  var btn = document.querySelector('.menu-btn');
  var bar = document.querySelector('.catbar');
  if (btn && bar) {
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      bar.classList.toggle('is-open', open);
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    bar.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // Header shadow on scroll
  var header = document.querySelector('.header');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hero carousel
  var root = document.querySelector('[data-carousel]');
  if (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-dot]'));
    var i = 0;
    var timer = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var go = function (n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
        s.querySelectorAll('a, button').forEach(function (el) { if (on) el.removeAttribute('tabindex'); else el.setAttribute('tabindex', '-1'); });
      });
      dots.forEach(function (d, k) { d.setAttribute('aria-selected', String(k === i)); });
    };
    var start = function () { if (reduce) return; stop(); timer = setInterval(function () { go(i + 1); }, 6000); };
    var stop = function () { if (timer) clearInterval(timer); timer = null; };
    root.querySelector('[data-prev]').addEventListener('click', function () { go(i - 1); start(); });
    root.querySelector('[data-next]').addEventListener('click', function () { go(i + 1); start(); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(Number(d.getAttribute('data-dot'))); start(); }); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    // swipe
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      x0 = null; start();
    });
    go(0);
    start();
  }

  // Countdown timers
  var cds = Array.prototype.slice.call(document.querySelectorAll('[data-countdown]'));
  if (cds.length) {
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tickCd = function () {
      var now = Date.now();
      cds.forEach(function (el) {
        var end = Date.parse(el.getAttribute('data-countdown'));
        var left = Math.max(0, Math.floor((end - now) / 1000));
        if (left <= 0) {
          if (el.hasAttribute('data-countdown-hide')) { el.hidden = true; return; }
          el.classList.add('is-over');
          var note = el.parentNode && el.parentNode.querySelector('[data-countdown-note]');
          if (note) note.textContent = 'Booking for Chhath Mahaprasad is now closed.';
        }
        var v = { d: Math.floor(left / 86400), h: Math.floor(left % 86400 / 3600), m: Math.floor(left % 3600 / 60), s: left % 60 };
        el.querySelectorAll('[data-cd]').forEach(function (b) {
          var k = b.getAttribute('data-cd');
          var t = k === 'd' ? String(v.d) : pad(v[k]);
          if (b.textContent !== t) {
            b.textContent = t;
            b.classList.remove('tick'); void b.offsetWidth; b.classList.add('tick');
          }
        });
      });
    };
    tickCd();
    setInterval(tickCd, 1000);
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
