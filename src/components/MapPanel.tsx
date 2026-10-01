"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent } from "react";
import { loadMapGeo, type MapGeo } from "@/lib/map-geo";
import pins from "@/lib/map-places.json";
import type { MapData, MapLayer, MapMarket, MapPlace, MapRegion } from "@/lib/projects-map";
import { ArrowIcon } from "./icons";

const regions: { id: MapRegion; label: string }[] = [
  { id: "world", label: "World" },
  { id: "europe", label: "Europe" },
  { id: "middle-east", label: "Middle East" },
  { id: "far-east", label: "Far East" },
];

const layers: { id: "all" | MapLayer; label: string }[] = [
  { id: "all", label: "All" },
  { id: "projects", label: "Projects" },
  { id: "distribution", label: "Distribution" },
];

/** What is picked: a project or address ("place:<id>") or an export market ("market:<iso id>"). */
type Pick = `place:${string}` | `market:${string}`;

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(reducedQuery).matches;

/** Export market labels near the map's right edge go on the left of the pin. */
const marketSide = (x: number) => (x > 850 ? "left" : "right");

/**
 * The projects map, opened from the Map button in the header: SWEILLEM's
 * projects, its addresses abroad and the export routes from Cairo, on the
 * same map as the export map on About. It zooms to a region (only transform
 * animates) and picks a place from the map or the lists beside it. The map
 * shapes load the first time it opens. Closed, it is inert.
 */
export function MapPanel({ open, data, onClose }: { open: boolean; data: MapData; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const [region, setRegion] = useState<MapRegion>("world");
  const [layer, setLayer] = useState<"all" | MapLayer>("all");
  const [picked, setPicked] = useState<Pick | null>(null);
  const [geo, setGeo] = useState<MapGeo | null>(null);

  // Nothing inside is built until the map is first opened, so other pages
  // do not load its photos (adjusting state during render, not in an effect).
  const [seen, setSeen] = useState(open);
  if (open && !seen) setSeen(true);

  useEffect(() => {
    if (!seen || geo) return;
    let live = true;
    loadMapGeo()
      .then((g) => live && setGeo(g))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [seen, geo]);

  // While open, the page behind is inert so focus and screen readers stay in the map.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const behind = Array.from(document.querySelectorAll<HTMLElement>("header.site-header, #main, body footer"));
    behind.forEach((el) => (el.inert = true));
    return () => behind.forEach((el) => (el.inert = false));
  }, [open]);

  const places = data.places;
  const projects = places.filter((p) => p.layer === "projects");
  const addresses = places.filter((p) => p.layer === "distribution");
  const shows = (l: MapLayer) => layer === "all" || layer === l;

  const pickedPlace = picked?.startsWith("place:") ? places.find((p) => `place:${p.id}` === picked) : undefined;
  const pickedMarket = picked?.startsWith("market:") ? data.markets.find((m) => `market:${m.id}` === picked) : undefined;

  const pick = (key: Pick, itemRegion: Exclude<MapRegion, "world">) => {
    if (key === picked) return setPicked(null);
    setPicked(key);
    setRegion(itemRegion);
  };
  const pickPlace = (p: MapPlace) => pick(`place:${p.id}`, p.region);
  const pickMarket = (m: MapMarket) => pick(`market:${m.id}`, m.region);
  // Picked from a list further down: bring the map (phones) and the card above the lists back into view.
  const pickFromList = (key: Pick, itemRegion: Exclude<MapRegion, "world">) => {
    pick(key, itemRegion);
    const behavior = reduced ? "auto" : "smooth";
    bodyRef.current?.scrollTo({ top: 0, behavior });
    asideRef.current?.scrollTo({ top: 0, behavior });
  };
  const regionOfMarket = new Map(data.markets.map((m) => [m.id, m.region]));

  const chooseRegion = (r: MapRegion) => {
    setRegion(r);
    const itemRegion = pickedPlace?.region ?? pickedMarket?.region;
    if (r !== "world" && itemRegion !== r) setPicked(null);
  };
  const chooseLayer = (l: "all" | MapLayer) => {
    setLayer(l);
    const itemLayer = pickedPlace?.layer ?? (pickedMarket ? "distribution" : undefined);
    if (l !== "all" && itemLayer && itemLayer !== l) setPicked(null);
  };

  // Pins on the map are for pointing; the lists beside it do the same for keyboards and screen readers.
  const onMapClick = (e: MouseEvent<HTMLDivElement>) => {
    const key = (e.target as Element).closest<HTMLElement>("[data-pick]")?.dataset.pick as Pick | undefined;
    if (!key) return;
    const place = places.find((p) => `place:${p.id}` === key);
    if (place) return pickPlace(place);
    const market = data.markets.find((m) => `market:${m.id}` === key);
    if (market) pickMarket(market);
  };

  const view = pins.views[region];
  const on = (key: Pick) => (picked === key ? "" : undefined);
  const ready = open && geo !== null;

  return (
    <div
      id="map-panel"
      inert={!open}
      data-open={open ? "" : undefined}
      className="group/map pointer-events-none fixed inset-0 z-50 data-open:pointer-events-auto"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[rgb(20_10_8/0.55)] opacity-0 backdrop-blur-[2px] transition-opacity duration-300 ease-glaze group-data-open/map:opacity-100"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-panel-title"
        className="absolute inset-0 mx-auto flex max-w-[1360px] translate-y-4 flex-col overflow-hidden bg-surface opacity-0 shadow-card transition-[opacity,transform] duration-[420ms] ease-kiln group-data-open/map:translate-y-0 group-data-open/map:opacity-100 md:inset-5 md:rounded-card"
      >
        <div className="flex flex-none items-center gap-4 border-b border-line px-5 py-3 md:px-6">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">SWEILLEM on the map</p>
            <h2 id="map-panel-title" className="text-[clamp(20px,2.4vw,26px)] leading-tight">
              Projects and distribution
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close map"
            className="relative size-11 flex-none cursor-pointer rounded-full text-ink transition-transform duration-100 hover:bg-sunk active:translate-y-px"
          >
            <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-0.5 rotate-45 bg-current" />
            <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-0.5 -rotate-45 bg-current" />
          </button>
        </div>

        {seen && (
          <div
            ref={bodyRef}
            className="grid min-h-0 flex-1 overflow-y-auto overscroll-contain lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:overflow-hidden"
          >
            <div className="grid content-start gap-3 p-4 md:p-5 lg:min-h-0 lg:overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <Choice label="Zoom to" items={regions} value={region} onChange={chooseRegion} />
                <Choice label="Show" items={layers} value={layer} onChange={chooseLayer} />
              </div>

              <div
                role="img"
                aria-label={`Map of SWEILLEM’s projects in Saudi Arabia, Egypt and Germany, its addresses in Cairo, Brüggen and Jeddah, and routes from Cairo to the ${data.markets.length} countries it names.`}
                data-view={region}
                data-layer={layer}
                data-ready={ready ? "" : undefined}
                data-focus={picked ? "" : undefined}
                style={{ "--zoom": view.k, "--pan-x": view.tx, "--pan-y": view.ty } as CSSProperties}
                className="pmap relative aspect-[1000/620] w-full overflow-hidden rounded-inner bg-[#0b1220]"
              >
                <svg viewBox="0 0 1000 620" className="absolute inset-0 size-full" aria-hidden="true">
                  {geo && (
                    <g className="pmap-zoom">
                      <path d={geo.land} className="pmap-land" />
                      <path d={geo.borders} className="pmap-borders" vectorEffect="non-scaling-stroke" />
                      <path d={geo.egypt} className="pmap-egypt" />
                      {geo.markets.map((m, i) => (
                        <path
                          key={m.id}
                          d={m.d}
                          data-on={on(`market:${m.id}`)}
                          className="pmap-country"
                          style={{ "--i": i } as CSSProperties}
                        />
                      ))}
                      {geo.markets.map((m, i) => (
                        <path
                          key={m.id}
                          id={`pmap-arc-${m.id}`}
                          d={m.arc}
                          data-on={on(`market:${m.id}`)}
                          vectorEffect="non-scaling-stroke"
                          className="pmap-arc"
                          style={{ "--i": i } as CSSProperties}
                        />
                      ))}
                      {open && !reduced && (
                        <g className="pmap-ships">
                          {geo.markets.map((m, i) => (
                            <circle key={m.id} r={2.4} className="pmap-ship">
                              <animateMotion dur={`${3 + (i % 4) * 0.4}s`} begin={`${(i * 0.37).toFixed(2)}s`} repeatCount="indefinite">
                                <mpath href={`#pmap-arc-${m.id}`} />
                              </animateMotion>
                            </circle>
                          ))}
                        </g>
                      )}
                    </g>
                  )}
                </svg>

                <div className="absolute inset-0" onClick={onMapClick}>
                  {geo?.markets.map((m, i) => (
                    <div
                      key={m.id}
                      data-pick={`market:${m.id}`}
                      data-layer="distribution"
                      data-region={regionOfMarket.get(m.id)}
                      data-on={on(`market:${m.id}`)}
                      className="pmap-pin pmap-market"
                      style={{ "--x": m.x, "--y": m.y, "--i": i } as CSSProperties}
                    >
                      <span className="pmap-mark" />
                      <span className="pmap-label" data-side={marketSide(m.x)}>
                        {m.name}
                      </span>
                    </div>
                  ))}
                  {places.map((p, i) => (
                    <div
                      key={p.id}
                      data-pick={`place:${p.id}`}
                      data-layer={p.layer}
                      data-region={p.region}
                      data-kind={p.origin ? "origin" : p.layer === "projects" ? "project" : "address"}
                      data-on={on(`place:${p.id}`)}
                      className="pmap-pin pmap-place"
                      style={{ "--x": p.x, "--y": p.y, "--i": i + 4 } as CSSProperties}
                    >
                      <span className="pmap-mark" />
                      <span className="pmap-label" data-side={p.side}>
                        {p.short}
                      </span>
                    </div>
                  ))}
                </div>
                {!geo && <p className="absolute inset-0 grid place-items-center text-[14px] text-[#c9d2e3]">Loading the map…</p>}
              </div>

              <ul aria-label="Map key" className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted">
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="pmap-key pmap-key-project" />
                  Project
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="pmap-key pmap-key-address" />
                  SWEILLEM address
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="pmap-key pmap-key-route" />
                  Export route from Cairo
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="pmap-key pmap-key-market" />
                  Country SWEILLEM names
                </li>
              </ul>
            </div>

            <div
              ref={asideRef}
              className="grid content-start gap-6 border-t border-line p-5 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border-t-0 lg:border-s"
            >
              <div aria-live="polite">
                {pickedPlace ? (
                  <PlaceCard place={pickedPlace} />
                ) : pickedMarket ? (
                  <div className="grid gap-1.5 rounded-card border border-line bg-paper p-4">
                    <p className="font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">Export market</p>
                    <h3 className="text-lg">{pickedMarket.name}</h3>
                    <p className="text-[15px] text-muted">
                      One of the {data.markets.length} countries SWEILLEM names as customers, reached from Cairo.
                    </p>
                  </div>
                ) : (
                  <p className="text-[15px] text-muted">Pick a project, an address or a country to find it on the map.</p>
                )}
              </div>

              {shows("projects") && (
                <section aria-labelledby="pmap-projects" className="grid gap-2.5">
                  <h3 id="pmap-projects" className="font-mono text-[12px] font-medium tracking-[.12em] text-muted uppercase">
                    Projects
                  </h3>
                  <ul className="grid gap-2">
                    {projects.map((p) => (
                      <li key={p.id}>
                        <PlaceButton place={p} pressed={picked === `place:${p.id}`} onPick={() => pickFromList(`place:${p.id}`, p.region)} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {shows("distribution") && (
                <section aria-labelledby="pmap-distribution" className="grid gap-2.5">
                  <h3 id="pmap-distribution" className="font-mono text-[12px] font-medium tracking-[.12em] text-muted uppercase">
                    Distribution
                  </h3>
                  <ul className="grid gap-2">
                    {addresses.map((p) => (
                      <li key={p.id}>
                        <PlaceButton place={p} pressed={picked === `place:${p.id}`} onPick={() => pickFromList(`place:${p.id}`, p.region)} />
                      </li>
                    ))}
                  </ul>
                  {regions.slice(1).map((r) => (
                    <div key={r.id} className="grid gap-1.5 pt-1">
                      <p className="text-[13px] text-muted">Export markets · {r.label}</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {data.markets
                          .filter((m) => m.region === r.id)
                          .map((m) => (
                            <li key={m.id}>
                              <button
                                type="button"
                                aria-pressed={picked === `market:${m.id}`}
                                onClick={() => pickFromList(`market:${m.id}`, m.region)}
                                className="min-h-11 cursor-pointer rounded-full border border-line bg-surface px-3.5 text-[14px] transition-[background-color,transform] duration-100 hover:bg-sunk active:translate-y-px aria-pressed:border-maroon aria-pressed:bg-maroon aria-pressed:text-on-maroon"
                              >
                                {m.name}
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </section>
              )}

              <div className="grid gap-1 border-t border-line pt-4">
                <Link
                  href="/projects"
                  onClick={onClose}
                  className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-maroon no-underline hover:underline"
                >
                  All projects <ArrowIcon />
                </Link>
                <Link
                  href="/about#reach"
                  onClick={onClose}
                  className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-maroon no-underline hover:underline"
                >
                  The export map on About <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** A row of toggle buttons where exactly one is pressed. */
function Choice<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-0.5 sm:gap-1">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          aria-pressed={it.id === value}
          onClick={() => onChange(it.id)}
          className="min-h-11 cursor-pointer rounded-full px-3 text-[14px] font-medium text-ink sm:px-3.5 transition-[background-color,transform] duration-100 hover:bg-sunk active:translate-y-px aria-pressed:bg-ink aria-pressed:text-paper"
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function PlaceButton({ place, pressed, onPick }: { place: MapPlace; pressed: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPick}
      className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-inner border border-line bg-surface p-2 text-start transition-[background-color,transform] duration-100 hover:bg-sunk active:translate-y-px aria-pressed:border-maroon aria-pressed:bg-sunk"
    >
      {place.image ? (
        <span className="relative size-12 flex-none overflow-hidden rounded-[10px] bg-sunk">
          <Image src={place.image.src} alt="" fill sizes="48px" className={`object-cover ${place.image.pos ?? ""}`} />
        </span>
      ) : (
        <span aria-hidden="true" className="grid size-12 flex-none place-items-center rounded-[10px] bg-sunk">
          <span className={`pmap-key ${place.origin ? "pmap-key-origin" : "pmap-key-address"}`} />
        </span>
      )}
      <span className="grid min-w-0">
        <span className="text-[15px] leading-snug font-semibold">{place.name}</span>
        <span className="text-[14px] text-muted">{place.place}</span>
      </span>
    </button>
  );
}

function PlaceCard({ place }: { place: MapPlace }) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper">
      {place.image && (
        <div className="relative aspect-[16/9] bg-sunk">
          <Image
            src={place.image.src}
            alt={place.image.alt}
            fill
            sizes="(min-width: 1024px) 380px, 100vw"
            className={`object-cover ${place.image.pos ?? ""}`}
          />
        </div>
      )}
      <div className="grid gap-1.5 p-4">
        <p className="font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">
          {place.layer === "projects" ? "Project" : "SWEILLEM address"} · {place.place}
        </p>
        <h3 className="text-lg">{place.name}</h3>
        <p className="text-[15px] text-muted">{place.text}</p>
      </div>
    </div>
  );
}
