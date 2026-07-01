# PROJECT HANDOFF — The Vinyl Lab Israel website

The client is handing this project to a new owner. Read this fully before touching anything.
The client is (rightly) frustrated because the site structure was rebuilt from the wrong source
and the Services navigation was broken. Do NOT ask the client to re-explain — everything known is here.

---

## THE CORRECT STRUCTURE (what the client actually wants)

This is a **multi-page** site. The **Services page is a HUB that links out to a separate detail
page per service** — exactly like the client's original site. Clicking a service must open THAT
service's own page (Mastering, CD, Cassettes, etc.), **NOT** the contact page.

Old site had roughly these service/detail pages (each its own file):
- מאסטרינג — `mastering.html`
- ייצור ויניל — `vinyl-production.html`
- ייצור CD — `cd-production.html`
- קסטות — `cassettes.html`
- עיצוב ואריזות — `design-packaging.html`
- (plus) `pricing.html`, `contact.html`, `faq.html`

Top menu (8 items, every page, this exact order/wording):
`דף הבית · מי אנחנו · שירותים · גלריה · מחירים · גיפט קארדס · לפני שמתקשרים · צור קשר`

3 new pages to include: **home (`index.html`)**, **`gift-cards.html`**, **`before-you-call.html`**.
Old pages must stay unchanged except their menu links.

The client has provided a **video and images** showing the intended navigation and content — treat
those as the authoritative spec. They know exactly where every link should lead.

---

## WHERE THE SOURCE MATERIAL LIVES (GitHub: yarivtenta-creator/FB)

- **Branch `claude/bold-goldberg-g2lbw4`** — the ORIGINAL multi-page old site. This has the real
  service sub-pages under `pages/`: `cassettes.html`, `cd-production.html`, `contact.html`,
  `design-packaging.html`, `faq.html`, `mastering.html`, `pricing.html`, `vinyl-production.html`,
  plus root `index.html`, `assets/css/style.css`, `assets/js/main.js`. **Copy the page structure
  and internal links from here.**
- **Branch `claude/vinyl-lab-html-preview-rs0x2b`** — the new visual design + full asset library
  (`assets/images/` incl. thumbnails/medium/large, logo set, favicon, `assets/video/banner.mp4`).

---

## WHAT WAS DONE WRONG (do not repeat)

The site was rebuilt from the vinyl-lab **single-page (SPA)** version, where "Services" is one page
of cards. Those cards were wired to `contact.html`. That collapsed the per-service detail pages and
broke the drill-down the client needs (Services → Mastering → …). This is the core defect to fix.

Current branch `claude/html-website-merge-package-dh4fio` contains that incorrect build
(8 files: index/about/services/gallery/pricing/gift-cards/before-you-call/contact, shared
`assets/css/style.css` + `assets/js/main.js`, and `final-html-preview.zip`). Keep the assets and the
3 new pages; **rebuild the Services area to link to real per-service pages** from `bold-goldberg`.

---

## DELIVERABLES EXPECTED
- Multi-page HTML site, opens locally by double-clicking `index.html`, no server.
- Services hub links to each service's own page (per the client's video/images).
- 8-item menu identical on every page; 3 new pages added; old pages unchanged except menu.
- Verify links, images, logo, CSS/JS, mobile; produce `final-html-preview.zip`.

---

_The client's materials (video + photos + written instructions) are the source of truth for exact
page-to-page navigation. Build to match them, not to a single-page substitute._
