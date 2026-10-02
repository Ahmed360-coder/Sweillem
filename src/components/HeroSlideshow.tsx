"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface HeroSlide {
  src: string;
  alt: string;
  kicker: string;
  place: string;
}

const SLIDE_MS = 5500;

/**
 * Home hero photos from SWEILLEM sites in several countries. Each photo drifts
 * slowly while it shows; the next one rises in over it with a glaze sweep, and
 * the caption changes with it. Only transform and opacity animate. Tapping
 * the photo shows the next one, and after the last it starts again from the
 * first. It pauses on hover, while the tab is hidden, with the pause button,
 * and never plays by itself for people who ask for reduced motion.
 */
const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(reducedQuery).matches;

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  // The first photo waits out the intro (about 3.9 s) so it still gets its full turn.
  const firstTurn = useRef(true);

  // The other photos load once the page has finished loading, so they don't
  // compete with the first photo and the page's own files.
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const go = () => setWarm(true);
    if (document.readyState === "complete") return void window.setTimeout(go, 0);
    window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  const playing = !paused && !hovered && !reduced;
  useEffect(() => {
    if (!playing) return;
    const wait = firstTurn.current && document.documentElement.dataset.intro !== "done" ? 3900 : 0;
    const id = window.setTimeout(() => {
      firstTurn.current = false;
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS + wait);
    return () => window.clearTimeout(id);
  }, [playing, index, slides.length]);

  const current = slides[index];
  const next = (index + 1) % slides.length;
  return (
    <div
      className="absolute inset-0"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        className="absolute inset-0 isolate overflow-hidden rounded-full bg-glaze shadow-card"
        role="group"
        aria-roledescription="slideshow"
        aria-label="Project photos"
      >
        {slides.map((s, i) => (
          <div
            key={s.src}
            data-active={i === index ? "" : undefined}
            aria-hidden={i !== index}
            className="hero-slide absolute inset-0"
          >
            {(i === 0 || i === index || warm) && (
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="hero-slide-img object-cover"
              />
            )}
          </div>
        ))}
        <span key={index} aria-hidden="true" className="hero-sweep pointer-events-none absolute inset-y-0 -start-1/2 w-1/2" />
      </div>
      {/* Outside the clipped circle so its focus ring shows; the waiting time starts over with each tap. */}
      <button
        type="button"
        onClick={() => {
          firstTurn.current = false;
          setIndex(next);
        }}
        aria-label={`Next photo: ${slides[next].place}`}
        className="absolute inset-0 cursor-pointer rounded-full"
      />

      <p
        aria-live={playing ? "off" : "polite"}
        className="pointer-events-none absolute start-3 bottom-3 z-10 grid gap-0.5 overflow-hidden rounded-inner bg-surface px-4 py-3 shadow-card md:-start-[4%] md:bottom-[10%] md:min-w-[220px]"
      >
        <span key={index} className="hero-caption grid gap-0.5">
          <small className="font-mono text-[12px] font-medium tracking-[.1em] text-muted uppercase">{current.kicker}</small>
          <strong className="font-display text-base font-semibold">{current.place}</strong>
        </span>
      </p>

      <div className="absolute start-0 top-[2%] z-10 flex items-center rounded-pill md:start-auto md:top-auto md:end-0 md:bottom-[2%] bg-[rgb(20_10_8/0.62)] p-0.5 backdrop-blur-sm">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Photo ${i + 1} of ${slides.length}: ${s.place}`}
            aria-current={i === index ? "true" : undefined}
            className="grid h-7 w-6 cursor-pointer place-items-center rounded-full"
          >
            <span className="relative h-1 w-3.5 overflow-hidden rounded-full bg-white/40">
              {i === index && (
                <span
                  key={`${index}-${playing}`}
                  className="hero-progress absolute inset-0 origin-left bg-white rtl:origin-right"
                  data-playing={playing ? "" : undefined}
                  style={{ animationDuration: `${SLIDE_MS}ms` }}
                />
              )}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          className="grid size-7 cursor-pointer place-items-center rounded-full text-white hover:bg-white/15"
        >
          {paused ? (
            <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
              <path d="M7 5v14l12-7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
