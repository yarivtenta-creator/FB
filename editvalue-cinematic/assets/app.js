/* =========================================================================
   EditValue — cinematic redesign
   No dependencies. Every enhancement layers on top of a page that already
   works: the reel is a plain horizontal scroller until JS pins it, the
   comparisons render both states until JS makes them draggable, and every
   drawn film frame stands in until real media is dropped into assets/media/.
   ========================================================================= */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  var root = document.documentElement;

  /* ==================================================== header state ==== */
  var bar = $('#bar');
  var DARK = '.hero, .workpin, .compare, .credits, .finale, .foot';

  function paintBar() {
    if (!bar) return;
    var h = bar.offsetHeight || 60;
    bar.classList.toggle('is-solid', window.scrollY > 24);
    var overDark = $$(DARK).some(function (sec) {
      var r = sec.getBoundingClientRect();
      return r.top <= h * 0.6 && r.bottom > h * 0.6;
    });
    bar.classList.toggle('on-dark', overDark);
  }

  /* ==================================================== mobile drawer === */
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

  /* ==================================================== media loading === */
  /* Videos carry preload="none" and only load once they are near the
     viewport. Until one can actually play it stays transparent and the drawn
     film frame behind it shows through, so a missing file is never a hole. */
  function wakeVideo(v) {
    if (v.dataset.woke) return;
    v.dataset.woke = '1';
    v.addEventListener('canplay', function () {
      v.classList.add('is-ready');
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* autoplay refused — poster stands */ });
    }, { once: true });
    try { v.load(); } catch (e) { /* no sources — the frame stays */ }
  }

  var videos = $$('video.v');
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        wakeVideo(e.target);
        vio.unobserve(e.target);
      });
    }, { rootMargin: '200px 0px' });
    videos.forEach(function (v) { vio.observe(v); });
  } else {
    videos.forEach(wakeVideo);
  }

  /* ==================================================== hero ============ */
  var heroVideo = $('#heroVideo');
  var reelFill = $('#reelFill');
  var reelTc = $('#reelTc');
  var reelDur = $('#reelDur');

  function mmss(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  if (heroVideo) {
    heroVideo.addEventListener('loadedmetadata', function () {
      if (reelDur) reelDur.textContent = mmss(heroVideo.duration);
    });
    heroVideo.addEventListener('timeupdate', function () {
      if (!heroVideo.duration) return;
      var p = heroVideo.currentTime / heroVideo.duration;
      if (reelFill) reelFill.style.width = (p * 100) + '%';
      if (reelTc) reelTc.textContent = mmss(heroVideo.currentTime);
    });
  }

  /* With no showreel file present the indicator would sit dead at zero.
     Run it as an ambient loop instead so the hero still reads as film. */
  var ambient = null;
  function startAmbient() {
    if (ambient || reduceMQ.matches || !reelFill) return;
    var t0 = null, LOOP = 24000;
    ambient = function step(ts) {
      if (t0 === null) t0 = ts;
      var p = ((ts - t0) % LOOP) / LOOP;
      reelFill.style.width = (p * 100) + '%';
      if (reelTc) reelTc.textContent = mmss(p * 24);
      window.requestAnimationFrame(ambient);
    };
    window.requestAnimationFrame(ambient);
  }
  window.setTimeout(function () {
    if (!heroVideo || !heroVideo.classList.contains('is-ready')) startAmbient();
  }, 1400);

  var watchBtn = $('#watchBtn');
  if (watchBtn) {
    watchBtn.addEventListener('click', function () {
      var work = $('#work');
      if (work) work.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ==================================================== work reel ======= */
  /* Vertical scroll drives horizontal movement, but only where that is a
     genuine improvement: wide viewports with motion allowed. Everywhere else
     the markup stays the swipeable scroller it already is. */
  var pin = $('#work');
  var track = $('#worktrack');
  var workNow = $('#workNow');
  var workAll = $('#workAll');
  var slides = track ? $$('.slide', track) : [];
  var pinned = false;

  if (workAll) workAll.textContent = slides.length < 10 ? '0' + slides.length : String(slides.length);

  function pinEligible() {
    return !!pin && !!track && slides.length > 1 &&
           !reduceMQ.matches && window.innerWidth >= 900;
  }

  function enablePin() {
    if (pinned || !pinEligible()) return;
    pinned = true;
    pin.classList.add('js-pin');
    /* one viewport of travel per slide after the first, plus a beat at each end */
    pin.style.setProperty('--pin-h', ((slides.length - 1) * 100 + 120) + 'vh');
  }

  function disablePin() {
    if (!pinned) return;
    pinned = false;
    pin.classList.remove('js-pin');
    pin.style.removeProperty('--pin-h');
    track.style.transform = '';
  }

  function paintPin() {
    if (!pinned) return;
    var total = pin.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var p = clamp(-pin.getBoundingClientRect().top / total, 0, 1);
    var maxX = track.scrollWidth - window.innerWidth;
    track.style.transform = 'translate3d(' + (-p * maxX).toFixed(2) + 'px,0,0)';
    if (workNow) {
      var n = clamp(Math.floor(p * slides.length) + 1, 1, slides.length);
      workNow.textContent = n < 10 ? '0' + n : String(n);
    }
  }

  /* ==================================================== reveals ========= */
  var rvTargets = $$([
    '.hero-body > *', '.workhead > *', '.diff .wrap > *', '.pri > *',
    '.services .wrap > *', '.srv-row', '.compare .wrap > *', '.ba',
    '.process .wrap > *', '.step', '.credits .wrap > *', '.finale-body > *',
    '.foot-in > *'
  ].join(', '));

  /* Visually-hidden headings are not worth animating, and giving them
     opacity:0 only muddies the reveal bookkeeping. */
  rvTargets = rvTargets.filter(function (el) { return !el.classList.contains('sr'); });

  var rio = null;
  if ('IntersectionObserver' in window && !reduceMQ.matches) {
    rvTargets.forEach(function (el) { el.setAttribute('data-rv', ''); });
    rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
        e.target.classList.add('is-in');
        rio.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    rvTargets.forEach(function (el) { rio.observe(el); });
  }

  /* The negative bottom margin means the last element on the page can sit
     just inside the viewport and never trip the observer. Once the page is
     scrolled to the end, nothing is allowed to still be hidden. */
  function sweepBottom() {
    if (!rio) return;
    var atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    if (!atEnd) return;
    rvTargets.forEach(function (el) {
      if (el.classList.contains('is-in')) return;
      el.classList.add('is-in');
      rio.unobserve(el);
    });
  }

  /* ==================================================== services peek === */
  var peek = $('#srvPeek');
  var srv = $('#srv');
  if (peek && srv && finePointer.matches && !reduceMQ.matches) {
    var px = 0, py = 0, tx = 0, ty = 0, peeking = false, raf = null;

    var glide = function () {
      tx += (px - tx) * 0.16;
      ty += (py - ty) * 0.16;
      peek.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%) scale(' + (peeking ? 1 : 0.9) + ')';
      raf = window.requestAnimationFrame(glide);
    };

    srv.addEventListener('pointermove', function (ev) { px = ev.clientX; py = ev.clientY; });
    $$('.srv-row', srv).forEach(function (row) {
      row.addEventListener('pointerenter', function () {
        peeking = true;
        peek.classList.add('is-on');
        /* vary the stand-in frame per row so the preview is not one flat swatch */
        var i = parseInt(row.dataset.srv, 10) || 1;
        $('.frame', peek).style.filter = 'hue-rotate(' + (i * 9) + 'deg) saturate(' + (0.85 + i * 0.05) + ')';
      });
      row.addEventListener('pointerleave', function () { peeking = false; peek.classList.remove('is-on'); });
    });
    srv.addEventListener('pointerleave', function () { peeking = false; peek.classList.remove('is-on'); });
    raf = window.requestAnimationFrame(glide);
  }

  /* ==================================================== waveforms ======= */
  /* Drawn rather than imaged: "unmixed" is a brick of clipped level, "mixed"
     keeps its dynamics. Deterministic, so both halves line up frame for frame. */
  function waveSvg(kind) {
    var N = 72, parts = [], i, t, env, det, h;
    for (i = 0; i < N; i++) {
      t = i / (N - 1);
      env = Math.sin(t * Math.PI);
      det = 0.5 + 0.5 * Math.sin(t * 37.7) * Math.sin(t * 11.3 + 1.2);
      h = kind === 'raw'
        ? 0.82 + 0.14 * det                       /* squashed flat against the ceiling */
        : 0.12 + 0.88 * env * (0.3 + 0.7 * det);  /* room to breathe */
      parts.push({ x: (i / N) * 100, h: h });
    }
    var w = (100 / N) * 0.58;
    var fill = kind === 'raw' ? '#8D8C86' : '#C5A46D';
    var rects = parts.map(function (p) {
      var hh = p.h * 50;
      return '<rect x="' + p.x.toFixed(2) + '" y="' + (50 - hh).toFixed(2) +
             '" width="' + w.toFixed(2) + '" height="' + (hh * 2).toFixed(2) + '" fill="' + fill + '"/>';
    }).join('');
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-hidden="true">' + rects + '</svg>';
  }
  $$('[data-wave]').forEach(function (el) { el.innerHTML = waveSvg(el.dataset.wave); });

  /* ==================================================== before / after == */
  $$('[data-ba]').forEach(function (stage) {
    var handle = $('.ba-handle', stage);
    var dragging = false;

    function set(pct, announce) {
      pct = clamp(pct, 0, 100);
      stage.style.setProperty('--split', pct + '%');
      if (handle && announce !== false) handle.setAttribute('aria-valuenow', Math.round(pct));
    }

    function fromEvent(ev) {
      var r = stage.getBoundingClientRect();
      set(((ev.clientX - r.left) / r.width) * 100);
    }

    stage.addEventListener('pointerdown', function (ev) {
      dragging = true;
      stage.setPointerCapture(ev.pointerId);
      fromEvent(ev);
      ev.preventDefault();
    });
    stage.addEventListener('pointermove', function (ev) { if (dragging) fromEvent(ev); });
    var stop = function (ev) {
      if (!dragging) return;
      dragging = false;
      try { stage.releasePointerCapture(ev.pointerId); } catch (e) {}
    };
    stage.addEventListener('pointerup', stop);
    stage.addEventListener('pointercancel', stop);

    if (handle) {
      handle.addEventListener('keydown', function (ev) {
        var now = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
        var step = ev.shiftKey ? 10 : 2;
        if (ev.key === 'ArrowLeft')      { set(now - step); ev.preventDefault(); }
        else if (ev.key === 'ArrowRight'){ set(now + step); ev.preventDefault(); }
        else if (ev.key === 'Home')      { set(0);  ev.preventDefault(); }
        else if (ev.key === 'End')       { set(100); ev.preventDefault(); }
      });
    }

    set(50);
  });

  /* ==================================================== scroll loop ===== */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      paintBar();
      paintPin();
      sweepBottom();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (pinEligible()) { enablePin(); } else { disablePin(); }
      onScroll();
    }, 150);
  });

  reduceMQ.addEventListener('change', function () {
    if (pinEligible()) { enablePin(); } else { disablePin(); }
    onScroll();
  });

  /* ==================================================== boot =========== */
  var yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  if (pinEligible()) enablePin();
  onScroll();
  window.requestAnimationFrame(function () { root.classList.add('is-lit'); });
})();
