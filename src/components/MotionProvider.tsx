"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { duration, ease } from "@/lib/motion";

/** Every Motion animation honours the visitor's reduced-motion setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: duration.base, ease: ease.glaze }}>
      {children}
    </MotionConfig>
  );
}
