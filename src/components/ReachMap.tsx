import map from "@/lib/export-map.json";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ReachMapController } from "./ReachMapController";

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

/**
 * Markets too small to see as a shape (Singapore, Hong Kong) also get a red
 * disc, so every country on the list shows in red.
 */
const markets = map.markets.map((m) => ({ ...m, small: extent(m.d) < 14 }));
const groups = [
  { title: "Named on SWEILLEM’s About Us page", items: markets.filter((m) => m.source === "about") },
  { title: "Also marked on SWEILLEM’s own map", items: markets.filter((m) => m.source === "map") },
];

/** A vitrified clay pipe, spigot end first, drawn around 0,0 so it can ride a route. */
function PipeSymbol() {
  return (
    <symbol id="reach-pipe" viewBox="-15 -8 30 16" overflow="visible">
      {/* Barrel, with a glaze highlight */}
      <rect x={-13} y={-4.5} width={19} height={9} rx={1.5} fill="#a8572f" stroke="#2a1410" strokeWidth={0.8} />
      <rect x={-12} y={-3.4} width={17} height={2.2} rx={1} fill="#e09a63" />
      {/* Socket */}
      <rect x={5} y={-6.5} width={8} height={13} rx={2.2} fill="#8a4424" stroke="#2a1410" strokeWidth={0.8} />
      <rect x={6} y={-5.4} width={6} height={2.4} rx={1} fill="#c97d4f" />
      {/* Bore */}
      <ellipse cx={13} cy={0} rx={1.6} ry={4.4} fill="#2a1410" />
    </symbol>
  );
}

/**
 * The export map on About, after SWEILLEM's own map: its markets in red with
 * their names, on a satellite view of Europe and the Middle East, with the Far
 * East in an inset. A switch flips between the night and day views. Routes draw
 * out from Cairo and clay pipes ship along them. Pointing at a country or a
 * name picks it out; while nobody touches it, the map tours the list on its
 * own. On phones the map is wider than the screen and swipes sideways,
 * following the country in focus.
 *
 * Everything is built ahead of time by scripts/build-export-map.mjs (country
 * shapes from Natural Earth, imagery from NASA), so the page ships plain SVG,
 * two WebP images and a small controller. Reduced motion shows the finished
 * map with nothing moving.
 */
export function ReachMap() {
  const { inset } = map;
  return (
    <div id="reach-map" className="reach grid gap-6" data-mode="night">
      <div className="relative overflow-hidden rounded-card bg-[#060b16]">
        <div
          className="reach-scroll overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:overflow-visible"
          role="region"
          aria-label="Export map. On small screens, scroll sideways to see the Gulf and the Far East."
          tabIndex={0}
        >
          <div className="relative aspect-[1400/820] w-[820px] md:w-full">
            <Image
              src="/images/company/export-map-night.webp"
              alt=""
              fill
              sizes="(min-width: 1240px) 1180px, (min-width: 768px) 100vw, 820px"
              className="reach-photo reach-photo-night"
            />
            <Image
              src="/images/company/export-map-day.webp"
              alt=""
              fill
              sizes="(min-width: 1240px) 1180px, (min-width: 768px) 100vw, 820px"
              className="reach-photo reach-photo-day"
            />
            {/* Coast and border lines: a static file that loads with the map, instead of 110 KB of paths in the page. */}
            <Image src="/images/company/export-map-borders.svg" alt="" fill unoptimized className="pointer-events-none" />
            <svg
              viewBox={`0 0 ${map.width} ${map.height}`}
              className="absolute inset-0 block h-full w-full"
              role="img"
              aria-labelledby="reach-map-title"
            >
              {/* One text node: React hydrates <title> as a single string. */}
              <title id="reach-map-title">{`Satellite map of SWEILLEM’s markets: ${markets.map((m) => m.name).join(", ")}, with export routes from Cairo`}</title>
              <defs>
                <PipeSymbol />
                <filter id="reach-lift" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.55" />
                </filter>
              </defs>
              <g filter="url(#reach-lift)">
                {markets.map((m, i) => (
                  <g key={m.id} data-id={m.id} className="reach-country" style={{ "--i": i } as CSSProperties}>
                    <path d={m.d} />
                    {m.small && <circle cx={m.x} cy={m.y} r={7} />}
                  </g>
                ))}
              </g>
              {/* The Far East inset */}
              <g className="reach-inset" aria-hidden="true">
                <rect x={inset.x} y={inset.y} width={inset.w} height={inset.h} rx={14} />
                <text x={inset.x + 16} y={inset.y + 28}>
                  Far East
                </text>
              </g>
              {markets.map((m, i) => (
                <path
                  key={m.id}
                  id={`reach-arc-${m.id}`}
                  d={m.arc}
                  pathLength={1}
                  data-id={m.id}
                  className="reach-arc"
                  style={{ "--i": i } as CSSProperties}
                />
              ))}
              {/* Shipments: a pipe leaves Cairo, rides the route nose first and fades on arrival. */}
              <g className="reach-ships" aria-hidden="true">
                {markets.map((m, i) => {
                  const dur = `${4.2 + (i % 4) * 0.5}s`;
                  const begin = `${(i * 0.4).toFixed(2)}s`;
                  return (
                    <g key={m.id} data-id={m.id} className="reach-ship">
                      <use href="#reach-pipe" x={-15} y={-8} width={30} height={16}>
                        <animate
                          attributeName="opacity"
                          values="0;1;1;0"
                          keyTimes="0;0.12;0.82;1"
                          dur={dur}
                          begin={begin}
                          repeatCount="indefinite"
                        />
                      </use>
                      <animateMotion dur={dur} begin={begin} repeatCount="indefinite" rotate="auto">
                        <mpath href={`#reach-arc-${m.id}`} />
                      </animateMotion>
                    </g>
                  );
                })}
              </g>
              <g className="reach-origin">
                <circle cx={map.origin.x} cy={map.origin.y} r={16} className="reach-origin-ring" />
                <circle cx={map.origin.x} cy={map.origin.y} r={13} className="reach-origin-dot" />
                <image
                  href="/images/brand/sweillem-mark.svg"
                  x={map.origin.x - 6.5}
                  y={map.origin.y - 9.5}
                  width={13}
                  height={19}
                />
                <text x={map.origin.x - 22} y={map.origin.y + 5} className="reach-origin-text" textAnchor="end">
                  CAIRO
                </text>
              </g>
              {/* Names on the countries, sized to the country like SWEILLEM's map. */}
              {markets.map((m) => (
                <g key={m.id} data-id={m.id} className="reach-name" style={{ "--s": m.label.size } as CSSProperties}>
                  <text x={m.label.x} y={m.label.y} textAnchor="middle" dominantBaseline="central">
                    {m.name.toUpperCase()}
                  </text>
                  {/* A wider invisible target, so small countries are easy to point at. */}
                  <circle cx={m.x} cy={m.y} r={16} fill="transparent" />
                </g>
              ))}
            </svg>
          </div>
        </div>
        {/* Day / night switch, outside the scroller so it stays put on phones. */}
        <div
          className="reach-modes absolute top-3 left-3 flex rounded-full bg-[#0b1220]/80 p-1 text-[13px] font-semibold text-white backdrop-blur-sm"
          role="group"
          aria-label="Map view"
        >
          <button type="button" data-mode="night" aria-pressed="true" className="reach-mode min-h-11 rounded-full px-4 md:min-h-9 md:px-3.5">
            Night
          </button>
          <button type="button" data-mode="day" aria-pressed="false" className="reach-mode min-h-11 rounded-full px-4 md:min-h-9 md:px-3.5">
            Day
          </button>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {groups.map((g, gi) => (
          <div key={g.title} className="grid content-start gap-3">
            <h3 className="font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">{g.title}</h3>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((m, i) => (
                <li key={m.id} className="reveal" style={{ "--dl": `${(gi * 6 + i) * 35}ms` } as CSSProperties}>
                  <button
                    type="button"
                    data-id={m.id}
                    aria-pressed="false"
                    className="reach-chip min-h-11 cursor-pointer rounded-full border border-line bg-surface px-3.5 text-[14px] transition-colors"
                  >
                    {m.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-[14px] text-muted">
        Point at a country or pick a name to trace its route from Cairo.
        <span className="md:hidden"> Swipe the map to see the Gulf and the Far East.</span>
      </p>
      <ReachMapController />
    </div>
  );
}
