"use client";

import { useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { assetUrls, chapterAt, COMPACT_H, DURATION, frameSVG, getChapters, H, W } from "@/lib/journey/frames";

const pad = (n: number) => String(n).padStart(2, "0");
/** Scroll length per second of the journey's timeline, in vh. */
const VH_PER_SECOND = 8;
/** The journey starts once the intro title has drawn in, so the first screen is never blank. */
const T0 = 1.8;
const SCROLL_VH = Math.round((DURATION - T0) * VH_PER_SECOND);
/** Below this width the frame drops its caption band and the caption shows as text. */
const COMPACT_BELOW = 720;

const chapters = getChapters("en");
const steps = chapters.filter((c) => c.n);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * Portrait camera for phones: a window as tall as the scene that pans left to
 * right through each step as the visitor scrolls, so the drawing fills the
 * screen instead of sitting in a thin strip. The scenes read left to right
 * (quarry to factory, extruder to dryer, kiln to truck), so the pan follows
 * the action. Photo cards pan from the step title to the photo, then swing
 * back to the start of the drawing as the photo fades.
 */
function portraitViewBox(t: number, aspect: number) {
  const ch = chapterAt(t);
  // A window under half the scene wide: the drawing is more than twice the size
  // it would be as a full-width strip, and whole machines still fit. The extra
  // height is open sky above the scene, where the step's caption sits, so the
  // ground stays at the bottom.
  const target = ch.n ? 800 : 1300;
  let vw = Math.min(W, target);
  let vh = vw / aspect;
  if (vh < COMPACT_H) {
    vh = COMPACT_H;
    vw = Math.min(W, vh * aspect);
  }
  const y = COMPACT_H - vh;
  const box = (x: number) => `${x.toFixed(1)} ${y.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`;
  // Intro and closing cards are centred compositions: show them whole.
  if (!ch.n) return box((W - vw) / 2);
  const lt = t - ch.start;
  const d = ch.end - ch.start;
  let p: number;
  if (ch.lead && lt < ch.lead + 0.3) {
    p = lt < ch.lead - 0.5 ? ease(seg(lt, 0.3, ch.lead - 0.6)) : 1 - ease(seg(lt, ch.lead - 0.5, ch.lead + 0.3));
  } else {
    p = ease(seg(lt, ch.lead + 0.6, d - 0.6));
  }
  return box((W - vw) * p);
}

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
  const stageRef = useRef<HTMLDivElement>(null);
  /** Width over height of the stage on phones. */
  const aspectRef = useRef(0.7);
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
    const t = T0 + Math.min(Math.max(p, 0), 1) * (DURATION - T0);
    svg.innerHTML = frameSVG(t, { compact, uid: "journey" });
    svg.setAttribute("viewBox", compact ? portraitViewBox(t, aspectRef.current) : `0 0 ${W} ${H}`);
    const id = chapterAt(t).id;
    setActive((prev) => (prev === id ? prev : id));
  };

  useMotionValueEvent(progress, "change", draw);
  // Redraw when the layout switches between full and compact frames.
  useEffect(() => draw(progress.get()), [compact]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track the phone stage's shape so the camera window matches it.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !compact) return;
    const ro = new ResizeObserver(() => {
      if (el.clientHeight) aspectRef.current = el.clientWidth / el.clientHeight;
      draw(progress.get());
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [compact]); // eslint-disable-line react-hooks/exhaustive-deps

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
    window.scrollTo({ top: top + ((t - T0) / (DURATION - T0)) * travel, behavior: reduce ? "auto" : "smooth" });
  };

  const current = chapters.find((c) => c.id === active) ?? chapters[0];
  const firstFrame = useMemo(() => frameSVG(T0, { uid: "journey" }), []);

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
        <div className={`wrap w-full gap-3 ${compact ? "flex h-full flex-col" : "grid"}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 id="journey-title" className="text-[clamp(22px,2.6vw,32px)]">
              From Aswan clay to the trench
            </h2>
            <p className="text-[14px] text-muted">
              <span aria-hidden="true">↓ </span>
              {compact ? "Scroll to move the pipe along." : "Scroll to move the pipe along. Stop, and it waits for you."}
            </p>
          </div>

          <div
            ref={stageRef}
            className={`relative mx-auto w-full overflow-hidden rounded-card bg-[#f2f2ef] shadow-card ${compact ? "min-h-0 flex-1" : ""}`}
            style={{
              maxWidth: compact
                ? undefined
                : `calc((100dvh - var(--header-h) - 190px) * ${W / H})`,
            }}
          >
            {compact && current.n && (
              <p
                key={current.id}
                className="journey-caption absolute inset-x-0 top-0 grid gap-1 p-4 text-[14px] leading-normal text-muted"
                aria-hidden="true"
              >
                <span className="flex items-baseline gap-2">
                  <b className="font-display text-[28px] leading-none font-semibold text-maroon">{pad(current.n)}</b>
                  <strong className="font-display text-xl text-ink">{current.title}</strong>
                </span>
                <span>{current.caption}</span>
              </p>
            )}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${compact ? COMPACT_H : H}`}
              preserveAspectRatio="xMidYMid meet"
              className={`block w-full ${compact ? "h-full" : "h-auto"}`}
              role="img"
              aria-label="How a SWEILLEM vitrified clay pipe is made, from Aswan clay to an installed sewer line. The current step is described below."
              dangerouslySetInnerHTML={{ __html: firstFrame }}
            />
          </div>

          <p className="sr-only" aria-live="polite">
            {current.n ? `Step ${current.n}: ` : ""}
            {current.title}. {current.caption}
          </p>

          <ol
            ref={railRef}
            aria-label="Jump to a step"
            className="relative flex flex-none snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]"
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
