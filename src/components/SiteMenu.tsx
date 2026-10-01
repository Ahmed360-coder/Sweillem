"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { inertOutside } from "@/lib/inert";
import { siteMap } from "@/lib/site";
import { MapIcon } from "./icons";

/**
 * Side menu listing every page of the site, grouped by section. It slides in
 * from the start edge, beside the menu button over a dimmed page; only transform and opacity animate.
 * Closed, it is inert so nothing inside can be focused or read.
 */
export function SiteMenu({
  open,
  pathname,
  onClose,
  onOpenMap,
}: {
  open: boolean;
  pathname: string;
  onClose: () => void;
  onOpenMap: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // While open, the page behind is inert so focus and screen readers stay in the menu.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>('[aria-current="page"]') ?? panel?.querySelector<HTMLElement>("a"))?.focus();
    return inertOutside(panel);
  }, [open]);

  let index = 0;
  return (
    <div
      id="site-menu"
      inert={!open}
      data-open={open ? "" : undefined}
      className="group/menu pointer-events-none fixed inset-0 z-50 data-open:pointer-events-auto"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[rgb(20_10_8/0.45)] opacity-0 backdrop-blur-[2px] transition-opacity duration-300 ease-glaze group-data-open/menu:opacity-100"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="absolute inset-y-0 start-0 flex w-[min(400px,calc(100vw-40px))] -translate-x-full flex-col bg-surface shadow-card transition-transform duration-[420ms] ease-kiln group-data-open/menu:translate-x-0 rtl:translate-x-full rtl:group-data-open/menu:translate-x-0"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-3.5">
          <p className="font-mono text-[12px] font-medium tracking-[.12em] text-muted uppercase">Every page</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="relative size-11 cursor-pointer rounded-full text-ink transition-transform duration-100 hover:bg-sunk active:translate-y-px"
          >
            <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-0.5 rotate-45 bg-current" />
            <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-0.5 -rotate-45 bg-current" />
          </button>
        </div>
        <nav aria-label="Site menu" className="flex-1 overflow-y-auto overscroll-contain px-6 pt-2 pb-10">
          <button
            type="button"
            onClick={onOpenMap}
            className="mt-3 flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-inner border border-line bg-paper px-3 py-2 text-start text-[16px] font-medium text-ink transition-[background-color,transform] duration-100 hover:bg-sunk active:translate-y-px"
          >
            <MapIcon className="text-maroon" />
            <span className="grid">
              Map of projects and distribution
              <span className="text-[13px] font-normal text-muted">Where SWEILLEM pipes go</span>
            </span>
          </button>
          {siteMap.map((group) => (
            <section key={group.title} className="border-b border-line py-4 last:border-b-0">
              <h2 className="mb-1.5 font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">{group.title}</h2>
              <ul className="grid">
                {group.items.map((item) => {
                  const i = index++;
                  const current = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={current ? onClose : undefined}
                        aria-current={current ? "page" : undefined}
                        style={{ transitionDelay: open ? `${Math.min(i, 14) * 22 + 120}ms` : "0ms" }}
                        className={`group/link flex min-h-11 items-center gap-3 rounded-inner px-3 -mx-3 text-[16px] font-medium text-ink no-underline transition-[opacity,transform] duration-[420ms] ease-glaze hover:bg-sunk aria-[current=page]:bg-sunk aria-[current=page]:text-maroon ${
                          open ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0 rtl:translate-x-3"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="hex size-2 flex-none scale-0 bg-maroon transition-transform duration-200 group-hover/link:scale-100 group-aria-[current=page]/link:scale-100"
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
      </div>
    </div>
  );
}
