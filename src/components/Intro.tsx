"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Logo } from "./Logo";

/**
 * M00 intro: a 4-second title card on the first visit per session
 * (design/intro-spec.md). It says who SWEILLEM is and what they make over three
 * real project photos (Germany, Makkah, New Alamein), then lifts away like a
 * curtain to reveal the home page.
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

// Places follow content/company.ts and the home hero captions.
const places = ["Germany · Euro Sweillem", "Makkah, Saudi Arabia", "New Alamein City, Egypt"];

// Facts SWEILLEM publishes on the home page and About Us.
const facts = [
  { value: "1935", label: "Founded in Cairo" },
  { value: "1200", unit: "°C", label: "Firing temperature" },
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
      {/* Photos are CSS backgrounds so they only download when the intro actually plays. */}
      <div className="intro-photos" aria-hidden="true">
        {places.map((_, i) => (
          <div key={i} className="intro-photo" style={{ "--n": i } as CSSProperties} />
        ))}
      </div>
      <div className="intro-shade" aria-hidden="true" />

      <div className="intro-card" aria-hidden="true">
        <div className="intro-top">
          <div className="intro-logo">
            <Logo title={null} />
          </div>
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
            Glazed sewer and drainage pipes made from Aswan clay, laid from Egypt to Saudi Arabia and Germany.
          </p>
        </div>

        <div className="intro-foot">
          <dl className="intro-facts">
            {facts.map((f, i) => (
              <div key={f.label} style={{ "--n": i } as CSSProperties}>
                <dt>{f.label}</dt>
                <dd>
                  {f.value}
                  {f.unit && <small>{f.unit}</small>}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="intro-places">
            {places.map((p, i) => (
              <li key={p} style={{ "--n": i } as CSSProperties}>
                {p}
              </li>
            ))}
          </ul>
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
 * Inline script for <head>: decides before first paint whether the intro plays.
 * Plays once per session, only when the visitor lands on "/", and schedules
 * the hand-off (play, exit, done) so it never depends on hydration. A skip key
 * pressed before the Intro component hydrates starts the exit straight away.
 */
export const introGateScript = `(()=>{try{var d=document.documentElement,k="sweillem.intro";if(location.pathname==="/"&&!sessionStorage.getItem(k)){sessionStorage.setItem(k,"1");d.dataset.intro="play";var r=matchMedia("(prefers-reduced-motion: reduce)").matches,h=r?${HOLD_REDUCED_MS}:${HOLD_MS},x=r?${EXIT_REDUCED_MS}:${EXIT_MS},out=function(){if(d.dataset.intro==="play"){d.dataset.intro="exit";setTimeout(function(){if(d.dataset.intro==="exit")d.dataset.intro="done"},x)}};setTimeout(out,h);addEventListener("keydown",function f(e){if(/^(Escape|Enter| )$/.test(e.key)){out();removeEventListener("keydown",f)}})}else{d.dataset.intro="done"}}catch(e){document.documentElement.dataset.intro="done"}})()`;
