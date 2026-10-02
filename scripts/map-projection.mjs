// The projections of the export map (build-export-map.mjs), shared with the
// projects map in the header (build-map-places.mjs), so a point placed by one
// script lines up with the shapes and pictures drawn by the other.
import { geoMercator } from "d3-geo";

export const W = 1400;
/** The frame About shows. */
export const H = 820;
/**
 * The full picture runs a little further south, so the projects map in the
 * header also reaches Sharurah. About crops it to H from the top.
 */
export const FULL_H = 900;
/** Cairo, where the pipes leave from. */
export const ORIGIN = [31.24, 30.04];
/** The Far East inset, in map pixels. */
export const INSET = { x: 1092, y: 18, w: 290, h: 330 };

/** Main view: Spain to the Gulf, Poland to the Red Sea, like SWEILLEM's map. */
export function makeMainProjection() {
  const main = geoMercator().fitExtent(
    [
      [0, 0],
      [W, H],
    ],
    { type: "MultiPoint", coordinates: [[-10.2, 44], [24, 56.2], [57.5, 30], [44, 20.5], [-9, 36]] },
  );
  main.clipExtent([
    [0, 0],
    [W, FULL_H],
  ]);
  return main;
}

/** Inset: Hong Kong, Brunei and Singapore. */
export function makeInsetProjection() {
  const inset = geoMercator().fitExtent(
    [
      [INSET.x + 18, INSET.y + 44],
      [INSET.x + INSET.w - 18, INSET.y + INSET.h - 18],
    ],
    { type: "MultiPoint", coordinates: [[102.5, 23.5], [117.5, 23.5], [102.5, 0.4], [117.5, 0.4]] },
  );
  inset.clipExtent([
    [INSET.x, INSET.y],
    [INSET.x + INSET.w, INSET.y + INSET.h],
  ]);
  return inset;
}
