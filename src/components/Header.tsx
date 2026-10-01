"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { mainNav } from "@/lib/site";
import { useQuoteCount } from "@/lib/quote";
import { Logo } from "./Logo";
import { QuoteIcon } from "./icons";

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

export function Header() {
  const pathname = usePathname();
  const quoteCount = useQuoteCount();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) burgerRef.current?.focus();
  }, []);

  // Close the menu after navigating (adjusting state during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const mq = window.matchMedia("(min-width: 980px)");
    const onWide = () => mq.matches && close(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    document.documentElement.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
      document.documentElement.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute top-6 left-0 h-px w-px" />
      <header data-stuck={stuck && !open ? "" : undefined} className="site-header group/hdr sticky top-0 z-40 py-3.5">
        {/* Condensed ground: fades in, so only opacity animates. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--paper)_86%,transparent)] opacity-0 shadow-[0_1px_0_var(--line)] backdrop-blur-md transition-opacity duration-300 ease-glaze group-data-stuck/hdr:opacity-100"
        />
        <div className="wrap flex items-center gap-5">
          <Link
            href="/"
            aria-label="SWEILLEM home"
            className="relative z-50 block h-11 flex-none py-0.5 origin-left transition-transform duration-300 ease-glaze group-data-stuck/hdr:scale-[.8] rtl:origin-right"
          >
            <Logo title={null} className={open ? "[--logo-mark:#fff] [--logo-word:#fff]" : ""} />
          </Link>

          <nav aria-label="Main" className="ms-auto hidden gap-1 whitespace-nowrap min-[980px]:flex">
            {mainNav.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={currentFor(pathname, item.href)}
                  className="relative rounded-full px-3 py-2 text-[14.5px] font-medium text-ink no-underline after:absolute after:inset-x-3 after:bottom-[3px] after:h-0.5 after:origin-left after:scale-x-0 after:bg-maroon after:transition-transform after:duration-300 after:ease-glaze hover:after:scale-x-100 [&[aria-current]]:after:scale-x-100 rtl:after:origin-right"
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
                className="min-w-5 rounded-full bg-maroon px-[5px] text-center font-mono text-[12px] leading-5 font-semibold text-on-maroon"
              >
                {quoteCount}
              </span>
            </Link>
            <button
              ref={burgerRef}
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
              className="relative z-50 size-11 cursor-pointer rounded-full min-[980px]:hidden"
            >
              {[14, 20, 26].map((top, i) => (
                <span
                  key={top}
                  aria-hidden="true"
                  style={{ top: top + 1 }}
                  className={`absolute inset-x-2.5 h-0.5 transition-[transform,opacity] duration-300 ease-glaze ${
                    open ? "bg-on-maroon" : "bg-ink"
                  } ${
                    open
                      ? i === 0
                        ? "translate-y-1.5 rotate-45"
                        : i === 1
                          ? "opacity-0"
                          : "-translate-y-1.5 -rotate-45"
                      : ""
                  }`}
                />
              ))}
            </button>
          </div>
        </div>
      </header>

      {/* M26 menu iris: a maroon disc scales up from the burger (transform only). */}
      <div
        id="mobile-menu"
        ref={menuRef}
        inert={!open}
        data-open={open ? "" : undefined}
        className="group/menu pointer-events-none fixed inset-0 z-30 overflow-hidden text-on-maroon data-open:pointer-events-auto min-[980px]:hidden"
      >
        <div
          aria-hidden="true"
          className="absolute top-10 right-10 size-[300vmax] translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-maroon transition-transform duration-[560ms] ease-kiln group-data-open/menu:scale-100 rtl:right-auto rtl:left-10 rtl:-translate-x-1/2"
        />
        <div className="relative h-full overflow-y-auto px-6 pt-24 pb-8">
        <nav aria-label="Menu" className="flex flex-col">
          {mainNav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={currentFor(pathname, item.href)}
              style={{ transitionDelay: open ? `${i * 45 + 160}ms` : "0ms" }}
              className={`border-b border-[color-mix(in_srgb,var(--on-maroon)_20%,transparent)] py-2 font-display text-3xl leading-tight font-semibold text-inherit no-underline transition-[opacity,transform] duration-[560ms] ease-glaze [&[aria-current]]:underline [&[aria-current]]:decoration-2 [&[aria-current]]:underline-offset-8 ${
                open ? "translate-y-0 opacity-100" : "translate-y-[18px] opacity-0"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        </div>
      </div>
    </>
  );
}
