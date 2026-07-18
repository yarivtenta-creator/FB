/* Go-Bigger Solutions — page behavior
   Scroll reveals, header state, nav highlighting, mobile menu,
   pricing modal, and the intake form (front-end only for now —
   wire the submit handler to the backend intake endpoint later). */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Scroll reveals ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  } else {
    // Stagger siblings that enter together (e.g. cards in a grid)
    reveals.forEach(function (el) {
      var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
      var i = siblings.filter(function (s) { return s.classList && s.classList.contains("reveal"); }).indexOf(el);
      if (i > 0) el.style.setProperty("--d", (Math.min(i, 5) * 0.1) + "s");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Header, scroll progress, kinetic ghost ---------- */
  var header = document.getElementById("siteHeader");
  var progress = document.getElementById("scrollProgress");
  var ghost = document.getElementById("heroGhost");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    if (y > 420 && y > lastY + 6) header.classList.add("hidden");
    else if (y < lastY - 6 || y < 420) header.classList.remove("hidden");
    lastY = y;

    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && max > 0) progress.style.transform = "scaleX(" + Math.min(y / max, 1) + ")";

    if (ghost && !prefersReduced && y < window.innerHeight * 1.4) {
      ghost.style.transform = "translateY(" + y * -0.12 + "px)";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Process steps: tick the level chips as you pass them ---------- */
  var steps = document.querySelectorAll(".process-step");
  if ("IntersectionObserver" in window && steps.length) {
    var stepIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("done");
          stepIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    steps.forEach(function (s) { stepIo.observe(s); });
  } else {
    steps.forEach(function (s) { s.classList.add("done"); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { navIo.observe(s); });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("modal-open");
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    menu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("modal-open", open);
  });
  menu.querySelectorAll("a[href^='#']").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- Pricing modal ---------- */
  var modal = document.getElementById("pricingModal");
  var openBtn = document.getElementById("pricingOpen");
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (openBtn) openBtn.addEventListener("click", openModal);
  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!modal.hidden) closeModal();
      if (menu.classList.contains("open")) closeMenu();
    }
  });

  /* ---------- Client Login placeholder ---------- */
  document.querySelectorAll(".client-login, .mobile-login, .footer-meta a").forEach(function (a) {
    if (a.getAttribute("href") === "#") {
      a.addEventListener("click", function (e) { e.preventDefault(); });
    }
  });

  /* ---------- Intake form (front-end only) ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var bad = !field.value.trim() ||
          (field.type === "email" && !/^\S+@\S+\.\S+$/.test(field.value));
        field.classList.toggle("invalid", bad);
        if (bad) valid = false;
      });
      if (!valid) {
        status.className = "form-status err";
        status.textContent = "Please fill in your name, a valid email, and your goal.";
        return;
      }
      // TODO: POST to the backend intake endpoint (src/intake/normalize.js) when it ships.
      status.className = "form-status ok";
      status.textContent = "Thank you — we've got it. A real person will reply within two business days.";
      form.querySelectorAll("input, textarea").forEach(function (f) { f.value = ""; });
    });
    form.querySelectorAll("input, textarea").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
    });
  }

  /* ==========================================================
     3D layer — vanilla canvas, no dependencies
     ========================================================== */

  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  // Soft glow sprite shared by both scenes
  function makeGlow(color) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.25, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return c;
  }
  var glowCyan = makeGlow("rgba(46,230,224,0.55)");
  var glowViolet = makeGlow("rgba(160,107,255,0.5)");

  function fitCanvas(canvas) {
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, r.width * DPR);
    canvas.height = Math.max(1, r.height * DPR);
    return { w: canvas.width, h: canvas.height };
  }

  // Run a render loop only while the canvas is on screen
  function runWhileVisible(canvas, frame) {
    var running = false, raf = 0, t0 = performance.now();
    function loop(now) {
      frame((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }
    if (prefersReduced) { frame(0); return; } // single static frame
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(loop); }
        else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
      });
    }, { threshold: 0.02 });
    io.observe(canvas);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && running) { cancelAnimationFrame(raf); running = false; }
      else if (!document.hidden) { io.unobserve(canvas); io.observe(canvas); }
    });
  }

  /* ---------- Hero: rotating orbital network ---------- */
  (function () {
    var canvas = document.getElementById("scene3d");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var size = fitCanvas(canvas);
    window.addEventListener("resize", function () { size = fitCanvas(canvas); });

    // Fibonacci sphere
    var N = 190, pts = [], golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var r = Math.sqrt(1 - y * y);
      var th = golden * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    // Static topology: connect points that are close on the sphere
    var pairs = [];
    for (var a = 0; a < N; a++) {
      for (var b = a + 1; b < N; b++) {
        var dx = pts[a][0] - pts[b][0], dy = pts[a][1] - pts[b][1], dz = pts[a][2] - pts[b][2];
        if (dx * dx + dy * dy + dz * dz < 0.11) pairs.push([a, b]);
      }
    }

    var mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener("pointermove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
      ty = (e.clientY / window.innerHeight - 0.5) * 0.35;
    }, { passive: true });

    function project(p, rotY, rotX, cx, cy, R) {
      var x = p[0] * Math.cos(rotY) - p[2] * Math.sin(rotY);
      var z = p[0] * Math.sin(rotY) + p[2] * Math.cos(rotY);
      var y = p[1] * Math.cos(rotX) - z * Math.sin(rotX);
      z = p[1] * Math.sin(rotX) + z * Math.cos(rotX);
      var s = 2.4 / (2.4 - z);
      return [cx + x * R * s, cy + y * R * s, z, s];
    }

    runWhileVisible(canvas, function (t) {
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;
      var w = size.w, h = size.h;
      var cx = w * (w > h ? 0.68 : 0.5), cy = h * 0.46;
      var R = Math.min(w, h) * 0.34;
      var rotY = t * 0.14 + mx, rotX = 0.3 + my;
      ctx.clearRect(0, 0, w, h);

      var proj = [];
      for (var i = 0; i < N; i++) proj.push(project(pts[i], rotY, rotX, cx, cy, R));

      // Links
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = DPR * 0.6;
      for (var k = 0; k < pairs.length; k++) {
        var p1 = proj[pairs[k][0]], p2 = proj[pairs[k][1]];
        var depth = (p1[2] + p2[2]) / 2;
        var al = 0.05 + (depth + 1) * 0.09;
        ctx.strokeStyle = "rgba(46,230,224," + al + ")";
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }

      // Nodes
      for (var j = 0; j < N; j++) {
        var p = proj[j];
        var sz = (2.2 + (p[2] + 1) * 3.4) * p[3] * DPR;
        ctx.globalAlpha = 0.25 + (p[2] + 1) * 0.34;
        ctx.drawImage(glowCyan, p[0] - sz, p[1] - sz, sz * 2, sz * 2);
      }
      ctx.globalAlpha = 1;

      // Two orbit rings, each with a bright traveller
      for (var ring = 0; ring < 2; ring++) {
        var RR = 1.28 + ring * 0.22, tilt = 0.5 + ring * 0.55;
        ctx.beginPath();
        for (var s = 0; s <= 90; s++) {
          var ang = (s / 90) * Math.PI * 2;
          var q = project([Math.cos(ang) * RR, Math.sin(ang) * Math.sin(tilt) * RR, Math.sin(ang) * Math.cos(tilt) * RR], rotY, rotX, cx, cy, R);
          if (s === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
        }
        ctx.strokeStyle = ring ? "rgba(160,107,255,0.16)" : "rgba(46,230,224,0.18)";
        ctx.lineWidth = DPR;
        ctx.stroke();
        var ta = t * (ring ? -0.45 : 0.6) + ring * 2;
        var tp = project([Math.cos(ta) * RR, Math.sin(ta) * Math.sin(tilt) * RR, Math.sin(ta) * Math.cos(tilt) * RR], rotY, rotX, cx, cy, R);
        var tsz = 9 * tp[3] * DPR;
        ctx.drawImage(ring ? glowViolet : glowCyan, tp[0] - tsz, tp[1] - tsz, tsz * 2, tsz * 2);
      }
      ctx.globalCompositeOperation = "source-over";
    });
  })();

  /* ---------- Closing: aurora light ribbons ---------- */
  (function () {
    var canvas = document.getElementById("ribbons");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var size = fitCanvas(canvas);
    window.addEventListener("resize", function () { size = fitCanvas(canvas); });

    var COLORS = ["46,230,224", "110,231,255", "160,107,255", "232,121,249"];
    var ribbons = [];
    for (var i = 0; i < 14; i++) {
      ribbons.push({
        phase: i * 0.7,
        amp: 0.08 + (i % 5) * 0.035,
        freq: 0.0022 + (i % 4) * 0.0009,
        speed: 0.25 + (i % 3) * 0.14,
        color: COLORS[i % COLORS.length],
        width: 0.7 + (i % 3) * 0.5
      });
    }

    runWhileVisible(canvas, function (t) {
      var w = size.w, h = size.h;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < ribbons.length; i++) {
        var rb = ribbons[i];
        ctx.beginPath();
        for (var x = -40; x <= w + 40; x += 14 * DPR) {
          var y = h * 0.52
            + Math.sin(x * rb.freq / DPR + t * rb.speed + rb.phase) * h * rb.amp
            + Math.sin(x * rb.freq * 0.37 / DPR - t * rb.speed * 0.6 + rb.phase * 2) * h * rb.amp * 0.7;
          if (x === -40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(" + rb.color + ",0.35)";
        ctx.lineWidth = rb.width * DPR;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    });
  })();

  /* ---------- 3D tilt on cards ---------- */
  if (!prefersReduced && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".service-card, .result-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", (px * 7) + "deg");
        card.style.setProperty("--rx", (-py * 7) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    });
  }
})();
