"use client";

import { useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { assetUrls, chapterAt, COMPACT_H, DURATION, frameSVG, getChapters, H, W } from "@/lib/journey/frames";

const pad = (n: number) => String(n).padStart(2, "0");
/** Scroll length per second of the journey's timeline, in vh. */
const VH_PER_SECOND = 8;
const SCROLL_VH = Math.round(DURATION * VH_PER_SECOND);
/** Below this width the frame drops its caption band and the caption shows as text. */
const COMPACT_BELOW = 720;

const chapters = getChapters("en");
const steps = chapters.filter((c) => c.n);
/** A moment late in a chapter, when its drawing is complete. */
const settled = (c: (typeof chapters)[number]) => Math.max(c.start, c.end - 0.6);

/**
 * The process journey, driven by scroll (M14). The section pins under the
 * header and its scroll position becomes the journey's timeline: scrolling down
 * moves the pipe from the Aswan quarry through the kiln to the trench, scrolling
 * up runs it back, and it stays put when the visitor stops. Frames come from
 * frameSVG(t), the same drawing code as the "How it's made" film.
 *
 * With reduced motion it is not pinned: each step shows its finished drawing.
 */
export function ScrollJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState(chapters[0].id);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // A light spring smooths wheel steps; it settles within a moment of the last scroll.
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.0005 });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${COMPACT_BELOW - 1}px)`);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    assetUrls().forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    return () => mq.removeEventListener("change", sync);
  }, []);

  const draw = (p: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const t = Math.min(Math.max(p, 0), 1) * DURATION;
    svg.innerHTML = frameSVG(t, { compact, uid: "journey" });
    const id = chapterAt(t).id;
    setActive((prev) => (prev === id ? prev : id));
  };

  useMotionValueEvent(progress, "change", draw);
  // Redraw when the layout switches between full and compact frames.
  useEffect(() => draw(progress.get()), [compact]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the current step's button in view in the rail (it scrolls sideways on phones).
  useEffect(() => {
    const rail = railRef.current;
    const btn = rail?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!rail || !btn) return;
    const left = btn.offsetLeft; // the rail is the offset parent (relative)
    if (left < rail.scrollLeft || left + btn.offsetWidth > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left: left - 16, behavior: reduce ? "auto" : "smooth" });
    }
  }, [active, reduce]);

  const jump = (c: (typeof chapters)[number]) => {
    const el = sectionRef.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    // Land just past the photo card, where the step's drawing begins.
    const t = Math.min(c.start + c.lead + 0.5, c.end - 0.1);
    window.scrollTo({ top: top + (t / DURATION) * travel, behavior: reduce ? "auto" : "smooth" });
  };

  const current = chapters.find((c) => c.id === active) ?? chapters[0];
  const firstFrame = useMemo(() => frameSVG(0, { uid: "journey" }), []);

  if (reduce) {
    return (
      <section id="journey" aria-labelledby="journey-title" className="py-[clamp(32px,5vw,64px)]">
        <div className="wrap grid gap-6">
          <h2 id="journey-title" className="text-[clamp(26px,3.4vw,40px)]">
            From Aswan clay to the trench
          </h2>
          <ol className="grid gap-4 md:grid-cols-2">
            {steps.map((c) => (
              <li key={c.id} className="grid content-start gap-3 overflow-hidden rounded-card border border-line bg-surface">
                <svg
                  viewBox={`0 0 ${W} ${COMPACT_H}`}
                  className="block w-full bg-[#f2f2ef]"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: frameSVG(settled(c), { compact: true, uid: `j${c.id}` }) }}
                />
                <div className="grid gap-1 px-5 pb-5">
                  <span className="font-mono text-xs text-maroon">Step {pad(c.n!)}</span>
                  <h3 className="text-xl">{c.title}</h3>
                  <p className="text-[15px] text-muted">{c.caption}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="journey"
      aria-labelledby="journey-title"
      data-chapter={active}
      className="relative"
      style={{ height: `calc(100dvh + ${SCROLL_VH}vh)` }}
    >
      <div className="sticky top-[var(--header-h)] flex h-[calc(100dvh-var(--header-h))] flex-col justify-center gap-3 py-3">
        <div className="wrap grid w-full gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 id="journey-title" className="text-[clamp(22px,2.6vw,32px)]">
              From Aswan clay to the trench
            </h2>
            <p className="text-[14px] text-muted">
              <span aria-hidden="true">↓ </span>Scroll to move the pipe along. Stop, and it waits for you.
            </p>
          </div>

          <div
            className="mx-auto w-full overflow-hidden rounded-card bg-[#f2f2ef] shadow-card"
            style={{
              maxWidth: compact
                ? undefined
                : `calc((100dvh - var(--header-h) - 190px) * ${W / H})`,
            }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${compact ? COMPACT_H : H}`}
              className="block h-auto w-full"
              role="img"
              aria-label="How a SWEILLEM vitrified clay pipe is made, from Aswan clay to an installed sewer line. The current step is described below."
              dangerouslySetInnerHTML={{ __html: firstFrame }}
            />
          </div>

          {compact && (
            <p className="min-h-[7.5em] text-[15px] leading-relaxed text-muted" aria-hidden="true">
              {current.n && <b className="me-2 font-mono text-maroon">{pad(current.n)}</b>}
              <strong className="font-display text-lg text-ink">{current.title}</strong>
              <span className="mt-1 block">{current.caption}</span>
            </p>
          )}
          <p className="sr-only" aria-live="polite">
            {current.n ? `Step ${current.n}: ` : ""}
            {current.title}. {current.caption}
          </p>

          <ol
            ref={railRef}
            aria-label="Jump to a step"
            className="relative flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]"
          >
            {steps.map((c) => (
              <li key={c.id} className="flex-none snap-start">
                <button
                  type="button"
                  onClick={() => jump(c)}
                  aria-current={c.id === active ? "step" : undefined}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-[14px] font-semibold transition-colors hover:border-maroon aria-[current=step]:border-maroon aria-[current=step]:bg-maroon aria-[current=step]:text-on-maroon"
                >
                  <span className="font-mono font-medium">{pad(c.n!)}</span>
                  {c.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
