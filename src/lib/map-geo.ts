// The export map's shapes (export-map.json, about 50 KB) load only when the
// projects map in the header is first wanted, not with every page.
export type MapGeo = typeof import("./export-map.json");

let pending: Promise<MapGeo> | null = null;

export function loadMapGeo(): Promise<MapGeo> {
  pending ??= import("./export-map.json").then(
    (m) => m.default,
    (err) => {
      pending = null;
      throw err;
    },
  );
  return pending;
}
