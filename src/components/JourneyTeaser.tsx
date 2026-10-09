"use client";

import Link from "next/link";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef } from "react";
import { frameSVG, getChapters, H, W } from "@/lib/journey/frames";

const steps = getChapters("en").filter((c) => c.n);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Timeline moment for a scroll position through the card: the nine steps share
 * the scroll evenly, and inside each step the pipe moves through its scene
 * (skipping the picture card each step opens on).
 */
function timeAt(p: number) {
  const q = clamp01((p - 0.1) / 0.8) * steps.length;
  const i = Math.min(steps.length - 1, Math.floor(q));
  const c = steps[i];
  const a = c.start + c.lead + 0.5;
  const b = c.end - 0.1;
  return a + (q - i) * (b - a);
}

/**
 * The home page's journey card. As the card crosses the screen, scrolling moves
 * the pipe from the quarry (step 01) to the trench (step 09), drawn by the same
 * code as the full journey on /process. It is not pinned, so the page scrolls
 * normally. Without JavaScript, and with reduced motion, it shows the kiln
 * (`initial`, rendered on the server).
 */
export function JourneyTeaser({ initial }: { initial: string }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });

  const draw = (p: number) => {
    if (reduce || !svgRef.current) return;
    svgRef.current.innerHTML = frameSVG(timeAt(p), { uid: "teaser" });
  };
  useMotionValueEvent(scrollYProgress, "change", draw);
  // Draw the step for wherever the page already is (a reload halfway down, a back navigation).
  useEffect(() => {
    if (reduce) {
      if (svgRef.current) svgRef.current.innerHTML = initial;
    } else draw(scrollYProgress.get());
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Link ref={cardRef} href="/process#journey" className="reveal group relative block overflow-hidden rounded-card bg-(--j-bg) shadow-card">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: initial }}
      />
      <span className="absolute start-3 top-3 flex items-center gap-3 rounded-full bg-ink/85 py-1 ps-1 pe-4 text-paper shadow-card backdrop-blur-sm sm:start-4 sm:top-4 sm:py-1.5 sm:ps-1.5 sm:pe-5">
        <span className="hex grid size-10 place-content-center bg-brand text-on-brand transition-transform duration-300 ease-set group-hover:scale-110 sm:size-12">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-display text-base font-semibold sm:text-lg">See the full journey</span>
      </span>
    </Link>
  );
}

/** "Scroll down and the pipe moves", hidden with reduced motion, where the card stays on the kiln. Pure CSS, so server and client HTML match. */
export function JourneyScrollHint() {
  return <span className="motion-reduce:hidden"> Scroll down and the pipe moves with you.</span>;
}
