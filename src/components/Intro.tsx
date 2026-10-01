"use client";

import { useEffect, useRef } from "react";
import { jointSeats, pipesFrame } from "@/lib/intro-pipes";
import { Logo } from "./Logo";

/**
 * M00 intro: a 3-second brand moment on the first visit per session
 * (design/intro-spec.md). The overlay is server-rendered with CSS keyframes, so
 * it starts before hydration and ends on time even if hydration is slow. JS adds
 * the pipe assembly, embers, pointer tilt, the year counter and the skip handlers.
 *
 * Whether it shows at all is decided by the inline script in the root layout
 * (introGateScript), which sets <html data-intro="play"> only when the landing
 * page is "/" and the intro has not played in this session.
 */
const HOLD_MS = 3000;
const HOLD_REDUCED_MS = 900;
const EXIT_MS = 920;
const EXIT_REDUCED_MS = 220;

export function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const yearRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root || html.dataset.intro !== "play") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let raf = 0;
    let done = false;

    // Hand off to the page: "exit" runs the dissolve in intro.css, "done" removes the overlay.
    // The gate script schedules the same steps, so the intro ends on time even before hydration.
    const finish = () => {
      if (done) return;
      done = true;
      if (html.dataset.intro === "play") html.dataset.intro = "exit";
      timers.push(
        window.setTimeout(() => {
          if (html.dataset.intro === "exit") html.dataset.intro = "done";
        }, reduced ? EXIT_REDUCED_MS : EXIT_MS),
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    root.addEventListener("click", finish);
    document.addEventListener("keydown", onKey);

    if (reduced) {
      timers.push(window.setTimeout(finish, HOLD_REDUCED_MS));
    } else {
      root.dataset.live = "";
      const svg = svgRef.current;
      const year = yearRef.current;
      const t0 = performance.now();
      const loop = (now: number) => {
        if (done) return;
        const t = (now - t0) / 1000;
        if (svg) {
          const k = jointSeats.reduce((acc, seat) => acc + Math.max(0, 1 - Math.abs(t - (seat + 0.04)) / 0.12), 0);
          const shake = k ? `translate(${((Math.random() - 0.5) * 10 * k).toFixed(1)} ${((Math.random() - 0.5) * 6 * k).toFixed(1)})` : "";
          svg.innerHTML = `<g transform="${shake}">${pipesFrame(t)}</g>`;
          if (t > 1.1 && !svg.dataset.settled) svg.dataset.settled = "";
        }
        if (year) {
          const p = Math.min(1, Math.max(0, (t - 1.85) / 0.75));
          year.textContent = String(1900 + Math.round(35 * (1 - Math.pow(1 - p, 3))));
        }
        if (t < 3) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      timers.push(window.setTimeout(finish, HOLD_MS));
    }

    // Pointer tilt: the logo turns toward the pointer; photo and glow drift against it.
    const onMove = (e: PointerEvent) => {
      if (reduced) return;
      const r = root.getBoundingClientRect();
      root.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      root.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    };
    root.addEventListener("pointermove", onMove);

    const stopEmbers = reduced || !canvasRef.current ? () => {} : embers(canvasRef.current, root, () => done);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      stopEmbers();
      root.removeEventListener("click", finish);
      root.removeEventListener("pointermove", onMove);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} id="intro" className="intro">
      <div className="intro-art" aria-hidden="true">
        {/* Photo is a CSS background so it only downloads when the intro actually plays. */}
        <div className="intro-bg">
          <div className="intro-photo" />
        </div>
        <div className="intro-shade" />
        <div className="intro-glow" />
        <canvas ref={canvasRef} className="intro-embers" />
        <div className="intro-center">
          <svg className="intro-hex" viewBox="0 0 100 115">
            <path pathLength={100} d="M50 2l46 26.5v58L50 113 4 86.5v-58z" />
            <path className="h2" pathLength={100} d="M50 2l46 26.5v58L50 113 4 86.5v-58z" />
          </svg>
          <div className="intro-logo">
            <Logo title={null} />
          </div>
          <p className="intro-tag">
            <span>Since</span>
            <b ref={yearRef}>1935</b>
            <span>·</span>
            <span>Cairo</span>
          </p>
          <div className="intro-slot">
            <svg
              ref={svgRef}
              className="intro-pipes"
              viewBox="0 0 1200 160"
              dangerouslySetInnerHTML={{ __html: pipesFrame(9) }}
            />
          </div>
        </div>
      </div>
      <button type="button" className="intro-skip" tabIndex={-1} aria-hidden="true">
        Skip intro
      </button>
    </div>
  );
}

/** Kiln embers rising on a small canvas; they drift with the pointer. */
function embers(cv: HTMLCanvasElement, root: HTMLElement, stopped: () => boolean) {
  const ctx = cv.getContext("2d");
  if (!ctx) return () => {};
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = r.width * dpr;
  cv.height = r.height * dpr;
  ctx.scale(dpr, dpr);
  const P = Array.from({ length: 46 }, () => ({
    x: Math.random() * r.width,
    y: r.height + Math.random() * r.height * 0.6,
    v: 0.4 + Math.random() * 1.3,
    s: 0.6 + Math.random() * 1.8,
    a: 0.3 + Math.random() * 0.6,
  }));
  let raf = 0;
  const loop = () => {
    if (stopped()) return;
    ctx.clearRect(0, 0, r.width, r.height);
    const px = Number(root.style.getPropertyValue("--px")) || 0;
    for (const p of P) {
      p.y -= p.v;
      p.x += px * 0.8 + Math.sin(p.y / 40) * 0.3;
      if (p.y < -10) {
        p.y = r.height + 10;
        p.x = Math.random() * r.width;
      }
      ctx.fillStyle = `rgba(255,${120 + Math.round(p.a * 80)},70,${p.a * (p.y / r.height)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, 7);
      ctx.fill();
    }
    raf = requestAnimationFrame(loop);
  };
  loop();
  return () => cancelAnimationFrame(raf);
}

/**
 * Inline script for <head>: decides before first paint whether the intro plays.
 * Plays once per session, only when the visitor lands on "/", and schedules
 * the hand-off (play, exit, done) so it never depends on hydration.
 */
export const introGateScript = `(()=>{try{var d=document.documentElement,k="sweillem.intro";if(location.pathname==="/"&&!sessionStorage.getItem(k)){sessionStorage.setItem(k,"1");d.dataset.intro="play";var r=matchMedia("(prefers-reduced-motion: reduce)").matches,h=r?${HOLD_REDUCED_MS}:${HOLD_MS},x=r?${EXIT_REDUCED_MS}:${EXIT_MS};setTimeout(function(){if(d.dataset.intro==="play")d.dataset.intro="exit"},h);setTimeout(function(){if(d.dataset.intro==="exit")d.dataset.intro="done"},h+x)}else{d.dataset.intro="done"}}catch(e){document.documentElement.dataset.intro="done"}})()`;
