"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { duration, ease } from "@/lib/motion";
import type { PipeClass, SizeStop } from "@/lib/size-finder";
import { AddToQuote } from "./AddToQuote";

// Pipe size slider (M10 pipe tween). Drag from DN 125 to 1000: the glazed pipe
// is redrawn to true scale on a fixed 100 mm grid, the published figures for
// that size update, and the list shows every fitting SWEILLEM publishes at it.
// Sizes come from the pipe tables (src/lib/size-finder.ts); nothing here is
// typed in by hand.

const GLAZE = { dark: "#3a1d12", base: "#6e3820", light: "#a7603b" };
const BODY = "#b9744c";

/** Barrel depth as a share of the outer diameter, receding at 30°. Illustrative: only the end face is to scale. */
const DEPTH = 0.9;
const OX = 2 * DEPTH * Math.cos(Math.PI / 6);
const OY = -2 * DEPTH * Math.sin(Math.PI / 6);
/** Unit vector across the barrel (perpendicular to its axis). */
const NX = Math.sin(Math.PI / 6);
const NY = Math.cos(Math.PI / 6);
const PAD = 70;
const TWEEN = { duration: 0.62, ease: [0.25, 1, 0.5, 1] as const };

const CLASS_NAME: Record<PipeClass, string> = { N: "normal strength", H: "extra strength" };

/** Outline of a pipe of radius 1 whose end face is centred on the origin. */
const OUTLINE = [
  `M ${-NX} ${-NY} L ${-NX + OX} ${-NY + OY}`,
  `M ${NX} ${NY} L ${NX + OX} ${NY + OY}`,
  `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0`,
  `M ${OX + 1} ${OY} A 1 1 0 1 1 ${OX - 1} ${OY} A 1 1 0 1 1 ${OX + 1} ${OY}`,
].join(" ");

function PipeDrawing({ d1, d3, maxD3, label }: { d1: number; d3: number; maxD3: number; label: string }) {
  const id = useId();
  const reduce = useReducedMotion();
  const r = useMotionValue(d3 / 2);
  const bore = useMotionValue(d1 / d3);
  const place = (v: number) => `translate(${v} ${-v}) scale(${v})`;
  // An SVG transform attribute, not a CSS one: set it directly each frame.
  const body = useRef<SVGGElement>(null);
  useMotionValueEvent(r, "change", (v) => body.current?.setAttribute("transform", place(v)));

  useEffect(() => {
    const opts = reduce ? { duration: 0 } : TWEEN;
    const a = animate(r, d3 / 2, opts);
    const b = animate(bore, d1 / d3, opts);
    return () => {
      a.stop();
      b.stop();
    };
  }, [d1, d3, reduce, r, bore]);

  const R = maxD3 / 2;
  const width = R * (2 + OX);
  const height = R * (2 - OY);
  const grid = (to: number, step: number) => Array.from({ length: Math.floor(to / step) + 1 }, (_, i) => i * step);

  return (
    <svg viewBox={`${-PAD} ${-height - PAD} ${width + 2 * PAD} ${height + 2 * PAD}`} role="img" aria-label={label} className="block h-auto w-full">
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={-NX} y1={-NY} x2={NX} y2={NY}>
          <stop offset="0" stopColor={GLAZE.dark} />
          <stop offset=".2" stopColor={GLAZE.light} />
          <stop offset=".5" stopColor={GLAZE.base} />
          <stop offset="1" stopColor={GLAZE.dark} />
        </linearGradient>
        <radialGradient id={`${id}b`} cx=".62" cy=".38" r=".75">
          <stop offset="0" stopColor="#2a1610" />
          <stop offset="1" stopColor="#0d0605" />
        </radialGradient>
      </defs>

      {/* 100 mm grid, every 500 mm stronger, resting on the floor line */}
      <g stroke="var(--line)">
        {grid(width + PAD, 100).map((x) => (
          <line key={`x${x}`} x1={x} x2={x} y1={0} y2={-height - PAD} strokeWidth={x % 500 ? 0.6 : 1.4} vectorEffect="non-scaling-stroke" />
        ))}
        {grid(height + PAD, 100).map((y) => (
          <line key={`y${y}`} x1={-PAD} x2={width + PAD} y1={-y} y2={-y} strokeWidth={y % 500 ? 0.6 : 1.4} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <line x1={-PAD} x2={width + PAD} y1={0} y2={0} stroke="var(--muted)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />

      {/* the largest size, dashed, for comparison */}
      <path
        d={OUTLINE}
        transform={`translate(${R} ${-R}) scale(${R})`}
        fill="none"
        stroke="var(--muted)"
        strokeDasharray="5 5"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        opacity=".7"
      />

      <g ref={body} transform={place(r.get())}>
        <circle cx={OX} cy={OY} r={1} fill={`url(#${id}g)`} />
        <path
          d={`M ${-NX} ${-NY} L ${-NX + OX} ${-NY + OY} L ${NX + OX} ${NY + OY} L ${NX} ${NY} Z`}
          fill={`url(#${id}g)`}
        />
        {/* glaze shine along the top of the barrel */}
        <path
          d={`M ${-NX * 0.62} ${-NY * 0.62} l ${OX} ${OY}`}
          stroke="#fff"
          strokeOpacity=".35"
          strokeWidth=".09"
          strokeLinecap="round"
        />
        {/* cut end: the fired clay wall, then the bore */}
        <circle r={1} fill={BODY} stroke={GLAZE.dark} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
        <motion.circle r={bore} fill={`url(#${id}b)`} stroke={GLAZE.dark} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

export function PipeSizeSlider({ stops, initialDn = 300 }: { stops: SizeStop[]; initialDn?: number }) {
  const uid = useId();
  const [index, setIndex] = useState(() => Math.max(0, stops.findIndex((s) => s.dn === initialDn)));
  const [want, setWant] = useState<PipeClass>("N");
  const stop = stops[index];
  const pipe = stop.pipes.find((p) => p.strength === want) ?? stop.pipes[0];
  const reduce = useReducedMotion();

  const maxD3 = useMemo(() => Math.max(...stops.flatMap((s) => s.pipes.map((p) => p.d3))), [stops]);
  const largest = stops.at(-1)!;
  /** Published size range of each class, for the chip hints. */
  const ranges = useMemo(() => {
    const of = (c: PipeClass) => stops.filter((s) => s.pipes.some((p) => p.strength === c)).map((s) => s.dn);
    return { N: of("N"), H: of("H") } satisfies Record<PipeClass, number[]>;
  }, [stops]);

  const last = stops.length - 1;
  const fill = `${(index / last) * 100}%`;
  const swap = reduce ? { initial: false as const } : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: duration.base, ease: ease.glaze } };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
      <div className="grid gap-4 lg:sticky lg:top-[calc(var(--header-h)+16px)]">
        <figure className="relative overflow-hidden rounded-card border border-line bg-surface">
          <div className="pointer-events-none absolute top-3 left-4 sm:top-5 sm:left-6" aria-hidden="true">
            <p className="font-mono text-[11px] tracking-[.12em] text-muted uppercase">Nominal size</p>
            <p className="font-display text-[clamp(30px,5vw,48px)] leading-none font-semibold">
              DN{" "}
              <motion.span key={stop.dn} className="inline-block font-mono text-maroon tabular-nums" {...swap}>
                {stop.dn}
              </motion.span>
            </p>
          </div>
          <PipeDrawing
            d1={pipe.d1}
            d3={pipe.d3}
            maxD3={maxD3}
            label={`DN ${stop.dn} ${pipe.strength} class pipe drawn to scale on a 100 mm grid: outer ø ${pipe.d3} mm, inner ø ${pipe.d1} mm. The dashed outline is DN ${largest.dn}.`}
          />
          <figcaption className="border-t border-line px-4 py-2.5 text-[13px] text-muted sm:px-6">
            End face to scale on a 100 mm grid. Dashed: DN {largest.dn}, the largest size.
          </figcaption>
        </figure>

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
            onChange={(e) => setIndex(Number(e.target.value))}
            aria-valuetext={`DN ${stop.dn}`}
            className="size-range"
            style={{ ["--fill" as string]: fill }}
          />
          <ol className="relative h-7" aria-hidden="true">
            {stops.map((s, i) => (
              <li
                key={s.dn}
                className={`absolute top-0 grid -translate-x-1/2 justify-items-center gap-1 font-mono text-[11px] tabular-nums rtl:translate-x-1/2 ${
                  i === index ? "font-semibold text-maroon" : "text-muted"
                }`}
                style={{ insetInlineStart: `calc(14px + (100% - 28px) * ${i / last})` }}
              >
                <span className={`h-1.5 w-px ${i === index ? "bg-maroon" : "bg-line"}`} />
                <span className={i % 2 && i !== index ? "max-sm:hidden" : undefined}>{s.dn}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="grid gap-6">
        <fieldset className="grid gap-2.5">
          <legend className="mb-2.5 font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">Strength class</legend>
          <div className="flex flex-wrap gap-2">
            {(["N", "H"] as const).map((c) => {
              const made = stop.pipes.some((p) => p.strength === c);
              const range = ranges[c];
              return (
                <label
                  key={c}
                  className={`relative inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition-colors duration-200 ease-glaze select-none has-checked:border-brand has-checked:bg-brand has-checked:text-on-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-maroon ${
                    made ? "cursor-pointer hover:border-ink" : "cursor-not-allowed border-dashed text-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${uid}-class`}
                    value={c}
                    checked={pipe.strength === c}
                    disabled={!made}
                    onChange={() => setWant(c)}
                    className="sr-only"
                  />
                  {c} class
                  <span className="text-xs font-normal opacity-80">
                    {made ? CLASS_NAME[c] : `DN ${range[0]} to ${range.at(-1)} only`}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <section aria-labelledby={`${uid}-pipe`} className="grid gap-4 rounded-card border border-line bg-surface p-[clamp(18px,3vw,24px)]">
          <h3 id={`${uid}-pipe`} className="text-xl">
            Pipe, DN {stop.dn} <span className="block text-base font-normal text-muted">{pipe.strength} class, {CLASS_NAME[pipe.strength]}</span>
          </h3>
          <dl className="grid grid-cols-2 overflow-hidden rounded-inner border border-line sm:grid-cols-3">
            {pipe.figures.map((f) => (
              <div key={f.key} className="grid content-start gap-1 p-3 shadow-[0_0_0_.5px_var(--line)]">
                <dt className="text-[12.5px] leading-tight text-muted">{f.label}</dt>
                <dd className="font-mono text-[15px] font-semibold [overflow-wrap:anywhere]">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <AddToQuote
              item={{ product: `Pipes, ${pipe.title}`, size: `DN ${stop.dn}`, strengthClass: pipe.strength }}
              label={`Add to quote: DN ${stop.dn} ${pipe.title}`}
            />
            <Link className="link relative text-sm" href={pipe.href}>
              <span className="tap" />
              Full row in the explorer
            </Link>
          </div>
        </section>

        <section aria-labelledby={`${uid}-fit`} className="grid gap-3">
          <h3 id={`${uid}-fit`} className="text-xl">
            Fittings made at DN {stop.dn}
          </h3>
          {stop.fittings.length ? (
            <ul className="grid gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {stop.fittings.map((f) => (
                  <motion.li
                    key={f.slug}
                    layout={!reduce}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-2 rounded-inner border border-line bg-surface p-3"
                  >
                    <Link href={`/products/${f.slug}`} className="relative justify-self-start font-semibold text-ink no-underline hover:text-maroon">
                      <span className="tap" />
                      {f.name}
                    </Link>
                    <ul className="flex flex-wrap gap-1.5">
                      {f.groups.map((g) => (
                        <li key={g.label}>
                          <Link
                            href={g.href}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-ink no-underline transition-colors duration-200 ease-glaze hover:border-ink"
                          >
                            {g.label}
                            <span className="font-mono text-xs text-muted">
                              {[g.classes.join(", "), g.sizes.some((s) => s.includes("/")) ? g.sizes.join(", ") : ""].filter(Boolean).join(" · ")}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="rounded-inner border border-dashed border-line p-4 text-muted">
              SWEILLEM publishes no fittings at DN {stop.dn}, only the pipe.{" "}
              <Link className="link relative" href="/contact">
                Ask about this size
              </Link>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
