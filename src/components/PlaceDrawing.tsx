// A drawn stand-in for a map place that has no photo in SWEILLEM's material.
// It uses the journey's theme colours, so it follows light and dark mode.
// Kept generic on purpose: a port on the Red Sea with SWEILLEM pipes stacked
// on the quay, not a picture of any real building.

export function PortDrawing({ title, className = "" }: { title?: string; className?: string }) {
  const pipe = (x: number, y: number, r: number) => (
    <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r={r} fill="var(--glaze)" />
      <circle cx={x} cy={y} r={r * 0.78} fill="var(--glaze-hi)" />
      <circle cx={x} cy={y} r={r * 0.62} fill="var(--bore)" opacity="0.9" />
    </g>
  );
  return (
    <svg
      viewBox="0 0 160 90"
      preserveAspectRatio="xMidYMid slice"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {/* sky and sun */}
      <rect width="160" height="90" fill="var(--j-skyline)" />
      <circle cx="122" cy="20" r="9" fill="var(--clay)" opacity="0.55" />
      {/* low skyline across the water */}
      <path
        d="M0 46 h14 v-6 h8 v-10 h6 v10 h10 v-4 h12 v-12 h5 v12 h9 v-7 h14 v9 h8 v-15 h4 v15 h12 v-5 h10 v-3 h12 v8 h22 v8 H0z"
        fill="var(--slate)"
        opacity="0.35"
      />
      {/* the Red Sea */}
      <rect y="46" width="160" height="18" fill="var(--j-glass)" />
      <path d="M8 52 h14 M40 56 h18 M86 51 h12 M118 57 h20" stroke="var(--j-surface)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      {/* a ship on the horizon */}
      <path d="M96 46 l3 -4 h22 l-2 4z" fill="var(--j-steel-dark)" opacity="0.7" />
      <rect x="104" y="37" width="7" height="5" fill="var(--j-maroon)" opacity="0.75" />
      {/* the quay with a stack of pipe ends */}
      <rect y="64" width="160" height="26" fill="var(--j-ground)" />
      <rect y="64" width="160" height="2" fill="var(--j-line)" />
      {pipe(34, 80, 9)}
      {pipe(53, 80, 9)}
      {pipe(72, 80, 9)}
      {pipe(43.5, 64, 9)}
      {pipe(62.5, 64, 9)}
      {pipe(53, 48, 9)}
      {/* a few pipes lying on the quay, seen from the side */}
      <rect x="96" y="74" width="46" height="9" rx="2" fill="var(--glaze)" />
      <rect x="96" y="74" width="46" height="3" rx="1.5" fill="var(--glaze-hi)" />
      <rect x="92" y="72" width="7" height="13" rx="2" fill="var(--glaze)" />
    </svg>
  );
}
