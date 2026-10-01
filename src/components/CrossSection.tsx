// A pipe's cross-section drawn to scale from its spec row: outer ring d3,
// bore d1. Every drawing on a page shares one scale (`scaleTo`, in mm), so a
// DN 1000 ring really is eight times a DN 125 one.

export function CrossSection({
  d1,
  d3,
  scaleTo = 1200,
  title,
  className = "",
  showLabels = true,
}: {
  d1: number;
  d3: number | null;
  scaleTo?: number;
  /** Accessible description; leave out for a decorative drawing. */
  title?: string;
  className?: string;
  showLabels?: boolean;
}) {
  const r = (mm: number) => (mm / scaleTo) * 100;
  const outer = d3 ?? d1;
  const ro = r(outer) / 2;
  const ri = r(d1) / 2;
  return (
    <svg viewBox="-60 -60 120 120" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} className={className}>
      {title && <title>{title}</title>}
      <circle cx="0" cy="0" r="55" fill="none" stroke="var(--line)" strokeDasharray="1.5 2.5" strokeWidth="0.4" />
      <line x1="-58" y1="0" x2="58" y2="0" stroke="var(--line)" strokeWidth="0.3" strokeDasharray="4 1.5 1 1.5" />
      <line x1="0" y1="-58" x2="0" y2="58" stroke="var(--line)" strokeWidth="0.3" strokeDasharray="4 1.5 1 1.5" />
      <g className="xs-ring" style={{ ["--ro" as string]: ro }}>
        {d3 !== null && <circle cx="0" cy="0" r={(ro + ri) / 2} fill="none" stroke="var(--glaze-hi)" strokeWidth={ro - ri} />}
        {d3 !== null && <circle cx="0" cy="0" r={ro} fill="none" stroke="var(--glaze)" strokeWidth="0.6" />}
        <circle cx="0" cy="0" r={ri} fill="var(--bore)" stroke="var(--glaze)" strokeWidth="0.6" />
      </g>
      {showLabels && (
        <g fontFamily="var(--font-data)" fontSize="5" fill="var(--muted)" textAnchor="middle">
          <text y={-Math.max(ro, 8) - 3}>d3 {d3 ?? "–"}</text>
          <text y={Math.max(ro, 8) + 7} fill="var(--ink)">
            d1 {d1}
          </text>
        </g>
      )}
    </svg>
  );
}
