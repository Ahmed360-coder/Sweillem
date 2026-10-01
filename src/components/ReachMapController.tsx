"use client";

import { useEffect } from "react";

/** How long the tour rests on each country. */
const TOUR_MS = 2200;

/**
 * Behaviour for ReachMap, which is rendered on the server. It starts the
 * drawing when the map scrolls into view, marks the country in focus (every
 * element sharing its data-id gets data-on), and tours the list until the
 * visitor points at or picks a country themselves.
 */
export function ReachMapController() {
  useEffect(() => {
    const root = document.getElementById("reach-map");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chips = [...root.querySelectorAll<HTMLButtonElement>(".reach-chip")];
    const ids = chips.map((c) => c.dataset.id!);
    let current: string | null = null;
    let pinned: string | null = null;
    let tour = 0;
    let timer = 0;

    const show = (id: string | null, force = false) => {
      if (id === current && !force) return;
      current = id;
      root.toggleAttribute("data-focus", id !== null);
      root.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => el.toggleAttribute("data-on", el.dataset.id === id));
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.id === pinned)));
    };
    const stopTour = () => window.clearInterval(timer);
    const startTour = () => {
      stopTour();
      if (reduce) return;
      timer = window.setInterval(() => {
        tour = (tour + 1) % ids.length;
        show(ids[tour]);
      }, TOUR_MS);
    };

    // Pointing: anything with a data-id inside the map or the chips.
    const onOver = (e: PointerEvent) => {
      const id = (e.target as Element).closest<HTMLElement>("[data-id]")?.dataset.id;
      if (!id) return;
      stopTour();
      show(id);
    };
    const onLeave = () => show(pinned);
    // Picking: a chip click (or tap) pins the country until it is picked again.
    const onClick = (e: MouseEvent) => {
      const chip = (e.target as Element).closest<HTMLButtonElement>(".reach-chip");
      if (!chip) return;
      stopTour();
      pinned = pinned === chip.dataset.id ? null : chip.dataset.id!;
      show(pinned, true);
    };
    const onFocus = (e: FocusEvent) => {
      const id = (e.target as HTMLElement).dataset.id;
      if (!id) return;
      stopTour();
      show(id);
    };
    const onBlur = () => show(pinned);

    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClick);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onBlur);

    // Draw the routes the first time the map comes into view, then start the tour.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        root.setAttribute("data-play", "");
        if (!reduce) timer = window.setTimeout(() => startTour(), 2600);
      },
      { threshold: 0.35 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      stopTour();
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("click", onClick);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onBlur);
    };
  }, []);
  return null;
}
