"use client";

import { useEffect, useRef, useState } from "react";
import { inertOutside } from "@/lib/inert";
import type { MapData } from "@/lib/projects-map";
import { ProjectsMap } from "./ProjectsMap";

/**
 * The projects map, opened from the Map button in the header. The map itself
 * (ProjectsMap) is shared with the Projects page; nothing inside is built until
 * the panel first opens, so other pages do not load its photos. Closed, it is inert.
 */
export function MapPanel({ open, data, onClose }: { open: boolean; data: MapData; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Adjusting state during render, not in an effect.
  const [seen, setSeen] = useState(open);
  if (open && !seen) setSeen(true);

  // While open, everything else is inert so focus and screen readers stay in the map.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    return inertOutside(rootRef.current);
  }, [open]);

  return (
    <div
      ref={rootRef}
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

        {seen && <ProjectsMap data={data} active={open} variant="panel" onLeave={onClose} />}
      </div>
    </div>
  );
}
