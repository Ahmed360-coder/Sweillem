"use client";

import { animate, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ease } from "@/lib/motion";

export interface Milestone {
  /** Four-digit year when SWEILLEM has published one. */
  year?: string;
  /** Shown instead of a year, e.g. "Newest launch". Defaults to "Year to confirm". */
  when?: string;
  title: string;
  text: string;
  source: string;
  /** How far the business reaches at this point: index into `reach`, 1-based. */
  reach: number;
  visual?: ReactNode;
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Heritage track (M31 to M33). On wide screens the section pins and the
 * milestone cards slide sideways with the scroll; the big year counts to the
 * current milestone and the market chips light up as the business grows.
 * On phones it is a plain vertical list. Driven by Motion useScroll, never a
 * scroll listener.
 */
export function HeritageTrack({ milestones, reach }: { milestones: Milestone[]; reach: string[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);
  const [overflow, setOverflow] = useState(0);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useIsoLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || !pinned) return;
    const measure = () => setOverflow(Math.max(0, track.scrollWidth - track.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -overflow]);
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!pinned) return;
    setActive(Math.min(milestones.length - 1, Math.max(0, Math.round(p * (milestones.length - 1)))));
  });

  // Phones: the milestone nearest the middle of the screen is the current one.
  useEffect(() => {
    if (pinned) return;
    const items = trackRef.current?.querySelectorAll("li");
    if (!items) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [pinned]);

  // M32: the big year counts to the current milestone's year.
  const shownYear = useRef(Number(milestones[0].year ?? 0));
  const current = milestones[active];
  useEffect(() => {
    const el = yearRef.current;
    if (!el || !current.year) return;
    const to = Number(current.year);
    if (reduce) {
      el.textContent = current.year;
      shownYear.current = to;
      return;
    }
    const controls = animate(shownYear.current, to, {
      duration: 0.6,
      ease: ease.glaze,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
        shownYear.current = Math.round(v);
      },
    });
    return () => controls.stop();
  }, [current.year, reduce]);

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={pinned && overflow ? { height: `calc(100dvh + ${overflow}px)` } : undefined}
    >
      <div
        className={
          pinned
            ? "sticky top-[var(--header-h)] flex h-[calc(100dvh-var(--header-h))] flex-col justify-center gap-7 overflow-hidden py-6"
            : "grid gap-6"
        }
      >
        <div
          className={`wrap flex flex-wrap items-end justify-between gap-x-10 gap-y-3 ${
            pinned ? "" : "sticky top-[calc(var(--header-h)-6px)] z-10 bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] py-3 backdrop-blur-md"
          }`}
        >
          <div aria-hidden="true" className="grid gap-1">
            <span className="hidden font-mono text-[12px] tracking-[.12em] text-muted uppercase sm:block">{current.year ? "Year" : "When"}</span>
            <span className="relative grid">
              <span
                ref={yearRef}
                className={`col-start-1 row-start-1 font-display text-[clamp(34px,6vw,84px)] leading-none font-bold text-maroon tabular-nums transition-opacity duration-300 ${
                  current.year ? "opacity-100" : "opacity-0"
                }`}
              >
                {milestones[0].year}
              </span>
              <span
                className={`col-start-1 row-start-1 self-end font-display text-[clamp(22px,3vw,40px)] leading-tight font-semibold text-muted transition-opacity duration-300 ${
                  current.year ? "opacity-0" : "opacity-100"
                }`}
              >
                {current.year ? "" : (current.when ?? "Year to confirm")}
              </span>
            </span>
          </div>
          <ol aria-label="Markets reached" className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            {reach.map((r, i) => {
              const lit = i < current.reach;
              return (
                <li key={r} className="flex items-center gap-1 sm:gap-1.5">
                  {i > 0 && (
                    <span aria-hidden="true" className="h-0.5 w-2 overflow-hidden rounded bg-line sm:w-4">
                      <span
                        className={`block h-full bg-maroon transition-transform duration-500 ease-glaze ltr:origin-left rtl:origin-right ${lit ? "scale-x-100" : "scale-x-0"}`}
                      />
                    </span>
                  )}
                  <span
                    data-lit={lit || undefined}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] font-medium sm:px-3 sm:py-1.5 sm:text-[13px] text-muted transition-[color,border-color,background-color] duration-500 data-lit:border-maroon data-lit:bg-maroon data-lit:text-on-maroon"
                  >
                    <span aria-hidden="true" className="hex size-2 bg-current" />
                    {r}
                    <span className="sr-only">{lit ? " (reached)" : " (later)"}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <motion.ol
          ref={trackRef}
          style={pinned ? { x } : undefined}
          className={
            pinned
              ? "flex min-h-0 gap-5 ps-[max(clamp(16px,4vw,40px),calc((100vw_-_1180px)/2_+_40px))] will-change-transform after:block after:w-[max(clamp(16px,4vw,40px),calc((100vw_-_1180px)/2_+_40px))] after:flex-none after:content-['']"
              : "wrap grid gap-4"
          }
        >
          {milestones.map((m, i) => (
            <li
              key={m.title}
              data-i={i}
              data-current={i === active || undefined}
              className={`group grid min-w-0 overflow-hidden rounded-card border border-line bg-surface shadow-card transition-[border-color,transform] duration-500 ease-glaze ${
                pinned
                  ? "w-[min(400px,34vw)] flex-none grid-rows-[minmax(0,1fr)_auto] data-current:border-maroon motion-safe:data-current:-translate-y-1.5"
                  : "sm:grid-cols-[minmax(0,200px)_1fr]"
              }`}
            >
              <div
                className={`relative overflow-hidden bg-sunk ${
                  pinned
                    ? "min-h-[150px] opacity-45 transition-opacity duration-500 group-data-current:opacity-100"
                    : "aspect-[16/10] sm:aspect-auto sm:min-h-[150px]"
                }`}
              >
                {m.visual}
              </div>
              <div className="grid content-start gap-2 p-5">
                <span className={`font-mono text-xs font-medium tracking-[.1em] uppercase ${m.year ? "text-maroon" : "text-muted"}`}>
                  {m.year ?? m.when ?? "Year to confirm"}
                </span>
                <h3 className="text-xl">{m.title}</h3>
                <p className="text-base sm:text-[15px] text-muted">{m.text}</p>
                <span className="font-mono text-[12px] text-muted">Source: {m.source}</span>
              </div>
            </li>
          ))}
        </motion.ol>

        {pinned && (
          <div className="wrap" aria-hidden="true">
            <div className="h-0.5 overflow-hidden rounded bg-line">
              <motion.div style={{ scaleX: fill }} className="h-full origin-left bg-maroon rtl:origin-right" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
