"use client";

import { useSyncExternalStore } from "react";

// Quote list store. Milestone 6 adds items from product pages and sends the
// request; the header only needs the count, so the store lives here from the start.
// Items stay on the visitor's device (localStorage) until the request is sent.

export interface QuoteItem {
  product: string;
  size: string;
  strengthClass?: string;
  qty: number;
}

const KEY = "sweillem.quote.v1";
const EVENT = "sweillem:quote";
const EMPTY: QuoteItem[] = [];
let cache: { raw: string | null; items: QuoteItem[] } = { raw: null, items: EMPTY };

function read(): QuoteItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.items;
  let items: QuoteItem[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) items = parsed as QuoteItem[];
  } catch {
    items = EMPTY;
  }
  cache = { raw, items };
  return items;
}

export function writeQuote(items: QuoteItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage blocked (private mode): the list lives for this page only.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useQuote(): QuoteItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useQuoteCount(): number {
  return useQuote().reduce((n, item) => n + item.qty, 0);
}

/** Add one of an item, or one more if the same product, size and class is already listed. */
export function addToQuote(item: Omit<QuoteItem, "qty">) {
  const items = read();
  const same = (i: QuoteItem) => i.product === item.product && i.size === item.size && (i.strengthClass ?? "") === (item.strengthClass ?? "");
  writeQuote(items.some(same) ? items.map((i) => (same(i) ? { ...i, qty: i.qty + 1 } : i)) : [...items, { ...item, qty: 1 }]);
}
