# EditValue — website

A rebuild of [editvalue.net](https://editvalue.net/): a New York post house that cuts wedding
films for videographers and photography studios, and turns them around in ten days.

Static HTML/CSS/JS. No build step, no dependencies, no framework.

## The design

**"Aisle"** — a custom Theme Factory theme, specified in full in [`THEME.md`](THEME.md).

Soft, unhurried and photography-led: a linen invitation rather than a grading suite. EditValue
sells to videographers, but what it is selling them is craft and taste, so the page leads with
those and lets the specification follow.

| role | token | light | dark |
|---|---|---|---|
| Bone — the ground | `--ground` | `#F6F3EE` | `#191C17` |
| Deep olive — the one saturated field | `--olive` / `--offer-bg` | `#4A5340` | `#9FB08C` / `#2F3828` |
| Antique brass — punctuation | `--brass` | `#B08D57` | `#C9A870` |
| Umber — text | `--text` | `#2E2A26` | `#EFEBE3` |

Three rules do most of the work:

- **Air is the material.** Section padding is large and never compressed to fit more in.
- **Hairlines, not boxes.** Structure is drawn with 1px rules and whitespace — no cards, no
  shadows, no filled panels except one.
- **One saturated field.** The risk-free offer is the only full-bleed olive section, so nothing
  else on the page competes with it.

**Type** — Cormorant Garamond at weight 300, set very large (it is delicate, so it is never used
small), over Jost for body and labels. Cormorant's old-style figures are why the numbers — `2005`,
`1,000+`, `90–180` — carry the statistics section on their own. Cormorant italic handles the pull
quote and the two words in the headline that matter.

**Layout** — a strong left margin throughout, with the hero and the offer deliberately centred
because an invitation is. Section labels are small caps against a hairline rule, the way an order
of service sets its sections. The ten-day breakdown is a programme list, not a card grid.

Both themes are designed. Light is the default; the dark theme rotates the same four hues rather
than inverting them, so olive lifts to a sage that survives on a dark ground and brass warms. The
header toggle persists to `localStorage`, and the un-stamped "system" state resolves through
`prefers-color-scheme`.

## Structure

```
index.html          all markup (single page, anchor nav)
THEME.md            the Aisle theme specification
assets/styles.css   all styling — tokens at the top of the file
assets/app.js       theme, scroll progress, ten-day timeline, reveals, reel, form
assets/fonts/       Cormorant Garamond + Jost, self-hosted variable woff2
assets/work/        showreel poster frames (film-01…06.jpg), 4:3
```

## Publishing the showreel

The Work section renders from one array at the top of `assets/app.js`:

```js
var FILMS = [
  { id: '', title: 'First dance, downtown loft', meta: 'Highlights · 4:12', poster: 'assets/work/film-01.jpg' },
  …
];
```

Paste the numeric Vimeo ID from `https://vimeo.com/<ID>` into `id` and the card becomes a
click-to-play facade — the poster loads on page view, the Vimeo iframe only mounts on click, so
six films cost six images instead of six embedded players. While `id` is empty the card links out
to the Vimeo profile instead of breaking.

Poster frames are 4:3. Replace `assets/work/*.jpg` with real frames from the films whenever they
are available; until a poster exists the card draws an editor's slate rather than a broken image.

## Before this goes live

These need a decision from EditValue; they are marked with `TODO` in the source where relevant.

- **Contact address.** The footer has no email yet — the form is the only route in. Add the real
  address, or wire the form up (below).
- **The form does not send anything.** `assets/app.js` validates and confirms locally only. Replace
  the `TODO` in the submit handler with a `fetch` POST to a real intake endpoint (Formspree, a
  serverless function, whatever the host offers) before launch.
- **The ten-day breakdown** in the timeline control and the Day 0–10 programme is written as an
  illustrative post workflow — assembly, selects, cut, sound, grade, revisions. The ten-day
  delivery, the two free revision rounds and the free social reel are EditValue's own published
  terms; the day-by-day split of the work in between is draft copy and should be confirmed
  against how the room actually schedules.
- **The pull quote** is EditValue's own testimonial copy with the attribution still unresolved —
  it currently reads "attribution to be confirmed". Name the studio or cut the quote.
- **Prices** are deliberately absent. The page sells the risk-free first edit instead, which is
  the stronger offer. Add a pricing section only if there is a public rate card.
- **Language.** The self-hosted fonts are latin-subset only. Adding a non-latin language means
  pulling the matching subset files into `assets/fonts/` too.

## Facts the copy is built on

All from EditValue's own published material:

- New York; editing wedding films for around 20 years
- Over 1,000 weddings a year
- Ten-day turnaround, against an industry norm of three to six months
- 4K footage accepted, Full HD delivered
- A short social reel included free with every highlights delivery
- Two rounds of revisions, free
- Any song you choose, or a recommended playlist including copyright-free tracks
- Highlights and teasers run 3–5 minutes, set by the track
- Final renders held on their servers for three months
- Premiere project files are not part of delivery
- First edit is risk-free — a complete highlights edit with no pre-payment

## Run locally

```bash
python3 -m http.server 8080 --directory editvalue
# → http://localhost:8080
```

## Deploy

Static. Point Vercel / Netlify / GitHub Pages at `editvalue/` with no build command.
