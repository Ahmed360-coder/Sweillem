"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { DownloadItem, DownloadKind } from "@/lib/downloads";

type Filter = "all" | DownloadKind;

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * The searchable list on the Downloads page. Every entry is in the page's
 * HTML, so it works without JavaScript; the search and filters only hide
 * entries. The search and filter are kept in the address (?q=, ?type=) so a
 * filtered list can be shared.
 */
export function DownloadCentre({ items, kinds }: { items: DownloadItem[]; kinds: Record<DownloadKind, string> }) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [onlyFiles, setOnlyFiles] = useState(false);

  // Start from the address, once, after the first paint.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const t = params.get("type");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the address once on load
    if (q) setQuery(q);
    if (t && t in kinds) setFilter(t as DownloadKind);
  }, [kinds]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    if (filter !== "all") url.searchParams.set("type", filter);
    else url.searchParams.delete("type");
    window.history.replaceState(window.history.state, "", url);
  }, [query, filter]);

  const words = normalise(query).split(" ").filter(Boolean);
  const matches = (d: DownloadItem) => {
    if (filter !== "all" && d.kind !== filter) return false;
    if (onlyFiles && d.status === "unavailable") return false;
    const text = normalise(`${d.title} ${d.detail} ${d.country ?? ""} ${d.keywords} ${d.actions.map((a) => a.format).join(" ")}`);
    return words.every((w) => text.includes(w));
  };
  const shown = items.filter(matches);
  const clear = () => {
    setQuery("");
    setFilter("all");
    setOnlyFiles(false);
  };
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    ...(Object.keys(kinds) as DownloadKind[]).map((k) => ({ id: k, label: kinds[k] })),
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-card border border-line bg-surface p-4 md:p-5">
        <label htmlFor={`${uid}-q`} className="text-[15px] font-semibold">
          Search downloads
        </label>
        <input
          id={`${uid}-q`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="For example ISO 9001, SASO, Germany or bends"
          autoComplete="off"
          className="min-h-12 w-full rounded-inner border border-line bg-paper px-4 text-base text-ink placeholder:text-muted focus-visible:border-ink"
        />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div role="group" aria-label="Show" className="flex flex-wrap gap-1">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className="min-h-11 cursor-pointer rounded-full px-3.5 text-[14px] font-medium text-ink transition-[background-color,transform] duration-100 hover:bg-sunk active:translate-y-px aria-pressed:bg-ink aria-pressed:text-paper"
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px]">
            <input type="checkbox" checked={onlyFiles} onChange={(e) => setOnlyFiles(e.target.checked)} className="size-5 accent-brand" />
            Only what can be opened now
          </label>
        </div>
        <p aria-live="polite" className="text-[14px] text-muted">
          {shown.length === items.length ? `${items.length} entries` : `${shown.length} of ${items.length} entries`}
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="grid justify-items-start gap-3 rounded-card border border-dashed border-line p-[clamp(20px,3vw,28px)]">
          <h2 className="text-lg">Nothing matches {query ? `“${query}”` : "these filters"}</h2>
          <p className="max-w-[60ch] text-base text-muted sm:text-[15px]">
            Try a standard (EN 295), a country or a product name. If you need a document that is not here,{" "}
            <Link href="/contact" className="link">
              ask SWEILLEM
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={clear}
            className="min-h-11 cursor-pointer rounded-full border border-line bg-surface px-5 text-[15px] font-semibold transition-transform duration-100 hover:border-ink active:translate-y-px"
          >
            Show everything
          </button>
        </div>
      ) : (
        (Object.keys(kinds) as DownloadKind[]).map((k) => {
          const group = shown.filter((d) => d.kind === k);
          if (!group.length) return null;
          return (
            <section key={k} aria-labelledby={`${uid}-${k}`} className="grid gap-3">
              <h2 id={`${uid}-${k}`} className="text-[clamp(20px,2.4vw,26px)]">
                {kinds[k]} <span className="font-mono text-[14px] font-normal text-muted">({group.length})</span>
              </h2>
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
                {group.map((d) => (
                  <Entry key={d.id} d={d} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

function Entry({ d }: { d: DownloadItem }) {
  return (
    <li id={d.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6 md:p-5">
      <div className="grid min-w-0 gap-1">
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[12px] font-medium tracking-[.1em] uppercase">
          {d.country && <span className="text-muted">{d.country}</span>}
          {d.status === "expired" && <span className="rounded-full border border-current px-2 py-0.5 text-warn">Past its date</span>}
          {d.status === "unavailable" && <span className="rounded-full bg-sunk px-2 py-0.5 text-muted">Not available yet</span>}
        </p>
        <h3 className="text-[17px] leading-snug">{d.title}</h3>
        <p className="text-base text-muted sm:text-[15px]">{d.detail}</p>
        {d.note && <p className={`text-base sm:text-[14px] ${d.status === "expired" ? "text-warn" : "text-muted"}`}>{d.note}</p>}
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        {d.actions.map((a) =>
          a.href.startsWith("/products/") ? (
            <Link key={a.href} href={a.href} className="dl-action">
              <span>{a.label}</span>
              <span className="dl-format">{a.format}</span>
            </Link>
          ) : (
            <a
              key={a.href}
              href={a.href}
              className="dl-action"
              {...(a.download ? { download: "" } : {})}
              {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : { target: "_blank", rel: "noopener" })}
            >
              <span>{a.label}</span>
              <span className="dl-format">{a.format}</span>
            </a>
          ),
        )}
        {d.status === "unavailable" && (
          <Link href="/contact" className="dl-action dl-action-quiet">
            <span>Ask SWEILLEM for a copy</span>
          </Link>
        )}
      </div>
    </li>
  );
}
