// The projection shared by the export map on About (build-reach-map.mjs) and
// the projects map in the header (build-map-places.mjs), so a point placed by
// one script lines up with the shapes drawn by the other.
import { geoAzimuthalEqualArea } from "d3-geo";

export const W = 1000;
export const H = 620;
/** Cairo, where the pipes leave from. */
export const ORIGIN = [31.24, 30.04];

/** Equal-area view centred near Egypt, fitted so Europe and the Far East both fit. */
export function makeProjection() {
  const projection = geoAzimuthalEqualArea().rotate([-52, -34]);
  projection.fitExtent(
    [
      [24, 24],
      [W - 24, H - 24],
    ],
    { type: "MultiPoint", coordinates: [[-9.5, 56], [24, 58], [118, 23], [104, 0.5], [116, 3.5], [5, 37], [52, 15]] },
  );
  projection.clipExtent([
    [0, 0],
    [W, H],
  ]);
  return projection;
}
