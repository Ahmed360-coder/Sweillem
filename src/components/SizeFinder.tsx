"use client";

import { useState } from "react";
import type { ViewerFamily } from "@/lib/family-viewer";
import type { SizeStop } from "@/lib/size-finder";
import { FamilySizeViewer } from "./FamilySizeViewer";
import { PipeSizeSlider } from "./PipeSizeSlider";

// The size finder on /products: one product family at a time, picked from the
// chips above. Pipes keep their slider (with the fittings made at each size);
// every other family gets the same 3D and To scale views in FamilySizeViewer.

export function SizeFinder({ stops, families }: { stops: SizeStop[]; families: ViewerFamily[] }) {
  const [slug, setSlug] = useState("pipes");
  const all = [{ slug: "pipes", name: "Pipes" }, ...families];
  const family = families.find((f) => f.slug === slug);

  return (
    <div className="grid gap-6">
      <div role="group" aria-label="Product family" className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {all.map((f) => (
          <button
            key={f.slug}
            type="button"
            aria-pressed={f.slug === slug}
            onClick={(e) => {
              setSlug(f.slug);
              e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
            }}
            className={`relative inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ease-glaze focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon ${
              f.slug === slug ? "border-brand bg-brand text-on-brand" : "border-line bg-surface hover:border-ink"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>
      {family ? <FamilySizeViewer key={family.slug} family={family} /> : <PipeSizeSlider stops={stops} />}
    </div>
  );
}
