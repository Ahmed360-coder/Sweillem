"use client";

import { animate, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ease } from "@/lib/motion";

/**
 * Interactive spigot-and-socket joint (Joint performance, Jointing systems).
 * The visitor drags the slider, or taps the drawing, to push the spigot into
 * the socket. The polyurethane ring is drawn proud of the socket bore, so it
 * squeezes as it enters (the "interference" the live site describes) and the
 * joint locks once the ring is fully home. A pressure test at the three
 * published pressures, inside or outside the pipe, shows the open joint
 * leaking and the sealed one holding.
 *
 * Facts used, all from the Joint Performance page on sweillem.net: a
 * polyurethane seal, watertight at 0.5, 1 and 2.4 bar internal or external,
 * and roots kept out. The section is redrawn from the figure on that page
 * and is schematic, not to scale.
 */

const PRESSURES = ["0.5", "1", "2.4"] as const;
type Bar = (typeof PRESSURES)[number];
type Side = "inside" | "outside";

/** How far the spigot travels, in drawing units. */
const TRAVEL = 120;
/** Progress (0-100) at which the whole ring is inside the socket bell. */
export const SEAL_AT = 92;
/** Releasing past this point finishes the push for the visitor. */
const SNAP_FROM = 75;
/** Socket mouth: the ring is squeezed to the right of this line. */
const MOUTH = 230;

const mirror = (y: number) => 260 - y;
const socketPath = (f: (y: number) => number) => `M560 ${f(40)}H352L338 ${f(6)}H${MOUTH}V${f(28)}H330V${f(68)}H560Z`;

export function JointDemo({ className = "" }: { className?: string }) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [p, setP] = useState(0);
  const [bar, setBar] = useState<Bar>("0.5");
  const [side, setSide] = useState<Side>("inside");
  const [locks, setLocks] = useState(0);
  const [touched, setTouched] = useState(false);
  const pRef = useRef(0);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const figure = useRef<HTMLElement>(null);

  const sealed = p >= SEAL_AT;
  const touchedRef = useRef(false);

  // Each new lock replays the flash and gives phones a small tap.
  const set = useCallback((v: number) => {
    if (v >= SEAL_AT && pRef.current < SEAL_AT) {
      setLocks((n) => n + 1);
      if (touchedRef.current) navigator.vibrate?.(12);
    }
    pRef.current = v;
    setP(v);
  }, []);

  const glide = useCallback(
    (to: number, how: "set" | "kiln" = "set") => {
      anim.current?.stop();
      if (reduce) return set(to);
      anim.current = animate(pRef.current, to, {
        duration: 0.6,
        ease: how === "set" ? [...ease.set] : [...ease.kiln],
        onUpdate: (v) => set(Math.min(100, Math.max(0, v))),
      });
    },
    [reduce, set],
  );

  useEffect(() => () => anim.current?.stop(), []);

  // A one-off nudge when the demo first scrolls into view, so it reads as
  // something to push. Skipped once the visitor has touched it.
  useEffect(() => {
    const el = figure.current;
    if (!el || reduce || touched || !("IntersectionObserver" in window)) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => {
          anim.current = animate(0, 1, {
            duration: 1.4,
            ease: [...ease.kiln],
            onUpdate: (t) => set(Math.sin(t * Math.PI) * 22),
          });
        }, 500);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [reduce, touched, set]);

  const start = () => {
    anim.current?.stop();
    touchedRef.current = true;
    setTouched(true);
  };
  const release = () => {
    if (pRef.current >= SNAP_FROM && pRef.current < 100) glide(100);
  };
  const toggle = () => {
    start();
    glide(pRef.current >= SEAL_AT ? 0 : 100, pRef.current >= SEAL_AT ? "kiln" : "set");
  };

  const s = (p / 100 - 1) * TRAVEL;
  const stage = sealed ? "sealed" : 302 + s > MOUTH ? "entering" : "apart";
  const state = {
    apart: "Apart: the joint is open.",
    entering: "The seal is entering the socket and starting to squeeze.",
    sealed: "Sealed: the polyurethane ring is squeezed tight between spigot and socket.",
  }[stage];
  const verdict = sealed ? "Holds. Watertight, no leak." : "Leaks at the open joint.";
  const level = PRESSURES.indexOf(bar) + 1;
  // Higher pressure, faster drips and pushier arrows.
  const beat = `${(1.5 / Math.sqrt(Number(bar))).toFixed(2)}s`;

  return (
    <figure ref={figure} data-stage={stage} className={`joint-demo grid gap-4 ${className}`}>
      <div dir="ltr" className="relative overflow-hidden rounded-card border border-line bg-surface">
        <span
          aria-hidden="true"
          className={`absolute top-3 end-3 rounded-full px-3 py-1 font-mono text-[11px] font-semibold tracking-[.12em] uppercase transition-colors ${
            sealed ? "bg-brand text-on-brand" : "bg-sunk text-muted"
          }`}
        >
          {sealed ? "Sealed" : stage === "entering" ? "Joining" : "Open"}
        </span>
        <svg
          viewBox="0 -44 560 348"
          className="block w-full cursor-pointer touch-manipulation select-none"
          role="img"
          aria-labelledby={`${uid}-t`}
          onClick={toggle}
          style={{ "--beat": beat } as CSSProperties}
        >
          <title id={`${uid}-t`}>
            Section through a joint. The spigot of one pipe pushes into the socket of the next, and a polyurethane ring between
            them seals it.
          </title>
          <defs>
            <clipPath id={`${uid}-out`} clipPathUnits="userSpaceOnUse">
              <rect x="-10" y="-60" width={MOUTH + 10} height="380" />
            </clipPath>
            <clipPath id={`${uid}-in`} clipPathUnits="userSpaceOnUse">
              <rect x={MOUTH} y="-60" width={570 - MOUTH} height="380" />
            </clipPath>
          </defs>

          {/* water in the line */}
          <rect x="0" y="68" width="560" height="124" fill="var(--water)" opacity=".16" />
          <g className="joint-flow" stroke="var(--water)" strokeWidth="2" strokeLinecap="round" opacity=".5">
            <line x1="-40" y1="104" x2="600" y2="104" />
            <line x1="-40" y1="156" x2="600" y2="156" />
          </g>
          <line x1="0" y1="130" x2="560" y2="130" stroke="var(--line)" strokeDasharray="10 6" />

          {/* socket pipe (fixed) */}
          <path d={socketPath((y) => y)} fill="var(--glaze-hi)" />
          <path d={socketPath(mirror)} fill="var(--glaze-hi)" />

          {/* spigot pipe and its ring, which travel together */}
          <g transform={`translate(${s.toFixed(2)} 0)`}>
            <rect x="-140" y="40" width="466" height="28" rx="3" fill="var(--clay)" />
            <rect x="-140" y="192" width="466" height="28" rx="3" fill="var(--clay)" />
            <g fill="var(--maroon)">
              {/* outside the bell the ring stands proud of the bore */}
              <g clipPath={`url(#${uid}-out)`} transform={`translate(${(-s).toFixed(2)} 0)`}>
                <g transform={`translate(${s.toFixed(2)} 0)`}>
                  <rect x="240" y="23" width="62" height="17" rx="3" />
                  <rect x="240" y="220" width="62" height="17" rx="3" />
                </g>
              </g>
              {/* inside it is squeezed to the gap between spigot and bore */}
              <g clipPath={`url(#${uid}-in)`} transform={`translate(${(-s).toFixed(2)} 0)`}>
                <g transform={`translate(${s.toFixed(2)} 0)`}>
                  <rect x="240" y="28" width="62" height="12" rx="2" />
                  <rect x="240" y="220" width="62" height="12" rx="2" />
                </g>
              </g>
            </g>
            <g className="joint-callout">
              <line x1="271" y1="-22" x2="271" y2="20" stroke="var(--maroon)" strokeWidth="1.5" />
              <text x="271" y="-28" textAnchor="middle" className="joint-label" style={{ fill: "var(--maroon)" }}>
                Polyurethane seal
              </text>
            </g>
          </g>
          <text x="16" y="292" className="joint-label">
            Spigot
          </text>
          <text x="544" y="292" textAnchor="end" className="joint-label">
            Socket
          </text>

          {/* the lock: one flash on each ring when the joint seats */}
          {locks > 0 && sealed && (
            <g key={locks} fill="none" stroke="var(--maroon)" strokeWidth="2.5" className="joint-flash">
              <circle cx="271" cy="34" r="20" />
              <circle cx="271" cy="226" r="20" />
            </g>
          )}

          {/* pressure: arrows push from the side under test */}
          <g className="joint-push" fill="none" stroke="var(--water)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {Array.from({ length: level }, (_, i) =>
              side === "inside" ? (
                <g key={`i${i}`} style={{ "--i": i } as CSSProperties}>
                  <path d={`M318 ${100 + i * 9}l10 -10 10 10`} />
                  <path d={`M318 ${160 - i * 9}l10 10 10 -10`} />
                </g>
              ) : (
                <g key={`o${i}`} style={{ "--i": i } as CSSProperties}>
                  <path d={`M180 ${-4 - i * 9}l10 10 10 -10`} />
                  <path d={`M180 ${264 + i * 9}l10 -10 10 10`} />
                </g>
              ),
            )}
          </g>

          {/* leak at the open joint: out of the pipe, or into it */}
          {!sealed && (
            <g fill="var(--water)" className={`joint-drips joint-drips-${side}`}>
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d="M0 -7C3 -2 5 1 5 4a5 5 0 0 1 -10 0c0 -3 2 -6 5 -11Z"
                  transform={`translate(${MOUTH - 8} ${side === "inside" ? 244 : 240})`}
                  style={{ "--i": i } as CSSProperties}
                />
              ))}
            </g>
          )}
        </svg>
      </div>

      <div className="grid gap-4 rounded-card border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-2">
          <label htmlFor={`${uid}-push`} className="flex items-center justify-between gap-3 text-[15px] font-semibold">
            <span>Push the pipes together</span>
            <span className="font-mono text-xs font-medium text-muted tabular-nums" aria-hidden="true">
              {Math.round(p)}%
            </span>
          </label>
          <input
            id={`${uid}-push`}
            type="range"
            dir="ltr"
            min={0}
            max={100}
            step={1}
            value={Math.round(p)}
            aria-valuetext={`${Math.round(p)}% home. ${state}`}
            onPointerDown={start}
            onKeyDown={start}
            onChange={(e) => set(Number(e.target.value))}
            onPointerUp={release}
            onKeyUp={release}
            onBlur={release}
            className="joint-range"
            style={{ "--v": `${p}%` } as CSSProperties}
          />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-[14px] text-muted" aria-live="polite">
              {state}
            </p>
            <button type="button" onClick={toggle} className="link tap text-[14px] font-semibold">
              {sealed ? "Pull apart" : "Join them"}
            </button>
          </div>
        </div>

        <fieldset className="grid gap-3 border-t border-line pt-4">
          <legend className="mb-3 font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">
            Pressure test
          </legend>
          <div className="flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label="Water pressure" className="flex gap-1.5">
              {PRESSURES.map((b) => (
                <ChipRadio key={b} name={`${uid}-bar`} checked={b === bar} onChange={() => setBar(b)}>
                  {b} <span className="font-sans text-xs font-normal opacity-80">bar</span>
                </ChipRadio>
              ))}
            </div>
            <div role="radiogroup" aria-label="Pressure from" className="flex gap-1.5">
              {(["inside", "outside"] as const).map((x) => (
                <ChipRadio key={x} name={`${uid}-side`} checked={x === side} onChange={() => setSide(x)}>
                  <span className="font-sans">{x === "inside" ? "Inside" : "Outside"}</span>
                </ChipRadio>
              ))}
            </div>
          </div>
          <p
            aria-live="polite"
            className={`flex items-center gap-2 text-[15px] font-semibold ${sealed ? "text-ink" : "text-maroon"}`}
          >
            <span
              aria-hidden="true"
              className={`grid size-6 shrink-0 place-content-center rounded-full text-[13px] ${
                sealed ? "bg-brand text-on-brand" : "border border-maroon"
              }`}
            >
              {sealed ? "✓" : "!"}
            </span>
            <span>
              <span className="font-mono tabular-nums">{bar} bar</span> {side === "inside" ? "inside the pipe" : "from outside"}:{" "}
              {verdict}
            </span>
          </p>
        </fieldset>
      </div>

      <figcaption className="text-[13px] text-muted">
        Schematic, not to scale. Seal and test pressures from the Joint Performance page on sweillem.net.
      </figcaption>
    </figure>
  );
}

function ChipRadio({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="relative inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-full border border-line bg-surface px-3.5 font-mono text-sm font-semibold tabular-nums transition-colors select-none hover:border-ink has-checked:border-brand has-checked:bg-brand has-checked:text-on-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-maroon">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}
