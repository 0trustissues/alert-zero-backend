---
name: fslides-style-elastic-web
description: >-
  The Elastic 2026 web visual language for fslides decks: white canvas, flat
  Elastic palette, Inter + IBM Plex Mono, isometric solids that assemble,
  hairline mono callouts, dot-matrix fields and big blue stats. Use for every
  slide you create or edit in a deck whose fslides.config.js has
  style: 'elastic-web'.
---

# Elastic web style

This deck follows the Elastic 2026 web language, the same look as the
elastic.co platform graphics. Before writing a slide, open the reference
slides next to this file (`reference/*.html`); copy their structure rather
than inventing a new one.

## Atmosphere

Calm, precise, engineered. It reads like a technical illustration on a white
page: generous whitespace, one idea per slide, and the visual *explains* the
claim instead of decorating it. Motion is assembly, not spectacle: parts drop
in, snap into place, and then keep quietly working (data flowing, a cube
bobbing, a shimmer across dots).

## Canvas and grid

- Fixed 1280×720. Body padding `56px 72px`: every text column starts at x=72.
- Background white; `body.soft` (#F5F7FA) for official-graphic slides.
  Avoid dark slides: at most one per deck, and only when contrast is the point.
- Left column for words (up to ~560px wide), right side for the visual.
  Wide visuals may go full-bleed or run off the canvas edge on purpose.
- Footer chrome comes from `data-foot="Section · tag"` on `<body>`: Elastic logo
  bottom-left, mono tag bottom-right. `data-foot="none"` hides it.

## Type

| Role | Spec |
|---|---|
| Headline `h1` | Inter 600, 46–58px (hero 88px), letter-spacing ≈ −0.03em, line-height 1.04 |
| Payoff | the second half of the headline in `<span class="b">` (Elastic blue) |
| Subtitle `.sub` | Inter 400, 16–19px, grey #69707D, max ~2 lines |
| Eyebrow `.eyebrow` | IBM Plex Mono 500, 12px, uppercase, 0.08em tracking, blue square bullet |
| Callouts / tags | IBM Plex Mono 600, 10.5–12px, uppercase; sub-line weight 400 |
| Big stats `.stat` | Inter 500, 84px+, blue, tight tracking (−3px) |

Headlines are sentences with a period. Structure: plain statement, then the
payoff in blue ("Every signal in. **One experience out.**").

## Palette (flat, no gradients on solids)

| Token | Hex | Use |
|---|---|---|
| `--blue` | #0B64DD | primary, stats, the payoff, Elasticsearch |
| `--blue-d` | #0A4FB0 | right face of blue solids |
| `--teal` / `--teal-d` | #48EFCF / #02BCB7 | pipelines, ingest, "healthy" |
| `--pink` | #F04E98 | AI / agent / autonomous (the hero cube) |
| `--orange` | #FF7E62 | security, cost, documents, warnings |
| `--yellow` | #FEC514 | sparing accent only |
| `--ink` / `--char` | #1D1E24 / #343741 | text, strokes, dark faces |
| `--grey` / `--grey-l` | #69707D / #98A2B3 | secondary text |
| `--line` / `--slate` / `--slate-l` | #D3DAE6 / #B5BFCE / #DDE3EC | hairlines, neutral solids |
| incident red | #E0352B | alerts / problems only |

Isometric solid faces: top white, left face = the color, right face = its
darker partner or ink #343741. Neutral solids are slate (top #F5F7FA, left
#DDE3EC, right #B5BFCE) with no stroke.

## The isometric language (style/eweb.js)

Build diagrams with `EW.iso(svg, {ox, oy, s})`:
- `sc.box({x, y, z, w, d, h, c, delay, drop, float, order})`: a solid that drops
  in with a snap. `c` is a face set: blue, pink, orange, teal, yellow, ink,
  slate, white, glass.
- `sc.rect({...})`: dashed footprint or plane on the floor.
- `sc.label({at, side, len, title, sub, raw})`: a hairline leader plus a mono
  callout. Pass `raw: true` to keep mixed case (product names).
- `sc.run()` starts it. `EW.dots({...})` adds the organic dot-matrix field
  behind the scene. `EW.count(el, n)` counts numbers up.

Rules that were learned the hard way:
- **Draw order**: anything resting on a base must draw after it. The engine
  sorts this automatically. For hand-built SVG, append the base first. A
  base painted over the blocks standing on it is the most common bug.
- A "hovering" object needs visible air under it plus a soft shadow on the
  surface below, or it reads as sitting on the mat.
- Labels go outside the object, on short straight leaders, never across a face.
- Reuse official geometry when it exists: `reference/platform.html` is the
  exact elastic.co platform graphic (measured). Do not reinterpret it.
- Tiny cubes are the unit of "data": raw data is multi-color, processed data is
  uniform blue, problems are red with a soft pulsing halo, AI is pink.

## Motion

- Entrances: `.in1`–`.in6` fade-up classes for text. Solids drop and snap.
- **Everything must settle by 1.8s**: PDF export captures at 2s. For demos
  that run longer, detect `navigator.webdriver` and jump to the final frame.
- After settling, gentle loops are good: data flowing, a slow shimmer, a
  cube bobbing a few pixels. Nothing blinks rapidly, and at most one element
  pulses at a time.
- Show causality: an alert fires, *then* the agent reacts. Order the motion
  like the story.

## Components

- Cards: white, 1px `--line` border, square corners. Emphasis: ink border
  plus a 4–10px solid offset shadow in the accent color (`box-shadow: 8px 8px 0 var(--blue)`).
- Chips `.chip`: mono uppercase, 1px border, square.
- Buttons `.btn`: 1.5px blue outline, 4px radius. External links open in a
  new tab (`target="_blank" rel="noopener"`).
- Product UI (Kibana, Slack) goes in a light window frame: 1px ink border,
  three hollow dots, a mono title bar, and an offset shadow.

## Copy rules

- No em dashes anywhere; use a colon, comma or period.
- "Elastic nightshift" always has a lowercase nightshift. CSS uppercasing
  breaks this, so wrap it in `text-transform:none` or pass `raw: true`.
- Keep numbers honest: illustrative charts carry no fake axis values.
- One idea per slide. Every slide gets a visual that demonstrates the claim.

## Files

- `style/eweb.css`: tokens and components. Link it with `<link rel="stylesheet" href="style/eweb.css">`.
- `style/eweb.js`: the iso engine, dots, counters, footer, fit-to-screen.
  Load `<script src="style/eweb.js"></script>` before `/js/fuckslides.js`.
- `reference/`: cover, platform (official graphic), stats, closing.
