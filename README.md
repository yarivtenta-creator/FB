# AI Business Growth Platform — Landing Page

A premium, dark-themed marketing landing page for the AI Business Growth Platform. Static HTML/CSS/JS — no build step required.

## What this is

The client defines a business goal (find sales agents, find buyers, find distributors, build a local sales team, test a new market, etc.). The platform researches the market, builds a strategy, finds the right people, tests campaigns, manages candidates in classes/batches, drives sales, and continuously improves itself. This site explains and sells that platform — it does not implement the platform itself.

## Structure

```
index.html            Page shell, loads assets/translations.js then assets/app.js
assets/styles.css      All styling — dark SaaS theme, gradients, cards, animations
assets/translations.js Full copy for all 17 sections in 6 languages (en, nl, de, it, fr, es)
assets/app.js          Renders the page from translations.js, handles language switching,
                        the mission-flow animation, FAQ accordion, scroll reveals, sticky CTA
```

## Language switching

On first visit, users see a full-screen welcome step with a language selector (English, Dutch, German, Italian, French, Spanish). Choosing a language stores it in `localStorage` and renders the entire site — headings, buttons, FAQ, pricing, use cases, CTA, footer — in that language. The language can be changed again anytime from the dropdown in the sticky nav bar, which re-renders the whole page.

All copy lives in `assets/translations.js` as one object keyed by language code, so adding a language means adding one more key with the same shape.

## Run locally

No build tools needed. From the project root:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed URL in a browser.

## Deploy to Vercel

This is a static site, so no build command or output directory override is needed.

```bash
npm i -g vercel   # if you don't already have it
vercel --prod
```

Or import the GitHub repo directly at https://vercel.com/new — Vercel auto-detects it as a static site (Framework Preset: "Other", no build command, root as output).

## Editing content

- Change any copy: edit the matching key in `assets/translations.js` for each language.
- Change the WhatsApp number/message: edit `WHATSAPP_URL` at the top of `assets/app.js`.
- Change colors/spacing: edit the CSS custom properties at the top of `assets/styles.css`.
