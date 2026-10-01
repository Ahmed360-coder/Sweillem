"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { duration, ease } from "@/lib/motion";

/**
 * Stat count-up (M06). The final value is in the server HTML, so search
 * engines, no-JS visitors and reduced motion all see the real number.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const match = /^(\d+)(.*)$/.exec(value);
    if (!el || !match || reduce || !inView) return;
    const [, digits, suffix] = match;
    const target = Number(digits);
    const from = target > 1000 ? target - 120 : 0;
    const controls = animate(from, target, {
      duration: duration.story * 1.6,
      ease: ease.glaze,
      onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
