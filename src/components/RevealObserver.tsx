"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveal for server-rendered pages: any element with the `reveal`
 * class fades up once it enters the viewport. One observer per page, no
 * scroll listeners (design/taste-audit.md). Reduced motion shows everything
 * at once (globals.css), and a <noscript> style in the layout covers no-JS.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal:not([data-in])");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => (el.dataset.in = ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
