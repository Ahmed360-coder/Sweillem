"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import { loadMapGeo, type MapGeo } from "@/lib/map-geo";
import pins from "@/lib/map-places.json";
import type { Flag, MapData, MapLayer, MapMarket, MapPlace, MapRegion } from "@/lib/projects-map";
import { ArrowIcon } from "./icons";
import { PortDrawing } from "./PlaceDrawing";

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

/** Remembers the visitor's night or day choice on this device (shared with the export map on About). */
const MODE_KEY = "sweillem.map-mode";
const readMode = () => {
  try {
    const m = window.localStorage.getItem(MODE_KEY);
    return m === "night" || m === "day" ? m : null;
  } catch {
    return null;
  }
};
/** Until the visitor picks a view, the map follows the site theme: day in light mode, night in dark. */
const themeMode = () => (document.documentElement.dataset.theme === "light" ? "day" : "night");

/** How long the tour rests on each country, and the wait before it starts. */
const TOUR_MS = 2400;
const TOUR_DELAY_MS = 2600;

const mapSizes = "(min-width: 1360px) 900px, (min-width: 768px) 66vw, 760px";

/** Width and height of a path, in map units. */
function extent(d: string) {
  const n = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (let i = 0; i + 1 < n.length; i += 2) {
    x0 = Math.min(x0, n[i]);
    x1 = Math.max(x1, n[i]);
    y0 = Math.min(y0, n[i + 1]);
    y1 = Math.max(y1, n[i + 1]);
  }
  return Math.max(x1 - x0, y1 - y0);
}

/** How near (in page pixels) a click or tap must land to pick a pin; hovering is stricter. */
const TAP_REACH = 26;
const HOVER_REACH = 20;

/**
 * SWEILLEM's projects, its addresses abroad and the export routes from Cairo,
 * on the export map from About: the satellite view with its Night / Day
 * switch, the markets in red with their names, routes drawing out from Cairo
 * and clay pipes shipping along them. While nobody touches it, it tours the
 * markets like About does. It zooms to a region (only transform animates) and
 * picks a place from the map or the lists beside it. On phones the map is
 * wider than the screen and swipes sideways. The map shapes load once it is
 * active. It is shown in two places: the header's map panel ("panel") and the
 * Projects page ("page").
 */
export function ProjectsMap({
  data,
  active,
  variant,
  onLeave,
}: {
  data: MapData;
  /** Loads the shapes and runs the route animation. */
  active: boolean;
  variant: "panel" | "page";
  /** Called when one of its links is followed, so the panel can close. */
  onLeave?: () => void;
}) {
  const uid = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const [region, setRegion] = useState<MapRegion>("world");
  const [layer, setLayer] = useState<"all" | MapLayer>(variant === "page" ? "projects" : "all");
  const [picked, setPicked] = useState<Pick | null>(null);
  const [geo, setGeo] = useState<MapGeo | null>(null);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<Pick | null>(null);
  const [mapWidth, setMapWidth] = useState(0);
  const [mode, setMode] = useState<"night" | "day">("night");
  const [tour, setTour] = useState<string | null>(null);
  const [toured, setToured] = useState(false);
  const panel = variant === "panel";

  // Night or day: the visitor's choice, else the site theme (followed as it changes).
  useEffect(() => {
    const sync = () => setMode(readMode() ?? themeMode());
    sync();
    const watch = new MutationObserver(sync);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => watch.disconnect();
  }, []);
  const pickMode = (m: "night" | "day") => {
    setMode(m);
    try {
      window.localStorage.setItem(MODE_KEY, m);
    } catch {}
  };

  // The shapes load once active (the header's Map button warms them on hover); a failed load can be retried.
  useEffect(() => {
    if (!active || geo || failed) return;
    let live = true;
    loadMapGeo().then(
      (g) => live && setGeo(g),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [active, geo, failed]);

  // The map's width in page pixels, to keep pin labels inside it.
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setMapWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const view = pins.views[region];
  const W = pins.width;
  const places = data.places;
  const projects = places.filter((p) => p.layer === "projects");
  const addresses = places.filter((p) => p.layer === "distribution");
  const shows = (l: MapLayer) => layer === "all" || layer === l;

  const pickedPlace = picked?.startsWith("place:") ? places.find((p) => `place:${p.id}` === picked) : undefined;
  const pickedMarket = picked?.startsWith("market:") ? data.markets.find((m) => `market:${m.id}` === picked) : undefined;

  const pick = (key: Pick, itemRegion: Exclude<MapRegion, "world">) => {
    stopTour();
    if (key === picked) return setPicked(null);
    setPicked(key);
    setRegion(itemRegion);
  };
  const pickPlace = (p: MapPlace) => pick(`place:${p.id}`, p.region);
  const pickMarket = (m: MapMarket) => pick(`market:${m.id}`, m.region);
  // A new pick made by pointer from a list further down brings the map (phones) and the card
  // above the lists (wide screens) into view. Keyboard picks stay put, so the focus ring stays in sight.
  const pickFromList = (e: MouseEvent, key: Pick, itemRegion: Exclude<MapRegion, "world">) => {
    const isNew = key !== picked;
    pick(key, itemRegion);
    if (!isNew || e.detail === 0) return;
    const behavior = reduced ? "auto" : "smooth";
    const body = bodyRef.current;
    const map = mapRef.current;
    if (panel && body && map && body.scrollHeight > body.clientHeight) {
      const top = map.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12;
      if (top < body.scrollTop) body.scrollTo({ top, behavior });
    } else if (!panel && map && map.getBoundingClientRect().top < 0) {
      map.scrollIntoView({ behavior, block: "start" });
    }
    asideRef.current?.scrollTo({ top: 0, behavior });
  };
  const regionOfMarket = new Map(data.markets.map((m) => [m.id, m.region]));

  const chooseRegion = (r: MapRegion) => {
    stopTour();
    setRegion(r);
    const itemRegion = pickedPlace?.region ?? pickedMarket?.region;
    if (r !== "world" && itemRegion !== r) setPicked(null);
  };
  const chooseLayer = (l: "all" | MapLayer) => {
    setLayer(l);
    const itemLayer = pickedPlace?.layer ?? (pickedMarket ? "distribution" : undefined);
    if (l !== "all" && itemLayer && itemLayer !== l) setPicked(null);
  };

  // Pins on the map are for pointing; the lists beside it do the same for keyboards and screen
  // readers. Pins sit close together (Makkah and Jeddah are 70 km apart), so a click picks the
  // pin nearest to it rather than whichever pin's box is on top, and a click on an export
  // country away from any pin picks that country.
  const pinAt = (x: number, y: number, reach: number): Pick | null => {
    if (!geo || !pinsRef.current) return null;
    let best: Pick | null = null;
    let bestD = reach;
    pinsRef.current.querySelectorAll<HTMLElement>("[data-pick]").forEach((pin) => {
      if (layer !== "all" && pin.dataset.layer !== layer) return;
      const r = pin.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
      // Places come after markets, so on a tie (the site in Germany) the place wins.
      if (d <= bestD) {
        bestD = d;
        best = pin.dataset.pick as Pick;
      }
    });
    if (best || !shows("distribution")) return best;
    const country = document.elementsFromPoint(x, y).find((el) => el.classList.contains("pmap-country")) as SVGElement | undefined;
    return country?.dataset.market ? `market:${country.dataset.market}` : null;
  };
  const onMapClick = (e: MouseEvent<HTMLDivElement>) => {
    const key = pinAt(e.clientX, e.clientY, TAP_REACH);
    const place = places.find((p) => `place:${p.id}` === key);
    if (place) return pickPlace(place);
    const market = data.markets.find((m) => `market:${m.id}` === key);
    if (market) pickMarket(market);
  };
  const onMapPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const key = pinAt(e.clientX, e.clientY, HOVER_REACH);
    if (key) stopTour();
    if (key !== hovered) setHovered(key);
  };

  // The tour: while nobody has touched the map, it picks out one market after another, as on About.
  const touring = tour !== null && picked === null && hovered === null;
  const stopTour = () => {
    if (toured) return;
    setToured(true);
    setTour(null);
  };
  const tourIds = geo?.markets.map((m) => m.id);
  const canTour = active && geo !== null && !reduced && !toured && region === "world" && layer !== "projects" && picked === null;
  useEffect(() => {
    if (!canTour || !tourIds) return;
    let i = -1;
    let timer = 0;
    const step = () => {
      i = (i + 1) % tourIds.length;
      setTour(tourIds[i]);
    };
    const start = window.setTimeout(() => {
      step();
      timer = window.setInterval(step, TOUR_MS);
    }, TOUR_DELAY_MS);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
      setTour(null);
    };
    // tourIds only changes when the shapes load, which canTour already follows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canTour]);

  // Phones: the map is wider than the screen, so slide it to keep what matters in the middle:
  // the pick, or the toured country, or the middle of a zoomed region, or Europe to Cairo.
  const followX = (() => {
    const id = picked ?? (touring ? `market:${tour}` : null);
    const x = id?.startsWith("place:")
      ? places.find((p) => `place:${p.id}` === id)?.x
      : id
        ? geo?.markets.find((m) => `market:${m.id}` === id)?.x
        : undefined;
    if (x !== undefined) return view.tx + x * view.k;
    return region === "world" ? 650 : W / 2;
  })();
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc || !mapWidth || sc.scrollWidth <= sc.clientWidth + 1) return;
    sc.scrollTo({ left: (followX / W) * mapWidth - sc.clientWidth / 2, behavior: reduced || !geo ? "auto" : "smooth" });
    // geo is read only to pick the scroll behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followX, mapWidth, W, reduced]);

  /** Which side of its pin a label goes, so it stays inside the map at the current zoom. */
  const labelSide = (x: number, name: string, side: "left" | "right") => {
    if (!mapWidth) return side;
    const px = ((view.tx + x * view.k) * mapWidth) / W;
    const width = name.length * 7.6 + 34;
    if (side === "left" && px - width < 4) return "right";
    if (side === "right" && px + width > mapWidth - 4) return "left";
    return side;
  };

  const on = (key: Pick) => (picked === key || (touring && key === `market:${tour}`) ? "" : undefined);
  const ready = active && geo !== null;
  const arcId = (id: string) => `pmap-arc${uid}${id}`;
  const pipeId = `pmap-pipe${uid}`;
  // Markets too small to see as a shape (Singapore, Hong Kong) also get a red disc.
  const smallMarkets = new Set(geo?.markets.filter((m) => extent(m.d) < 14).map((m) => m.id));
  const namedCount = data.markets.filter((m) => m.source === "about").length;

  return (
    <div
      ref={bodyRef}
      className={
        panel
          ? "grid min-h-0 flex-1 overflow-y-auto overscroll-contain lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:overflow-hidden"
          : "grid overflow-hidden rounded-card border border-line bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]"
      }
    >
      <div className={`grid auto-rows-max content-start gap-3 p-4 md:p-5 ${panel ? "lg:min-h-0 lg:overflow-y-auto" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Choice label="Zoom to" items={regions} value={region} onChange={chooseRegion} />
          <Choice label="Show" items={layers} value={layer} onChange={chooseLayer} />
        </div>

        <div className="relative mx-auto w-full overflow-hidden rounded-inner bg-[#060b16] md:max-w-[calc((100dvh_-_230px)_*_1.5556)]">
          <div
            ref={scrollRef}
            onPointerDown={stopTour}
            onWheel={stopTour}
            role="region"
            aria-label="Map. On small screens, scroll sideways to see the Gulf and the Far East."
            tabIndex={0}
            className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:overflow-visible"
          >
            <div
              ref={mapRef}
              data-view={region}
              data-layer={layer}
              data-mode={mode}
              data-ready={ready ? "" : undefined}
              data-focus={picked || touring ? "" : undefined}
              style={{ "--zoom": view.k, "--pan-x": view.tx, "--pan-y": view.ty } as CSSProperties}
              className="pmap relative aspect-[1400/900] w-[760px] scroll-mt-[calc(var(--header-h)_+_12px)] md:w-full"
            >
              <div
                role="img"
                aria-label={`Satellite map of SWEILLEM’s projects in Saudi Arabia, Egypt and Germany, its addresses in Cairo, Brüggen and Jeddah, and routes from Cairo to the ${data.markets.length} countries on its export map.`}
                className="absolute inset-0"
              >
                <div className="pmap-zoom absolute inset-0" aria-hidden="true">
                  <Image src="/images/company/export-map-night.webp" alt="" fill sizes={mapSizes} className="pmap-photo pmap-photo-night" />
                  <Image src="/images/company/export-map-day.webp" alt="" fill sizes={mapSizes} className="pmap-photo pmap-photo-day" />
                  <Image src="/images/company/export-map-borders.svg" alt="" fill unoptimized className="pointer-events-none" />
                  <svg viewBox={`0 0 ${pins.width} ${pins.height}`} className="absolute inset-0 size-full">
                    {geo && (
                      <>
                        <defs>
                          <PipeSymbol id={pipeId} />
                        </defs>
                        <g className="pmap-countries">
                          {geo.markets.map((m, i) => (
                            <g key={m.id} data-market={m.id} data-on={on(`market:${m.id}`)} className="pmap-country" style={{ "--i": i } as CSSProperties}>
                              <path d={m.d} />
                              {smallMarkets.has(m.id) && <circle cx={m.x} cy={m.y} r={7} />}
                            </g>
                          ))}
                        </g>
                        <g className="pmap-inset">
                          <rect x={geo.inset.x} y={geo.inset.y} width={geo.inset.w} height={geo.inset.h} rx={14} />
                          <text x={geo.inset.x + 16} y={geo.inset.y + 28}>
                            Far East
                          </text>
                        </g>
                        {geo.markets.map((m, i) => (
                          <path
                            key={m.id}
                            id={arcId(m.id)}
                            d={m.arc}
                            pathLength={1}
                            data-on={on(`market:${m.id}`)}
                            className="pmap-arc"
                            style={{ "--i": i } as CSSProperties}
                          />
                        ))}
                        {/* Shipments: a pipe leaves Cairo, rides the route nose first and fades on arrival. */}
                        {active && !reduced && (
                          <g className="pmap-ships">
                            {geo.markets.map((m, i) => {
                              const dur = `${4.2 + (i % 4) * 0.5}s`;
                              const begin = `${(i * 0.4).toFixed(2)}s`;
                              return (
                                <g key={m.id} data-on={on(`market:${m.id}`)} className="pmap-ship">
                                  <use href={`#${pipeId}`} x={-15} y={-8} width={30} height={16}>
                                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.82;1" dur={dur} begin={begin} repeatCount="indefinite" />
                                  </use>
                                  <animateMotion dur={dur} begin={begin} repeatCount="indefinite" rotate="auto">
                                    <mpath href={`#${arcId(m.id)}`} />
                                  </animateMotion>
                                </g>
                              );
                            })}
                          </g>
                        )}
                        <g className="pmap-origin">
                          <circle cx={geo.origin.x} cy={geo.origin.y} r={16} className="pmap-origin-ring" />
                          <circle cx={geo.origin.x} cy={geo.origin.y} r={13} className="pmap-origin-dot" />
                          <image href="/images/brand/sweillem-mark.svg" x={geo.origin.x - 6.5} y={geo.origin.y - 9.5} width={13} height={19} />
                          <text x={geo.origin.x - 22} y={geo.origin.y + 5} className="pmap-origin-text" textAnchor="end">
                            CAIRO
                          </text>
                        </g>
                        {/* Names on the countries, sized to the country like SWEILLEM's map. */}
                        {geo.markets.map((m, i) => (
                          <text
                            key={m.id}
                            x={m.label.x}
                            y={m.label.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            data-on={on(`market:${m.id}`)}
                            className="pmap-name"
                            style={{ "--s": m.label.size, "--i": i } as CSSProperties}
                          >
                            {m.name.toUpperCase()}
                          </text>
                        ))}
                      </>
                    )}
                  </svg>
                </div>

                <div
                  ref={pinsRef}
                  className="absolute inset-0 data-hover:cursor-pointer"
                  data-hover={hovered ? "" : undefined}
                  onClick={onMapClick}
                  onPointerMove={onMapPointerMove}
                  onPointerLeave={() => setHovered(null)}
                >
                  {geo?.markets.map((m, i) => (
                    <div
                      key={m.id}
                      data-pick={`market:${m.id}`}
                      data-layer="distribution"
                      data-region={regionOfMarket.get(m.id)}
                      data-on={on(`market:${m.id}`)}
                      data-hover={hovered === `market:${m.id}` ? "" : undefined}
                      className="pmap-pin pmap-market"
                      style={{ "--x": m.x, "--y": m.y, "--i": i } as CSSProperties}
                    />
                  ))}
                  {places.map((p, i) => (
                    <div
                      key={p.id}
                      data-pick={`place:${p.id}`}
                      data-layer={p.layer}
                      data-region={p.region}
                      data-kind={p.origin ? "origin" : p.layer === "projects" ? "project" : "address"}
                      data-on={on(`place:${p.id}`)}
                      data-hover={hovered === `place:${p.id}` ? "" : undefined}
                      className="pmap-pin pmap-place"
                      style={{ "--x": p.x, "--y": p.y, "--i": i + 4 } as CSSProperties}
                    >
                      <span className="pmap-mark" />
                      {!p.origin && (
                        <span className="pmap-label" data-side={labelSide(p.x, p.short, p.side)}>
                          {p.short}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {!geo &&
                (failed ? (
                  <div className="absolute inset-0 grid place-content-center justify-items-center gap-3 p-4 text-center text-[14px] text-[#c9d2e3]">
                    <p>The map could not load.</p>
                    <button
                      type="button"
                      onClick={() => setFailed(false)}
                      className="min-h-11 cursor-pointer rounded-full bg-white px-5 text-[14px] font-semibold text-[#1c1818] transition-transform duration-100 active:translate-y-px"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <p className="absolute inset-0 grid place-items-center text-[14px] text-[#c9d2e3]">Loading the map…</p>
                ))}
            </div>
          </div>
          {/* Night / day switch, shared with the export map on About. Outside the scroller so it stays put on phones. */}
          <div
            className="absolute top-3 left-3 z-[4] flex rounded-full bg-[#0b1220]/80 p-1 text-[13px] font-semibold text-white backdrop-blur-sm"
            role="group"
            aria-label="Map view"
          >
            {(["night", "day"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => pickMode(m)}
                className="reach-mode min-h-11 rounded-full px-4 capitalize md:min-h-9 md:px-3.5"
              >
                {m}
              </button>
            ))}
          </div>
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
        className={`grid content-start gap-6 border-t border-line p-5 lg:border-t-0 lg:border-s ${
          panel ? "lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain" : "lg:h-0 lg:min-h-full lg:overflow-y-auto lg:overscroll-contain"
        }`}
      >
        <div aria-live="polite">
          {pickedPlace ? (
            <PlaceCard place={pickedPlace} onLeave={onLeave} />
          ) : pickedMarket ? (
            <div className="grid gap-1.5 rounded-card border border-line bg-paper p-4">
              <p className="font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">Export market</p>
              <h3 className="flex items-center gap-2.5 text-lg">
                <CountryFlag flag={pickedMarket.flag} size="lg" />
                {pickedMarket.name}
              </h3>
              <p className="text-[15px] text-muted">
                {pickedMarket.source === "about"
                  ? `One of the ${namedCount} countries SWEILLEM names as customers on its About Us page, reached from Cairo.`
                  : "Filled red on SWEILLEM’s own export map, reached from Cairo."}
              </p>
            </div>
          ) : (
            <p className="text-[15px] text-muted">Pick a project, an address or a country to find it on the map.</p>
          )}
        </div>

        {shows("projects") && (
          <section aria-labelledby={`${uid}-projects`} className="grid gap-2.5">
            <h3 id={`${uid}-projects`} className="font-mono text-[12px] font-medium tracking-[.12em] text-muted uppercase">
              Projects
            </h3>
            <ul className="grid gap-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <PlaceButton place={p} pressed={picked === `place:${p.id}`} onPick={(e) => pickFromList(e, `place:${p.id}`, p.region)} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {shows("distribution") && (
          <section aria-labelledby={`${uid}-distribution`} className="grid gap-2.5">
            <h3 id={`${uid}-distribution`} className="font-mono text-[12px] font-medium tracking-[.12em] text-muted uppercase">
              Distribution
            </h3>
            <ul className="grid gap-2">
              {addresses.map((p) => (
                <li key={p.id}>
                  <PlaceButton place={p} pressed={picked === `place:${p.id}`} onPick={(e) => pickFromList(e, `place:${p.id}`, p.region)} />
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
                          onClick={(e) => pickFromList(e, `market:${m.id}`, m.region)}
                          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface ps-3 pe-3.5 text-[14px] transition-[background-color,transform] duration-100 hover:bg-sunk active:translate-y-px aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-on-brand"
                        >
                          <CountryFlag flag={m.flag} />
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
          {panel && (
            <Link
              href="/projects"
              onClick={onLeave}
              className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-maroon no-underline hover:underline"
            >
              All projects <ArrowIcon />
            </Link>
          )}
          <Link
            href="/about#reach"
            onClick={onLeave}
            className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-maroon no-underline hover:underline"
          >
            The export map on About <ArrowIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** A vitrified clay pipe, spigot end first, drawn around 0,0 so it can ride a route (as on About). */
function PipeSymbol({ id }: { id: string }) {
  return (
    <symbol id={id} viewBox="-15 -8 30 16" overflow="visible">
      <rect x={-13} y={-4.5} width={19} height={9} rx={1.5} fill="#a8572f" stroke="#2a1410" strokeWidth={0.8} />
      <rect x={-12} y={-3.4} width={17} height={2.2} rx={1} fill="#e09a63" />
      <rect x={5} y={-6.5} width={8} height={13} rx={2.2} fill="#8a4424" stroke="#2a1410" strokeWidth={0.8} />
      <rect x={6} y={-5.4} width={6} height={2.4} rx={1} fill="#c97d4f" />
      <ellipse cx={13} cy={0} rx={1.6} ry={4.4} fill="#2a1410" />
    </symbol>
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

function PlaceButton({ place, pressed, onPick }: { place: MapPlace; pressed: boolean; onPick: (e: MouseEvent) => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPick}
      className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-inner border border-line bg-surface p-2 text-start transition-[background-color,transform] duration-100 hover:bg-sunk active:translate-y-px aria-pressed:border-maroon aria-pressed:bg-sunk"
    >
      {place.image ? (
        <span className="relative size-12 flex-none overflow-hidden rounded-[10px] bg-sunk">
          {"drawn" in place.image ? (
            <PortDrawing className="absolute inset-0 size-full" />
          ) : (
            <Image src={place.image.src} alt="" fill sizes="48px" className={`object-cover ${place.image.pos ?? ""}`} />
          )}
        </span>
      ) : (
        <span aria-hidden="true" className="grid size-12 flex-none place-items-center rounded-[10px] bg-sunk">
          <span className={`pmap-key ${place.origin ? "pmap-key-origin" : "pmap-key-address"}`} />
        </span>
      )}
      <span className="grid min-w-0">
        <span className="text-[15px] leading-snug font-semibold">{place.name}</span>
        <span className="flex items-center gap-1.5 text-[14px] text-muted">
          <CountryFlag flag={place.flag} />
          {place.place}
        </span>
      </span>
    </button>
  );
}

function PlaceCard({ place, onLeave }: { place: MapPlace; onLeave?: () => void }) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper">
      {place.image && (
        <div className="relative aspect-[16/9] bg-sunk">
          {"drawn" in place.image ? (
            <>
              <PortDrawing title={place.image.alt} className="absolute inset-0 size-full" />
              <span className="absolute end-2.5 bottom-2.5 rounded-full bg-surface/90 px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-[.1em] text-muted uppercase">
                Drawing
              </span>
            </>
          ) : (
            <Image
              src={place.image.src}
              alt={place.image.alt}
              fill
              sizes="(min-width: 1024px) 380px, 100vw"
              className={`object-cover ${place.image.pos ?? ""}`}
            />
          )}
        </div>
      )}
      <div className="grid gap-1.5 p-4">
        <p className="flex items-center gap-2 font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">
          <CountryFlag flag={place.flag} />
          {place.layer === "projects" ? "Project" : "SWEILLEM address"} · {place.place}
        </p>
        <h3 className="text-lg">{place.name}</h3>
        <p className="text-[15px] text-muted">{place.text}</p>
        {place.layer === "projects" && (
          <Link
            href={`/projects#${place.id}`}
            onClick={onLeave}
            className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-maroon no-underline hover:underline"
          >
            Photos of this project <ArrowIcon />
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * A country's flag beside its name. The name is always written next to it, so the
 * flag is decorative. A thin ring keeps white and pale flags visible on any background.
 */
function CountryFlag({ flag, size = "sm" }: { flag: Flag; size?: "sm" | "lg" }) {
  return (
    <Image
      src={`/images/flags/${flag}.svg`}
      alt=""
      width={size === "lg" ? 24 : 20}
      height={size === "lg" ? 18 : 15}
      className="flex-none rounded-[2px] object-cover shadow-[0_0_0_1px_var(--line)]"
    />
  );
}
