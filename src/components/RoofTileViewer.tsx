"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { AddToQuote } from "./AddToQuote";

export const tileColours = [
  { id: "terracotta", name: "Terracotta", swatch: "#b4532e", src: "/images/roof-tiles/tile-terracotta-cutout.webp", w: 420 },
  { id: "blue", name: "Blue", swatch: "#4b9ce0", src: "/images/roof-tiles/tile-blue-cutout.webp", w: 427 },
  { id: "black", name: "Black", swatch: "#2b2b2d", src: "/images/roof-tiles/tile-black-cutout.webp", w: 421 },
] as const;

export type TileColour = (typeof tileColours)[number]["id"];

const ROOF_ROWS = 6;
const ROOF_COLS = 7;

/** Colour viewer: one tile up close, or the same tile laid across a roof. */
export function RoofTileViewer() {
  const uid = useId();
  const [colour, setColour] = useState<TileColour>("terracotta");
  const [view, setView] = useState<"tile" | "roof">("tile");
  const current = tileColours.find((c) => c.id === colour)!;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
      <div className="relative grid aspect-[4/3.4] place-items-center overflow-hidden rounded-card border border-line bg-[radial-gradient(ellipse_at_50%_35%,var(--surface),var(--sunk))]">
        {/* Single tile: all three are in the page so switching is instant. */}
        <div className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${view === "tile" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          {tileColours.map((c, i) => (
            <Image
              key={c.id}
              src={c.src}
              alt={view === "tile" && c.id === colour ? `SWEILLEM clay roof tile in ${c.name.toLowerCase()}, stamped “Made in Egypt” and “SWEILLEM”` : ""}
              width={c.w}
              height={720}
              priority={i === 0}
              sizes="(min-width: 1024px) 300px, 55vw"
              className={`tile-swap absolute h-[86%] w-auto drop-shadow-[0_18px_24px_rgb(40_25_20/0.28)] ${c.id === colour ? "is-on" : ""}`}
            />
          ))}
        </div>

        {/* Roof: the same photo laid in overlapping rows, seen at an angle. */}
        <div
          role="img"
          aria-label={`A roof laid with ${current.name.toLowerCase()} SWEILLEM tiles (illustration made from the tile photo)`}
          aria-hidden={view !== "roof"}
          className={`absolute inset-0 overflow-hidden transition-opacity duration-500 [perspective:900px] ${view === "roof" ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <div className="roof-plane absolute top-[-18%] left-1/2 w-[150%] -translate-x-1/2">
            {Array.from({ length: ROOF_ROWS }, (_, r) => (
              <div key={r} className="flex justify-center" style={{ marginTop: r ? "-11.5%" : 0, zIndex: ROOF_ROWS - r, position: "relative" }}>
                {Array.from({ length: ROOF_COLS }, (_, c) => (
                  // eslint-disable-next-line @next/next/no-img-element -- repeated decorative copies of one cached image
                  <img key={c} src={current.src} alt="" className="-mx-[0.7%] w-[15%] drop-shadow-[0_6px_4px_rgb(20_10_5/0.35)]" />
                ))}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
        </div>
      </div>

      <div className="grid gap-7">
        <fieldset>
          <legend className="mb-3 font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">Colour</legend>
          <div className="flex flex-wrap gap-3">
            {tileColours.map((c) => (
              <label
                key={c.id}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 ps-1.5 pe-4 font-semibold transition-colors select-none hover:border-ink has-checked:border-ink has-checked:ring-2 has-checked:ring-maroon has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-maroon"
              >
                <input type="radio" name={`${uid}-colour`} value={c.id} checked={colour === c.id} onChange={() => setColour(c.id)} className="sr-only" />
                <span className="hex block size-8" style={{ background: c.swatch }} aria-hidden="true" />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">View</legend>
          <div className="inline-flex rounded-full border border-line bg-surface p-1">
            {(["tile", "roof"] as const).map((v) => (
              <label
                key={v}
                className="inline-flex min-h-10 cursor-pointer items-center rounded-full px-5 text-sm font-semibold select-none has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-maroon"
              >
                <input type="radio" name={`${uid}-view`} value={v} checked={view === v} onChange={() => setView(v)} className="sr-only" />
                {v === "tile" ? "Single tile" : "On a roof"}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="text-muted" aria-live="polite">
          Showing <strong className="text-ink">{current.name.toLowerCase()}</strong>
          {view === "roof" ? " tiles laid on a roof. The roof is an illustration built from the tile photo." : ", photographed by SWEILLEM."}
        </p>
        <div className="flex flex-wrap gap-3">
          <AddToQuote item={{ product: "Clay roof tiles", size: current.name }} label={`Add to quote: ${current.name.toLowerCase()} roof tiles`} />
        </div>
      </div>
    </div>
  );
}
