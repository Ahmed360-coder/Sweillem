"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// How a roof tile is made, told on scroll like the pipe journey on /process.
// Step text is SWEILLEM's published clay process (content/company.ts); the
// roof-tile specifics are waiting on SWEILLEM (docs/content-gaps.md 8.2).

export interface TileStep {
  id: string;
  title: string;
  text: string;
  fact?: string;
}

const tiles = {
  terracotta: "/images/roof-tiles/tile-terracotta-cutout.webp",
  blue: "/images/roof-tiles/tile-blue-cutout.webp",
  black: "/images/roof-tiles/tile-black-cutout.webp",
};

function Stage({ step }: { step: number }) {
  const on = (i: number) => (step === i ? "opacity-100" : "opacity-0");
  return (
    <div className="tile-stage relative h-full w-full overflow-hidden rounded-card border border-line" data-step={step}>
      {/* 0 · raw clay */}
      <svg viewBox="0 0 200 160" className={`absolute inset-0 m-auto h-[62%] transition-opacity duration-500 ${on(0)}`} aria-hidden="true">
        <defs>
          <radialGradient id="clay-lump" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#b98559" />
            <stop offset="1" stopColor="#7b5236" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="142" rx="78" ry="10" fill="rgb(0 0 0 / .18)" />
        <path d="M30 128c-6-30 10-58 34-70 18-24 54-30 78-12 26 6 40 34 34 60-2 16-12 26-30 26H52c-12 0-20-0-22-4z" fill="url(#clay-lump)" />
        <g fill="#5e3d27" opacity=".35">
          <circle cx="70" cy="90" r="2.5" />
          <circle cx="118" cy="76" r="2" />
          <circle cx="140" cy="108" r="3" />
          <circle cx="92" cy="116" r="2" />
        </g>
      </svg>
      {/* 1-5 · the tile itself, changing as it goes */}
      <div className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${step >= 1 && step <= 4 ? "opacity-100" : "opacity-0"}`}>
        <div className="tile-body relative h-[78%]">
          <Image src={tiles.terracotta} alt="" width={420} height={720} className="tile-raw h-full w-auto" sizes="300px" />
          <Image src={tiles.terracotta} alt="" width={420} height={720} className="tile-col absolute inset-0 h-full w-auto" sizes="300px" />
        </div>
      </div>
      {/* 1 · press plate */}
      <div className={`press absolute inset-x-[22%] top-0 h-[9%] rounded-b-lg bg-slate transition-opacity duration-300 ${on(1)}`} aria-hidden="true" />
      {/* 2 · warm air */}
      <svg viewBox="0 0 200 160" className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${on(2)}`} aria-hidden="true" preserveAspectRatio="none">
        {[30, 60, 90, 120].map((y, i) => (
          <path key={y} className="air" style={{ animationDelay: `${i * 0.35}s` }} d={`M-20 ${y} q25 -8 50 0 t50 0 t50 0 t50 0 t50 0`} fill="none" stroke="var(--clay)" strokeWidth="1.4" opacity=".55" />
        ))}
      </svg>
      {/* 4 · kiln */}
      <div className={`kiln absolute inset-0 transition-opacity duration-700 ${on(4)}`} aria-hidden="true" />
      <p className={`absolute end-4 top-4 font-mono text-2xl font-semibold text-white drop-shadow transition-opacity duration-500 ${on(4)}`} aria-hidden="true">
        1200 °C
      </p>
      {/* 5 · ready: the three colours */}
      <div className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${on(5)}`} aria-hidden="true">
        <div className="flex h-[70%] items-end gap-[3%]">
          {Object.values(tiles).map((src, i) => (
            <Image key={src} src={src} alt="" width={420} height={720} sizes="160px" className="h-full w-auto drop-shadow-lg" style={{ transform: `translateY(${i === 1 ? -6 : 0}%)` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TileJourney({ steps }: { steps: TileStep[] }) {
  const [step, setStep] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="sticky top-[calc(var(--header-h)+8px)] z-10 h-[42vh] self-start md:top-[calc(var(--header-h)+24px)] md:h-[min(70vh,560px)]">
        <Stage step={step} />
        <ol className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
          {steps.map((s, i) => (
            <li key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-maroon" : "w-1.5 bg-line"}`} />
          ))}
        </ol>
      </div>
      <ol className="grid gap-[28vh] py-[8vh] md:py-[20vh]">
        {steps.map((s, i) => (
          <li
            key={s.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-i={i}
            aria-current={i === step ? "step" : undefined}
            className="grid gap-3 border-s-2 border-line ps-5 transition-colors duration-300 aria-[current=step]:border-maroon"
          >
            <p className="font-mono text-xs tracking-[.12em] text-maroon uppercase">
              Step {i + 1} of {steps.length}
            </p>
            <h3 className="text-[clamp(24px,3vw,34px)]">{s.title}</h3>
            <p className="max-w-[48ch] text-[17px] leading-relaxed text-muted">{s.text}</p>
            {s.fact && <p className="font-mono text-sm font-semibold">{s.fact}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
