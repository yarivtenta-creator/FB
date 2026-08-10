# Media drop-in

Every file below is referenced by `index.html`. None of them are in the repo yet —
until a file exists, the page draws a film frame in its place, so nothing renders
as a broken image or an empty black box. Drop the real files in with these exact
names and they take over automatically.

## Files the page expects

| Path | Used by | Ratio | Notes |
|---|---|---|---|
| `showreel.mp4` / `showreel.webm` | Hero | 16:9 | Muted loop. Keep it under ~8 MB; it loads immediately. |
| `showreel-poster.jpg` | Hero | 16:9 | Shown while the video loads and on slow connections. |
| `work-01.mp4` / `.webm` … `work-06.*` | Selected Work | 16:9 | Short silent loops, 6–10 s. Lazy-loaded 200px before entry. |
| `work-01-poster.jpg` … `work-06-poster.jpg` | Selected Work | 16:9 | |
| `og.jpg` | Social sharing card | 1.91:1 | 1200 × 630. |

## Encoding

The brief asks for optimized WebP/AVIF stills and MP4/WebM video. Rough targets:

```bash
# video — H.264 for reach, VP9 for size
ffmpeg -i source.mov -vf "scale=1920:-2" -c:v libx264 -crf 23 -preset slow -an -movflags +faststart work-01.mp4
ffmpeg -i source.mov -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 -an work-01.webm

# poster stills
ffmpeg -i source.mov -ss 00:00:02 -frames:v 1 -q:v 3 work-01-poster.jpg
```

`-an` strips the audio track deliberately: every video on the page is a muted
loop, and shipping silent audio is wasted bytes. It also guarantees the page can
never make noise on load.

If you would rather serve AVIF/WebP stills, add them as extra `<source>` entries
inside a `<picture>` around each poster — the markup currently uses a plain
`poster` attribute, which only takes one URL.

## Swapping in real projects

The six Selected Work entries in `index.html` carry placeholder titles and
descriptions (`Vows at Golden Hour`, `The Long Table`, and so on). Replace the
title, the two `.slide-meta` spans, the description and the `View Project` href
with real projects. Each `View Project` link currently points at the Vimeo
profile; point it at the individual film instead.
