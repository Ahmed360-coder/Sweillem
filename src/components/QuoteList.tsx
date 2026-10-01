"use client";

import { useQuote } from "@/lib/quote";
import { ButtonLink } from "./Button";
import { QuoteIcon } from "./icons";

// Milestone 6 adds editing, the request form and sending. For now the list
// shows what the visitor has collected, or a clear empty state.
export function QuoteList() {
  const items = useQuote();

  if (items.length === 0) {
    return (
      <div className="wrap py-10">
        <div className="grid justify-items-center gap-4 rounded-card border border-line bg-surface px-6 py-14 text-center">
          <span className="hex grid size-16 place-items-center bg-sunk text-maroon" aria-hidden="true">
            <QuoteIcon className="size-6" />
          </span>
          <h2 className="text-2xl">Your quote list is empty</h2>
          <p className="max-w-[46ch] text-muted">
            Add sizes from the product pages and they collect here, ready to send as one request.
          </p>
          <ButtonLink href="/products" variant="ghost" arrow>
            Browse the pipes
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap py-10">
      <ul className="divide-y divide-line rounded-card border border-line bg-surface">
        {items.map((item, i) => (
          <li key={`${item.product}-${item.size}-${item.strengthClass ?? ""}-${i}`} className="flex justify-between gap-4 px-5 py-4">
            <span>
              {item.product} · {item.size}
              {item.strengthClass ? ` · ${item.strengthClass}` : ""}
            </span>
            <span className="font-mono tabular-nums">× {item.qty}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
