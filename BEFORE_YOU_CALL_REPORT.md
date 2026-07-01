# BEFORE_YOU_CALL_REPORT

**Deliverable:** `before-you-call.html` — a new page for *The Vinyl Lab Israel* that **replaces the FAQ page**.
**Branch:** `claude/before-you-call-page-16g09z`
**Date:** 2026-07-01
**Language / direction:** Hebrew, RTL (`dir="rtl"`, `lang="he"`)

---

## 1. What was built

A single page, `before-you-call.html`, presenting a **"לפני שמתקשרים" (Before You Call) checklist** — the details a customer should prepare before contacting the studio, so the studio can give an accurate quote and realistic timeline on the first call.

The page is delivered as **one HTML file plus the supporting assets it needs to render** (shared CSS/JS + the real images it uses). No other page was created or modified.

### Page structure
1. **Navbar** — matches the approved site navigation (logo + RTL links + WhatsApp).
2. **Page hero** — title *"לפני שמתקשרים"* over a real studio background image.
3. **Intro strip** — short reassurance that not everything has to be finalized.
4. **Checklist grid** — 9 numbered cards (01–09), each with a real image, a heading, a short explanation and a ✓ bullet list.
5. **Legal note** — the required rights declaration, in a highlighted `legal-box` (also anchored at `#legal`).
6. **Contact CTA** — phone (`tel:`) + WhatsApp buttons.
7. **Footer** — matches the approved site footer.
8. **Floating WhatsApp button** — matches the approved site.

---

## 2. Required items — coverage checklist

Every item requested in the brief is present as its own numbered card:

| # | Required item | Card title | Real image used |
|---|---------------|-----------|-----------------|
| 01 | פורמט: ויניל / CD / קסטה / המרות מדיה | פורמט | `vinyl-record-on-turntable.webp` |
| 02 | כמות | כמות | `vinyl-stack.webp` |
| 03 | אורך מוזיקה | אורך מוזיקה | `black-vinyl-closeup.webp` |
| 04 | מאסטרינג | מאסטרינג | `mastering-console.jpeg` |
| 05 | עיצוב עטיפה | עיצוב עטיפה | `gatefold-cover-open.webp` |
| 06 | זכויות ואישורים | זכויות ואישורים | `album-booklet.jpeg` |
| 07 | עטיפה מודפסת או גנרית | עטיפה מודפסת או גנרית | `printing-process.jpeg` |
| 08 | לוח זמנים | לוח זמנים | `customer-project-award.webp` |
| 09 | טלפון / WhatsApp | טלפון / WhatsApp | `finsih4.jpeg` |

Card 01 also lists the four formats explicitly as tags: **ויניל · CD · קסטה · המרות מדיה**.

### Legal note (verbatim, as required)
> כל הזכויות, הרישיונות והאישורים הנדרשים לייצור, שכפול והפצה של התוכן המוזיקלי הם באחריות המזמין בלבד. The Vinyl Lab Israel רשאית לסרב לייצור חומר שלגביו קיים חשש להפרת זכויות יוצרים או זכויות מבצעים.

The full sentence is included **exactly as specified**, with no wording changes.

### Phone / WhatsApp
- WhatsApp: `https://wa.me/972523610464` (displayed as **052-361-0464**)
- Phone: `tel:+972523610464`
- Present in: card 09, the contact CTA band, the footer, and the floating button.

---

## 3. Design

The page reuses the **approved design** from the existing site (the multi-page *Vinyl Lab Israel* build):

- Shared stylesheet `assets/css/style.css` and script `assets/js/main.js` copied over unchanged.
- Same design tokens: gold `#c9a84c`, black `#0a0a0a`, `Heebo` font, RTL, `.navbar` / `.section` / `.btn-whatsapp` / `.footer` / `.whatsapp-float` components.
- Page-specific styling (hero, checklist cards, legal box, contact band) added in a scoped `<style>` block — the same pattern the original FAQ page used — so **no shared/global file was altered in a way that could affect other pages.**
- The `legal-box` styling and `#legal` anchor mirror the original FAQ page, so existing links such as `...#legal` remain meaningful.

---

## 4. Images — "real images only"

All images are **real project/studio photographs** taken from the site's own image library (no placeholders, no stock, no fabricated URLs). Each was verified to be a valid image file and to load in a real browser.

12 real images are referenced, and **every referenced image exists on disk and is actually used** (no dead references, no unused files left behind). A low-resolution asset that was initially chosen for card 09 was swapped for a high-resolution one to keep quality consistent.

Assets are placed under `assets/images/`, `assets/css/`, `assets/js/` — relative paths, so the page is portable within the site.

---

## 5. Self-audit performed

- ✅ **All 9 required checklist items present** (grep-verified in the HTML).
- ✅ **Format sub-options present:** ויניל / CD / קסטה / המרות מדיה.
- ✅ **Legal note present verbatim** (both sentences, exact match).
- ✅ **Phone + WhatsApp present** in four locations.
- ✅ **Every `assets/images/...` reference resolves** to a real file on disk.
- ✅ **No unused images** left in the assets folder.
- ✅ **Rendered in headless Chromium:** 0 broken image elements, 0 failed image responses, 0 page/JS errors. (The only console messages were blocked Google-Fonts requests in the offline sandbox; Heebo loads normally when online, with a sans-serif fallback otherwise.)
- ✅ **HTML tag balance verified:** `<section>` 3/3, `<article>` 9/9, `<div>` 34/34.
- ✅ **Logo sizing fixed:** the square logo asset is constrained in the navbar/footer so it does not overflow.
- ✅ **Scope respected:** only `before-you-call.html` (page) created; no other page touched.

---

## 6. Notes & assumptions

- **Placement:** the file is delivered at repository root as `before-you-call.html` to match the requested output name, mirroring `index.html` (also a root-level page). Navigation and footer links point to the existing site pages (`index.html`, `pages/...`) and resolve once this page sits alongside the approved site.
- **Nav label:** the old *"שאלות נפוצות"* (FAQ) entry is replaced conceptually by *"לפני שמתקשרים"* in this page's own header/footer. Updating the other pages' menus to point here was **intentionally not done** — the brief said *do not touch other pages*.
- **Card 06 image** (`album-booklet.jpeg`) and **card 05** (`gatefold-cover-open.webp`) are two distinct real photos of the same customer project; verified to be different files.

---

## Files in this change
- `before-you-call.html` — the new page (deliverable).
- `assets/css/style.css`, `assets/js/main.js` — shared design files (copied unchanged from the approved build).
- `assets/images/*` — 12 real images used by the page.
- `BEFORE_YOU_CALL_REPORT.md` — this report.
