import type { CSSProperties } from "react";
import { ButtonLink } from "./Button";
import { Logo } from "./Logo";

// Home hero: the SWEILLEM logo large on a fired-clay maroon ground, with glazed
// clay pipes rising in front of it and fittings and shards drifting around.
// The pieces are 3D renders made by scripts/render-hero-pieces.mjs. Colours are
// fixed, so it looks the same in the light and dark themes (Ahmed, 2026-10-04).
// Positions are a share of the hero box: x from the start edge, b (pipes) from
// the bottom, y (floats) from the top, h the height; m* are the phone values.

interface Piece {
  src: string;
  kind: "pipe" | "float";
  vars: Record<string, string>;
  desktopOnly?: boolean;
}

const pieces: Piece[] = [
  { src: "pipe-honey", kind: "pipe", vars: { x: "31%", b: "16%", h: "39%", mx: "6%", mb: "30%", mh: "36%", d: ".15s", t: "6s", r0: "-1deg", r1: "1.5deg" } },
  { src: "pipe-wide", kind: "pipe", vars: { x: "41.5%", b: "13%", h: "44%", mx: "28%", mb: "27%", mh: "38%", d: "0s", t: "7s", r0: "1deg", r1: "-1deg" } },
  { src: "pipe-dark", kind: "pipe", vars: { x: "58%", b: "13%", h: "48%", mx: "66%", mb: "29%", mh: "42%", d: ".3s", t: "6.5s", r0: ".5deg", r1: "-2deg" } },
  { src: "junction", kind: "float", vars: { x: "10%", y: "40%", h: "24%", mx: "0%", my: "50%", mh: "11%", a: "-16deg", t: "8s" } },
  { src: "short-piece", kind: "float", vars: { x: "82%", y: "8%", h: "13%", mx: "80%", my: "22%", mh: "7%", a: "18deg", t: "10s", d: "-3s" } },
  { src: "bend", kind: "float", vars: { x: "80%", y: "46%", h: "20%", mx: "56%", my: "24%", mh: "6%", a: "12deg", t: "7s", d: "-1s" } },
  { src: "shard-1", kind: "float", vars: { x: "19%", y: "9%", h: "8%", mx: "36%", my: "25%", mh: "4.5%", a: "25deg", t: "11s", d: "-5s" } },
  { src: "shard-2", kind: "float", vars: { x: "73%", y: "44%", h: "8%", mx: "88%", my: "50%", mh: "4%", a: "-20deg", t: "8.5s", d: "-2s" } },
  { src: "shard-3", kind: "float", vars: { x: "22%", y: "56%", h: "7%", mx: "10%", my: "27%", mh: "4%", a: "40deg", t: "12s", d: "-6s" } },
  { src: "shard-1", kind: "float", desktopOnly: true, vars: { x: "88%", y: "34%", h: "5%", a: "110deg", t: "9.5s" } },
  { src: "shard-2", kind: "float", desktopOnly: true, vars: { x: "8%", y: "24%", h: "5%", a: "70deg", t: "7.5s", d: "-4s" } },
  { src: "shard-3", kind: "float", desktopOnly: true, vars: { x: "90%", y: "64%", h: "4.5%", a: "-60deg", t: "10.5s" } },
];

const facts = [
  { value: "1935", label: "Since" },
  { value: "100+", label: "Year life" },
  { value: "EN 295", label: "Standard" },
];

const cssVars = (vars: Record<string, string>) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [`--${k}`, v])) as CSSProperties;

export function ClayHero() {
  return (
    <section aria-label="Introduction" className="clay-hero">
      <h1 className="clay-hero-logo">
        <Logo title="SWEILLEM Vitrified Clay Pipes Co." />
      </h1>

      {pieces.map((p, i) => (
        // Decorative renders; plain img keeps them out of the image optimiser's blur and resize steps.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={`/images/hero/${p.src}.webp`}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority={p.kind === "pipe" ? "high" : "low"}
          draggable={false}
          className="clay-piece"
          data-kind={p.kind}
          data-desktop={p.desktopOnly ? "" : undefined}
          style={cssVars(p.vars)}
        />
      ))}

      <div className="clay-hero-panel" aria-hidden="true" />
      <div className="clay-hero-bar">
        <div className="hero-btn flex justify-center gap-2 sm:gap-2.5">
          <ButtonLink href="/products">Products</ButtonLink>
          <ButtonLink href="/products#size" variant="ghost" className="border-2! border-[#7a0404]! bg-transparent! text-[#7a0404]! hover:bg-[#7a0404]/5!">
            Size finder
          </ButtonLink>
          <ButtonLink href="/quote">Get a quote</ButtonLink>
        </div>
        <dl className="clay-hero-facts flex gap-6 rounded-[14px] border border-[#dccdb2] px-5 py-3">
          {facts.map((f) => (
            <div key={f.label} className="grid">
              <dt className="order-2 text-[12px] font-semibold">{f.label}</dt>
              <dd className="order-1 font-display text-[20px] leading-tight font-bold text-[#7a0404]">{f.value}</dd>
            </div>
          ))}
        </dl>
        <a href="#after-hero" className="absolute start-1/2 bottom-[2%] inline-flex min-h-7 -translate-x-1/2 items-center px-3 font-mono text-[11px] font-semibold tracking-[.2em] text-[#7a0404] uppercase no-underline rtl:translate-x-1/2">
          Scroll ↓
        </a>
      </div>
    </section>
  );
}
