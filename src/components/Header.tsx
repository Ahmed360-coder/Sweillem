"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { mainNav } from "@/lib/site";
import { useQuoteCount } from "@/lib/quote";
import { Logo } from "./Logo";
import { QuoteIcon } from "./icons";

const isCurrent = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const pathname = usePathname();
  const quoteCount = useQuoteCount();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // M02 header condense after 24 px of scroll.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    const mq = window.matchMedia("(min-width: 64rem)");
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
      <header
        data-stuck={stuck && !open ? "" : undefined}
        className="group/hdr sticky top-0 z-40 py-[18px] transition-[background-color,box-shadow,padding] duration-300 ease-glaze data-stuck:bg-[color-mix(in_srgb,var(--paper)_86%,transparent)] data-stuck:py-2.5 data-stuck:shadow-[0_1px_0_var(--line)] data-stuck:backdrop-blur-md"
      >
        <div className="wrap flex items-center gap-5">
          <Link
            href="/"
            aria-label="SWEILLEM home"
            className="relative z-50 block h-10 flex-none transition-[height] duration-300 ease-glaze group-data-stuck/hdr:h-8"
          >
            <Logo priority white={open} />
          </Link>

          <nav aria-label="Main" className="ms-auto hidden gap-1 lg:flex">
            {mainNav.map((item) => {
              const current = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className="relative rounded-lg px-3 py-2 text-[14.5px] font-medium text-ink no-underline after:absolute after:inset-x-3 after:bottom-[3px] after:h-0.5 after:origin-left after:scale-x-0 after:bg-maroon after:transition-transform after:duration-300 after:ease-glaze hover:after:scale-x-100 aria-[current=page]:after:scale-x-100 rtl:after:origin-right"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-2 lg:ms-0">
            <Link
              href="/quote"
              aria-label={`Quote list, ${quoteCount} ${quoteCount === 1 ? "item" : "items"}`}
              className="relative z-50 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper no-underline"
            >
              <QuoteIcon />
              <span className="hidden sm:inline">Quote list</span>
              <span
                aria-hidden="true"
                data-quote-count
                className="min-w-5 rounded-[10px] bg-maroon px-[5px] text-center font-mono text-[11px] leading-5 font-semibold text-on-maroon"
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
              className="relative z-50 size-11 cursor-pointer rounded-lg lg:hidden"
            >
              {[14, 20, 26].map((top, i) => (
                <span
                  key={top}
                  aria-hidden="true"
                  style={{ top: top + 1 }}
                  className={`absolute inset-x-2.5 h-0.5 transition-[transform,opacity,background-color] duration-300 ease-glaze ${
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

      {/* M26 menu iris: maroon panel opens as a circle from the burger. */}
      <div
        id="mobile-menu"
        ref={menuRef}
        inert={!open}
        data-open={open ? "" : undefined}
        className="fixed inset-0 z-30 flex flex-col gap-1.5 overflow-y-auto bg-maroon px-6 pt-24 pb-8 text-on-maroon [clip-path:circle(0_at_calc(100%-40px)_40px)] transition-[clip-path] duration-[560ms] ease-kiln data-open:[clip-path:circle(150%_at_calc(100%-40px)_40px)] lg:hidden rtl:[clip-path:circle(0_at_40px_40px)] rtl:data-open:[clip-path:circle(150%_at_40px_40px)]"
      >
        <nav aria-label="Menu" className="flex flex-col">
          {mainNav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              style={{ transitionDelay: open ? `${i * 45 + 160}ms` : "0ms" }}
              className={`border-b border-[color-mix(in_srgb,var(--on-maroon)_20%,transparent)] py-2 font-display text-3xl leading-tight font-semibold text-inherit no-underline transition-[opacity,transform] duration-[560ms] ease-glaze aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8 ${
                open ? "translate-y-0 opacity-100" : "translate-y-[18px] opacity-0"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
