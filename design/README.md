# SWEILLEM redesign: screens and motion

Clickable prototype of the new sweillem.net, used to agree the look and the interactions before the Next.js build (Milestone 2 onward).

- `prototype/sweillem-prototype.html` – the whole prototype in one file (images embedded). Open it in a browser.
- `prototype/src.html`, `prototype/assets/`, `prototype/build.py` – editable source; run `python3 build.py` to rebuild the single file.
- `logo/` – the SWEILLEM logo redrawn as clean vectors: `sweillem-logo.svg` (full colour: grey #7f8285 mark and tagline, maroon #7a0404 wordmark), `sweillem-logo-white.svg` (dark backgrounds), `sweillem-logo-maroon.svg` (one colour), and the hexagon S mark alone in the same three colours. It is a faithful redraw of the logo on sweillem.net, not a redesign. The mark and the straight letters were fitted to the original with exact geometry, and the S was traced and smoothed. The tagline is set in Jost (a Futura-style open font) matched to the original letter positions. If SWEILLEM has the original vector file (AI, EPS or PDF), use it instead.
- `tokens.css` – colour, type, motion and shape tokens.
- `intro-spec.md` – the 3-second intro screen (M00): sequence, reactive behaviour and build rules.
- `motion-spec.md` – every animation with trigger, timing, easing and reduced-motion fallback.

## Screens

| Screen | What it shows |
|---|---|
| Intro | 3-second brand moment: three glazed pipes fly in and snap together, then hexagon draw, white logo wipe, 1900→1935 counter, embers, pointer tilt, hexagon exit; skippable |
| Home | Word-by-word slogan, hexagon photo iris, 1935 badge, count-up stats, standards marquee, 10 product families with redrawing icons, film slot, projects with tilt, tools band (3D viewer and calculator), pipe-joint section dividers, Euro Sweillem band |
| Product explorer | Class pill (N/H), DN chips and slider, true-scale SVG cross-section that tweens, compare-classes overlay, live spec card, add-to-quote flight, full table (stacked cards on phones), empty state for families whose tables are not imported yet |
| Process journey | Film slot, then sticky scrollytelling through the six steps plus delivery, hex-iris photo changes, progress rail, kiln dial to 1200 °C |
| About and history | Stats, then a pinned heritage track from 1935 to today: milestone cards slide sideways with scroll, a big year counts between dated milestones, market chips (Egypt, Saudi Arabia with TAAS, GCC and Europe, Germany with Euro Sweillem) light up as the business grows, carbon baseline and ISO cards; undated milestones read "year to confirm" |
| 3D pipe viewer | A three.js pipe built from the chosen row of the spec table: drag to spin, zoom, glaze close-up, seal ring, cut section, and a joint that assembles itself |
| Size calculator | Flow, slope, Manning's n and design depth give a suggested DN from the published tables (Manning partial-flow, guidance only), velocity and self-cleansing check, a log-scale capacity chart, and add to quote |
| Projects map | Region filters, schematic map with dropping pins, FLIP list, shared-element gallery |
| Roof tiles | Colour viewer (glaze-pour reveal) and a roof section that re-tiles in a diagonal wave |
| Downloads | Search with highlight, type filter, empty state; only files that exist are listed |
| Quote and contact | Quote list, form with inline validation, kiln-fill send button, success and network-error states, locations |
| 404 | Rolling pipe with a drip |
| Motion spec | Tokens with playable curves and the full catalogue |

Prototype bar: switch screen, Desktop/Mobile (the site responds with container queries), EN/Arabic (full RTL mirror), Full/Reduced motion, Stone/Kiln theme. The kiln theme is a dark ember palette that opens as a circle from the button pressed; it is also in the site header (flame icon) and, on phones, in the menu.

The 3D viewer loads three.js r128 from cdnjs. Without WebGL it shows a message and a link to the explorer.

## Sources and assumptions

- Copy, spec tables, certificates and standards come from the live site (fetched 30 Sep 2026) and SWEILLEM's deck and 2024 report. Pipe table values were transcribed through an automated fetch; re-check every row in M1.
- Photos are the real deck images, cropped and compressed. Deck text baked into some photos was cropped out where possible. Pexels stock images are not used.
- Arabic text is a draft for layout only. It needs SWEILLEM's approval (plan section 7). The hero uses SWEILLEM's own Arabic tagline from the deck.
- Hidden until confirmed: project count (2434 vs 3,000+), contact details, project clients/years, roof tile specs, the six broken certificates.
- The map is schematic; the build uses an open-tile map. Germany pins are placed at country level until the exact sites are known.
- 3D model: pipe length is shortened for viewing, and the socket outer shape and ring width are approximate until SWEILLEM sends drawings. Diameters come from the table.
- Calculator: standard Manning equation, n = 0.013 by default (0.010 to 0.011 for new glazed pipe), 0.6–3 m/s self-cleansing band. Guidance only; it does not replace a design check. Sizes and classes come from the published N and H tables.
- Heritage milestones come only from sweillem.net, the 2024 report, the certificate files and the deck; each card names its source.
- The manufacturing-to-installation film is produced in a separate thread; the prototype reserves its slot on Home and Process.
