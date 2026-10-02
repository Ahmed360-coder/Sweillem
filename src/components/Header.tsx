"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadMapGeo } from "@/lib/map-geo";
import type { MapData } from "@/lib/projects-map";
import { mainNav } from "@/lib/site";
import { useQuoteCount } from "@/lib/quote";
import { Logo } from "./Logo";
import { MapPanel } from "./MapPanel";
import { SiteMenu } from "./SiteMenu";
import { MapIcon, QuoteIcon } from "./icons";

/** Pages that sit under a main nav item without being inside its path. */
const sectionOf: Record<string, string> = {
  "/services": "/about",
  "/sustainability": "/about",
  "/euro-sweillem": "/about",
  "/quality": "/about",
  "/joint-performance": "/about",
  "/certificates": "/downloads",
};

/** "page" for the item's own page or its children, "true" for its section, else undefined. */
const currentFor = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`) ? "page" : sectionOf[pathname] === href ? "true" : undefined;

/** Warms the map shapes when the Map button is pointed at or focused, before it is pressed. */
const preloadMap = () => void loadMapGeo().catch(() => {});

export function Header({ mapData }: { mapData: MapData }) {
  const pathname = usePathname();
  const quoteCount = useQuoteCount();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const mapButtonRef = useRef<HTMLButtonElement>(null);

  // M02 header condense once the page has scrolled 24 px. A sentinel and an
  // IntersectionObserver replace a scroll listener (design/taste-audit.md).
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // The header is inert while the menu is open; focus the burger once it is not.
    requestAnimationFrame(() => burgerRef.current?.focus());
  }, []);
  const closeMap = useCallback(() => {
    setMapOpen(false);
    requestAnimationFrame(() => mapButtonRef.current?.focus());
  }, []);
  const openMapFromMenu = useCallback(() => {
    setOpen(false);
    setMapOpen(true);
  }, []);

  // Close the menu and the map after navigating (adjusting state during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setMapOpen(false);
  }

  const overlay = open || mapOpen;
  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mapOpen) closeMap();
      else close();
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [overlay, mapOpen, close, closeMap]);

  return (
    <>
      {/* 24 px below the 44 px top bar, so the header condenses once it is pinned. */}
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute top-[68px] left-0 h-px w-px" />
      <header data-stuck={stuck && !overlay ? "" : undefined} className="site-header group/hdr sticky top-0 z-40 py-3.5">
        {/* Condensed ground: fades in, so only opacity animates. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--paper)_86%,transparent)] opacity-0 shadow-[0_1px_0_var(--line)] backdrop-blur-md transition-opacity duration-300 ease-glaze group-data-stuck/hdr:opacity-100"
        />
        <div className="wrap flex items-center gap-3 min-[1100px]:gap-5">
          <button
            ref={burgerRef}
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
            className="group/burger relative z-50 -ms-2.5 size-11 flex-none cursor-pointer rounded-full transition-colors duration-200 hover:bg-sunk"
          >
            {[14, 20, 26].map((top, i) => (
              <span
                key={top}
                aria-hidden="true"
                style={{ top: top + 1 }}
                className={`absolute inset-x-2.5 h-0.5 origin-left bg-ink transition-transform duration-300 ease-glaze rtl:origin-right ${
                  i === 1 ? "scale-x-75 group-hover/burger:scale-x-100" : ""
                }`}
              />
            ))}
          </button>
          <Link
            href="/"
            aria-label="SWEILLEM home"
            className="relative z-50 block h-11 flex-none py-0.5 origin-left transition-transform duration-300 ease-glaze group-data-stuck/hdr:scale-[.8] rtl:origin-right"
          >
            <Logo title={null} />
          </Link>
          <button
            ref={mapButtonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={mapOpen}
            aria-controls="map-panel"
            onClick={() => setMapOpen(true)}
            onPointerEnter={preloadMap}
            onFocus={preloadMap}
            className="group/mapbtn relative z-50 inline-flex size-11 flex-none cursor-pointer items-center justify-center gap-2 rounded-full border border-line text-[14px] font-semibold text-ink transition-[background-color,transform] duration-100 hover:bg-sunk active:translate-y-px min-[640px]:w-auto min-[640px]:px-3.5 min-[980px]:w-11 min-[980px]:px-0 min-[1240px]:w-auto min-[1240px]:px-3.5"
          >
            <MapIcon className="text-maroon transition-transform duration-500 ease-glaze group-hover/mapbtn:rotate-[20deg]" />
            <span className="sr-only min-[640px]:not-sr-only min-[980px]:sr-only min-[1240px]:not-sr-only">Map</span>
          </button>

          {/* 980 to 1100 px is tight: the map button drops its label and the links pad less. */}
          <nav aria-label="Main" className="ms-auto hidden gap-0.5 whitespace-nowrap min-[980px]:flex min-[1100px]:gap-1">
            {mainNav.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={currentFor(pathname, item.href)}
                  className="relative rounded-full px-2 py-2 text-[14.5px] font-medium text-ink no-underline after:absolute after:inset-x-2 after:bottom-[3px] min-[1100px]:px-3 min-[1100px]:after:inset-x-3 after:h-0.5 after:origin-left after:scale-x-0 after:bg-maroon after:transition-transform after:duration-300 after:ease-glaze hover:after:scale-x-100 [&[aria-current]]:after:scale-x-100 rtl:after:origin-right"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-2 min-[980px]:ms-0">
            <Link
              href="/quote"
              aria-current={pathname === "/quote" ? "page" : undefined}
              aria-label={`Quote list, ${quoteCount} ${quoteCount === 1 ? "item" : "items"}`}
              className="relative z-50 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper no-underline transition-transform duration-100 active:translate-y-px"
            >
              <QuoteIcon />
              <span className="hidden whitespace-nowrap min-[1240px]:inline">Quote list</span>
              <span
                aria-hidden="true"
                data-quote-count
                className="min-w-5 rounded-full bg-brand px-[5px] text-center font-mono text-[12px] leading-5 font-semibold text-on-brand"
              >
                {quoteCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <SiteMenu open={open} pathname={pathname} onClose={close} onOpenMap={openMapFromMenu} />
      <MapPanel open={mapOpen} data={mapData} onClose={closeMap} />
    </>
  );
}
