// Small inline icons that follow the text direction. Lucide covers the rest.

export function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`size-[18px] flex-none rtl:-scale-x-100 ${className}`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function QuoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      className={`size-[18px] flex-none ${className}`}
    >
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 12h7M9 16h5" />
    </svg>
  );
}

/** The hexagon from the S mark, used for badges, bullets and reveals. */
export function HexIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 115" aria-hidden="true" className={className}>
      <path d="M50 2l46 26.5v58L50 113 4 86.5v-58z" fill="currentColor" />
    </svg>
  );
}

/** A globe, for the projects map. */
export function MapIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`size-[18px] flex-none ${className}`}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3z" />
    </svg>
  );
}
