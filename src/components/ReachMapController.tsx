"use client";

import { useEffect } from "react";

/** How long the tour rests on each country. */
const TOUR_MS = 2400;
/** Wait after the routes start drawing before the tour begins. */
const TOUR_DELAY_MS = 2600;
/** Remembers the visitor's night or day choice on this device. */
const MODE_KEY = "sweillem.map-mode";

/**
 * Behaviour for ReachMap, which is rendered on the server. It starts the
 * drawing when the map scrolls into view, marks the country in focus (every
 * element sharing its data-id gets data-on), and tours the list until the
 * visitor points at, picks or swipes the map themselves. On phones the map is
 * wider than the screen, so it slides to keep a picked or toured country in view.
 * The Night / Day switch swaps the satellite view.
 */
export function ReachMapController() {
  useEffect(() => {
    const root = document.getElementById("reach-map");
    const scroller = root?.querySelector<HTMLElement>(".reach-scroll");
    const svg = root?.querySelector<SVGSVGElement>("svg");
    if (!root || !scroller || !svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chips = [...root.querySelectorAll<HTMLButtonElement>(".reach-chip")];
    const ids = chips.map((c) => c.dataset.id!);
    const width = svg.viewBox.baseVal.width;
    let current: string | null = null;
    let pinned: string | null = null;
    let tour = -1;
    let tourTimer = 0;
    let startTimer = 0;

    const show = (id: string | null, force = false) => {
      if (id === current && !force) return;
      current = id;
      root.toggleAttribute("data-focus", id !== null);
      root.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => el.toggleAttribute("data-on", el.dataset.id === id));
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.id === pinned)));
    };

    // Phones: slide the map so the country sits in the middle of the screen.
    const follow = (id: string | null) => {
      if (!id || scroller.scrollWidth <= scroller.clientWidth + 1) return;
      const dot = root.querySelector<SVGCircleElement>(`.reach-name[data-id="${id}"] circle`);
      if (!dot) return;
      const x = (dot.cx.baseVal.value / width) * svg.clientWidth;
      scroller.scrollTo({ left: x - scroller.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
    };

    const stopTour = () => {
      window.clearTimeout(startTimer);
      window.clearInterval(tourTimer);
    };
    const startTour = () => {
      stopTour();
      if (reduce) return;
      tourTimer = window.setInterval(() => {
        tour = (tour + 1) % ids.length;
        show(ids[tour]);
        follow(ids[tour]);
      }, TOUR_MS);
    };

    // Night or day view.
    const modes = [...root.querySelectorAll<HTMLButtonElement>(".reach-mode")];
    const setMode = (mode: string) => {
      if (mode !== "night" && mode !== "day") return;
      root.dataset.mode = mode;
      modes.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    };
    try {
      setMode(window.localStorage.getItem(MODE_KEY) ?? "night");
    } catch {}
    const onMode = (e: MouseEvent) => {
      const mode = (e.currentTarget as HTMLButtonElement).dataset.mode!;
      setMode(mode);
      try {
        window.localStorage.setItem(MODE_KEY, mode);
      } catch {}
    };
    modes.forEach((b) => b.addEventListener("click", onMode));

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
      follow(pinned);
    };
    const onFocus = (e: FocusEvent) => {
      const id = (e.target as HTMLElement).dataset.id;
      if (!id) return;
      stopTour();
      show(id);
      follow(id);
    };
    const onBlur = () => show(pinned);
    // Swiping or scrolling the map is the visitor taking over: stop the tour.
    const onGrab = () => stopTour();

    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClick);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onBlur);
    scroller.addEventListener("pointerdown", onGrab);
    scroller.addEventListener("wheel", onGrab, { passive: true });

    // Draw the routes the first time the map comes into view, then start the tour.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        root.setAttribute("data-play", "");
        if (!reduce) startTimer = window.setTimeout(startTour, TOUR_DELAY_MS);
      },
      { threshold: 0.3 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      stopTour();
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("click", onClick);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onBlur);
      scroller.removeEventListener("pointerdown", onGrab);
      scroller.removeEventListener("wheel", onGrab);
      modes.forEach((b) => b.removeEventListener("click", onMode));
    };
  }, []);
  return null;
}
