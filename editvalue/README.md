# EditValue — website

A rebuild of [editvalue.net](https://editvalue.net/): a New York post house that cuts wedding
films for videographers and photography studios, and turns them around in ten days.

Static HTML/CSS/JS. No build step, no dependencies, no framework.

## The design

**"The Edit Bay."** EditValue's customer is not the couple — it's the professional who shot the
wedding and wants post off their plate. So the site speaks the language of the edit suite rather
than the language of bridal.

One semantic rule runs through the whole page:

| | meaning | token |
|---|---|---|
| **Cool** slate blue | raw, unrendered, waiting | `--cool` `#5B7C99` |
| **Warm** tungsten amber | graded, rendered, delivered | `--warm` `#F0B357` |
| **Record red** | the playhead, and nothing else | `--signal` `#FF4436` |

The problem section ("most couples wait three to six months") is washed cool and desaturated. From
the ten-day section onward the page warms up. The colour is carrying the argument, not decorating it.

- **Ground** — `#0C0F13`, a near-black biased blue rather than neutral: the colour of a grading suite.
- **Type** — Bodoni Moda (high-contrast didone, set large where its hairlines survive) for display,
  Archivo for body, IBM Plex Mono for timecode and spec data.
- **Layout** — a fixed left rail that is a working scrubber: a red playhead tracks scroll position
  against a live timecode readout. Sections are marked with timecode instead of `01 / 02 / 03`,
  because position in the reel is real information here and a decorative counter isn't.

Both themes are designed. Dark is the default; light is a cool blue-biased paper, not cream. The
toggle in the header persists to `localStorage`, and the un-stamped "system" state resolves through
`prefers-color-scheme`.

## Structure

```
index.html          all markup (single page, anchor nav)
assets/styles.css   all styling — tokens at the top of the file
assets/app.js       theme, rail scrubber, hero timeline, reveals, reel, form
assets/work/        showreel poster frames (film-01…06.jpg)
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

Poster frames are 16:9. Replace `assets/work/*.jpg` with real frames from the films whenever
they're available — the current set is generated placeholder imagery.

## Before this goes live

These need a decision from EditValue; they are marked with `TODO` in the source where relevant.

- **Contact address.** The footer has no email yet — the form is the only route in. Add the real
  address, or wire the form up (below).
- **The form does not send anything.** `assets/app.js` validates and confirms locally only. Replace
  the `TODO` in the submit handler with a `fetch` POST to a real intake endpoint (Formspree, a
  serverless function, whatever the host offers) before launch.
- **The ten-day breakdown** in the hero scrubber and the Day 0–10 track is written as an
  illustrative post workflow — assembly, selects, cut, sound, grade, revisions. The ten-day
  delivery, the two free revision rounds and the free social reel are EditValue's own published
  terms; the day-by-day split of the work in between is draft copy and should be confirmed
  against how the room actually schedules.
- **The pull quote** is EditValue's own testimonial copy with the attribution still unresolved —
  it currently reads "attribution to be confirmed". Name the studio or cut the quote.
- **Prices** are deliberately absent. The page sells the risk-free first edit instead, which is
  the stronger offer. Add a pricing section only if there's a public rate card.

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
