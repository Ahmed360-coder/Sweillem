# How a SWEILLEM clay pipe is made

An 88-second animated walkthrough of how SWEILLEM vitrified clay pipes are made, from clay at the Aswan quarry to a watertight sewer line underground. It runs in two ways:

- **On the site**, as an interactive player: play/pause, a seek bar, and nine chapter buttons. It starts playing when it scrolls into view and pauses when it leaves.
- **As a video file**: `scripts/render.mjs` renders it frame by frame to MP4, along with a poster image and WebVTT captions.

The animation is plain SVG built by a small ES module. It has no runtime dependencies. Each frame is computed from the playback time alone (`frameSVG(t)`), so what you see in the browser is exactly what goes into the MP4.

## Chapters

| # | Step | Source |
|---|------|--------|
| 1 | Raw material: clay from the Aswan quarry, inspected and stored | Deck slide 6, report "Raw material handling" |
| 2 | Quality control: fine minerals, salts, Al₂O₃ | Deck slide 6 |
| 3 | Moulding: extruders, handling equipment to the dryers | Deck slide 7 |
| 4 | Drying: computerised dryers built under Lingl supervision | Deck slide 8 |
| 5 | Glazing: QC, full immersion, glaze inside and out | Deck slide 9 |
| 6 | Final firing: pre-heating, shuttle kilns, up to 1200 °C over 2–4 days | Deck slide 10 |
| 7 | Joints: factory-applied high-compression joints and couplings | Report "Tight joints", questionnaire |
| 8 | Delivery: direct distribution to Egypt, Saudi Arabia, Germany | Deck slides 13, 16, 20; delivery photo |
| 9 | Installation: spigot into socket, continuous watertight line | Illustrative; see below |

The closing card uses the report's benefits list (100+ year life expectancy, rigid, corrosion resistant, low maintenance).

**Illustrative, needs SWEILLEM's confirmation:** the sources don't describe installation. The trench, the excavator lowering pipes and the backfill are a generic depiction of laying socket-and-spigot pipe. The exact joint system (what the red compression ring is made of, where it sits) is drawn from the Euro Sweillem site photo, not a spec. The source text says pre-heating uses "a hot stream of water"; the animation says only that pre-heating removes remaining humidity. Clay roof tiles aren't covered, because the sources have no roof tile process.

## Use it on a page

```html
<link rel="stylesheet" href="/animation/how-its-made/how-its-made.css">
<div id="how-its-made"></div>
<script type="module">
  import { mount } from '/animation/how-its-made/how-its-made.js';
  const player = mount(document.getElementById('how-its-made'), { autoplay: true, loop: false });
  // player.play(), player.pause(), player.seek(seconds), player.goTo('fire'), player.destroy()
</script>
```

Options: `autoplay` (plays while at least 40% visible), `loop`, `controls` (player bar and chapter buttons), `startAt` (seconds). Assets load relative to the module; call `setAssetBase(url)` if you serve `assets/` somewhere else.

Accessibility: the SVG has a text label, the current chapter's caption is announced in a polite live region, every control is a real button with a 44 px target, and with `prefers-reduced-motion` it does not autoplay; chapter buttons jump to each step's finished state instead.

In a React/Next.js page, call `mount` in a `useEffect` on a ref and `destroy()` in its cleanup.

## Preview and render

```bash
cd animation/how-its-made
npx serve .            # or any static server, then open /index.html
npm install            # installs Playwright
FFMPEG=/path/to/ffmpeg npm run render   # writes out/sweillem-how-its-made.mp4, poster and .vtt
npm run stills         # PNG stills at key moments, for review
```

A full render at 1920×1080, 30 fps takes about five minutes.

## Assets

- `assets/logo.png`: the SWEILLEM logo from the company deck, cropped with a transparent background.
- `assets/inter.woff2`, `assets/space-grotesk.woff2`: the fonts used in the project plan (both OFL).
