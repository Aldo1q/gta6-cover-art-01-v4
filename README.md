# Neon Coast Cover Studio

![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/Aldo1q/gta6-cover-art-01-v4/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/Aldo1q/gta6-cover-art-01-v4/reward.svg)

Bounty: https://make.fun/bounty/gta6-cover-art-01

A fully offline, GTA-style cover maker in vanilla JS + canvas. No build step,
no external requests — fonts and sample photos ship inside `app/`.

## Run

```
node serve.ts
```

Then open http://localhost:8080 — the studio loads with a sample photo already
placed, a live preview on every change, and export ready to go.

To hand the entry in (what the grader runs):

```
node main.ts
```

## Features

- **Three layouts**
  - **Cover Grid** — an 8-panel collage with gaps and a bold outer border.
    Click any panel to select it; each panel keeps its own crop.
  - **Snapshots** — three polaroid frames, rotated on a dark backdrop, with
    handwritten-style captions under each frame.
  - **Full Bleed** — one hero image edge-to-edge with the lettering over it.
- **Photos** — upload your own file, or use the three built-in samples.
  Per-panel crop controls: zoom plus X/Y offset sliders for the selected panel.
- **Lettering** — a big arched caption in Anton (uppercase, white fill, dark
  outline, neon glow), a script accent in Pacifico in vice pink, and a subtitle
  line. All three are editable text inputs.
- **Colour grades** — Sunset (warm orange / teal), Neon (magenta / cyan) and
  Vice (pink / teal pastel), applied with canvas filters plus gradient-map and
  overlay blends, live on the preview.
- **Extras** — a clickable 5-star heat meter, an editable ribbon badge
  (default "NEON COAST") and a thin inner frame line.
- **Export** — one-click PNG downloads rendered offscreen at 1080×1080,
  1080×1350, 1920×1080 and 1080×1920.

## Shot modes

Append a query string for deterministic, toolbar-free renders, e.g.
`?shot=grid&photo=sample-1&caption=NEON%20COAST&grade=vice`
(`shot` is `grid`, `snapshots`, `fullbleed` or `editor`).

## Licences

Code: MIT (see `LICENSE`). Fonts: Anton and Pacifico under the SIL Open Font
License — see `app/fonts/OFL-Anton.txt` and `app/fonts/OFL-Pacifico.txt`.
Sample photos are placeholder images from picsum.photos.
