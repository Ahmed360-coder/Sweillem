"use client";

import { useId } from "react";
import { sectionOf, type FittingShape, type Pt } from "@/lib/fitting-shapes";

// A size finder product drawn to scale on a 100 mm grid (bold every 500 mm),
// in section like the product cards: hatched fired clay, red seals, dash-dot
// centre lines. The frame is the family's largest piece, so every size of a
// family is drawn at the same scale.

const FILL = "#efc397";
const HATCH = "#c6a17e";
const LINE = "#70483a";
const SEAL = "#d7262d";

const path = (p: Pt[]) => `M ${p.map(([x, y]) => `${x.toFixed(1)} ${(-y).toFixed(1)}`).join(" L ")} Z`;
const open = (p: Pt[]) => `M ${p.map(([x, y]) => `${x.toFixed(1)} ${(-y).toFixed(1)}`).join(" L ")}`;

export function FittingDrawing({ shape, frame, label }: { shape: FittingShape; frame: [number, number, number, number]; label: string }) {
  const id = useId();
  const sec = sectionOf(shape);
  const [x0, y0, x1, y1] = frame;
  const pad = Math.max(x1 - x0, y1 - y0) * 0.08 + 20;
  const vb = { x: x0 - pad, y: -y1 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
  const hatch = Math.max(x1 - x0, y1 - y0) / 70;
  const ticks = (from: number, to: number) => {
    const out: number[] = [];
    for (let v = Math.ceil(from / 100) * 100; v <= to; v += 100) out.push(v);
    return out;
  };
  const walls = sec.walls.map(path).join(" ");
  const seals = sec.seals.map(path).join(" ");

  return (
    <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} role="img" aria-label={label} className="block h-full w-full">
      <defs>
        <pattern id={`${id}h`} width={hatch} height={hatch} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={hatch} height={hatch} fill={FILL} />
          <line x1="0" y1="0" x2="0" y2={hatch} stroke={HATCH} strokeWidth={hatch * 0.24} />
        </pattern>
      </defs>
      <g stroke="var(--line)">
        {ticks(vb.x, vb.x + vb.w).map((x) => (
          <line key={`x${x}`} x1={x} x2={x} y1={vb.y} y2={vb.y + vb.h} strokeWidth={x % 500 ? 0.6 : 1.4} vectorEffect="non-scaling-stroke" />
        ))}
        {ticks(-vb.y - vb.h, -vb.y).map((y) => (
          <line key={`y${y}`} x1={vb.x} x2={vb.x + vb.w} y1={-y} y2={-y} strokeWidth={y % 500 ? 0.6 : 1.4} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      {/* Outline first, then the fill over it: overlapping parts merge into one cut face. */}
      <path d={walls} fill="none" stroke={LINE} strokeWidth={3} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={walls} fill={`url(#${id}h)`} />
      {seals && <path d={seals} fill={SEAL} stroke={LINE} strokeWidth={1} vectorEffect="non-scaling-stroke" />}
      {sec.dots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={-y} r={r} fill="none" stroke="var(--muted)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
      {sec.axes.map((a, i) => (
        <path key={i} d={open(a)} fill="none" stroke="var(--muted)" strokeWidth={1} strokeDasharray="12 4 2 4" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
