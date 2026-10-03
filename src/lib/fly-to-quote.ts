"use client";

import { useSyncExternalStore } from "react";

// M12 add-to-quote flight (design/motion-spec.md). A small glazed pipe end
// leaves the pressed button, arcs over to the header's quote count and the
// count bumps as it lands. The quote list itself is saved at once
// (src/lib/quote.ts); only the number shown on the badge waits for the pipe,
// so a visitor who leaves the page mid-flight never loses a line.
//
// The badge to fly to is any element marked data-quote-target. With reduced
// motion, a hidden badge, or no Web Animations support there is no flight and
// the count changes straight away.

const DURATION = 760;
const EASE_KILN = "cubic-bezier(0.65, 0, 0.35, 1)";
const EASE_SET = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const SIZE = 30;

// Flights still in the air. The badge shows the saved count minus these.
let pending = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((cb) => cb());

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** How many quote lines are still flying to the badge (0 on the server). */
export function usePendingFlights(): number {
  return useSyncExternalStore(
    subscribe,
    () => pending,
    () => 0,
  );
}

/** A visible badge to land on, or null when there is nowhere sensible to fly. */
function findTarget(): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>("[data-quote-target]");
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth) return el;
  }
  return null;
}

function canAnimate() {
  return typeof Element !== "undefined" && "animate" in Element.prototype && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The end of a glazed clay pipe: glaze ring, highlight and the bore. Colours follow the theme. */
function makePipe(): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.dataset.quoteFlyer = "";
  el.style.cssText = `position:fixed;left:0;top:0;width:${SIZE}px;height:${SIZE}px;z-index:70;pointer-events:none;will-change:transform,opacity;filter:drop-shadow(0 4px 6px rgb(20 8 6 / 0.35))`;
  el.innerHTML =
    '<svg viewBox="0 0 30 30" width="30" height="30">' +
    '<circle cx="15" cy="15" r="13.5" fill="var(--glaze)" stroke="var(--glaze-hi)" stroke-width="1.5"/>' +
    '<path d="M6.2 9.4A10.5 10.5 0 0 1 15 4.5" fill="none" stroke="var(--glaze-hi)" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="15" cy="15" r="8.4" fill="var(--bore)" stroke="var(--maroon)" stroke-width="1.6"/>' +
    "</svg>";
  return el;
}

/** Bump the badge and send a ring out from it, as the pipe lands. */
function land(target: HTMLElement) {
  target.animate([{ transform: "scale(1)" }, { transform: "scale(1.45)", offset: 0.35 }, { transform: "scale(1)" }], { duration: 460, easing: EASE_SET });
  const r = target.getBoundingClientRect();
  const ring = document.createElement("div");
  ring.setAttribute("aria-hidden", "true");
  const d = Math.max(r.width, r.height);
  ring.style.cssText = `position:fixed;left:${r.left + r.width / 2 - d / 2}px;top:${r.top + r.height / 2 - d / 2}px;width:${d}px;height:${d}px;border-radius:9999px;border:2px solid var(--maroon);z-index:70;pointer-events:none`;
  document.body.appendChild(ring);
  ring
    .animate([{ transform: "scale(1)", opacity: 0.8 }, { transform: "scale(2.4)", opacity: 0 }], { duration: 520, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" })
    .finished.catch(() => {})
    .finally(() => ring.remove());
}

/**
 * Fly a pipe from `from` to the quote badge. Call it right after the line has
 * been saved. Safe to call many times in a row; each flight lands on its own.
 */
export function flyToQuote(from: Element) {
  if (!canAnimate()) return;
  const target = findTarget();
  if (!target) return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const x0 = a.left + a.width / 2 - SIZE / 2;
  const y0 = a.top + a.height / 2 - SIZE / 2;
  const x1 = b.left + b.width / 2 - SIZE / 2;
  const y1 = b.top + b.height / 2 - SIZE / 2;
  // Quadratic arc whose peak sits above both ends, higher for longer trips.
  const lift = Math.min(160, 40 + Math.hypot(x1 - x0, y1 - y0) * 0.25);
  const cx = (x0 + x1) / 2;
  const cy = Math.min(y0, y1) - lift;
  // Rolls the way it travels, so it reads as a pipe end rolling through the air.
  const spin = (x1 >= x0 ? 1 : -1) * 300;

  const steps = 24;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
    const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    // Pops up a little on take-off, then shrinks into the badge.
    const s = t < 0.15 ? 1 + t * 1.6 : 1.24 - (t - 0.15) * 0.82;
    frames.push({ transform: `translate(${x}px, ${y}px) rotate(${spin * t}deg) scale(${s})`, opacity: t > 0.92 ? (1 - t) / 0.08 : 1, offset: t });
  }

  const pipe = makePipe();
  document.body.appendChild(pipe);
  pending += 1;
  emit();

  let done = false;
  const finish = (landed: boolean) => {
    if (done) return;
    done = true;
    pipe.remove();
    pending = Math.max(0, pending - 1);
    emit();
    if (landed && target.isConnected) land(target);
  };
  const anim = pipe.animate(frames, { duration: DURATION, easing: EASE_KILN, fill: "forwards" });
  anim.finished.then(() => finish(true), () => finish(false));
  // A backgrounded tab can stall animations; never leave the badge behind.
  window.setTimeout(() => finish(true), DURATION + 400);
}
