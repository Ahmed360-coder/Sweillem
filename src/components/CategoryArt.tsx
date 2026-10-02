import { useId, type ReactNode } from "react";
import { ClayTile, SHADES, TR } from "./ClayTile";

// Pictures for the product tool cards on /products, drawn in the site's style
// (no photos from the deck): glazed vitrified clay pipes seen at an angle, and
// the three roof tile colours. Glaze colours stay the same in both themes;
// labels and shadows follow the theme.

const GLAZE = { dark: "#3a1d12", base: "#6e3820", light: "#a7603b" };
/** The fired clay body, seen where the pipe end is cut. */
const BODY = { base: "#b9744c", dark: "#8d5233" };

function Shadow({ cx, cy, rx }: { cx: number; cy: number; rx: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.09} fill="currentColor" opacity=".14" />;
}

/**
 * A glazed pipe lying on its side, seen from its open spigot end: the cut face
 * shows the wall thickness (outer radius r, bore radius bore), the far end
 * carries the wider socket.
 */
function Pipe({ x, y, len, r, bore, socket = true }: { x: number; y: number; len: number; r: number; bore: number; socket?: boolean }) {
  const id = useId();
  const k = 0.34; // ellipse squash for the end faces
  const sr = r * 1.18;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={GLAZE.dark} />
          <stop offset=".22" stopColor={GLAZE.light} />
          <stop offset=".5" stopColor={GLAZE.base} />
          <stop offset="1" stopColor={GLAZE.dark} />
        </linearGradient>
        <radialGradient id={`${id}b`} cx=".6" cy=".55" r=".7">
          <stop offset="0" stopColor="#0d0605" />
          <stop offset="1" stopColor="#2a1610" />
        </radialGradient>
      </defs>
      {socket && (
        <g>
          <rect x={x + len - 34} y={y - sr} width={34} height={sr * 2} fill={`url(#${id}g)`} />
          <ellipse cx={x + len} cy={y} rx={sr * k} ry={sr} fill={`url(#${id}g)`} />
          <ellipse cx={x + len - 34} cy={y} rx={sr * k} ry={sr} fill={GLAZE.base} opacity=".55" />
        </g>
      )}
      <rect x={x} y={y - r} width={len - (socket ? 34 : 0)} height={r * 2} fill={`url(#${id}g)`} />
      {!socket && <ellipse cx={x + len} cy={y} rx={r * k} ry={r} fill={`url(#${id}g)`} />}
      {/* glaze shine along the top */}
      <rect x={x + 8} y={y - r * 0.62} width={len - (socket ? 50 : 16)} height={r * 0.12} rx={r * 0.06} fill="#fff" opacity=".38" />
      <rect x={x + len - 28} y={y - sr * 0.62} width={18} height={sr * 0.1} rx={2} fill="#fff" opacity={socket ? 0.3 : 0} />
      {/* open end: fired body ring, then the bore */}
      <ellipse cx={x} cy={y} rx={r * k} ry={r} fill={BODY.base} stroke={GLAZE.dark} strokeWidth="1.2" />
      <ellipse cx={x} cy={y} rx={bore * k} ry={bore} fill={`url(#${id}b)`} stroke={BODY.dark} strokeWidth="1" />
    </g>
  );
}

function Tag({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <g>
      <rect x={x - 15} y={y - 13} width="30" height="26" rx="6" fill="var(--surface)" stroke="currentColor" strokeOpacity=".35" />
      <text x={x} y={y + 5} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="600" fontSize="15" fill="var(--maroon)">
        {children}
      </text>
    </g>
  );
}

/** Product explorer: a pipe and a junction, with the bore and outside diameter called out. */
export function ExplorerArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" className={className} aria-hidden="true">
      <Shadow cx={175} cy={150} rx={130} />
      {/* junction: a branch rising at 45° from a short pipe at the back */}
      <g transform="translate(247 38) rotate(135)">
        <Pipe x={0} y={0} len={62} r={20} bore={15} socket={false} />
      </g>
      <Pipe x={130} y={104} len={150} r={28} bore={21} />
      <Pipe x={46} y={124} len={150} r={22} bore={16.5} />
      <g stroke="currentColor" strokeOpacity=".55" strokeWidth="1.2" fill="none">
        <path d="M24 107.5V140.5M20 107.5H28M20 140.5H28" />
        <path d="M14 102V146M10 102H18M10 146H18" strokeDasharray="2 3" />
      </g>
      <text x="22" y="92" textAnchor="middle" fontFamily="var(--font-data)" fontSize="11" fill="currentColor" opacity=".7">
        DN
      </text>
    </svg>
  );
}

/**
 * N and H class side by side: the same bore, the H pipe with the thicker wall.
 * Proportions from the DN 300 rows (d3 355 for N, 376 for H, bore 300).
 */
export function CompareArt({ className }: { className?: string }) {
  const bore = 30;
  return (
    <svg viewBox="0 0 320 180" className={className} aria-hidden="true">
      <Shadow cx={175} cy={170} rx={120} />
      <Pipe x={70} y={50} len={210} r={bore * (355 / 300)} bore={bore} />
      <Pipe x={70} y={128} len={210} r={bore * (376 / 300)} bore={bore} />
      <Tag x={28} y={50}>
        N
      </Tag>
      <Tag x={28} y={128}>
        H
      </Tag>
    </svg>
  );
}

/** Clay roof tiles: the three colours, fanned out like a sample set. */
export function RoofTilesArt({ className }: { className?: string }) {
  const h = 132;
  const w = h * TR;
  const tiles = [
    { shade: SHADES.terracotta, x: 92, rot: -9 },
    { shade: SHADES.blue, x: 160 - w / 2, rot: 0 },
    { shade: SHADES.black, x: 228 - w, rot: 9 },
  ];
  return (
    <svg viewBox="0 0 320 180" className={className} aria-hidden="true">
      <Shadow cx={160} cy={164} rx={110} />
      {tiles.map((t) => (
        <g key={t.rot} transform={`rotate(${t.rot} ${t.x + w / 2} 160)`}>
          <ClayTile x={t.x} y={22} h={h} shade={t.shade} />
        </g>
      ))}
    </svg>
  );
}
