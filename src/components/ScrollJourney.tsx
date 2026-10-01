"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { assetUrls, chapterAt, COMPACT_H, DURATION, frameSVG, getChapters, W } from "@/lib/journey/frames";

const pad = (n: number) => String(n).padStart(2, "0");
/** Scroll length per second of the journey's timeline, in vh. */
const VH_PER_SECOND = 10;
/** The journey starts once the intro title has drawn in, so the first screen is never blank. */
const T0 = 1.8;
const SCROLL_VH = Math.round((DURATION - T0) * VH_PER_SECOND);

const chapters = getChapters("en");
const steps = chapters.filter((c) => c.n);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * The camera: which part of the scene fills the screen.
 *
 * Landscape screens see the whole scene. Portrait screens (phones) see a window
 * under half the scene wide that pans left to right through each step as the
 * visitor scrolls, so the drawing fills the screen at more than twice the size.
 * The scenes read left to right (quarry to factory, extruder to dryer, kiln to
 * truck), so the pan follows the action. Picture cards pan from the step title to
 * the picture, then swing back to the start of the drawing as the picture fades.
 *
 * Extra height is open sky above the scene, where the explanation sits, so the
 * ground stays at the bottom of the screen.
 */
function cameraViewBox(t: number, aspect: number) {
  const ch = chapterAt(t);
  const portrait = aspect < 1.1;
  const target = !portrait ? W : ch.n ? 720 : 1300;
  let vw = Math.min(W, target);
  let vh = vw / aspect;
  if (vh < COMPACT_H) {
    vh = COMPACT_H;
    vw = Math.min(W, vh * aspect);
  }
  // Lift the ground clear of the step buttons at the bottom when there is sky to spare.
  const y = COMPACT_H - vh + (vh > COMPACT_H * 1.15 ? vh * 0.08 : 0);
  const box = (x: number) => `${x.toFixed(1)} ${y.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`;
  // Intro and closing cards are centred compositions: show them whole.
  if (!ch.n || vw >= W) return box((W - vw) / 2);
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
 * The process journey, driven by scroll (M14). The section pins full screen
 * (the site header slides away while it is pinned) and its scroll position
 * becomes the journey's timeline: scrolling down moves the pipe from the Aswan
 * quarry through the kiln to the trench, scrolling up runs it back, and it stays
 * put when the visitor stops. Each step's explanation appears as the step
 * begins. Frames come from frameSVG(t), the same drawing code as the
 * "How it's made" animation.
 *
 * With reduced motion it is not pinned: each step shows its finished drawing.
 */
export function ScrollJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  /** Width over height of the screen-filling stage. */
  const aspectRef = useRef(16 / 10);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(chapters[0].id);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // A light spring smooths wheel steps; it settles within a moment of the last scroll.
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 32, restDelta: 0.0005 });

  const draw = (p: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const t = T0 + clamp01(p) * (DURATION - T0);
    svg.innerHTML = frameSVG(t, { compact: true, uid: "journey" });
    svg.setAttribute("viewBox", cameraViewBox(t, aspectRef.current));
    const id = chapterAt(t).id;
    setActive((prev) => (prev === id ? prev : id));
  };
  useMotionValueEvent(progress, "change", draw);

  // While the journey fills the screen, the site header slides out of the way.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const html = document.documentElement;
    if (p > 0 && p < 1) html.dataset.journey = "";
    else delete html.dataset.journey;
  });
  useEffect(() => () => void delete document.documentElement.dataset.journey, []);

  // Match the camera to the stage's shape, and warm the image cache.
  useEffect(() => {
    assetUrls().forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.clientHeight) aspectRef.current = el.clientWidth / el.clientHeight;
      draw(progress.get());
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

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
    // Land just past the picture card, where the step's drawing begins.
    const t = Math.min(c.start + c.lead + 0.5, c.end - 0.1);
    window.scrollTo({ top: top + ((t - T0) / (DURATION - T0)) * travel, behavior: reduce ? "auto" : "smooth" });
  };

  const current = chapters.find((c) => c.id === active) ?? chapters[0];
  const firstFrame = useMemo(() => frameSVG(T0, { compact: true, uid: "journey" }), []);

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
                  <p className="text-base sm:text-[15px] text-muted">{c.caption}</p>
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
      <h2 id="journey-title" className="sr-only">
        From Aswan clay to the trench
      </h2>
      {/* On purpose, the journey stays on the light paper colour in both themes: frameSVG draws a daylight scene. */}
      <div ref={stageRef} className="sticky top-0 h-[100dvh] overflow-hidden bg-[#f2f2ef] text-[#1c1818]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${COMPACT_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 block h-full w-full"
          role="img"
          aria-label="How a SWEILLEM vitrified clay pipe is made, from Aswan clay to an installed sewer line. Each step is explained alongside."
          dangerouslySetInnerHTML={{ __html: firstFrame }}
        />

        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 origin-left bg-maroon rtl:origin-right"
          style={{ scaleX: progress }}
        />

        {/* The explanation for the current step, in the open sky above the scene. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-[#f2f2ef] via-[#f2f2ef]/85 to-transparent pb-10">
          <div
            key={current.id}
            className="journey-caption wrap grid max-w-[1180px] gap-2 pt-[clamp(20px,5vh,56px)]"
            aria-hidden="true"
          >
            {current.n ? (
              <>
                <span className="font-mono text-[12px] font-medium tracking-[.14em] text-[#7a0404] uppercase">
                  Step {pad(current.n)} of {pad(steps.length)}
                </span>
                <p className="font-display text-[clamp(26px,4vw,48px)] leading-[1.05] font-semibold">{current.title}</p>
                <p className="max-w-[54ch] text-[clamp(15px,1.4vw,18px)] leading-normal text-[#5d5f62]">{current.caption}</p>
              </>
            ) : current.id === "intro" ? (
              // The intro scene carries its own title; this only says how it works.
              <p className="text-[clamp(15px,1.4vw,18px)] font-medium text-[#5d5f62]">
                <span aria-hidden="true">↓ </span>Scroll to move the pipe along. Stop, and it waits for you.
              </p>
            ) : (
              <>
                <p className="font-display text-[clamp(26px,4vw,48px)] leading-[1.05] font-semibold">{current.title}</p>
                <p className="max-w-[54ch] text-[clamp(15px,1.4vw,18px)] text-[#5d5f62]">{current.caption}</p>
              </>
            )}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {current.n ? `Step ${current.n}: ` : ""}
          {current.title}. {current.caption}
        </p>

        <div className="absolute inset-x-0 bottom-0 pb-[max(12px,env(safe-area-inset-bottom))]">
          <ol
            ref={railRef}
            aria-label="Jump to a step"
            className="wrap relative flex max-w-[1180px] snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
          >
            {steps.map((c) => (
              <li key={c.id} className="flex-none snap-start">
                <button
                  type="button"
                  onClick={() => jump(c)}
                  aria-current={c.id === active ? "step" : undefined}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[#d6d4cf] bg-white/90 px-3.5 text-[14px] font-semibold text-[#1c1818] shadow-sm backdrop-blur-sm transition-colors hover:border-[#7a0404] aria-[current=step]:border-[#7a0404] aria-[current=step]:bg-[#7a0404] aria-[current=step]:text-white"
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
