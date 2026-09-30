# SWEILLEM motion spec

Every animation in the redesign prototype (M00 intro to M27). The same IDs appear on the prototype's **Motion spec** screen, where each one can be played.

## Principles

1. **Motion explains the product.** The big moments show something true about vitrified clay pipes: the cross-section redrawn to scale, the kiln climbing to 1200 °C, the pipe travelling from quarry to trench. Decoration stays small.
2. **One hexagon, everywhere.** Reveals, badges, bullets and the play button use the hexagon from the SWEILLEM S mark.
3. **Direction follows language.** Anything that moves sideways (drawer, marquee, arrows, underline origin, progress bars) mirrors in Arabic.
4. **Nothing waits on motion.** Every page is complete at rest; content is never hidden until an animation runs.
5. **Reduced motion is a first-class mode.** When the visitor's device asks for less motion, each item switches to the fallback in the last column. The prototype bar's Motion switch previews it.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--t-instant` | 120 ms | Chip press, tooltips |
| `--t-quick` | 200 ms | Hover, colour, focus |
| `--t-base` | 320 ms | Header, reveals, scrim, page transition |
| `--t-slow` | 560 ms | Drawer, pill, menu, FLIP, shared element |
| `--t-story` | 900 ms | Headline, hex iris, scroll steps |
| `--ease-glaze` | cubic-bezier(.2,.8,.2,1) | Standard ease-out, most UI |
| `--ease-kiln` | cubic-bezier(.65,0,.35,1) | Ease-in-out, things that travel |
| `--ease-set` | cubic-bezier(.34,1.56,.64,1) | Small overshoot, things that land |

## Catalogue

| ID | Name | Screen | Trigger | Duration | Easing | What moves | Reduced motion |
|---|---|---|---|---|---|---|---|
| M00 | Intro | home | First visit per session; skippable by tap or key | 3000 ms + 700 ms exit | back-out / glaze / kiln | 0–1.2 s: three glazed pipes fly in (left, above, right) and snap spigot-into-socket with a spark burst and a small shake; the joined line settles under the logo. 1.3–2 s: hexagon draws, white logo wipes in. 1.9–2.6 s: Since 1900→1935 · Cairo. Glaze highlight sweeps the pipe line; embers rise; logo and photo tilt with the pointer. Exits by collapsing into a hexagon | Joined pipes, logo and photo shown still for 0.9 s, then a 0.2 s fade |
| M01 | Page transition | all | Route change | 320 ms | glaze | View rises 14 px and fades in; View Transitions API where supported | Instant swap |
| M02 | Header condense | home | Scroll > 24 px | 320 ms | glaze | Logo 40→32 px, blurred ground and hairline appear | Same, no easing |
| M03 | Headline rise | home | Page load | 900 ms, 55 ms stagger | glaze | Each word rises out of a mask | Static text |
| M04 | Hex iris | home | Hero slideshow every 5.5 s; process step change | 1100 ms | kiln | Next photo opens from a hexagon (the S mark) at centre | Crossfade off; photo swaps |
| M05 | Ring draw | home | Page load | 2400 ms, 180 ms stagger | kiln | Concentric pipe rings draw behind the hero | Rings shown |
| M06 | Count-up | home | Stat enters view | 1200 ms | glaze | Numbers count from 0; 1935 counts from 1900 | Final value shown |
| M07 | Standards marquee | home | Always | 38 s loop | linear | EN 295, ASTM C700 and ISO marks scroll; pauses on hover; reverses in Arabic | Static row |
| M08 | Family redraw | home | Hover or focus | 900 ms | kiln | Fitting line icon redraws and tilts 4° | Colour change only |
| M09 | Class pill | products | Class change | 560 ms | set | Indicator slides with a small overshoot | Jump |
| M10 | Pipe tween | products | DN or class change | 620 ms | quart out | Cross-section radii, wall callout and d1 label tween to the new true-scale size | Instant redraw |
| M11 | Value flash | products | Spec value changes | 700 ms | glaze | Changed values lift 3 px in maroon | None |
| M12 | Add-to-quote flight | products | Add to quote | 760 ms | kiln arc | A pipe ring flies to the Quote button, which bumps; toast confirms | Toast only |
| M13 | Drawer | products | Open quote list | 560 ms | kiln | Slides from the inline end (right in English, left in Arabic) | Instant |
| M14 | Scrollytelling | process | Step reaches mid-viewport | 900 ms | kiln | Photo swaps by hex iris, step number and progress rail update | Photo swaps, rail updates |
| M15 | Kiln dial | process | Firing step active | 1400 ms | glaze | Heat arc fills and reads 0→1200 °C | Final value shown |
| M16 | Timeline fill | about | Scroll through history | scroll-linked | linear | Maroon line fills; hex nodes pop as they are reached | Line fully filled |
| M17 | Pin drop | projects | Map enters | 800 ms, 110 ms stagger | set | Pins drop in and pulse | Pins shown, no pulse |
| M18 | Filter | projects | Region chip | 560 ms | glaze | Non-matching pins shrink and fade; list reflows with FLIP | Instant filter |
| M19 | Shared-element zoom | projects | Open project | 560 ms | kiln | Card photo grows into the lightbox | Lightbox fades |
| M20 | Glaze pour | tiles | Tile colour change | 800 ms | kiln | New tile is revealed top to bottom; stage tint shifts | Instant swap |
| M21 | Roof wave | tiles | Tile colour change | 700 ms, diagonal 40 ms stagger | kiln | Each roof tile flips to the new colour in a diagonal wave | Instant swap |
| M22 | Search results | downloads | Typing | 200 ms, 40 ms stagger | glaze | Rows fade up; the match is highlighted | Rows shown |
| M23 | Kiln send | quote | Submit request | 1600 ms | kiln | Button fills maroon to fire orange while sending | Spinner text only |
| M24 | Success tick | quote | Request accepted | 700 ms | glaze | Tick draws inside a hexagon | Tick shown |
| M25 | Field error | quote | Invalid submit | 360 ms | glaze | Field nudges once, message fades in | Message only |
| M26 | Menu iris | home | Open mobile menu | 560 ms | kiln | Maroon panel opens as a circle from the burger; links stagger in | Instant |
| M27 | Pipe roll | notfound | 404 page load | 2200 ms | glaze | A pipe rolls in and a drop falls from the open socket | Static |

## Build notes (Next.js + Tailwind + Motion)

- Put the tokens in `tokens.css` as CSS variables and map them into Tailwind's theme; use the same values in Motion via a shared `motion.ts` (durations in seconds, easings as arrays).
- Wrap the app in Motion's `<MotionConfig reducedMotion="user">` and keep CSS `@media (prefers-reduced-motion: reduce)` rules for the CSS-only effects (marquee, rings, pulse).
- M01 page transition: use the View Transitions API through Next.js where supported; otherwise a Motion `AnimatePresence` fade-rise.
- M10 pipe tween: drive the SVG radii from the spec row with a Motion value and `animate()`; keep the drawing to true scale (one fixed px-per-mm for the whole range so size changes are visible).
- M12 flight and M19 shared element: Motion `layoutId` handles both.
- M14 scrollytelling and M16 timeline: `useScroll` + `useTransform`; step detection with IntersectionObserver.
- M00 intro: full spec and build rules in `intro-spec.md`.
- The manufacturing-to-installation film slot (Home and Process) is produced in a separate thread. It needs a poster frame, captions (EN + AR) and a still-image fallback for reduced motion.
