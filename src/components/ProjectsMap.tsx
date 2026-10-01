"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
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

/** How near (in page pixels) a click or tap must land to pick a pin; hovering is stricter. */
const TAP_REACH = 26;
const HOVER_REACH = 20;

/**
 * SWEILLEM's projects, its addresses abroad and the export routes from Cairo,
 * on the same map as the export map on About. It zooms to a region (only
 * transform animates) and picks a place from the map or the lists beside it.
 * The map shapes load once it is active. It is shown in two places: the
 * header's map panel ("panel") and the Projects page ("page").
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
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const [region, setRegion] = useState<MapRegion>("world");
  const [layer, setLayer] = useState<"all" | MapLayer>(variant === "page" ? "projects" : "all");
  const [picked, setPicked] = useState<Pick | null>(null);
  const [geo, setGeo] = useState<MapGeo | null>(null);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<Pick | null>(null);
  const [mapWidth, setMapWidth] = useState(0);
  const panel = variant === "panel";

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
    if (key !== hovered) setHovered(key);
  };

  /** Which side of its pin a label goes, so it stays inside the map at the current zoom. */
  const labelSide = (x: number, name: string, side: "left" | "right") => {
    if (!mapWidth) return side;
    const px = ((view.tx + x * view.k) * mapWidth) / 1000;
    const width = name.length * 7.6 + 34;
    if (side === "left" && px - width < 4) return "right";
    if (side === "right" && px + width > mapWidth - 4) return "left";
    return side;
  };

  const on = (key: Pick) => (picked === key ? "" : undefined);
  const ready = active && geo !== null;
  const arcId = (id: string) => `pmap-arc${uid}${id}`;

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

        <div
          ref={mapRef}
          data-view={region}
          data-layer={layer}
          data-ready={ready ? "" : undefined}
          data-focus={picked ? "" : undefined}
          style={{ "--zoom": view.k, "--pan-x": view.tx, "--pan-y": view.ty } as CSSProperties}
          className="pmap relative mx-auto aspect-[1000/620] w-full max-w-[calc((100dvh_-_230px)_*_1.6129)] scroll-mt-[calc(var(--header-h)_+_12px)] overflow-hidden rounded-inner bg-[#0b1220]"
        >
          <div
            role="img"
            aria-label={`Map of SWEILLEM’s projects in Saudi Arabia, Egypt and Germany, its addresses in Cairo, Brüggen and Jeddah, and routes from Cairo to the ${data.markets.length} countries it names.`}
            className="absolute inset-0"
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
                      data-market={m.id}
                      data-on={on(`market:${m.id}`)}
                      className="pmap-country"
                      style={{ "--i": i } as CSSProperties}
                    />
                  ))}
                  {geo.markets.map((m, i) => (
                    <path
                      key={m.id}
                      id={arcId(m.id)}
                      d={m.arc}
                      data-on={on(`market:${m.id}`)}
                      vectorEffect="non-scaling-stroke"
                      className="pmap-arc"
                      style={{ "--i": i } as CSSProperties}
                    />
                  ))}
                  {active && !reduced && (
                    <g className="pmap-ships">
                      {geo.markets.map((m, i) => (
                        <circle key={m.id} r={2.4} className="pmap-ship">
                          <animateMotion dur={`${3 + (i % 4) * 0.4}s`} begin={`${(i * 0.37).toFixed(2)}s`} repeatCount="indefinite">
                            <mpath href={`#${arcId(m.id)}`} />
                          </animateMotion>
                        </circle>
                      ))}
                    </g>
                  )}
                </g>
              )}
            </svg>

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
                >
                  <span className="pmap-mark" />
                  <span className="pmap-label" data-side={labelSide(m.x, m.name, "right")}>
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
                  data-hover={hovered === `place:${p.id}` ? "" : undefined}
                  className="pmap-pin pmap-place"
                  style={{ "--x": p.x, "--y": p.y, "--i": i + 4 } as CSSProperties}
                >
                  <span className="pmap-mark" />
                  <span className="pmap-label" data-side={labelSide(p.x, p.short, p.side)}>
                    {p.short}
                  </span>
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

function PlaceCard({ place, onLeave }: { place: MapPlace; onLeave?: () => void }) {
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
