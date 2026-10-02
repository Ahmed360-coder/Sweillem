import { useId } from "react";

/** Tile proportions (width / height), the same as the tile photo cut-outs. */
export const TR = 420 / 720;

/* A drawn tile for the steps before firing, coloured for its stage:
   wet clay is dark and shiny, dried clay pale and matte (and slightly smaller),
   glazed tiles take their colour with a wet sheen, and in the kiln they glow. */
export type Shade = { base: string; dark: string; light: string; gloss: number };
export const SHADES = {
  wet: { base: "#6f5b4b", dark: "#46372d", light: "#927c69", gloss: 0.45 },
  dry: { base: "#dcc6a7", dark: "#b49d80", light: "#eee0ca", gloss: 0 },
  terracotta: { base: "#c4623a", dark: "#8f3f22", light: "#e38d64", gloss: 0.4 },
  blue: { base: "#2f4f7d", dark: "#1c3253", light: "#6283b3", gloss: 0.4 },
  black: { base: "#2c2c2f", dark: "#141416", light: "#5d5e63", gloss: 0.4 },
  hot: { base: "#ff8d2e", dark: "#d4521b", light: "#ffd27a", gloss: 0 },
} satisfies Record<string, Shade>;

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) =>
  `#${hex(a)
    .map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0"))
    .join("")}`;
export const mixShade = (a: Shade, b: Shade, t: number): Shade => ({
  base: mixHex(a.base, b.base, t),
  dark: mixHex(a.dark, b.dark, t),
  light: mixHex(a.light, b.light, t),
  gloss: a.gloss + (b.gloss - a.gloss) * t,
});

export function ClayTile({ x, y, h, shade, shrink = 0 }: { x: number; y: number; h: number; shade: Shade; shrink?: number }) {
  const id = useId();
  const k = (h / 144) * (1 - shrink);
  // Shrinking keeps the tile standing on the same line, centred.
  const dx = (h * TR - 84 * k) / 2;
  const dy = h - 144 * k;
  return (
    <g transform={`translate(${x + dx} ${y + dy}) scale(${k})`}>
      <defs>
        <linearGradient id={`${id}r`} x1="0" x2="1">
          <stop offset="0" stopColor={shade.dark} />
          <stop offset=".45" stopColor={shade.light} />
          <stop offset="1" stopColor={shade.dark} />
        </linearGradient>
      </defs>
      <path d="M4 0H68V5H84V144H14V139H0V5H4Z" fill={shade.base} stroke={shade.dark} strokeWidth="1.5" />
      <path d="M8 6H82V26H8Z" fill={shade.dark} opacity=".28" />
      <path d="M12 26H82" stroke={shade.dark} strokeWidth="2" />
      {[3.5, 8.5].map((lx) => (
        <path key={lx} d={`M${lx} 10V134`} stroke={shade.dark} strokeWidth="1.6" />
      ))}
      {[18, 46].map((rx) => (
        <g key={rx}>
          <rect x={rx} y="30" width="20" height="108" rx="10" fill={`url(#${id}r)`} />
          {shade.gloss > 0 && <rect x={rx + 4} y="38" width="4" height="90" rx="2" fill="#fff" opacity={shade.gloss} />}
        </g>
      ))}
      {[71, 78].map((lx) => (
        <path key={lx} d={`M${lx} 32V138`} stroke={shade.dark} strokeWidth="1.4" />
      ))}
      {[60, 84, 108].map((ly) => (
        <path key={ly} d={`M71 ${ly}H84`} stroke={shade.dark} strokeWidth="1.4" />
      ))}
    </g>
  );
}
