# LINK_CHECK — The Vinyl Lab Israel (Multi-page)

**Date:** 2026-07-01 · **Result:** ✅ ALL LINKS VALID (0 broken)

The site is 8 separate HTML files. Menu items are real `<a href="…html">` links. Each link was
clicked in headless Chromium and confirmed to load the correct file.

## 1. Menu navigation (identical on every page)

| Menu label | href | Target file exists | Click-through lands correctly |
|---|---|---|---|
| דף הבית | `index.html` | ✅ | ✅ |
| מי אנחנו | `about.html` | ✅ | ✅ |
| שירותים | `services.html` | ✅ | ✅ |
| גלריה | `gallery.html` | ✅ | ✅ |
| מחירים | `pricing.html` | ✅ | ✅ |
| גיפט קארדס | `gift-cards.html` | ✅ | ✅ |
| לפני שמתקשרים | `before-you-call.html` | ✅ | ✅ |
| צור קשר | `contact.html` | ✅ | ✅ |

**8/8 menu links resolve to an existing file and navigate correctly** (tested from `index.html`).
The header logo links to `index.html`; footer links (services/info/contact columns) point to the
same 8 files. In-content CTAs that are `<a>` (hero "התחילו פרויקט" → `before-you-call.html`, etc.)
are real links; decorative card shortcuts (`<div data-nav>`, 19 total) navigate via `main.js` and
are keyboard-accessible (`role="link"`, `tabindex`, Enter/Space).

Every internal `.html` href across all 8 files was matched against disk: **all targets exist, 0 broken.**

## 2. External links

| Link | Type | Valid | Notes |
|---|---|---|---|
| `https://wa.me/972535315340` | WhatsApp | ✅ | Primary CTA on every page (`target="_blank" rel="noopener"`) |
| `tel:+972535315340` | Phone | ✅ | אלכס — matches `053-531-5340` |
| `tel:+972525315340` | Phone | ✅ | רפי — matches `052-531-5340` |
| `mailto:Alexs4all@gmail.com` | Email | ✅ | אלכס |
| `mailto:rafilipelis@gmail.com` | Email | ✅ | רפי |

All well-formed. (Instagram footer icon is a `#` placeholder pending the client's real handle —
noted in `PREVIEW_NOTES.md`.)

## 3. Asset links

Every `src`/`href`/`poster` in all 8 files was matched against the filesystem (decoding `%20`/`%23`):
**31/31 unique references present, 0 missing** — including `assets/css/style.css` and
`assets/js/main.js` now linked by every page.

---

**Summary:** 8 internal menu links + 5 external + 31 asset references + shared CSS/JS. **0 broken links.**
