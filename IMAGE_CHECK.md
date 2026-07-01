# IMAGE_CHECK — The Vinyl Lab Israel

**Date:** 2026-07-01 · **Result:** ✅ ALL IMAGES OK (0 broken)

Two independent methods were used:
1. **Static** — parse every image/video reference in `index.html` and confirm the file exists on
   disk (URL-decoding spaces `%20` and `%23`).
2. **Runtime** — load `index.html` in headless Chromium and read each `<img>` `naturalWidth`.

## 1. Runtime result

- **48 `<img>` elements rendered with `naturalWidth > 0`** (loaded successfully).
- **1 `<img src="">`** — the gallery **lightbox** placeholder inside `#lightbox`; its `src` is set
  by JavaScript when a gallery thumbnail is clicked. Empty at load is **expected**, not a defect.
- **Logo:** `assets/images/logo-header.png` loads at 847×847 (header, footer, and favicon usage).
- **Hero video:** `assets/video/banner.mp4` present; hero uses autoplay/muted/loop/playsinline with
  a `poster` still (`Vinyl record on turntable.webp`) as fallback.

## 2. Referenced media — existence check (28/28 present)

| File | Exists |
|---|---|
| assets/images/Album booklet.jpeg | ✅ |
| assets/images/Alex Eisenberg portrait.webp | ✅ |
| assets/images/Deluxe packaging.jpeg | ✅ |
| assets/images/Finished customer project.jpeg | ✅ |
| assets/images/Gatefold cover open.webp | ✅ |
| assets/images/Printing process.jpeg | ✅ |
| assets/images/Vinyl record on turntable.webp | ✅ |
| assets/images/WhatsApp Image 2026-06-12 at 11.08.34.jpeg | ✅ |
| assets/images/cassette-production.webp | ✅ |
| assets/images/cd-production.webp | ✅ |
| assets/images/customer-project-award.webp | ✅ |
| assets/images/favicon.png | ✅ |
| assets/images/finished-customer-project-2.jpeg | ✅ |
| assets/images/finished-customer-project-3.jpeg | ✅ |
| assets/images/finsih4.jpeg | ✅ |
| assets/images/gallery-project-01.webp | ✅ |
| assets/images/gallery-project-03.webp | ✅ |
| assets/images/gift-matana.png | ✅ |
| assets/images/gift-premium.png | ✅ |
| assets/images/live-sound-studio-control-room.jpg | ✅ |
| assets/images/logo-header.png (LOGO) | ✅ |
| assets/images/logo-mark.png (apple-touch-icon) | ✅ |
| assets/images/mastering-console.jpeg | ✅ |
| assets/images/mastering.webp | ✅ |
| assets/images/music-education.png | ✅ |
| assets/images/studio atmos.webp | ✅ |
| assets/images/vinyl-production-01.webp | ✅ |
| assets/images/vinyl-stack.webp | ✅ |
| assets/video/banner.mp4 (HERO VIDEO) | ✅ |

**Static result: 0 missing.**

## 3. Asset library (bundled)

`assets/images/` contains **45 top-level media files** plus responsive variants in
`thumbnails/` (150px), `medium/` (300px), and `large/` (1024px) — **150 image files total** —
alongside the logo set (`logo.png`, `logo-header.png`, `logo-mark.png`, `logo-full.png`) and
`favicon.png`. Formats: WebP, JPEG/JPG, PNG. All originals from the supplied *Original Pictures*
material; original filenames preserved (names containing `#` are URL-encoded as `%23` in paths).

---

**Summary:** 48 images load at runtime + 1 dynamic lightbox placeholder (expected); logo and hero
video verified; 28/28 referenced files exist. **0 broken images.**
