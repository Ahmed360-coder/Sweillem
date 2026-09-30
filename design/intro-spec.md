# Intro screen (M00)

A 2-second brand moment shown when a visitor first opens sweillem.net. Try it in the prototype with **Play intro**.

## Sequence (full motion)

| Time | What happens |
|---|---|
| 0 ms | Dark glaze ground. The glazed-pipe photo from the Cairo plant (deck image9) fades in at 118% and slowly settles to 103%. Kiln-coloured progress line starts filling. |
| 0–800 ms | A thin white hexagon (the S-mark shape) draws around the centre; a fire-orange hexagon traces over it more slowly. Embers rise from the bottom. |
| 450–1200 ms | The white SWEILLEM logo wipes in from the reading start edge (left in English, right in Arabic). |
| 1000–1600 ms | "Since 1900 → 1935 · Cairo" rises in; the year counts up and lands on 1935. |
| 2000 ms | The whole screen collapses into a hexagon at the centre (700 ms, ease-kiln), revealing the page, which rises in. |

**Reactive:** the logo tilts in 3D toward the pointer, the photo and a warm glow drift against it, and embers drift sideways. Tap, click, Enter, Space or Esc skips at any time; a "Skip intro" button is always visible.

**Reduced motion:** logo, photo and year shown still for 0.9 s, then a 0.2 s fade. No embers, tilt or iris.

## Build rules (Next.js)

- Show it **once per session** (flag in `sessionStorage`), never on internal navigation, and never on deep links from search (only when the landing page is `/` or `/ar`).
- The page renders underneath from the start; the intro is an overlay, so it does not delay LCP or hydration. Cap it at 2 s even if images are slow; if the photo has not loaded, show the dark ground and logo only.
- Render it server-side as markup + CSS keyframes so it starts before JavaScript; JS only adds the pointer tilt, embers (a small canvas) and the skip handlers. Without JS it removes itself when the CSS animation ends.
- Mark it `aria-hidden="true"`; screen readers go straight to the page. Focus stays on the page; the skip button is reachable but not required.
- Assets: white version of the logo (currently the PNG with a CSS white filter; replace with the vector when SWEILLEM sends it) and the glazed-pipe photo as AVIF/WebP ≤ 60 KB at 1600 px.
- Honour `prefers-reduced-motion` as above.
