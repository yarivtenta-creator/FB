# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The public marketing site for **Go-Bigger Solutions**, a strategy consultancy.
Static HTML/CSS/JS — **no build step, no package manager, no dependencies**. What is in
the repo is what ships.

```
index.html         The entire site (single page, anchor navigation)
edit.html          Standalone in-browser content editor for non-technical edits
assets/styles.css  All styling; design tokens live in :root at the top
assets/app.js      Scroll reveals, header, mobile menu, pricing modal, form, 3D canvases
claudify.html      Dev tool, not part of the site — see below
```

`claudify.html` is a self-contained utility: drop any project folder on it and it reads the
manifests in-browser and writes that project's `CLAUDE.md` and `.claude/settings.json`. It
shares this site's tokens and conventions but ships nothing to visitors and is not linked
from `index.html`. It reads no elements matching `edit.html`'s `SELECTOR`, so changing it
can never renumber saved client edits.

## Running it

```bash
python3 -m http.server 8080      # then open http://localhost:8080
```

Must be served over HTTP, not opened as `file://` — `edit.html` `fetch()`es `index.html`
and the browser blocks that on the file protocol.

There is no test suite, linter, or CI. Verify changes by loading the page and looking at
it (Playwright is available for screenshots and interaction checks).

## Rules that are easy to break

**Brand rule: this is a human company that uses AI.** The copy never says "AI-powered",
"artificial intelligence", or equivalent. Do not introduce it, including in alt text,
meta tags, or comments that could get surfaced.

**Keep it dependency-free.** The 3D orbital network in the hero and the aurora ribbons in
the closing section are hand-written vanilla `<canvas>` — not three.js. Do not add a
framework, a bundler, or an npm dependency to solve something these files already do.
Google Fonts (Fraunces / Inter / Space Grotesk) via `<link>` is the only external asset.

**`edit.html` keys edits by document order.** It collects nodes matching a hard-coded
`SELECTOR` list, numbers them `data-edit="0..n"`, and stores user text in `localStorage`
under `gbs-content-edits-v1`. Inserting, removing, or reordering any element that matches
that selector shifts every later index and silently corrupts a client's saved edits. When
you change markup in `index.html`:

- Prefer editing text in place over adding/removing matching elements.
- If you must add or reorder, append at the end of a group where possible, and say so in
  the commit message so saved edits can be reset deliberately.
- Adding a class to `SELECTOR` in `edit.html` has the same renumbering effect.

**Motion respects `prefers-reduced-motion`.** `assets/app.js` reads it into
`prefersReduced` and skips animation; `styles.css` has a matching block at the bottom.
Any new animation needs both paths.

## Conventions

- **Colors and type**: change the custom properties in `:root` (`assets/styles.css`),
  never hard-coded hex values in rules. Accent is `--accent: #2ee6e0` on a marine-dark
  `--bg: #070d12`.
- **CSS is organized by page section** with `/* ==== Section */` banner comments, in the
  same order as the markup. Put new rules in the matching block.
- **`app.js` is one IIFE in `"use strict"`**, ES5-flavoured (`var`, `function`) — match
  that style rather than mixing in modern syntax.
- **Sections use `id` anchors** (`#services`, `#process`, `#about`, `#results`,
  `#contact`) referenced by the header and mobile menu. Renaming an id means updating both
  navs plus `scroll-padding-top` assumptions.
- Reveal-on-scroll is opt-in per element via `class="reveal"`.

## Known placeholders (intentional — do not "fix" without being asked)

- Prices are `—` in the service cards (`.card-price span`) and in the pricing modal rows.
- The contact form is front-end only; the submit handler has a `TODO` where a POST to the
  intake endpoint goes.
- "Client Login" is `aria-disabled` with a "Portal opening soon" tooltip.
- Results shows founder ventures plus a reserved slot for the first client case study.

## Git

Work happens on `claude/*` branches; `main` is the deployed branch. The site deploys as-is
to any static host (root as output, no build command).
