# Intro screen (M00)

A 3-second brand moment shown when a visitor first opens sweillem.net. Try it in the prototype with **Play intro**.

## Sequence (full motion, 3 s)

| Time | What happens |
|---|---|
| 0 ms | Dark glaze ground. The glazed-pipe photo from the Cairo plant (deck image9) fades in at 118% and settles to 103%. Embers start rising. |
| 50–450 ms | Pipe 1 flies in from the left (back-out ease, slight overshoot). |
| 280–680 ms | Pipe 2 drops in from above, rotating level as it lands; its socket takes pipe 1's spigot at 680 ms: spark burst, red compression ring flashes hot, small screen shake. |
| 500–900 ms | Pipe 3 flies in from the right and seats at 900 ms with the same burst and shake. |
| 1100–1550 ms | The joined line shrinks and settles into place under the logo, like a foundation. |
| 1250–2600 ms | White hexagon (S-mark shape) draws around the logo; a fire-orange hexagon traces over it. |
| 1350–2000 ms | The white SWEILLEM logo wipes in from the reading start edge (left in English, right in Arabic). |
| 1500–2800 ms | A glaze highlight sweeps along the pipe line. |
| 1850–2600 ms | "Since 1900 → 1935 · Cairo" rises in and counts up. |
| 3000 ms | The screen collapses into a hexagon at the centre (700 ms, ease-kiln), revealing the page. |

Pipes use the same side-view drawing as the How-it's-made film (`animation/how-its-made`, `pipe()`): fired glaze #4a2a1c, socket on the left, red compression ring #cf4a2f on the spigot, the same shade gradient. The joint design is illustrative until SWEILLEM confirms its joint system.

**Reactive:** the logo tilts in 3D toward the pointer, the photo and a warm glow drift against it, and embers drift sideways. Tap, click, Enter, Space or Esc skips at any time; a "Skip intro" button is always visible.

**Reduced motion:** joined pipes, logo, photo and year shown still for 0.9 s, then a 0.2 s fade. No embers, tilt or iris.

## Build rules (Next.js)

- Show it **once per session** (flag in `sessionStorage`), never on internal navigation, and never on deep links from search (only when the landing page is `/` or `/ar`).
- The page renders underneath from the start; the intro is an overlay, so it does not delay LCP or hydration. Cap it at 3 s even if images are slow; if the photo has not loaded, show the dark ground and logo only.
- Render it server-side as markup + CSS keyframes so it starts before JavaScript; JS drives the pipe assembly (an SVG redrawn per frame from time, like the film) and adds the pointer tilt, embers (a small canvas) and the skip handlers. Without JS it removes itself when the CSS animation ends.
- Mark it `aria-hidden="true"`; screen readers go straight to the page. Focus stays on the page; the skip button is reachable but not required.
- Assets: white version of the logo (currently the PNG with a CSS white filter; replace with the vector when SWEILLEM sends it) and the glazed-pipe photo as AVIF/WebP ≤ 60 KB at 1600 px.
- Honour `prefers-reduced-motion` as above.
