/**
 * Spigot and socket in section, redrawn from the figure on the live Joint
 * Performance page. When it scrolls into view the spigot slides home, the
 * polyurethane seal appears and pressure pulses run at the seal (M30-style
 * joint push, CSS only). Proportions are schematic, not to scale.
 */
export function JointDiagram({ className = "" }: { className?: string }) {
  const m = (y: number) => 260 - y;
  const socket = (f: (y: number) => number) => `M560 ${f(40)}H352L338 ${f(6)}H230V${f(28)}H330V${f(68)}H560Z`;
  return (
    <figure className={`reveal grid gap-3 ${className}`}>
      <svg viewBox="0 -30 560 300" className="w-full overflow-visible" role="img" aria-labelledby="joint-svg-title">
        <title id="joint-svg-title">
          Section through a joint: the spigot of one pipe sits inside the socket of the next, sealed by a polyurethane ring
        </title>
        <rect x="0" y="68" width="560" height="124" fill="var(--sunk)" opacity=".55" />
        <line x1="0" y1="130" x2="560" y2="130" stroke="var(--line)" strokeDasharray="10 6" />
        <g className="joint-spigot">
          <rect x="0" y="40" width="326" height="28" rx="3" fill="var(--clay)" />
          <rect x="0" y="192" width="326" height="28" rx="3" fill="var(--clay)" />
        </g>
        <path d={socket((y) => y)} fill="var(--glaze-hi)" />
        <path d={socket(m)} fill="var(--glaze-hi)" />
        <g className="joint-seal" fill="var(--maroon)">
          <rect x="240" y="28" width="62" height="12" rx="2" />
          <rect x="240" y="220" width="62" height="12" rx="2" />
        </g>
        <g fill="none" stroke="var(--maroon)" strokeWidth="2">
          <circle className="joint-pulse" cx="271" cy="34" r="18" />
          <circle className="joint-pulse" cx="271" cy="226" r="18" style={{ animationDelay: "1.2s" }} />
        </g>
        <g fontFamily="var(--font-data)" fontSize="14" fill="var(--muted)">
          <text x="24" y="135">Spigot</text>
          <text x="536" y="135" textAnchor="end">
            Socket
          </text>
          <text x="271" y="-12" textAnchor="middle" fill="var(--maroon)">
            Polyurethane seal
          </text>
        </g>
        <line x1="271" y1="-6" x2="271" y2="24" stroke="var(--maroon)" strokeWidth="1.5" />
      </svg>
      <figcaption className="text-[13px] text-muted">Schematic, not to scale.</figcaption>
    </figure>
  );
}
