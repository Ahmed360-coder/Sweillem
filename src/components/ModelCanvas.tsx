"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { createStage, type OrbitOptions, type Stage } from "@/lib/three-stage";

/**
 * A canvas holding a 3D product model the visitor can turn: drag (a sideways
 * swipe on a phone, so the page still scrolls), or focus it and use the arrow
 * keys. three.js loads only when the canvas comes near the screen. If WebGL is
 * not available, `onFail` lets the caller show its flat drawing instead.
 */
export function ModelCanvas({
  label,
  orbit,
  onReady,
  onFail,
  className = "",
}: {
  /** Accessible description of what the model shows. */
  label: string;
  orbit: OrbitOptions;
  onReady: (stage: Stage | null) => void;
  onFail: () => void;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);
  const reduce = useReducedMotion() ?? false;
  const [touched, setTouched] = useState(false);
  // The props are read once, when the stage is made.
  const init = useRef({ orbit, onReady, onFail, reduce });

  useEffect(() => {
    const el = canvas.current!;
    const { orbit, onReady, onFail, reduce } = init.current;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        import("three")
          .then((THREE) => {
            if (cancelled) return;
            stage.current = createStage(THREE, el, orbit, reduce);
            onReady(stage.current);
          })
          .catch(() => !cancelled && onFail());
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      if (stage.current) {
        onReady(null);
        stage.current.dispose();
        stage.current = null;
      }
    };
  }, []);

  useEffect(() => stage.current?.setReducedMotion(reduce), [reduce]);

  const step = Math.PI / 12;
  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvas}
        role="img"
        aria-label={`${label} Drag or use the arrow keys to turn it.`}
        tabIndex={0}
        data-swipe-ignore=""
        onPointerDown={() => setTouched(true)}
        onKeyDown={(e) => {
          const d = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, -step / 2], ArrowDown: [0, step / 2] }[e.key];
          if (!d) return;
          e.preventDefault();
          setTouched(true);
          stage.current?.nudge(d[0], d[1]);
        }}
        className="block h-full w-full cursor-grab touch-pan-y outline-none select-none active:cursor-grabbing focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-maroon"
      />
      <p
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface/85 px-3 py-1 text-xs font-semibold text-muted shadow-card backdrop-blur-sm transition-opacity duration-500 ${touched ? "opacity-0" : "opacity-100"}`}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 4 0 0 0 16 2.5" />
          <path d="m16 12 3 2.5-3.5 1.5" />
          <path d="M21 12a9 4 0 0 0-16-2.5" />
        </svg>
        Drag to turn
      </p>
    </div>
  );
}
