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

  /* ---------- Header: solid after scroll, hide on scroll down ---------- */
  var header = document.getElementById("siteHeader");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    if (y > 420 && y > lastY + 6) header.classList.add("hidden");
    else if (y < lastY - 6 || y < 420) header.classList.remove("hidden");
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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
})();
