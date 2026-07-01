/* ============================================================
   THE VINYL LAB ISRAEL — Multi-page site JS (no server needed)
   ============================================================ */
(function () {
  'use strict';

  var WA = 'https://wa.me/972535315340';
  var NAV = {
    home: 'index.html', about: 'about.html', services: 'services.html',
    gallery: 'gallery.html', pricing: 'pricing.html', gift: 'gift-cards.html',
    before: 'before-you-call.html', contact: 'contact.html'
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNavShortcuts();
    initMobileMenu();
    initNavbarScroll();
    initReveal();
    initFAQ();
    initGallery();
    initBackToTop();
    initForm();
    initHeroVideoFallback();
    // Failsafe: force-reveal after 3.5s so no content ever stays hidden
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.revealed)').forEach(function (el) { el.classList.add('revealed'); });
    }, 3500);
  });

  /* ---------- NON-ANCHOR data-nav SHORTCUTS (e.g. category cards) ---------- */
  function initNavShortcuts() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-nav]');
      if (!el || el.tagName === 'A') return;
      var dest = NAV[el.getAttribute('data-nav')];
      if (dest) window.location.href = dest;
    });
    document.querySelectorAll('[data-nav]').forEach(function (el) {
      if (el.tagName === 'A') return;
      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var dest = NAV[el.getAttribute('data-nav')];
          if (dest) window.location.href = dest;
        }
      });
    });
  }

  /* ---------- MOBILE MENU ---------- */
  function initMobileMenu() {
    var burger = document.querySelector('.hamburger');
    var menu = document.querySelector('.mobile-menu');
    if (!burger || !menu) return;
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('active');
      burger.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobile(); });
  }
  function closeMobile() {
    var burger = document.querySelector('.hamburger');
    var menu = document.querySelector('.mobile-menu');
    if (menu) menu.classList.remove('active');
    if (burger) burger.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ---------- NAVBAR SCROLL ---------- */
  function initNavbarScroll() {
    var nav = document.querySelector('.navbar');
    if (!nav) return;
    function on() { nav.classList.toggle('scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', on, { passive: true });
    on();
  }

  /* ---------- SCROLL REVEAL ---------- */
  var io;
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ---------- FAQ ---------- */
  function initFAQ() {
    document.addEventListener('click', function (e) {
      var q = e.target.closest('.faq-q');
      if (!q) return;
      var item = q.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach(function (o) { o.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  }

  /* ---------- GALLERY LIGHTBOX ---------- */
  function initGallery() {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    var img = lb.querySelector('img');
    var imgs = [], idx = 0;
    function collect() {
      imgs = [];
      document.querySelectorAll('.gallery-item img').forEach(function (i) { imgs.push({ src: i.src, alt: i.alt }); });
    }
    function show(i) { if (!imgs[i]) return; img.src = imgs[i].src; img.alt = imgs[i].alt; lb.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function close() { lb.classList.remove('active'); document.body.style.overflow = ''; }
    document.addEventListener('click', function (e) {
      var item = e.target.closest('.gallery-item');
      if (item) { collect(); idx = [].indexOf.call(item.parentNode.querySelectorAll('.gallery-item'), item); show(idx); return; }
      if (e.target.closest('.lb-close') || e.target === lb) close();
      if (e.target.closest('.lb-prev')) { idx = (idx - 1 + imgs.length) % imgs.length; show(idx); }
      if (e.target.closest('.lb-next')) { idx = (idx + 1) % imgs.length; show(idx); }
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { idx = (idx - 1 + imgs.length) % imgs.length; show(idx); }
      if (e.key === 'ArrowLeft') { idx = (idx + 1) % imgs.length; show(idx); }
    });
  }

  /* ---------- BACK TO TOP ---------- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function () { btn.classList.toggle('visible', window.scrollY > 500); }, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- CONTACT FORM (prefills WhatsApp, no backend) ---------- */
  function initForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('#name') || {}).value || '';
      var phone = (form.querySelector('#phone') || {}).value || '';
      var type = form.querySelector('#projectType');
      var typeTxt = type ? (type.options[type.selectedIndex] || {}).text || '' : '';
      var qty = (form.querySelector('#quantity') || {}).value || '';
      var msg = (form.querySelector('#message') || {}).value || '';
      var text = 'שלום, אני ' + name + '.\nסוג פרויקט: ' + typeTxt + (qty ? '\nכמות: ' + qty : '') + '\nטלפון: ' + phone + '\n' + msg;
      var success = form.querySelector('.form-success');
      if (success) success.classList.add('show');
      window.open(WA + '?text=' + encodeURIComponent(text), '_blank');
    });
  }

  /* ---------- HERO VIDEO FALLBACK ---------- */
  function initHeroVideoFallback() {
    var v = document.getElementById('heroVideo');
    if (!v) return;
    v.addEventListener('error', function () { v.style.display = 'none'; });
  }

})();
