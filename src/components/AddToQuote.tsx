"use client";

import { useEffect, useState } from "react";
import { flyToQuote } from "@/lib/fly-to-quote";
import { addToQuote, type QuoteItem } from "@/lib/quote";

/**
 * Adds one size to the visitor's quote list (kept on their device until the
 * request is sent from /quote). Says "Added" for a moment, out loud too, and
 * sends a pipe flying to the header's quote count (M12).
 */
export function AddToQuote({
  item,
  label,
  compact = false,
  className = "",
}: {
  item: Omit<QuoteItem, "qty">;
  /** Accessible name. It must contain the visible text, e.g. "Add to quote: DN 300 H class pipe" or, compact, "Add DN 300 H class pipe to quote". */
  label: string;
  compact?: boolean;
  className?: string;
}) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(t);
  }, [added]);

  return (
    <button
      type="button"
      onClick={(e) => {
        addToQuote(item);
        setAdded(true);
        flyToQuote(e.currentTarget);
      }}
      aria-label={label}
      data-added={added || undefined}
      className={`no-print inline-flex min-h-11 items-center justify-center gap-2 rounded-full border font-semibold whitespace-nowrap transition-colors duration-200 ease-glaze active:translate-y-px data-added:border-ok data-added:text-ok ${
        compact
          ? "min-w-11 border-line bg-surface px-3 text-sm text-ink hover:border-ink"
          : "border-transparent bg-brand px-5 py-3 text-on-brand hover:bg-brand-hi data-added:bg-surface"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true" className="size-4 flex-none">
        {added ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M12 5v14M5 12h14" />}
      </svg>
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>{added ? "Added" : compact ? "Quote" : "Add to quote"}</span>
      <span className="sr-only" role="status">
        {added ? "Added to your quote list" : ""}
      </span>
    </button>
  );
}
