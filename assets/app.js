(function () {
  "use strict";

  var WHATSAPP_URL = "https://wa.me/31683010122?text=I%20am%20interested%20in%20the%20AI%20Business%20Growth%20Platform.%20How%20do%20we%20continue%3F";
  var LANGS = ["en", "nl", "de", "it", "fr", "es"];
  var STORAGE_KEY = "aigp_lang";

  var app = document.getElementById("app");
  var T = window.TRANSLATIONS;

  function getSavedLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function whatsappIcon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.29-.76.94-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5-.17 0-.37-.02-.56-.02-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.2 3.03c.15.2 2.06 3.15 5 4.41.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.72-.7 1.97-1.38.24-.68.24-1.26.17-1.38-.07-.13-.27-.2-.56-.34z"/><path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0012.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2zm0 18.06c-1.62 0-3.13-.44-4.43-1.2l-.32-.19-3 .79.8-2.92-.21-.3A8.02 8.02 0 014 12c0-4.42 3.6-8.02 8.02-8.02 4.42 0 8.01 3.6 8.01 8.02 0 4.42-3.59 8.06-8.01 8.06z"/></svg>';
  }

  // ---------- Render ----------

  function renderWelcome() {
    app.innerHTML =
      '<div class="welcome">' +
        '<div class="welcome-card">' +
          '<div class="eyebrow" data-w="eyebrow"></div>' +
          '<h1 class="welcome-title" data-w="title"></h1>' +
          '<p class="welcome-subtitle" data-w="subtitle"></p>' +
          '<p class="welcome-note" data-w="note"></p>' +
          '<div class="lang-grid" id="langGrid"></div>' +
        '</div>' +
      '</div>';

    var welcomeCopy = T.en.welcome; // welcome screen itself stays neutral/English until a language is picked
    app.querySelector('[data-w="eyebrow"]').textContent = "AI Business Growth Platform";
    app.querySelector('[data-w="title"]').textContent = welcomeCopy.title;
    app.querySelector('[data-w="subtitle"]').textContent = welcomeCopy.subtitle;
    app.querySelector('[data-w="note"]').textContent = welcomeCopy.note;

    var grid = document.getElementById("langGrid");
    LANGS.forEach(function (code) {
      var btn = document.createElement("button");
      btn.className = "lang-btn";
      btn.textContent = T[code].meta.name;
      btn.addEventListener("click", function () {
        saveLang(code);
        renderSite(code);
      });
      grid.appendChild(btn);
    });
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderSite(lang) {
    var d = T[lang];
    document.documentElement.lang = lang;

    var html = "";

    // Nav
    html += navHTML(d, lang);

    // Hero
    html += '<section class="hero container">' +
      '<div class="eyebrow">' + esc(d.hero.eyebrow) + '</div>' +
      '<h1 class="hero-title">' + esc(d.hero.title) + ' <span class="gradient-text">' + esc(d.hero.titleHighlight) + '</span></h1>' +
      '<p class="hero-subtitle">' + esc(d.hero.subtitle) + '</p>' +
      '<div class="hero-actions">' +
        '<a class="btn btn-primary" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener">' + esc(d.hero.ctaPrimary) + '</a>' +
        '<a class="btn btn-ghost" href="#how-thinks">' + esc(d.hero.ctaSecondary) + '</a>' +
      '</div>' +
      '<div class="hero-stats">' +
        d.hero.stats.map(function (s) {
          return '<div class="stat"><div class="stat-value">' + esc(s.value) + '</div><div class="stat-label">' + esc(s.label) + '</div></div>';
        }).join("") +
      '</div>' +
    '</section>';

    // Dream
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.dream.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.dream.body) + '</p>' +
        '</div>' +
        '<div class="bullets">' +
          d.dream.bullets.map(function (b) { return '<div class="bullet">' + esc(b) + '</div>'; }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // Different
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.different.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.different.subtitle) + '</p>' +
        '</div>' +
        '<div class="grid grid-4">' +
          d.different.cards.map(function (c, i) {
            return '<div class="card"><div class="card-icon">' + (i + 1) + '</div><div class="card-title">' + esc(c.title) + '</div><div class="card-body">' + esc(c.body) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // How it thinks
    html += '<section class="section reveal" id="how-thinks">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.howThinks.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.howThinks.subtitle) + '</p>' +
        '</div>' +
        '<div class="steps-row">' +
          d.howThinks.steps.map(function (s, i) {
            return '<div class="card step-card"><div class="step-num">0' + (i + 1) + '</div><div class="card-title" style="margin-top:8px">' + esc(s.title) + '</div><div class="card-body">' + esc(s.body) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // Mission flow
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.missionFlow.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.missionFlow.subtitle) + '</p>' +
        '</div>' +
        '<div class="mission-progress"><div class="mission-progress-bar" id="missionBar"></div></div>' +
        '<div class="mission-flow" id="missionFlow">' +
          d.missionFlow.steps.map(function (s, i) {
            return '<div class="mission-node" data-idx="' + i + '"><div class="mission-index">' + (i + 1) + '</div><div class="mission-label">' + esc(s.label) + '</div><div class="mission-desc">' + esc(s.desc) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // Capabilities
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.capabilities.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.capabilities.subtitle) + '</p>' +
        '</div>' +
        '<div class="grid grid-4">' +
          d.capabilities.items.map(function (c, i) {
            return '<div class="card"><div class="card-icon">' + (i + 1) + '</div><div class="card-title">' + esc(c.title) + '</div><div class="card-body">' + esc(c.body) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // Use cases
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.useCases.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.useCases.subtitle) + '</p>' +
        '</div>' +
        '<div class="grid grid-4">' +
          d.useCases.items.map(function (c, i) {
            return '<div class="card"><div class="card-icon">' + (i + 1) + '</div><div class="card-title">' + esc(c.title) + '</div><div class="card-body">' + esc(c.body) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // Classes / batches
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.classes.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.classes.body) + '</p>' +
        '</div>' +
        '<div class="grid grid-4">' +
          d.classes.points.map(function (p, i) {
            return '<div class="card"><div class="card-icon">' + (i + 1) + '</div><div class="card-body">' + esc(p) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // Self-improving
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.selfImproving.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.selfImproving.body) + '</p>' +
        '</div>' +
        '<div class="grid grid-4">' +
          d.selfImproving.points.map(function (p, i) {
            return '<div class="card"><div class="card-icon">' + (i + 1) + '</div><div class="card-body">' + esc(p) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // Dashboards
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.dashboards.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.dashboards.subtitle) + '</p>' +
        '</div>' +
        '<div class="dash-grid">' +
          '<div class="dash-card"><h3>' + esc(d.dashboards.admin.title) + '</h3><ul>' +
            d.dashboards.admin.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("") +
          '</ul></div>' +
          '<div class="dash-card"><h3>' + esc(d.dashboards.user.title) + '</h3><ul>' +
            d.dashboards.user.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("") +
          '</ul></div>' +
        '</div>' +
      '</div>' +
    '</section>';

    // Pricing
    html += '<section class="section reveal" id="pricing">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.pricing.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.pricing.subtitle) + '</p>' +
        '</div>' +
        '<div class="pricing-grid">' +
          d.pricing.options.map(function (o, i) {
            return '<div class="price-card' + (i === 1 ? ' featured' : '') + '">' +
              '<div class="price-tag">' + esc(o.tag) + '</div>' +
              '<div class="price-name">' + esc(o.name) + '</div>' +
              '<div class="price-desc">' + esc(o.desc) + '</div>' +
              '<ul class="price-features">' + o.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join("") + '</ul>' +
              '<a class="btn btn-primary btn-block" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener">' + esc(d.hero.ctaPrimary) + '</a>' +
            '</div>';
          }).join("") +
        '</div>' +
        '<div class="unit-note">' + esc(d.pricing.unitNote) + '</div>' +
      '</div>' +
    '</section>';

    // Purchase vs subscription
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head"><h2 class="section-title">' + esc(d.purchaseVsSub.title) + '</h2></div>' +
        '<div class="compare-wrap"><table class="compare">' +
          '<thead><tr><th>' + esc(d.purchaseVsSub.featureLabel) + '</th><th class="center">' + esc(d.purchaseVsSub.purchaseLabel) + '</th><th class="center">' + esc(d.purchaseVsSub.monthlyLabel) + '</th></tr></thead>' +
          '<tbody>' +
            d.purchaseVsSub.rows.map(function (r) {
              return '<tr><td>' + esc(r.feature) + '</td>' +
                '<td class="center">' + (r.oneTime ? '<span class="check-yes">✓</span>' : '<span class="check-no">—</span>') + '</td>' +
                '<td class="center">' + (r.monthly ? '<span class="check-yes">✓</span>' : '<span class="check-no">—</span>') + '</td></tr>';
            }).join("") +
          '</tbody>' +
        '</table></div>' +
      '</div>' +
    '</section>';

    // Monthly updates
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.monthlyUpdates.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.monthlyUpdates.body) + '</p>' +
        '</div>' +
        '<div class="grid grid-4">' +
          d.monthlyUpdates.points.map(function (p, i) {
            return '<div class="card"><div class="card-icon">' + (i + 1) + '</div><div class="card-body">' + esc(p) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // Expansion packs
    html += '<section class="section reveal">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<h2 class="section-title">' + esc(d.expansionPacks.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.expansionPacks.body) + '</p>' +
        '</div>' +
        '<div class="grid grid-4">' +
          d.expansionPacks.points.map(function (p, i) {
            return '<div class="card"><div class="card-icon">' + (i + 1) + '</div><div class="card-body">' + esc(p) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // FAQ
    html += '<section class="section reveal" id="faq">' +
      '<div class="container">' +
        '<div class="section-head"><h2 class="section-title">' + esc(d.faq.title) + '</h2></div>' +
        '<div class="faq-list">' +
          d.faq.items.map(function (f, i) {
            return '<div class="faq-item" data-faq="' + i + '">' +
              '<button class="faq-q"><span>' + esc(f.q) + '</span><span class="plus">+</span></button>' +
              '<div class="faq-a"><div class="faq-a-inner">' + esc(f.a) + '</div></div>' +
            '</div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</section>';

    // Final CTA
    html += '<section class="section">' +
      '<div class="container">' +
        '<div class="final-cta">' +
          '<h2 class="section-title">' + esc(d.finalCta.title) + '</h2>' +
          '<p class="section-subtitle">' + esc(d.finalCta.subtitle) + '</p>' +
          '<div class="final-cta-actions">' +
            '<a class="btn btn-primary" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener">' + whatsappIcon() + '<span>' + esc(d.finalCta.whatsapp) + '</span></a>' +
          '</div>' +
          '<div class="final-cta-note">' + esc(d.finalCta.note) + '</div>' +
        '</div>' +
      '</div>' +
    '</section>';

    // Footer
    html += '<footer class="footer"><div class="container">' +
      '<div class="footer-inner">' +
        '<div class="footer-tagline">' + esc(d.footer.tagline) + '</div>' +
        '<div class="footer-links">' + d.footer.links.map(function (l) { return '<a href="#">' + esc(l) + '</a>'; }).join("") + '</div>' +
      '</div>' +
      '<div class="footer-rights">© ' + new Date().getFullYear() + ' AI Business Growth Platform. ' + esc(d.footer.rights) + '</div>' +
    '</div></footer>';

    // Sticky CTA
    html += '<a class="sticky-cta" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener">' + whatsappIcon() + '<span>' + esc(d.finalCta.whatsapp) + '</span></a>';

    app.innerHTML = html;

    wireNav(lang);
    wireFaq();
    wireReveal();
    wireMissionFlow(d.missionFlow.steps.length);
  }

  function navHTML(d, currentLang) {
    var langOptions = LANGS.map(function (code) {
      return '<option value="' + code + '"' + (code === currentLang ? " selected" : "") + '>' + T[code].meta.name + '</option>';
    }).join("");
    return '<nav class="nav" id="siteNav">' +
      '<div class="nav-inner">' +
        '<div class="nav-brand"><span class="dot"></span>' + esc(d.nav.brand) + '</div>' +
        '<div class="nav-actions">' +
          '<select class="lang-select" id="navLangSelect">' + langOptions + '</select>' +
          '<a class="btn btn-primary btn-sm" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener">' + esc(d.nav.cta) + '</a>' +
        '</div>' +
      '</div>' +
    '</nav>';
  }

  function wireNav(lang) {
    var nav = document.getElementById("siteNav");
    var lastY = window.scrollY;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y > 400) {
        nav.classList.add("visible");
      } else {
        nav.classList.remove("visible");
      }
      lastY = y;
    });

    var select = document.getElementById("navLangSelect");
    select.addEventListener("change", function () {
      var newLang = select.value;
      saveLang(newLang);
      renderSite(newLang);
      window.scrollTo(0, 0);
    });
  }

  function wireFaq() {
    var items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      q.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        items.forEach(function (other) {
          other.classList.remove("open");
          other.querySelector(".faq-a").style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add("open");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });
  }

  function wireReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  function wireMissionFlow(count) {
    var flow = document.getElementById("missionFlow");
    var bar = document.getElementById("missionBar");
    if (!flow) return;
    var nodes = flow.querySelectorAll(".mission-node");
    var idx = 0;
    var timer = null;

    function activate(i) {
      nodes.forEach(function (n) { n.classList.remove("active"); });
      nodes[i].classList.add("active");
      bar.style.width = Math.round(((i + 1) / count) * 100) + "%";
      var node = nodes[i];
      var rect = node.getBoundingClientRect();
      var flowRect = flow.getBoundingClientRect();
      if (rect.left < flowRect.left || rect.right > flowRect.right) {
        flow.scrollTo({ left: node.offsetLeft - 20, behavior: "smooth" });
      }
    }

    function start() {
      activate(idx);
      timer = setInterval(function () {
        idx = (idx + 1) % count;
        activate(idx);
      }, 2200);
    }

    flow.addEventListener("mouseenter", function () { clearInterval(timer); });
    flow.addEventListener("mouseleave", function () { timer = setInterval(function () { idx = (idx + 1) % count; activate(idx); }, 2200); });

    start();
  }

  // ---------- Boot ----------
  var saved = getSavedLang();
  if (saved && T[saved]) {
    renderSite(saved);
  } else {
    renderWelcome();
  }
})();
