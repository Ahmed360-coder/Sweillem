"use client";

import { useRef, useState } from "react";

/** Chapter start times, from the film's caption file (public/video/how-its-made.en.vtt). */
const chapters = [
  { t: 5, label: "Raw material" },
  { t: 15, label: "Quality control" },
  { t: 22, label: "Moulding" },
  { t: 33, label: "Drying" },
  { t: 43, label: "Glazing" },
  { t: 53, label: "Firing" },
  { t: 66, label: "Joints" },
  { t: 75, label: "Delivery" },
  { t: 84, label: "Installation" },
];

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * The "How it's made" film (made in its own thread, branch
 * claude/project-thread-n5u898). A native player with captions; nothing
 * downloads until the visitor presses play, and it never autoplays.
 */
export function FilmPlayer({ id = "film" }: { id?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [current, setCurrent] = useState(-1);

  const jump = (t: number) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = t;
    void v.play().catch(() => {});
  };

  return (
    <figure id={id} className="grid gap-4">
      <div className="overflow-hidden rounded-card bg-glaze shadow-card">
        <video
          ref={ref}
          controls
          playsInline
          preload="none"
          poster="/video/how-its-made-poster.png"
          className="block aspect-video w-full"
          aria-describedby={`${id}-caption`}
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            let i = -1;
            chapters.forEach((c, n) => t >= c.t && (i = n));
            if (i !== current) setCurrent(i);
          }}
        >
          <source src="/video/how-its-made.mp4" type="video/mp4" />
          <track kind="captions" src="/video/how-its-made.en.vtt" srcLang="en" label="English" default />
        </video>
      </div>
      <figcaption id={`${id}-caption`} className="grid gap-3">
        <span className="text-[15px] text-muted">
          An animated film, 1 minute 45 seconds, with captions. It follows one pipe from the Aswan quarry to a sewer line
          in the ground. The installation scenes are illustrative.
        </span>
        <span className="flex flex-wrap gap-2" role="group" aria-label="Jump to a chapter">
          {chapters.map((c, i) => (
            <button
              key={c.label}
              type="button"
              aria-pressed={i === current}
              onClick={() => jump(c.t)}
              className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 text-[13px] font-medium transition-transform duration-100 hover:border-ink active:translate-y-px aria-pressed:border-maroon aria-pressed:bg-maroon aria-pressed:text-on-maroon"
            >
              <span className="font-mono text-[11px] opacity-70">{clock(c.t)}</span>
              {c.label}
            </button>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
