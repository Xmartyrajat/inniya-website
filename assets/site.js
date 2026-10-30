(function () {
  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Open menu');
        nav.classList.remove('is-open');
      }
    });
  }

  // Header border on scroll
  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var siblings = Array.prototype.indexOf.call(el.parentNode.children, el);
          el.style.transitionDelay = Math.min(siblings, 4) * 80 + 'ms';
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // 3D tilt on category cards (mouse only)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduce && fine) {
    document.querySelectorAll('.cat').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transitionDelay = '0ms';
        card.style.transform = 'rotateX(' + (-y * 10).toFixed(2) + 'deg) rotateY(' + (x * 12).toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }
})();
