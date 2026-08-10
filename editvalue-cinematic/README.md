# EditValue — cinematic redesign

A new saved version of the EditValue site, built to the cinematic brief: a
premium film-studio experience rather than an agency template. Static
HTML/CSS/JS, no build step, no dependencies.

**Not deployed.** This version is committed for review only, as the brief asked.
Nothing points at it and no host configuration has been changed.

Sibling versions in this repo:

| Directory | Direction |
|---|---|
| `editvalue/` | "Aisle" — bone, olive and brass; soft, editorial, wedding-led |
| `editvalue-cinematic/` | this one — warm cinematic white with dark media sections |

## The design

Palette is fixed by the brief and used exactly as specified:

| Token | Hex | Role |
|---|---|---|
| `--warm` | `#F4F1EA` | Warm cinematic white — the page ground |
| `--silver` | `#D7D7D2` | Soft silver |
| `--charcoal` | `#161616` | Dark sections |
| `--graphite` | `#242424` | Second dark tone (Before & After) |
| `--gold` | `#C5A46D` | Premium accent |
| `--white` | `#FFFFFF` | Clean white |

Dark sections are used only where they carry media — hero, Selected Work,
Before & After, Client Experience, the final call to action and the footer.
Everything between them sits on warm white.

**Type.** Archivo as the display face, run through its width axis at 86–94%
so the oversized headlines read as film titles rather than as a default
grotesque; Instrument Sans for body; IBM Plex Mono for the timecodes, counters
and labels that carry the film-frame details. All self-hosted variable woff2,
latin subset — no third-party font request at runtime.

Because the palette commits to one visual world, the page does not offer a
light/dark toggle. Every colour is painted explicitly rather than inherited, so
it holds on any host background.

## Motion and scroll

| Behaviour | How it degrades |
|---|---|
| Selected Work moves horizontally under vertical scroll | The markup is a snap-scrolling horizontal list to begin with. The pin is added by JS only above 900px with motion allowed; below that you swipe it. |
| Scroll-triggered reveals | Skipped entirely under `prefers-reduced-motion`; a sweep at the page end guarantees nothing stays hidden. |
| Cursor-following service preview | Pointer-fine devices only. Never rendered on touch. |
| Film grain drift | Static under `prefers-reduced-motion`. |
| Before & After sliders | Pointer events, so mouse, pen and touch all work. Each handle is also a real `role="slider"` — arrow keys, Home and End move it. |
| Showreel progress indicator | Driven by the video's own `timeupdate`. With no showreel file present it runs as an ambient loop instead of sitting dead at zero. |

Anchor targets carry `scroll-margin-top`, so the fixed header never covers the
heading you just jumped to.

## Media

There is no video or photography in the repo. Every `<video>` is paired with a
drawn film frame behind it — gradient, grain and sprocket holes rendered in CSS
— so a missing file reads as an intentional frame rather than a hole. Videos use
`preload="none"` and only load within 200px of the viewport.

`assets/media/README.md` lists every filename the page expects, the ratios, and
the ffmpeg commands to produce them.

## Structure

```
index.html              all markup (single page, anchor navigation)
assets/styles.css       all styling — tokens at the top
assets/app.js           header state, pinned reel, reveals, sliders, waveforms
assets/fonts/           Archivo, Instrument Sans, IBM Plex Mono (variable woff2)
assets/media/           empty — see the README in there for what goes in it
```

## Verified

Chromium, 1440px and 390px:

- All three fonts load; Archivo's width axis resolves (`font-stretch: 88%`)
- No horizontal overflow at either width
- Pinned reel engages at 1440 and is correctly absent at 390
- Cursor preview absent on touch
- Four comparison sliders, both waveforms centred in their stages
- No console errors; the only failed requests are the media files listed above

## Before this can go live

- **Real media.** Everything in `assets/media/`.
- **Selected Work is placeholder content.** Six invented project titles and
  descriptions. No real client names are used anywhere — that was deliberate,
  and they need replacing with real projects and per-film Vimeo links.
- **Only one testimonial exists**, and its attribution is unresolved — it reads
  "attribution to be confirmed". The Client Experience section is built to hold
  more; the brief asked for testimonials with real project imagery.
- **Contact address.** `hello@editvalue.net` is a placeholder used in the final
  CTA and the footer. Confirm it or replace it.
- **Instagram and YouTube** point at the bare platform URLs. Real profile URLs
  needed, or drop the links.
- **`privacy.html` and `terms.html` do not exist yet** — the footer links to
  them because the brief asked for Privacy and Terms.
- **Scope.** The brief adds commercial, documentary, colour grading, sound
  design, retouching and photography editing. EditValue's own published material
  only covers wedding post-production, so these eight service descriptions are
  written from the brief rather than from anything EditValue has said publicly.
  They need confirming before launch.

## Facts carried over from the existing site

Ten-day turnaround · over 1,000 films a year · editing since 2005 · 4K in,
Full HD out · two rounds of revisions included · a social cut-down free with
every delivery · renders held three months · the first edit free until you say
it is good · no missed deadlines.

## Run locally

```bash
python3 -m http.server 8080 --directory editvalue-cinematic
# → http://localhost:8080
```
