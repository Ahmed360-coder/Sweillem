"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ViewerFamily, ViewerItem } from "@/lib/family-viewer";
import { extentOf } from "@/lib/fitting-model";
import { sectionBox, sectionOf } from "@/lib/fitting-shapes";
import { duration, ease } from "@/lib/motion";
import type { PipeClass } from "@/lib/size-finder";
import { AddToQuote } from "./AddToQuote";
import { Fitting3D } from "./Fitting3D";
import { FittingDrawing } from "./FittingDrawing";

// The size finder for one product family other than pipes: pick a type (an
// angle, a short-piece code, ...), a class and a size, and turn the piece in
// 3D or see it drawn to scale. Same layout and controls as the pipe slider.
// Everything comes from src/lib/family-viewer.ts; parts drawn without a
// published figure are listed under the row.

const CLASS_NAME: Record<PipeClass, string> = { N: "normal strength", H: "extra strength" };

function chip(on: boolean, enabled = true) {
  return `relative inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ease-glaze select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon ${
    on ? "border-brand bg-brand text-on-brand" : enabled ? "border-line bg-surface hover:border-ink" : "cursor-not-allowed border-dashed border-line bg-surface text-muted"
  }`;
}

export function FamilySizeViewer({ family }: { family: ViewerFamily }) {
  const uid = useId();
  const reduce = useReducedMotion();
  const [typeId, setTypeId] = useState(family.types[0]?.id);
  const [want, setWant] = useState<PipeClass>("N");
  const [view, setView] = useState<"3d" | "flat">("3d");
  const [no3d, setNo3d] = useState(false);
  const show3d = view === "3d" && !no3d;
  const type = family.types.find((t) => t.id === typeId) ?? family.types[0];

  // Sizes of this type, smallest first; at each, the piece in each class.
  const sizes = useMemo(() => [...new Set((type?.items ?? []).map((i) => i.size))], [type]);
  const [size, setSize] = useState<string | null>(null);
  const first = type?.start && sizes.includes(type.start) ? sizes.indexOf(type.start) : Math.floor((sizes.length - 1) / 2);
  const index = Math.max(0, size === null ? first : sizes.indexOf(size));
  const current = sizes[index];
  const atSize = (type?.items ?? []).filter((i) => i.size === current);
  const item: ViewerItem | undefined = atSize.find((i) => i.strength === want) ?? atSize[0];

  // One scale for every size of the type, from its largest piece.
  const all = useMemo(() => type?.items ?? [], [type]);
  const frame2d = useMemo(() => {
    const boxes = all.map((i) => sectionBox(sectionOf(i.shape)));
    return [Math.min(...boxes.map((b) => b[0])), Math.min(...boxes.map((b) => b[1])), Math.max(...boxes.map((b) => b[2])), Math.max(...boxes.map((b) => b[3]))] as [number, number, number, number];
  }, [all]);
  const frame3d = useMemo(() => {
    const shapes = family.shapeOnly ? [family.shapeOnly.shape] : all.map((i) => i.shape);
    const ex = shapes.map(extentOf);
    return { span: Math.max(...ex.map((e) => e.span)), height: Math.max(...ex.map((e) => e.height)) };
  }, [all, family.shapeOnly]);

  const pickType = (id: string) => {
    const next = family.types.find((t) => t.id === id)!;
    const dn = item?.dn ?? 0;
    // Keep the nearest size in the new type.
    const best = [...next.items].sort((a, b) => Math.abs(a.dn - dn) - Math.abs(b.dn - dn))[0];
    setTypeId(id);
    setSize(best?.size ?? null);
  };

  const swap = reduce ? { initial: false as const } : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: duration.base, ease: ease.glaze } };
  const last = sizes.length - 1;
  const crowded = sizes.length > 9;
  // "Enlarger and Reducer, Enlarger" reads twice: name the type alone when the family name holds it.
  const title = !type ? family.name : family.name.toLowerCase().includes(type.label.toLowerCase().replace(/s$/, "")) ? type.label : `${family.name}, ${type.label}`;

  const viewSwitch = !no3d && (
    <div role="group" aria-label="View" className="absolute top-3 right-3 z-10 flex rounded-full border border-line bg-surface/90 p-0.5 backdrop-blur-sm sm:top-4 sm:right-4">
      {(
        [
          ["3d", "3D"],
          ["flat", "To scale"],
        ] as const
      ).map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => setView(v)}
          className="relative min-h-9 rounded-full px-3.5 text-[13px] font-semibold text-muted transition-colors duration-200 ease-glaze aria-pressed:bg-brand aria-pressed:text-on-brand"
        >
          <span className="tap" />
          {text}
        </button>
      ))}
    </div>
  );

  // No sizes published: the shape in 3D, and SWEILLEM's own drawing.
  if (family.shapeOnly) {
    const s = family.shapeOnly;
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <figure className="relative overflow-hidden rounded-card border border-line bg-surface">
          <div className="pointer-events-none absolute top-3 left-4 sm:top-5 sm:left-6" aria-hidden="true">
            <p className="font-mono text-[11px] tracking-[.12em] text-muted uppercase">{family.name}</p>
            <p className="font-display text-[clamp(22px,3.4vw,32px)] leading-none font-semibold">Shape only</p>
          </div>
          {viewSwitch}
          <div className="aspect-[6/5]">
            {show3d ? (
              <Fitting3D shape={s.shape} frame={frame3d} onFail={() => setNo3d(true)} className="h-full" label={`3D model of the ${family.name}, shape only, not to scale.`} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt={s.alt} className="h-full w-full bg-white object-contain p-4 pt-20" />
            )}
          </div>
          <figcaption className="border-t border-line px-4 py-2.5 text-[13px] text-muted sm:px-6">
            {show3d ? "Shape only, not to scale." : "Section with the dimensions marked, not to scale."}
          </figcaption>
        </figure>
        <div className="grid gap-4 rounded-card border border-line bg-surface p-[clamp(18px,3vw,24px)]">
          <h3 className="text-xl">{family.name}</h3>
          <p className="text-muted">Ask us for the {family.name} size you need and we will send its figures.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <AddToQuote item={{ product: family.name, size: "Size to confirm" }} label={`Add to quote: ${family.name}`} />
            <Link className="link relative text-sm" href={`/products/${family.slug}`}>
              <span className="tap" />
              {family.name} page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;
  // Close-ups of a straight piece's joint: the socket with the next pipe in it, or,
  // for a pipe on its own, both ends (spigot seal on the left, socket on the right).
  const closeUps: { title: string; box: [number, number, number, number]; label: string; detail?: string }[] =
    item.shape.kind === "straight" && item.shape.joint
      ? (() => {
          const { len, d1, d3 } = item.shape;
          const j = item.shape.joint!;
          const h = Math.max(j.d4, j.d7) / 2 + j.seal + (d3 - d1) / 2 + 20;
          const socket: [number, number, number, number] = [len - j.depth * 1.2, 0, len + j.depth + Math.min(j.next, j.depth * 1.2), h];
          if (j.next > 0) return [{ title: "Joint, close-up", box: socket, label: "the socket joint", detail: ": the next pipe's spigot pushed home and sealed" }];
          // Just the wall and its seal, a little wider than tall like the panes, centred on each end.
          const y0 = Math.max(0, d1 / 2 - 30);
          const half = ((h - y0) * 1.25) / 2;
          const around = (x: number): [number, number, number, number] => [x - half, y0, x + half, h];
          return [
            { title: "Spigot end", box: around(j.depth * 0.45), label: "the spigot end and its seal" },
            { title: "Socket end", box: around(len + j.depth * 0.35), label: "the socket end and its seal" },
          ];
        })()
      : [];
  const shownSize = `DN ${item.size}`;
  const classes = (["N", "H"] as const).filter((c) => type.items.some((i) => i.strength === c));
  const desc = `${title}, ${shownSize}${item.strength ? ` ${item.strength} class` : ""}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
      <div className="grid gap-4 lg:sticky lg:top-[calc(var(--header-h)+16px)]">
        <figure className="relative overflow-hidden rounded-card border border-line bg-surface">
          <div className="pointer-events-none absolute top-3 left-4 sm:top-5 sm:left-6" aria-hidden="true">
            <p className="max-w-[calc(100vw-210px)] font-mono text-[11px] tracking-[.12em] text-muted uppercase sm:max-w-none">{title}</p>
            <p className={`font-display leading-none font-semibold ${item.size.length > 4 ? "text-[clamp(24px,4.2vw,40px)]" : "text-[clamp(30px,5vw,48px)]"}`}>
              DN{" "}
              <motion.span key={item.size} className="inline-block font-mono text-maroon tabular-nums" {...swap}>
                {item.size}
              </motion.span>
            </p>
          </div>
          {viewSwitch}
          <div className="aspect-[6/5]">
            {show3d ? (
              <Fitting3D key={type.id} shape={item.shape} frame={frame3d} onFail={() => setNo3d(true)} className="h-full" label={`3D model of the ${desc} on a 100 mm floor grid.`} />
            ) : (
              <div className="flex h-full flex-col pt-16 sm:pt-20">
                <div className="min-h-0 flex-1">
                  <FittingDrawing shape={item.shape} frame={frame2d} label={`${desc}, drawn to scale on a 100 mm grid.`} />
                </div>
                {closeUps.length > 0 && (
                  // The joint is small next to a 2 m pipe: close-ups of it, on the same 100 mm grid.
                  <div className="flex h-[44%] border-t border-line">
                    {closeUps.map((c, i) => (
                      <div key={c.title} className={`min-w-0 flex-1 ${i ? "border-l border-line" : ""}`}>
                        <p className="px-4 pt-2 font-mono text-[10px] tracking-[.1em] text-muted uppercase sm:px-6">{c.title}</p>
                        <div className="h-[calc(100%-22px)] overflow-hidden">
                          <FittingDrawing shape={item.shape} frame={c.box} label={`Close-up of ${c.label} of the ${desc}${c.detail ?? ""}, to scale on a 100 mm grid.`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <figcaption className="border-t border-line px-4 py-2.5 text-[13px] text-muted sm:px-6">
            {show3d ? `To scale on a 100 mm grid, bold every 500 mm. Every size of this type is shown at the same scale.` : `${family.note} 100 mm grid, bold every 500 mm.`}
          </figcaption>
        </figure>

        {sizes.length > 1 ? (
          <div className="grid gap-1">
            <label htmlFor={`${uid}-dn`} className="font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">
              Drag to choose a size
            </label>
            <input
              id={`${uid}-dn`}
              type="range"
              min={0}
              max={last}
              step={1}
              value={index}
              onChange={(e) => setSize(sizes[Number(e.target.value)])}
              aria-valuetext={shownSize}
              className="size-range"
              style={{ ["--fill" as string]: `${(index / last) * 100}%` }}
            />
            <ol className="relative h-7" aria-hidden="true">
              {sizes.map((s, i) => {
                const on = i === index;
                const label = !crowded || on || i === 0 || i === last;
                const nearOn = crowded && !on && Math.abs(i - index) * (100 / last) < 14;
                return (
                  <li
                    key={s}
                    className={`absolute top-0 grid -translate-x-1/2 justify-items-center gap-1 font-mono text-[11px] whitespace-nowrap tabular-nums rtl:translate-x-1/2 ${on ? "z-10 font-semibold text-maroon" : "text-muted"}`}
                    style={{ insetInlineStart: `calc(14px + (100% - 28px) * ${i / last})` }}
                  >
                    <span className={`h-1.5 w-px ${on ? "bg-maroon" : "bg-line"}`} />
                    {label && !nearOn && <span className={!crowded && i % 2 && !on ? "max-sm:hidden" : undefined}>{s}</span>}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <p className="font-mono text-xs tracking-[.12em] text-muted uppercase">One size: DN {item.size}</p>
        )}
      </div>

      <div className="grid gap-6">
        {family.types.length > 1 && (
          <div className="grid gap-2.5">
            <p id={`${uid}-type`} className="font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">
              Type
            </p>
            <div role="group" aria-labelledby={`${uid}-type`} className="flex flex-wrap gap-2">
              {family.types.map((t) => (
                <button key={t.id} type="button" aria-pressed={t.id === type.id} onClick={() => pickType(t.id)} className={chip(t.id === type.id)}>
                  <span className="tap" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {classes.length > 0 && (
          <div className="grid gap-2.5">
            <p id={`${uid}-class`} className="font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">
              Strength class
            </p>
            <div role="group" aria-labelledby={`${uid}-class`} className="flex flex-wrap gap-2">
              {classes.map((c) => {
                const made = atSize.some((i) => i.strength === c);
                const on = item.strength === c;
                const range = type.items.filter((i) => i.strength === c);
                return (
                  <button key={c} type="button" aria-pressed={on} disabled={!made} onClick={() => setWant(c)} className={chip(on, made)}>
                    <span className="tap" />
                    {c} class
                    <span className="text-xs font-normal opacity-80">{made ? CLASS_NAME[c] : `DN ${range[0].size} to ${range.at(-1)!.size} only`}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <section aria-labelledby={`${uid}-row`} className="grid gap-4 rounded-card border border-line bg-surface p-[clamp(18px,3vw,24px)]">
          <h3 id={`${uid}-row`} className="text-xl">
            {title}, {shownSize}
            {item.strength && (
              <span className="block text-base font-normal text-muted">
                {item.strength} class, {CLASS_NAME[item.strength]}
              </span>
            )}
          </h3>
          <dl className="grid grid-cols-2 overflow-hidden rounded-inner border border-line sm:grid-cols-3">
            {item.figures.map((f) => (
              <div key={f.label} className="grid content-start gap-1 p-3 shadow-[0_0_0_.5px_var(--line)]">
                <dt className="text-[12.5px] leading-tight text-muted">{f.label}</dt>
                <dd className="font-mono text-[15px] font-semibold [overflow-wrap:anywhere]">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <AddToQuote item={item.quote} label={`Add to quote: ${item.quote.product}, ${shownSize}`} />
            <Link className="link relative text-sm" href={item.href ?? `/products/${family.slug}`}>
              <span className="tap" />
              {item.href ? "Full row in the explorer" : `${family.name} page`}
            </Link>
          </div>
          {item.drawn.length > 0 && (
            <div className="grid gap-1.5 border-t border-line pt-3 text-[13px] text-muted">
              <p className="font-semibold text-ink">Drawing notes</p>
              <ul className="grid list-disc gap-1 ps-5">
                {item.drawn.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
