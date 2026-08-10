/* =========================================================================
   EditValue — site behaviour
   No dependencies. Everything degrades to a readable page without JS.
   ========================================================================= */
(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     SHOWREEL SOURCE — the only thing you need to edit to publish films.
     Drop the numeric Vimeo ID from https://vimeo.com/<ID> into `id`.
     Leave `id` empty and the card links out to the Vimeo profile instead.
     `poster` is a 4:3 image in assets/work/.
     --------------------------------------------------------------------- */
  var VIMEO_PROFILE = 'https://vimeo.com/user96599547';

  var FILMS = [
    { id: '', title: 'First dance, downtown loft', meta: 'Highlights · 4:12',  poster: 'assets/work/film-01.jpg' },
    { id: '', title: 'Vows at golden hour',        meta: 'Highlights · 3:48',  poster: 'assets/work/film-02.jpg' },
    { id: '', title: 'The morning before',         meta: 'Teaser · 1:26',      poster: 'assets/work/film-03.jpg' },
    { id: '', title: 'Confetti exit',              meta: 'Social reel · 0:42', poster: 'assets/work/film-04.jpg' },
    { id: '', title: 'Speeches, long table',       meta: 'Highlights · 5:02',  poster: 'assets/work/film-05.jpg' },
    { id: '', title: 'Blue hour, arched window',   meta: 'Highlights · 4:31',  poster: 'assets/work/film-06.jpg' }
  ];

  /* Ten-day delivery timeline shown by the hero timeline control. */
  var DAYS = [
    ['Upload',    'Your cards go up as they are — 4K, mixed cameras, mixed frame rates. With them, your brief and the song you want the highlights cut to.'],
    ['Assembly',  'Every card is logged and organised. Ceremony and speeches are synced to the good audio rather than the on-camera scratch track.'],
    ['Selects',   'A first pass through the whole day, pulling the moments that will actually carry the film.'],
    ['Structure', 'The selects are put into a shape: the arc of the day, where the vows land, where the speeches are given room to breathe.'],
    ['The cut',   'The highlights film is built to your song. Its length follows the track — usually three to five minutes.'],
    ['Refine',    'A pass for pacing. Every cut is checked against the music so that nothing sits a beat too long.'],
    ['Sound',     'Vows and speeches are mixed to sit beneath the music rather than fight it, and levels are matched across the film.'],
    ['Grade',     'The 4K source is graded and matched across cameras, then mastered to Full HD for delivery.'],
    ['First cut', 'It comes to you. Watch it properly, then send notes — anything from a single moment to the whole music choice.'],
    ['Revisions', 'Two full rounds, at no cost. Pacing, music, moments in or out.'],
    ['Delivered', 'The highlights film and the vertical social reel, free with every delivery. Unbranded, ready to go out under your studio’s name.']
  ];

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pad = function (n, w) { n = String(Math.floor(n)); while (n.length < (w || 2)) n = '0' + n; return n; };

  /* ---------------------------------------------------------------- theme */
  var root = document.documentElement;
  var themeBtns = $$('[data-theme-toggle]');

  function resolvedTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function paintThemeBtns() {
    var next = resolvedTheme() === 'dark' ? 'light' : 'dark';
    themeBtns.forEach(function (btn) {
      $('.theme-txt', btn).textContent = next === 'dark' ? 'Dark' : 'Light';
      btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    });
  }

  try {
    var saved = localStorage.getItem('ev-theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) { /* storage blocked — fall back to system */ }

  themeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      root.setAttribute('data-theme', resolvedTheme() === 'dark' ? 'light' : 'dark');
      try { localStorage.setItem('ev-theme', root.getAttribute('data-theme')); } catch (e) {}
      paintThemeBtns();
    });
  });
  paintThemeBtns();

  /* Follow the system preference while it changes, until the visitor has
     made an explicit choice of their own. */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!root.getAttribute('data-theme')) paintThemeBtns();
  });

  /* --------------------------------------------------------------- header */
  var bar = $('#bar');
  var burger = $('#burger');
  var drawer = $('#drawer');

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      drawer.hidden = open;
    });
    $$('a', drawer).forEach(function (a) {
      a.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        drawer.hidden = true;
      });
    });
  }

  /* ------------------------------------------------------- scroll progress */
  var progress = $('#progress');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progress) progress.style.width = (p * 100) + '%';
      if (bar) bar.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ------------------------------------------------------ ten-day timeline */
  var range = $('#scrubRange');
  if (range) {
    var sTitle = $('#scrubTitle');
    var sText  = $('#scrubText');
    var sDay   = $('#scrubDay');

    var paintScrub = function () {
      var d = Math.min(DAYS.length - 1, Math.max(0, parseInt(range.value, 10) || 0));
      range.style.setProperty('--pct', (d / (DAYS.length - 1)) * 100 + '%');
      sDay.textContent   = String(d);
      sTitle.textContent = DAYS[d][0];
      sText.textContent  = DAYS[d][1];
    };

    range.addEventListener('input', paintScrub);
    paintScrub();
  }

  /* --------------------------------------------------------------- reveal */
  var revealTargets = $$('.sec .wrap > *, .hero .wrap > *, .offer .wrap > *');
  if ('IntersectionObserver' in window && !reduce.matches) {
    revealTargets.forEach(function (el) { el.setAttribute('data-reveal', ''); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        /* Reveal on entry, but also for anything already scrolled past —
           a deep link or an End keypress must not leave a section blank. */
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------- measure (bars) */
  var fills = $$('.m-fill');
  if (fills.length) {
    var draw = function () { fills.forEach(function (f) { f.style.width = f.dataset.w + '%'; }); };
    if ('IntersectionObserver' in window && !reduce.matches) {
      var mio = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { draw(); mio.disconnect(); }
      }, { threshold: 0.3 });
      mio.observe(fills[0].closest('.measure'));
    } else {
      draw();
    }
  }

  /* ----------------------------------------------------------------- reel */
  var reel = $('#reel');
  if (reel) {
    reel.innerHTML = '';
    FILMS.forEach(function (film, i) {
      var card = document.createElement('article');
      card.className = 'film';

      var open = film.id
        ? '<button class="film-frame" type="button" aria-label="Play ' + film.title + '">'
        : '<a class="film-frame" href="' + VIMEO_PROFILE + '" rel="noopener" aria-label="' + film.title + ' on Vimeo">';

      /* The slate sits behind the poster. With no poster it shows on its
         own — a leader frame rather than a broken image. */
      card.innerHTML =
        open +
          '<span class="slate" aria-hidden="true">' +
            '<span class="slate-bars"><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
            '<span class="slate-rows">' +
              '<span class="slate-row"><b>Roll</b><u>EV&nbsp;' + pad(i + 1, 3) + '</u></span>' +
              '<span class="slate-row"><b>Scene</b><u>' + pad(i + 1, 2) + 'A</u></span>' +
            '</span>' +
          '</span>' +
          '<img class="film-img" src="' + film.poster + '" alt="" loading="lazy" decoding="async" width="640" height="480" />' +
          '<span class="film-play" aria-hidden="true"></span>' +
          '<span class="film-tc" aria-hidden="true">' + pad(i + 1, 2) + '</span>' +
        (film.id ? '</button>' : '</a>') +
        '<div class="film-body">' +
          '<h3 class="film-h">' + film.title + '</h3>' +
          '<p class="film-m">' + film.meta + '</p>' +
        '</div>';

      var img = $('.film-img', card);
      img.addEventListener('error', function () { card.classList.add('no-poster'); });
      if (img.complete && img.naturalWidth === 0) card.classList.add('no-poster');

      if (film.id) {
        $('.film-frame', card).addEventListener('click', function () {
          var frame = document.createElement('iframe');
          frame.src = 'https://player.vimeo.com/video/' + film.id + '?autoplay=1&title=0&byline=0&portrait=0';
          frame.title = film.title;
          frame.allow = 'autoplay; fullscreen; picture-in-picture';
          frame.setAttribute('allowfullscreen', '');
          card.replaceChild(frame, $('.film-frame', card));
        });
      }

      reel.appendChild(card);
    });
  }

  /* ----------------------------------------------------------------- form */
  var form = $('#form');
  if (form) {
    var status = $('#formStatus');
    var mark = function (input, errEl, bad) {
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
      errEl.hidden = !bad;
      return !bad;
    };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name  = $('#f-name');
      var email = $('#f-email');

      var okName  = mark(name,  $('#e-name'),  !name.value.trim());
      var okEmail = mark(email, $('#e-email'), !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()));

      if (!okName || !okEmail) {
        status.textContent = '';
        (okName ? email : name).focus();
        return;
      }

      /* TODO: POST to the intake endpoint. Until then this only confirms
         locally — no message is sent anywhere. */
      status.textContent = 'Thank you — we will come back with upload details the same working day.';
      form.reset();
    });
  }

  /* ----------------------------------------------------------------- misc */
  var yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  root.classList.add('js-ready');
})();
