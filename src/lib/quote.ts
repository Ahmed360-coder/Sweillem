"use client";

import { useSyncExternalStore } from "react";

// Quote list store. Product pages add lines, /quote edits and sends them, and
// the header shows the count. Items stay on the visitor's device
// (localStorage) until the request is sent.

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
  const line = { ...item, qty: 1 };
  writeQuote(items.some((i) => sameLine(i, line)) ? items.map((i) => (sameLine(i, line) ? { ...i, qty: i.qty + 1 } : i)) : [...items, line]);
}

const sameLine = (a: QuoteItem, b: QuoteItem) => a.product === b.product && a.size === b.size && (a.strengthClass ?? "") === (b.strengthClass ?? "");

/** Set how many of one line the visitor wants (at least 1; remove the line to drop it). */
export function setQuoteQty(line: QuoteItem, qty: number) {
  const n = Math.max(1, Math.min(100000, Math.floor(qty) || 1));
  writeQuote(read().map((i) => (sameLine(i, line) ? { ...i, qty: n } : i)));
}

export function removeFromQuote(line: QuoteItem) {
  writeQuote(read().filter((i) => !sameLine(i, line)));
}

export function clearQuote() {
  writeQuote([]);
}
