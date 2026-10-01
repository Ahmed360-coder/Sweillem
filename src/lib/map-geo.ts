// The export map's shapes (reach-map.json, about 85 KB) load only when the
// projects map in the header is first wanted, not with every page.
export type MapGeo = typeof import("./reach-map.json");

let pending: Promise<MapGeo> | null = null;

export function loadMapGeo(): Promise<MapGeo> {
  pending ??= import("./reach-map.json").then(
    (m) => m.default,
    (err) => {
      pending = null;
      throw err;
    },
  );
  return pending;
}
