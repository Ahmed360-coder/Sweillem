"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Logo } from "./Logo";

/**
 * M00 intro: a 4-second title card on the first visit per session
 * (design/intro-spec.md). It says who SWEILLEM is and what they make beside a
 * drawn, glazed pipe end that builds itself like a technical drawing, then lifts
 * away like a curtain to reveal the home page. No photos: it is all SVG and type.
 *
 * Everything moves with CSS keyframes in intro.css, so it starts before hydration
 * and ends on time even if hydration is slow. JS only adds the skip handlers.
 *
 * Whether it shows at all is decided by the inline script in the root layout
 * (introGateScript), which sets <html data-intro="play"> only when the landing
 * page is "/" and the intro has not played in this session.
 */
const HOLD_MS = 4000;
const HOLD_REDUCED_MS = 1800;
const EXIT_MS = 950;
const EXIT_REDUCED_MS = 220;

// Facts SWEILLEM publishes on the home page, About Us and the product pages.
const facts = [
  { value: "1935", label: "Founded in Cairo" },
  { value: "10", label: "Product families" },
  { value: "EN 295", label: "European standard" },
];

export function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root || html.dataset.intro !== "play") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let done = false;

    // Hand off to the page: "exit" runs the curtain lift in intro.css, "done" removes the overlay.
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
    timers.push(window.setTimeout(finish, reduced ? HOLD_REDUCED_MS : HOLD_MS));

    return () => {
      timers.forEach(clearTimeout);
      root.removeEventListener("click", finish);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} id="intro" className="intro">
      <div className="intro-card" aria-hidden="true">
        <div className="intro-top">
          <div className="intro-logo">
            <Logo title={null} />
          </div>
        </div>

        <div className="intro-art">
          <PipeEnd />
        </div>

        <div className="intro-copy">
          <p className="intro-eyebrow">
            <span className="intro-hex" />
            Cairo · since 1935
          </p>
          <p className="intro-title">
            <span className="intro-line">
              <span>Vitrified clay pipes</span>
            </span>
            <span className="intro-line">
              <span>
                built for <em>100+ years.</em>
              </span>
            </span>
          </p>
          <p className="intro-lede">
            Glazed sewer and drainage pipes, made from Aswan clay and fired at 1200&nbsp;°C.
          </p>
        </div>

        <div className="intro-foot">
          <dl className="intro-facts">
            {facts.map((f, i) => (
              <div key={f.label} style={{ "--n": i } as CSSProperties}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="intro-reach">Egypt · Saudi Arabia · Germany</p>
        </div>
      </div>

      <div className="intro-progress" aria-hidden="true" />
      <button type="button" className="intro-skip" tabIndex={-1} aria-hidden="true">
        Skip
      </button>
    </div>
  );
}

/**
 * A pipe seen end-on, drawn like a technical drawing: guide rings and centre
 * lines first, then the glazed wall fills in, the red joint ring seats around it
 * and the size range is dimensioned across the bore (DN 125 to 1000, from the
 * product pages). Animated by intro.css.
 */
function PipeEnd() {
  return (
    <svg className="intro-pipe" viewBox="0 0 400 400">
      <defs>
        <radialGradient id="intro-glaze" cx="50%" cy="50%" r="50%">
          <stop offset="0.62" stopColor="#2a160f" />
          <stop offset="0.8" stopColor="#6b3a26" />
          <stop offset="0.93" stopColor="#4a2a1c" />
          <stop offset="1" stopColor="#2a160f" />
        </radialGradient>
        <radialGradient id="intro-bore" cx="46%" cy="42%" r="60%">
          <stop offset="0" stopColor="#0b0605" />
          <stop offset="1" stopColor="#1d100c" />
        </radialGradient>
        <marker id="intro-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1 9 5 0 9" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </marker>
      </defs>
      <g className="ip-guides">
        {[196, 170].map((r) => (
          <circle key={r} cx="200" cy="200" r={r} pathLength={100} />
        ))}
        <path d="M200 0V400M0 200H400" pathLength={100} />
      </g>
      <g className="ip-body">
        <circle className="ip-glaze" cx="200" cy="200" r="138" />
        <circle className="ip-boreFill" cx="200" cy="200" r="96" fill="url(#intro-bore)" />
        <circle className="ip-shine" cx="200" cy="200" r="118" pathLength={100} />
      </g>
      <circle className="ip-ring" cx="200" cy="200" r="148" />
      <g className="ip-lines">
        <circle cx="200" cy="200" r="138" pathLength={100} />
        <circle cx="200" cy="200" r="96" pathLength={100} />
      </g>
      <g className="ip-dim">
        <path d="M108 200H292" markerStart="url(#intro-arrow)" markerEnd="url(#intro-arrow)" />
        <text x="200" y="190" textAnchor="middle">
          DN 125 – 1000
        </text>
      </g>
    </svg>
  );
}

/**
 * Inline script for <head>: decides before first paint whether the intro plays.
 * Plays once per session, only when the visitor lands on "/", and schedules
 * the hand-off (play, exit, done) so it never depends on hydration. A skip key
 * pressed before the Intro component hydrates starts the exit straight away.
 */
export const introGateScript = `(()=>{try{var d=document.documentElement,k="sweillem.intro";if(location.pathname==="/"&&!sessionStorage.getItem(k)){sessionStorage.setItem(k,"1");d.dataset.intro="play";var r=matchMedia("(prefers-reduced-motion: reduce)").matches,h=r?${HOLD_REDUCED_MS}:${HOLD_MS},x=r?${EXIT_REDUCED_MS}:${EXIT_MS},out=function(){if(d.dataset.intro==="play"){d.dataset.intro="exit";setTimeout(function(){if(d.dataset.intro==="exit")d.dataset.intro="done"},x)}};setTimeout(out,h);addEventListener("keydown",function f(e){if(/^(Escape|Enter| )$/.test(e.key)){out();removeEventListener("keydown",f)}})}else{d.dataset.intro="done"}}catch(e){document.documentElement.dataset.intro="done"}})()`;
