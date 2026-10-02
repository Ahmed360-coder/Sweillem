"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clearQuote, removeFromQuote, setQuoteQty, useQuote, type QuoteItem } from "@/lib/quote";
import { ButtonLink } from "./Button";
import { EnquiryForm } from "./EnquiryForm";
import { QuoteIcon } from "./icons";

const lineName = (i: QuoteItem) => `${i.product}, ${i.size}${i.strengthClass ? `, ${i.strengthClass}` : ""}`;

function QtyStepper({ item }: { item: QuoteItem }) {
  // Local text so the visitor can clear the box while typing a new number.
  const [draft, setDraft] = useState<string | null>(null);
  const name = lineName(item);
  const btn =
    "grid size-11 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-sunk active:translate-y-px disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent";
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-line bg-paper p-0.5">
      <button type="button" className={btn} aria-label={`One fewer: ${name}`} disabled={item.qty <= 1} onClick={() => setQuoteQty(item, item.qty - 1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true" className="size-4">
          <path d="M5 12h14" />
        </svg>
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={100000}
        value={draft ?? String(item.qty)}
        aria-label={`Quantity: ${name}`}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(n) && n >= 1) setQuoteQty(item, n);
        }}
        onBlur={() => setDraft(null)}
        className="h-11 w-16 [appearance:textfield] bg-transparent text-center font-mono text-base tabular-nums text-ink [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" className={btn} aria-label={`One more: ${name}`} onClick={() => setQuoteQty(item, item.qty + 1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true" className="size-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

/** The visitor's quote list: change quantities, remove lines, then send it as one request. */
export function QuoteList({ enabled }: { enabled: boolean }) {
  const items = useQuote();
  const [sent, setSent] = useState<{ reference: string; email: string; items: QuoteItem[] } | null>(null);
  const [announce, setAnnounce] = useState("");
  const sentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) sentRef.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <div className="wrap py-10">
        <div
          ref={sentRef}
          tabIndex={-1}
          className="grid justify-items-start gap-4 rounded-card border border-line bg-surface p-[clamp(24px,4vw,40px)] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
          aria-labelledby="sent-title"
          role="region"
        >
          <span className="hex grid size-14 place-items-center bg-ok text-surface" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" className="size-6">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h2 id="sent-title" className="text-[clamp(24px,3vw,34px)]">
            Request sent
          </h2>
          <p className="max-w-[60ch] text-[17px]">
            SWEILLEM has your request, reference <strong className="font-mono">{sent.reference}</strong>. The reply will go to{" "}
            <strong>{sent.email}</strong>.
          </p>
          {sent.items.length > 0 && (
            <details className="w-full max-w-xl">
              <summary className="min-h-11 cursor-pointer py-2 font-semibold">What you asked for ({sent.items.length} {sent.items.length === 1 ? "line" : "lines"})</summary>
              <ul className="mt-1 divide-y divide-line rounded-inner border border-line">
                {sent.items.map((i) => (
                  <li key={lineName(i)} className="flex justify-between gap-4 px-4 py-2.5 text-[15px]">
                    <span>{lineName(i)}</span>
                    <span className="font-mono tabular-nums">× {i.qty}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <p className="text-muted">Your list on this device has been cleared.</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/products" variant="ghost" arrow>
              Back to the products
            </ButtonLink>
            <ButtonLink href="/" variant="ghost">
              Home
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const total = items.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
      <section aria-labelledby="quote-lines" className="grid gap-4 lg:sticky lg:top-[calc(var(--header-h)+16px)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="quote-lines" ref={listRef} tabIndex={-1} className="text-2xl outline-none">
            Your list
          </h2>
          {items.length > 0 && (
            <p className="font-mono text-sm text-muted tabular-nums">
              {items.length} {items.length === 1 ? "line" : "lines"} · {total.toLocaleString("en")} {total === 1 ? "piece" : "pieces"}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="grid justify-items-center gap-4 rounded-card border border-line bg-surface px-6 py-12 text-center">
            <span className="hex grid size-16 place-items-center bg-sunk text-maroon" aria-hidden="true">
              <QuoteIcon className="size-6" />
            </span>
            <h3 className="text-xl">Your quote list is empty</h3>
            <p className="max-w-[42ch] text-muted">
              Add sizes from the product pages and they collect here. You can also describe what you need in the form.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/products/explorer" variant="ghost" arrow>
                Find a size
              </ButtonLink>
              <ButtonLink href="/roof-tiles" variant="ghost">
                Roof tiles
              </ButtonLink>
            </div>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-line rounded-card border border-line bg-surface">
              {items.map((item) => (
                <li key={lineName(item)} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-3.5 sm:grid-cols-[1fr_auto_auto] sm:px-5">
                  <div className="min-w-0">
                    <p className="font-semibold">{item.product}</p>
                    <p className="font-mono text-sm text-muted">
                      {item.size}
                      {item.strengthClass ? ` · ${item.strengthClass}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeFromQuote(item);
                      setAnnounce(`Removed ${lineName(item)}`);
                      listRef.current?.focus();
                    }}
                    aria-label={`Remove ${lineName(item)}`}
                    className="order-2 grid size-11 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-sunk hover:text-err sm:order-3"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-5">
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                    </svg>
                  </button>
                  <div className="order-3 sm:order-2">
                    <QtyStepper item={item} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/products/explorer" className="inline-flex min-h-11 items-center font-semibold">
                Add more sizes
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Remove every line from your quote list?")) {
                    clearQuote();
                    setAnnounce("Quote list cleared");
                  }
                }}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-full px-3 text-[15px] text-muted hover:bg-sunk hover:text-ink"
              >
                Clear the list
              </button>
            </div>
          </>
        )}
        <p className="sr-only" role="status">
          {announce}
        </p>
      </section>

      <section aria-labelledby="quote-form-title" className="grid gap-5 rounded-card border border-line bg-surface p-[clamp(18px,3vw,32px)]">
        <div className="grid gap-2">
          <h2 id="quote-form-title" className="text-2xl">
            Send the request
          </h2>
          <p className="text-muted">Tell SWEILLEM who you are and where the pipes are going. Your list goes with it.</p>
        </div>
        <EnquiryForm
          kind="quote"
          enabled={enabled}
          items={items}
          onSent={(reference, email) => {
            setSent({ reference, email, items });
            clearQuote();
          }}
        />
      </section>
    </div>
  );
}
