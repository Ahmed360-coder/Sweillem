"use client";

import { animate, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ease } from "@/lib/motion";

export interface ProcessStep {
  title: string;
  text: string;
  facts: string[];
  image: { src: string; alt: string; contain?: boolean };
  /** Show the kiln dial while this step is current (M15). */
  kiln?: boolean;
  link?: { href: string; label: string };
  /** A closing step outside the numbered sequence (e.g. delivery). */
  after?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Process journey (M14, M15). On wide screens the photo stays put while the
 * steps scroll past; the photo, step number and rail follow the step in the
 * middle of the screen, and the kiln dial heats to 1200 °C on the firing
 * step. On phones each step carries its own photo.
 */
export function ProcessJourney({ steps }: { steps: ProcessStep[] }) {
  const [active, setActive] = useState(0);
  const numbered = steps.filter((s) => !s.after).length;
  const listRef = useRef<HTMLOListElement>(null);
  const dialRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const hot = !!steps[active].kiln;

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-step]");
    if (!items) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = dialRef.current;
    if (!el) return;
    if (!hot || reduce) {
      el.textContent = hot ? "1200" : "0";
      return;
    }
    const controls = animate(0, 1200, {
      duration: 1.4,
      ease: ease.glaze,
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [hot, reduce]);

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-14">
      <div className="hidden md:block">
        <div className="sticky top-[calc(var(--header-h)+24px)]">
          <div className="relative aspect-[4/4.2] overflow-hidden rounded-card bg-glaze shadow-card">
            {steps.map((s, i) => (
              <Image
                key={s.image.src}
                src={s.image.src}
                alt=""
                fill
                sizes="(min-width: 1180px) 560px, 50vw"
                className={`transition-[opacity,transform] duration-[900ms] ease-kiln ${
                  s.image.contain ? "drawing bg-white object-contain p-6" : "object-cover"
                } ${i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"}`}
              />
            ))}
            <span
              aria-hidden="true"
              className="absolute start-4 top-4 rounded-inner bg-black/50 px-3 py-1.5 font-display text-[clamp(32px,3.6vw,48px)] leading-none font-bold text-white tabular-nums backdrop-blur-sm"
            >
              {steps[active].after ? "+" : pad(active + 1)}
            </span>
            <div
              aria-hidden="true"
              data-hot={hot || undefined}
              className={`absolute end-4 bottom-4 grid w-[150px] justify-items-center rounded-inner bg-black/55 px-3 pt-3 pb-2 text-white backdrop-blur-sm transition-[opacity,transform] duration-500 ease-glaze ${
                hot ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              <svg viewBox="0 0 120 70" className="w-full">
                <defs>
                  <linearGradient id="kiln-heat">
                    <stop offset="0" stopColor="#f5b041" />
                    <stop offset=".6" stopColor="#e4572e" />
                    <stop offset="1" stopColor="#b3130b" />
                  </linearGradient>
                </defs>
                <path d="M12 62a48 48 0 1 1 96 0" fill="none" stroke="rgb(255 255 255 / .2)" strokeWidth="9" strokeLinecap="round" />
                <path
                  className="kiln-arc"
                  d="M12 62a48 48 0 1 1 96 0"
                  fill="none"
                  stroke="url(#kiln-heat)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  pathLength={100}
                />
              </svg>
              <span className="-mt-7 font-display text-2xl font-bold tabular-nums">
                <span ref={dialRef}>0</span> °C
              </span>
              <span className="font-mono text-[10px] tracking-[.1em] text-white/75 uppercase">Kiln temperature</span>
            </div>
          </div>
          <ol aria-hidden="true" className="mt-4 flex gap-1.5">
            {steps.map((s, i) => (
              <li key={s.title} className="h-1 flex-1 overflow-hidden rounded bg-line">
                <span
                  className={`block h-full bg-maroon transition-transform duration-500 ease-glaze ltr:origin-left rtl:origin-right ${
                    i <= active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ol ref={listRef} className="grid gap-6 md:gap-0">
        {steps.map((s, i) => (
          <li
            key={s.title}
            data-step={i}
            aria-current={i === active ? "step" : undefined}
            className="grid content-center gap-4 md:min-h-[78vh] md:py-10"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-inner bg-glaze md:hidden">
              <Image
                src={s.image.src}
                alt={s.image.alt}
                fill
                sizes="100vw"
                className={s.image.contain ? "drawing bg-white object-contain p-4" : "object-cover"}
              />
            </div>
            <p className="font-mono text-xs font-medium tracking-[.12em] text-maroon uppercase">
              {s.after ?? (
                <>
                  Step {pad(i + 1)}
                  <span className="text-muted"> of {pad(numbered)}</span>
                </>
              )}
            </p>
            <h3 className="text-[clamp(26px,3vw,38px)]">{s.title}</h3>
            <p className="lede">{s.text}</p>
            <ul className="flex flex-wrap gap-2" aria-label={`${s.title} facts`}>
              {s.facts.map((f) => (
                <li key={f} className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[12.5px]">
                  {f}
                </li>
              ))}
            </ul>
            {s.link && (
              <Link href={s.link.href} className="link w-fit">
                {s.link.label}
              </Link>
            )}
            <span className="sr-only hidden md:inline">Photo: {s.image.alt}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
