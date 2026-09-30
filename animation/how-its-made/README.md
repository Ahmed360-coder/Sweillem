# How a SWEILLEM clay pipe is made

A 103-second animated film of how SWEILLEM vitrified clay pipes are made, from clay at the Aswan quarry to a watertight sewer line underground, in English and Arabic. It runs in two ways:

- **On the site**, as an interactive player: play/pause, a seek bar, and nine chapter buttons. It starts playing when it scrolls into view and pauses when it leaves.
- **As a video file**: `scripts/render.mjs` renders it frame by frame to MP4, along with a poster image and WebVTT captions, for either language.

The animation is plain SVG built by a small ES module with no runtime dependencies. Each frame is computed from the playback time alone (`frameSVG(t)`), so what you see in the browser is exactly what goes into the MP4. Colours and fonts follow the redesign's `design/tokens.css` (paper, ink, maroon, slate; Jost, IBM Plex Sans, IBM Plex Mono, IBM Plex Sans Arabic).

## Chapters

Seven steps open with a two-second card showing SWEILLEM's own photo of that step, then the diagram.

| # | Starts | Step | Photo | Source |
|---|--------|------|-------|--------|
| 1 | 0:05 | Raw material: clay from the Aswan quarry, inspected and stored | deck image5 | Deck process slides, report "Raw material handling" |
| 2 | 0:15 | Quality control: fine minerals, salts, Al₂O₃ | | Deck process slides |
| 3 | 0:22 | Moulding: extruders, handling equipment to the dryers | deck image6 | Deck process slides |
| 4 | 0:33 | Drying: computerised dryers built under Lingl supervision | deck image7 | Deck process slides |
| 5 | 0:43 | Glazing: QC, full immersion, glaze inside and out | deck image8 | Deck process slides |
| 6 | 0:53 | Final firing: pre-heating, shuttle kilns, up to 1200 °C over 2–4 days | deck image9 | Deck process slides |
| 7 | 1:06 | Joints: factory-applied polyurethane joints, watertight at 0.5, 1 and 2.4 bar internal or external, keep roots out | | sweillem.net Joint Performance page |
| 8 | 1:13 | Delivery: from the factory or SWEILLEM's warehouses abroad to Egypt, Saudi Arabia, Germany | deck image11 | Deck market presence slides, "Germany warehouses" |
| 9 | 1:22 | Installation: spigot into socket, continuous watertight line | deck image16 | Illustrative; see below |

The closing card uses the report's benefits list (100+ year life expectancy, rigid, corrosion resistant, low maintenance).

**Illustrative, needs SWEILLEM's confirmation:** the sources don't describe installation. The trench, the excavator lowering pipes and the backfill are a generic depiction of laying socket-and-spigot pipe; the installation photo shows pipes on a German site, not the laying itself. The joint drawing (where the polyurethane sits on the spigot and in the socket) is schematic. The source text says pre-heating uses "a hot stream of water"; the film says only that pre-heating removes remaining humidity. Clay roof tiles aren't covered, because the sources have no roof tile process.

## Use it on a page

```html
<link rel="stylesheet" href="/animation/how-its-made/how-its-made.css">
<div id="how-its-made"></div>
<script type="module">
  import { mount } from '/animation/how-its-made/how-its-made.js';
  const player = mount(document.getElementById('how-its-made'), { autoplay: true, lang: 'en' });
  // player.play(), player.pause(), player.seek(seconds), player.goTo('joint'), player.destroy()
</script>
```

Options: `autoplay` (plays while at least 40% visible), `loop`, `controls` (player bar and chapter buttons), `startAt` (seconds), `lang` (`'en'` or `'ar'`; defaults to the nearest `lang` attribute, so an Arabic page gets the Arabic film). Chapter ids for `goTo`: `raw`, `qc`, `mould`, `dry`, `glaze`, `fire`, `joint`, `deliver`, `install`. Assets load relative to the module; call `setAssetBase(url)` if you serve `assets/` somewhere else.

The player reads the page's `--maroon`, `--ink`, `--muted`, `--line` and `--surface` custom properties when they are defined, so it matches the site theme; the film itself always stays on the light paper colour.

In Arabic the captions, labels and chapter buttons are Arabic, the page runs right to left, and the caption band, progress bar, photo cards and closing card are mirrored. The diagrams themselves are not mirrored, so machines and pipes read the same in both versions. Terms follow the redesign's Arabic copy (مواسير الفخار المزجج، الذيل، الجرس، لينجل، الأفران المكوكية).

On screens narrower than 720 px the player drops the caption band from the picture and shows the caption as text below it, so it stays readable on a phone.

Accessibility: the SVG has a text label, the current chapter's caption is announced in a polite live region, every control is a real button with a 44 px target, and with `prefers-reduced-motion` it does not autoplay; chapter buttons jump to each step's finished state instead.

In a React/Next.js page, call `mount` in a `useEffect` on a ref and `destroy()` in its cleanup.

## Preview, check and render

```bash
cd animation/how-its-made
npm install            # installs Playwright
npx serve .            # or any static server, then open /index.html (add ?lang=ar for Arabic)
npm run check          # player smoke test in English and Arabic, desktop and phone
FFMPEG=/path/to/ffmpeg npm run render      # out/sweillem-how-its-made.mp4, -poster.png, .en.vtt
FFMPEG=/path/to/ffmpeg npm run render:ar   # out/sweillem-how-its-made-ar.mp4, -ar-poster.png, .ar.vtt
npm run stills         # PNG stills at key moments, for review (stills:ar for Arabic)
```

A full render at 1920×1080, 30 fps takes about five minutes per language.

## Assets

- `assets/logo.png`, `assets/mark.png`: the SWEILLEM logo and S mark from the company deck, with transparent backgrounds.
- `assets/photos/*.webp`: step photos cropped from the company deck (1000×778). The deck's Pexels stock photos are not used.
- `assets/fonts/`: Jost, IBM Plex Sans, IBM Plex Mono and IBM Plex Sans Arabic (all SIL Open Font License), Latin and Arabic subsets.
