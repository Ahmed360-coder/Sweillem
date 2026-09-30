# SWEILLEM redesign: screens and motion

Clickable prototype of the new sweillem.net, used to agree the look and the interactions before the Next.js build (Milestone 2 onward).

- `prototype/sweillem-prototype.html` – the whole prototype in one file (images embedded). Open it in a browser.
- `prototype/src.html`, `prototype/assets/`, `prototype/build.py` – editable source; run `python3 build.py` to rebuild the single file.
- `tokens.css` – colour, type, motion and shape tokens.
- `motion-spec.md` – every animation with trigger, timing, easing and reduced-motion fallback.

## Screens

| Screen | What it shows |
|---|---|
| Home | Word-by-word slogan, hexagon photo iris, 1935 badge, count-up stats, standards marquee, 10 product families with redrawing icons, film slot, projects, Euro Sweillem band |
| Product explorer | Class pill (N/H), DN chips and slider, true-scale SVG cross-section that tweens, compare-classes overlay, live spec card, add-to-quote flight, full table (stacked cards on phones), empty state for families whose tables are not imported yet |
| Process journey | Film slot, then sticky scrollytelling through the six steps plus delivery, hex-iris photo changes, progress rail, kiln dial to 1200 °C |
| About and history | Stats, scroll-filled timeline (undated events marked "year to confirm"), standards |
| Projects map | Region filters, schematic map with dropping pins, FLIP list, shared-element gallery |
| Roof tiles | Colour viewer (glaze-pour reveal) and a roof section that re-tiles in a diagonal wave |
| Downloads | Search with highlight, type filter, empty state; only files that exist are listed |
| Quote and contact | Quote list, form with inline validation, kiln-fill send button, success and network-error states, locations |
| 404 | Rolling pipe with a drip |
| Motion spec | Tokens with playable curves and the full catalogue |

Prototype bar: switch screen, Desktop/Mobile (the site responds with container queries), EN/Arabic (full RTL mirror), Full/Reduced motion.

## Sources and assumptions

- Copy, spec tables, certificates and standards come from the live site (fetched 30 Sep 2026) and SWEILLEM's deck and 2024 report. Pipe table values were transcribed through an automated fetch; re-check every row in M1.
- Photos are the real deck images, cropped and compressed. Deck text baked into some photos was cropped out where possible. Pexels stock images are not used.
- Arabic text is a draft for layout only. It needs SWEILLEM's approval (plan section 7). The hero uses SWEILLEM's own Arabic tagline from the deck.
- Hidden until confirmed: project count (2434 vs 3,000+), contact details, project clients/years, roof tile specs, the six broken certificates.
- The map is schematic; the build uses an open-tile map. Germany pins are placed at country level until the exact sites are known.
- The manufacturing-to-installation film is produced in a separate thread; the prototype reserves its slot on Home and Process.
