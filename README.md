# Go-Bigger Solutions — Website

The public site for **Go-Bigger Solutions**, a strategy consultancy. Premium one-page design ("Acid Editorial", 2026 direction): dark-first near-black botanical base, acid-lime accent with aurora glows, glass surfaces, Fraunces serif display type + Space Grotesk labels. Static HTML/CSS/JS — no build step.

Built from `GoBigger_Website_Plan_v2.md`. Brand rule respected throughout: a **human company that uses AI** — the site never says "AI-powered".

## Sections

| Section | Notes |
|---|---|
| Hero | Outcome-led headline, "Get a Free Diagnostic" CTA, animated line reveal |
| Trust marquee | The manifesto principles as a scrolling strip |
| Services | Business Strategy · Marketing Plan · Creative Pack — placeholder prices ("Investment: —") |
| Pricing modal | "See Pricing Options" opens a side-by-side comparison table; drop real numbers into the last row later, no restructuring needed |
| How It Works | 5 steps: Discovery → Research & Diagnosis → Strategy Options → Delivery & Roadmap → Ongoing Support |
| About / Manifesto | Dark section; the philosophy ("Don't fall in love with the solution…") incl. the Hebrew original line |
| Results | Founder ventures (Club Lab, Vinyl Lab) honestly framed + a reserved slot for the first client case study |
| Contact | Intake form (front-end only — wire to backend `src/intake/normalize.js` later) |
| Client Login | Small top-right placeholder link with "Portal opening soon" tooltip; activates with backend P6/P7 |

## Structure

```
index.html         All markup (single page, anchor navigation)
assets/styles.css  All styling — design tokens at the top (:root)
assets/app.js      Scroll reveals, header behavior, mobile menu, pricing modal, form validation
```

## Run locally

```bash
python3 -m http.server 8080
# or: npx serve .
```

## Deploy

Static site — deploys as-is to Vercel/Netlify/GitHub Pages (no build command, root as output).

## Editing later

- **Real prices**: replace the `—` in each `.card-price span` (index.html) and in the modal's `pricing-row-price` cells.
- **Colors/type**: edit the CSS custom properties at the top of `assets/styles.css`.
- **Form backend**: replace the `TODO` in the submit handler in `assets/app.js` with a `fetch` POST to the intake endpoint.
- **Client portal**: point the `Client Login` links at the portal URL and remove the tooltip/`aria-disabled`.
