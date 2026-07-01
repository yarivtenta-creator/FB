# LINK_CHECK — The Vinyl Lab Israel

**Date:** 2026-07-01 · **Result:** ✅ ALL LINKS VALID (0 broken)

Navigation is a single-page router: menu items carry `data-nav="<id>"` and resolve to the
`#page-<id>` section. Each target was clicked in headless Chromium and confirmed to activate.

## 1. Internal navigation (menu → page)

| Menu label | `data-nav` | Target section | Resolves? | Runtime activate test |
|---|---|---|---|---|
| דף הבית | `home` | `#page-home` | ✅ | ✅ active |
| מי אנחנו | `about` | `#page-about` | ✅ | ✅ active |
| שירותים | `services` | `#page-services` | ✅ | ✅ active |
| גלריה | `gallery` | `#page-gallery` | ✅ | ✅ active |
| מחירים | `pricing` | `#page-pricing` | ✅ | ✅ active |
| גיפט קארדס | `gift` | `#page-gift` | ✅ | ✅ active |
| לפני שמתקשרים | `before` | `#page-before` | ✅ | ✅ active |
| צור קשר | `contact` | `#page-contact` | ✅ | ✅ active |

**8/8 menu links resolve to an existing page and activate correctly** (desktop nav + mobile menu).
In-body CTA links that use `data-nav` (logo → home, hero "התחילו פרויקט" → before, category cards
→ gallery/services/pricing, etc.) all point at the same valid target ids — **no dangling `data-nav`.**

Router safety: an unknown/empty hash falls back to `#page-home`, so the site can never land on a
blank view. With JavaScript disabled, a `<noscript>` rule reveals all pages so content stays reachable.

## 2. External links

| Link | Type | Format valid? | Notes |
|---|---|---|---|
| `https://wa.me/972535315340` | WhatsApp | ✅ | Primary CTA, used across all pages (`target="_blank" rel="noopener"`) |
| `tel:+972535315340` | Phone | ✅ | אלכס — matches displayed `053-531-5340` |
| `tel:+972525315340` | Phone | ✅ | רפי — matches displayed `052-531-5340` |
| `mailto:Alexs4all@gmail.com` | Email | ✅ | אלכס |
| `mailto:rafilipelis@gmail.com` | Email | ✅ | רפי |

All external links are well-formed. WhatsApp/phone/email are contact endpoints (not fetched during
QA); their formats are correct and the two phone numbers agree with their on-screen text.

## 3. Asset links (referenced files exist)

Every `src` / `href` / `poster` / `<source>` pointing at a local file was matched against the
filesystem (URL-decoding `%20` spaces and `%23` in filenames): **28/28 present, 0 missing.**
Full inventory in `IMAGE_CHECK.md`.

---

**Summary:** 8 internal + 5 external + 28 asset references checked. **0 broken links.**
