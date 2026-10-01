import map from "@/lib/reach-map.json";
import type { CSSProperties } from "react";
import { ReachMapController } from "./ReachMapController";

/** Width of a map label's pill, from the name's length (the font is fixed). */
const labelWidth = (name: string) => Math.round(name.length * 11 + 30);

/**
 * The export map on About: every country SWEILLEM names lights up, a route
 * draws out to it from Cairo, and shipments run along the routes. Pointing at
 * a country or a chip picks it out; while nobody touches it, the map tours the
 * list on its own. The shapes are built ahead of time from Natural Earth
 * (scripts/build-reach-map.mjs), so the page ships plain SVG and a small
 * controller. Reduced motion shows the finished map with no movement.
 */
export function ReachMap() {
  return (
    <div id="reach-map" className="reach grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center">
      {/* The map stays on its night colours in both themes, like the photo it replaces. */}
      <div className="relative overflow-hidden rounded-card bg-[#0b1220]">
        <svg
          viewBox={`0 0 ${map.width} ${map.height}`}
          className="block h-auto w-full"
          role="img"
          aria-labelledby="reach-map-title"
        >
          {/* One text node: React hydrates <title> as a single string. */}
          <title id="reach-map-title">{`Map of SWEILLEM’s export routes from Cairo to the ${map.markets.length} countries it names, in Europe, the Gulf and the Far East`}</title>
          <path d={map.land} className="reach-land" />
          <path d={map.borders} className="reach-borders" />
          <path d={map.egypt} className="reach-egypt" />
          {map.markets.map((m, i) => (
            <path key={m.id} d={m.d} data-id={m.id} className="reach-country" style={{ "--i": i } as CSSProperties} />
          ))}
          {map.markets.map((m, i) => (
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
          <g className="reach-ships" aria-hidden="true">
            {map.markets.map((m, i) => (
              <circle key={m.id} r={2.6} data-id={m.id} className="reach-ship">
                <animateMotion dur={`${3 + (i % 4) * 0.4}s`} begin={`${(i * 0.37).toFixed(2)}s`} repeatCount="indefinite">
                  <mpath href={`#reach-arc-${m.id}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
          {map.markets.map((m, i) => (
            <g key={m.id} data-id={m.id} className="reach-pin" style={{ "--i": i } as CSSProperties}>
              <circle cx={m.x} cy={m.y} r={9} className="reach-pin-ring" />
              <circle cx={m.x} cy={m.y} r={3.2} className="reach-pin-dot" />
              {/* A wider invisible target, so small countries are easy to point at. */}
              <circle cx={m.x} cy={m.y} r={16} fill="transparent" />
            </g>
          ))}
          <g className="reach-origin">
            <circle cx={map.origin.x} cy={map.origin.y} r={14} className="reach-origin-ring" />
            <circle cx={map.origin.x} cy={map.origin.y} r={5} className="reach-origin-dot" />
            <text x={map.origin.x - 14} y={map.origin.y + 34} className="reach-origin-text" textAnchor="end">
              Cairo
            </text>
          </g>
          {map.markets.map((m) => {
            const w = labelWidth(m.name);
            const left = m.x > map.width - w - 30;
            const x = left ? m.x - 14 - w : m.x + 14;
            const y = Math.min(Math.max(m.y - 22, 6), map.height - 50);
            return (
              <g key={m.id} data-id={m.id} className="reach-label" aria-hidden="true">
                <rect x={x} y={y} width={w} height={44} rx={22} />
                <text x={x + w / 2} y={y + 29} textAnchor="middle">
                  {m.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="grid gap-4">
        <h3 className="font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">Countries named by SWEILLEM</h3>
        <ul className="flex flex-wrap gap-2">
          {map.markets.map((m, i) => (
            <li key={m.id} className="reveal" style={{ "--dl": `${i * 40}ms` } as CSSProperties}>
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
        <p className="text-[14px] text-muted">Point at a country or pick a name to trace its route from Cairo.</p>
        <ReachMapController />
      </div>
    </div>
  );
}
