# IMAGE_CHECK — The Vinyl Lab Israel (Multi-page)

**Date:** 2026-07-01 · **Result:** ✅ ALL IMAGES OK (0 broken)

Two methods across all 8 pages:
1. **Runtime** — load each `.html` file in headless Chromium (network blocked) and read every
   `<img>` `naturalWidth`.
2. **Static** — parse every image/video reference in all files and confirm the file exists on disk
   (decoding `%20` spaces and `%23`).

## 1. Runtime result — per page (`<img>` loaded, 0 broken each)

| Page | file | images loaded | broken |
|---|---|---|---|
| Home | index.html | 20 | 0 |
| About | about.html | 5 | 0 |
| Services | services.html | 18 | 0 |
| Gallery | gallery.html | 12 | 0 |
| Pricing | pricing.html | 3 | 0 |
| Gift Cards | gift-cards.html | 6 | 0 |
| Before you call | before-you-call.html | 3 | 0 |
| Contact | contact.html | 3 | 0 |

- **Logo** (`assets/images/logo-header.png`) loads in header **and** footer on **all 8 pages**.
- **Hero video** (`assets/video/banner.mp4`) present on home with a `poster` still fallback.
- The gallery **lightbox** `<img src="">` is intentionally empty until a thumbnail is clicked (JS
  sets its `src`) — not a broken image.

## 2. Static result

- **31 unique asset references** across all 8 files (images, video, css, js) → **0 missing.**
- Image formats in use: WebP, JPEG/JPG, PNG. Filenames with spaces and `#` resolve correctly
  (`#` encoded as `%23` in paths).

## 3. Asset library (bundled, shared by all pages)

`assets/images/` — 45 top-level media + responsive variants in `thumbnails/` (150px),
`medium/` (300px), `large/` (1024px) = **150 image files**, plus the logo set
(`logo.png`, `logo-header.png`, `logo-mark.png`, `logo-full.png`) and `favicon.png`. Video:
`assets/video/banner.mp4`. All sourced from the supplied *Original Pictures*; original filenames preserved.

---

**Summary:** 0 broken images on any of the 8 pages; logo + hero video verified; 31/31 references
exist on disk. **0 broken images.**
