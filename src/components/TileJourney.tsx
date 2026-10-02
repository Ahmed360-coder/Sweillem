"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ClayTile, mixShade, SHADES, TR } from "./ClayTile";

// How a roof tile is made, driven by scroll like the pipe journey on /process:
// the section pins full screen, the visitor's scroll moves the tile from the
// Aswan quarry to a finished roof, and each step's explanation sits under the
// picture on the same screen. Step text is SWEILLEM's published clay process
// (content/company.ts); tile specifics wait on SWEILLEM (docs/content-gaps.md 8.2).

export interface TileStep {
  id: string;
  title: string;
  text: string;
  fact?: string;
}

const TILE = {
  terracotta: "/images/roof-tiles/tile-terracotta-cutout.webp",
  blue: "/images/roof-tiles/tile-blue-cutout.webp",
  black: "/images/roof-tiles/tile-black-cutout.webp",
};

const VH_PER_STEP = 70;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pad = (n: number) => String(n).padStart(2, "0");

// Outlines and machinery stay dark in both themes; paper, ground, buildings and
// labels use the --j-* scene variables so the drawing follows light or dark mode.
const INK = "#1c1818";
const TEXT = "var(--j-ink)";
const MUTED = "var(--j-muted)";
const MAROON = "#7a0404";
const CLAY = "#b07a4b";
const CLAY_DARK = "#7b5236";
const STEEL = "#7f8285";

/** The real tile photo: only for finished, fired tiles (packing onwards). */
function Tile({ x, y, h, src = TILE.terracotta, opacity = 1 }: { x: number; y: number; h: number; src?: string; opacity?: number }) {
  return <image href={src} x={x} y={y} width={h * TR} height={h} opacity={opacity} preserveAspectRatio="none" />;
}

function Truck({ x, load }: { x: number; load?: ReactNode }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="0" y="470" width="230" height="70" rx="6" fill="var(--j-band)" stroke={INK} strokeWidth="3" />
      {load}
      <path d="M232 540v-82h56l38 42v40z" fill={MAROON} stroke={INK} strokeWidth="3" />
      <path d="M248 470h36l26 30h-62z" fill="var(--j-sky)" stroke={INK} strokeWidth="2" />
      {[50, 180, 290].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="548" r="22" fill={INK} />
          <circle cx={cx} cy="548" r="8" fill="#d6d4cf" />
        </g>
      ))}
    </g>
  );
}

function Ground({ y = 560, fill = "var(--j-floor)" }: { y?: number; fill?: string }) {
  return <rect x="-2000" y={y} width="5000" height="400" fill={fill} />;
}

function Label({ x, y, children, anchor = "middle", size = 22 }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily="var(--font-data)" fontSize={size} fill={MUTED} letterSpacing="1">
      {children}
    </text>
  );
}

/* ---------- the nine scenes, each drawn for its own progress p (0..1) ---------- */

function Quarry({ p }: { p: number }) {
  const dig = Math.sin(seg(p, 0, 0.55) * Math.PI * 3) * 0.5 + 0.5;
  const arm = -35 + dig * 50;
  const load = seg(p, 0.15, 0.55);
  const drive = ease(seg(p, 0.6, 1));
  return (
    <g>
      <path d="M-600 560 L-100 300 L120 380 L260 250 L420 560Z" fill="var(--j-quarry)" />
      <path d="M-600 560 L-200 400 L60 450 L180 380 L330 560Z" fill={CLAY} />
      <path d="M40 560 L160 470 L300 560Z" fill={CLAY_DARK} opacity=".55" />
      <Ground fill="var(--j-sand)" />
      <Label x={150} y={230} anchor="start">ASWAN QUARRY</Label>
      <g transform="translate(330 0)">
        <rect x="0" y="470" width="150" height="50" rx="8" fill="#e0a21b" stroke={INK} strokeWidth="3" />
        <rect x="70" y="420" width="70" height="55" rx="6" fill="#e0a21b" stroke={INK} strokeWidth="3" />
        <rect x="-10" y="520" width="170" height="36" rx="18" fill={INK} />
        <g transform={`rotate(${arm} 20 470)`}>
          <path d="M20 470 L-90 400 L-150 470" fill="none" stroke="#e0a21b" strokeWidth="18" strokeLinejoin="round" />
          <path d="M-165 462 q15 40 45 22 l-10 -26z" fill={STEEL} stroke={INK} strokeWidth="3" />
        </g>
      </g>
      <Truck x={560 + drive * 900} load={<path d={`M10 470 Q115 ${470 - 60 * load} 220 470Z`} fill={CLAY} stroke={CLAY_DARK} strokeWidth="2" />} />
    </g>
  );
}

function Lab({ p }: { p: number }) {
  const checks = ["Fine minerals", "Salts", "Al₂O₃"];
  return (
    <g>
      <Ground />
      <path d="M60 560 Q170 420 300 560Z" fill={CLAY} />
      <Label x={180} y={600}>STORED CLAY</Label>
      <rect x="400" y="300" width="520" height="260" rx="16" fill="var(--j-surface)" stroke={INK} strokeWidth="3" />
      <Label x={660} y={340}>QUALITY CHECKS</Label>
      {checks.map((c, i) => {
        const f = ease(seg(p, 0.1 + i * 0.25, 0.3 + i * 0.25));
        return (
          <g key={c} transform={`translate(440 ${370 + i * 60})`}>
            <text x="0" y="28" fontFamily="var(--font-body)" fontSize="24" fill={TEXT}>
              {c}
            </text>
            <rect x="200" y="8" width="200" height="22" rx="11" fill="var(--j-band)" />
            <rect x="200" y="8" width={200 * f} height="22" rx="11" fill={MAROON} />
            <path d="M418 18l10 10 20 -22" fill="none" stroke="#1d6b43" strokeWidth="5" strokeLinecap="round" opacity={f >= 1 ? 1 : 0} />
          </g>
        );
      })}
    </g>
  );
}

function Moulding({ p }: { p: number }) {
  const slide = ease(seg(p, 0, 0.4));
  const press = Math.sin(seg(p, 0.4, 0.7) * Math.PI);
  const formed = p > 0.55;
  const out = ease(seg(p, 0.7, 1));
  const x = -80 + slide * 480 + out * 400;
  return (
    <g>
      <Ground />
      <rect x="-200" y="520" width="1400" height="18" fill={STEEL} />
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={-180 + i * 90} cy="548" r="10" fill={INK} />
      ))}
      <rect x="370" y="120" width="260" height="40" fill={INK} />
      <rect x="485" y="160" width="30" height={60 + press * 150} fill={STEEL} />
      <rect x="390" y={220 + press * 150} width="220" height="30" rx="4" fill={MAROON} />
      {formed ? <ClayTile x={x} y={520 - 150} h={150} shade={SHADES.wet} /> : <rect x={x} y={470} width={90} height={50} rx="10" fill={CLAY} stroke={CLAY_DARK} strokeWidth="3" />}
      <Label x={500} y={100}>MOULDING</Label>
    </g>
  );
}

function Drying({ p }: { p: number }) {
  const t = ease(seg(p, 0.1, 0.9));
  const shade = mixShade(SHADES.wet, SHADES.dry, t);
  return (
    <g>
      <Ground />
      <rect x="180" y="150" width="640" height="410" rx="14" fill="var(--j-surface)" stroke={INK} strokeWidth="3" />
      <Label x={500} y={135}>DRYER · COMPUTER CONTROLLED</Label>
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x="210" y={300 + r * 125} width="580" height="8" fill={STEEL} />
          {Array.from({ length: 7 }, (_, c) => (
            <ClayTile key={c} x={225 + c * 80} y={300 + r * 125 - 100} h={100} shade={shade} shrink={0.06 * t} />
          ))}
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${120 + ((p * 600 + i * 150) % 600)} 200 q20 -14 40 0 t40 0`} fill="none" stroke="#e4572e" strokeWidth="4" opacity=".6" transform={`translate(${i * 40} ${i * 90})`} />
      ))}
      <text x="860" y="300" fontFamily="var(--font-data)" fontSize="44" fontWeight="600" fill={TEXT}>
        {Math.round(100 - t * 100)}%
      </text>
      <Label x={860} y={335} anchor="start" size={18}>
        WATER LEFT
      </Label>
    </g>
  );
}

function Glaze({ p }: { p: number }) {
  const move = ease(seg(p, 0, 0.6));
  const x = 120 + move * 600;
  const reveal = clamp01((x + 87 - 470) / 90);
  const trio = ease(seg(p, 0.65, 1));
  return (
    <g>
      <Ground />
      <rect x="-200" y="520" width="1400" height="18" fill={STEEL} />
      <rect x="440" y="150" width="120" height="30" rx="6" fill={INK} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={452 + i * 22} y="180" width="8" height="340" fill="#b4532e" opacity=".55" />
      ))}
      <Label x={500} y={135}>COLOUR AND GLAZE</Label>
      <g opacity={1 - trio}>
        <ClayTile x={x} y={370} h={150} shade={SHADES.dry} shrink={0.06} />
        <clipPath id="tj-glaze">
          <rect x={x + 87 * (1 - reveal)} y="360" width={87 * reveal + 2} height="170" />
        </clipPath>
        <g clipPath="url(#tj-glaze)">
          <ClayTile x={x} y={370} h={150} shade={SHADES.terracotta} shrink={0.06} />
        </g>
      </g>
      <g opacity={trio}>
        {(["terracotta", "blue", "black"] as const).map((c, i) => (
          <ClayTile key={c} x={575 + i * 100} y={520 - 170 - (i === 1 ? 14 : 0) + (1 - trio) * 30} h={170} shade={SHADES[c]} shrink={0.06} />
        ))}
      </g>
    </g>
  );
}

function Firing({ p }: { p: number }) {
  const inX = ease(seg(p, 0, 0.3));
  const door = ease(seg(p, 0.25, 0.4));
  const heat = seg(p, 0.4, 0.92);
  const temp = Math.round((heat * 1200) / 10) * 10;
  return (
    <g>
      <Ground />
      <g transform="translate(-110 0)">
      <rect x="380" y="200" width="460" height="360" rx="12" fill="#3b2119" stroke={INK} strokeWidth="3" />
      <rect x="410" y="230" width="400" height="300" fill={`rgb(${60 + heat * 195} ${30 + heat * 90} ${20 + heat * 10})`} />
      <rect x="380" y="200" width={460 * door} height="360" fill={`rgb(${90 + heat * 120} ${51 + heat * 40} 37)`} stroke={INK} strokeWidth="3" opacity={door > 0.02 ? 1 : 0} />
      <Label x={610} y={185}>SHUTTLE KILN</Label>
      <g transform={`translate(${-120 + inX * 560} 0)`} opacity={1 - door}>
        <rect x="0" y="500" width="250" height="24" fill={STEEL} />
        {[0, 1, 2].map((i) => (
          <ClayTile key={i} x={10 + i * 80} y={400} h={100} shade={mixShade(SHADES.dry, SHADES.terracotta, 0.15)} shrink={0.06} />
        ))}
      </g>
      {/* Spy hole in the closed door: the tiles inside glow as the heat climbs. */}
      <g opacity={door}>
        <clipPath id="tj-spy">
          <rect x="545" y="240" width="130" height="86" rx="10" />
        </clipPath>
        <rect x="545" y="240" width="130" height="86" rx="10" fill="#1a0d08" />
        <g clipPath="url(#tj-spy)">
          {[0, 1, 2].map((i) => (
            <ClayTile key={i} x={552 + i * 42} y={256} h={96} shade={mixShade(SHADES.dry, SHADES.hot, heat)} shrink={0.06} />
          ))}
        </g>
        <rect x="545" y="240" width="130" height="86" rx="10" fill="none" stroke={INK} strokeWidth="4" />
      </g>
      <text x="610" y="400" textAnchor="middle" fontFamily="var(--font-data)" fontSize="64" fontWeight="600" fill="#fff" opacity={door}>
        {temp} °C
      </text>
      <text x="610" y="450" textAnchor="middle" fontFamily="var(--font-data)" fontSize="24" fill="#f6ebe4" opacity={door}>
        {heat < 1 ? "firing" : "2 to 4 days"}
      </text>
      </g>
    </g>
  );
}

function Packing({ p }: { p: number }) {
  const rows = Math.round(ease(seg(p, 0.05, 0.85)) * 5);
  const done = p > 0.85 ? 1 : 0;
  return (
    <g>
      <Ground />
      <rect x="330" y="530" width="340" height="30" fill={CLAY_DARK} />
      {Array.from({ length: rows }, (_, r) => Array.from({ length: 4 }, (_, c) => <Tile key={`${r}-${c}`} x={345 + c * 80} y={530 - (r + 1) * 46 - 70} h={116} />))}
      <circle cx="790" cy="260" r="46" fill="#1d6b43" opacity={done} />
      <path d="M768 262l16 16 30 -32" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity={done} />
      <Label x={500} y={180}>QUALITY CONTROL · PACKING</Label>
    </g>
  );
}

function Delivery({ p }: { p: number }) {
  const x = -380 + ease(p) * 1500;
  return (
    <g>
      <Ground fill="var(--j-tarmac)" />
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={-1000 + i * 120} y="596" width="60" height="8" fill="var(--j-tarmac-line)" />
      ))}
      <Truck x={x} load={<g>{[0, 1].map((r) => [0, 1, 2].map((c) => <Tile key={`${r}${c}`} x={20 + c * 70} y={470 - 90 - r * 34} h={90} />))}</g>} />
      <Label x={500} y={260}>ON TIME, TO SITE</Label>
    </g>
  );
}

function Roof({ p }: { p: number }) {
  const ROWS = 7;
  const laid = ease(seg(p, 0.05, 0.9)) * ROWS;
  return (
    <g>
      <Ground fill="var(--j-lawn)" />
      <rect x="250" y="340" width="500" height="220" fill="var(--j-wall)" stroke={INK} strokeWidth="3" />
      <rect x="450" y="440" width="90" height="120" fill={CLAY_DARK} />
      <rect x="310" y="400" width="90" height="70" fill="var(--j-sky)" stroke={INK} strokeWidth="3" />
      <rect x="600" y="400" width="90" height="70" fill="var(--j-sky)" stroke={INK} strokeWidth="3" />
      <clipPath id="tj-roof">
        <path d="M200 350 L500 130 L800 350Z" />
      </clipPath>
      <path d="M200 350 L500 130 L800 350Z" fill="var(--j-roof)" stroke={INK} strokeWidth="3" />
      <g clipPath="url(#tj-roof)">
        {Array.from({ length: ROWS }, (_, r) => {
          const shown = clamp01(laid - r);
          return Array.from({ length: 14 }, (_, c) => <Tile key={`${r}-${c}`} x={200 + c * 44 - (r % 2) * 22} y={350 - 70 - r * 33} h={72} opacity={shown} />);
        })}
      </g>
      <path d="M200 350 L500 130 L800 350" fill="none" stroke={INK} strokeWidth="4" />
    </g>
  );
}

const SCENES = [Quarry, Lab, Moulding, Drying, Glaze, Firing, Packing, Delivery, Roof];

function Scene({ index, p, portrait = false }: { index: number; p: number; portrait?: boolean }) {
  const S = SCENES[index];
  // Phones see the middle of each scene, larger; the action is drawn there.
  return (
    <svg viewBox={portrait ? "110 110 780 530" : "0 0 1000 640"} preserveAspectRatio={portrait ? "xMidYMid meet" : "xMidYMax meet"} className="block h-full w-full overflow-visible" aria-hidden="true">
      <g key={index} className="tj-scene">
        <S p={p} />
      </g>
    </svg>
  );
}

export function TileJourney({ steps }: { steps: TileStep[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPortrait(el.clientWidth < el.clientHeight * 1.2));
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduce]);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.0005 });
  useMotionValueEvent(progress, "change", (v) => setPos(clamp01(v) * steps.length));

  // While the journey fills the screen, the site header slides out of the way (same as /process).
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const html = document.documentElement;
    if (v > 0 && v < 1) html.dataset.journey = "";
    else delete html.dataset.journey;
  });
  useEffect(() => () => void delete document.documentElement.dataset.journey, []);

  const index = Math.min(steps.length - 1, Math.floor(pos));
  const local = clamp01(pos - index);
  const current = steps[index];

  useEffect(() => {
    const rail = railRef.current;
    const btn = rail?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!rail || !btn) return;
    if (btn.offsetLeft < rail.scrollLeft || btn.offsetLeft + btn.offsetWidth > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left: btn.offsetLeft - 16, behavior: "smooth" });
    }
  }, [index]);

  const jump = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((i + 0.08) / steps.length) * travel, behavior: reduce ? "auto" : "smooth" });
  };

  if (reduce) {
    return (
      <ol className="wrap grid gap-4 md:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.id} className="grid content-start gap-3 overflow-hidden rounded-card border border-line bg-surface">
            <div className="aspect-[16/9] overflow-hidden bg-(--j-bg)">
              <Scene index={i} p={1} />
            </div>
            <div className="grid gap-1 px-5 pb-5">
              <span className="font-mono text-xs text-maroon">Step {pad(i + 1)}</span>
              <h3 className="text-xl">{s.title}</h3>
              <p className="text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <section ref={sectionRef} aria-label="How a roof tile is made, step by step" className="relative" style={{ height: `calc(100dvh + ${steps.length * VH_PER_STEP}vh)` }}>
      {/* Scene colours are --j-* variables, so the drawing follows the light or dark theme. */}
      <div className="sticky top-0 flex h-[100dvh] flex-col overflow-hidden bg-(--j-bg) text-ink">
        <motion.div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-1 origin-left bg-maroon rtl:origin-right" style={{ scaleX: progress }} />
        <div ref={stageRef} className="relative min-h-0 flex-1 pt-6">
          <Scene index={index} p={local} portrait={portrait} />
        </div>

        {/* The explanation sits under the picture, on the same screen. */}
        <div className="relative z-10 border-t border-line bg-surface">
          <div key={current.id} className="journey-caption wrap grid max-w-[1180px] gap-1.5 pt-4 pb-3 sm:pt-5">
            <span className="font-mono text-[12px] font-medium tracking-[.14em] text-maroon uppercase">
              Step {pad(index + 1)} of {pad(steps.length)}
            </span>
            <p className="font-display text-[clamp(22px,3.2vw,38px)] leading-[1.05] font-semibold">{current.title}</p>
            <p className="max-w-[64ch] text-[clamp(15px,1.3vw,17px)] leading-normal text-muted">{current.text}</p>
            {current.fact && <p className="font-mono text-sm font-semibold">{current.fact}</p>}
          </div>
          <p className="sr-only" aria-live="polite">
            Step {index + 1}: {current.title}. {current.text}
          </p>
          <ol ref={railRef} aria-label="Jump to a step" className="wrap relative flex max-w-[1180px] snap-x gap-2 overflow-x-auto pb-[max(12px,env(safe-area-inset-bottom))] [scrollbar-width:none]">
            {steps.map((s, i) => (
              <li key={s.id} className="flex-none snap-start">
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={i === index ? "step" : undefined}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-[14px] font-semibold text-ink transition-colors hover:border-maroon aria-[current=step]:border-brand aria-[current=step]:bg-brand aria-[current=step]:text-on-brand"
                >
                  <span className="font-mono font-medium">{pad(i + 1)}</span>
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
