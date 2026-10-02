"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ProductSpecs, StrengthClass } from "@content/types";
import {
  cellText,
  classNames,
  columnName,
  columnUnit,
  distinguishingColumns,
  leadingNumber,
  rowSize,
  sizesOf,
  specGroups,
  tableTitle,
} from "@/lib/specs";
import { AddToQuote } from "./AddToQuote";
import { CrossSection } from "./CrossSection";

export interface ExplorerProduct {
  slug: string;
  name: string;
  spec: ProductSpecs;
}

interface State {
  slug: string;
  group: string;
  strength: StrengthClass | null;
  size: string;
}

/** Keeps the choice valid when the product, type or class changes. */
function resolve(items: ExplorerProduct[], want: Partial<State>) {
  const product = items.find((p) => p.slug === want.slug) ?? items[0];
  const groups = specGroups(product.spec);
  const group = groups.find((g) => g.id === want.group) ?? groups[0];
  const table = group.tables.find((t) => t.strength === want.strength) ?? group.tables[0];
  const sizes = sizesOf(table);
  const size = sizes.includes(want.size ?? "") ? want.size! : sizes[0];
  const rows = table.rows.filter((r) => rowSize(table, r) === size);
  return { product, groups, group, table, sizes, size, rows };
}

// Highlights shown large in the result, in this order, when the table has them.
const KEY_FIGURES = ["d1", "d3", "wallThickness", "crushingStrength", "strengthClass", "joint", "length", "weight"] as const;

function ChipGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  mono = false,
}: {
  legend: string;
  name: string;
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  mono?: boolean;
}) {
  return (
    <fieldset className="grid gap-2.5">
      <legend className="mb-2.5 font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`relative inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition-colors duration-200 ease-glaze select-none hover:border-ink has-checked:border-maroon has-checked:bg-maroon has-checked:text-on-maroon has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-maroon ${mono ? "font-mono tabular-nums" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={o.value === value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
            {o.hint && <span className="text-xs font-normal opacity-80">{o.hint}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ProductExplorer({
  items,
  syncUrl = false,
  initial,
  headingLevel = 3,
}: {
  items: ExplorerProduct[];
  /** Level of the result heading: 2 on the explorer page, 3 inside a product page section. */
  headingLevel?: 2 | 3;
  /** Mirror the choice in the address bar so a size can be shared (explorer page only). */
  syncUrl?: boolean;
  initial?: Partial<State>;
}) {
  const uid = useId();
  const Heading = `h${headingLevel}` as const;
  const [want, setWant] = useState<Partial<State>>(initial ?? {});
  const { product, groups, group, table, sizes, size, rows } = useMemo(() => resolve(items, want), [items, want]);
  const strengths = group.tables.map((t) => t.strength).filter((s): s is StrengthClass => !!s);
  const update = (patch: Partial<State>) =>
    setWant({ slug: product.slug, group: group.id, strength: table.strength, size, ...patch });

  // Read a shared link once, after hydration.
  const readUrl = useRef(false);
  useEffect(() => {
    if (!syncUrl || readUrl.current) return;
    readUrl.current = true;
    const q = new URLSearchParams(window.location.search);
    if (!q.size) return;
    const c = q.get("class");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the shared link after hydration
    setWant({
      slug: q.get("product") ?? undefined,
      group: q.get("type") ?? undefined,
      strength: c === "N" || c === "H" || c === "N/H" ? c : undefined,
      size: q.get("dn") ?? undefined,
    });
  }, [syncUrl]);

  useEffect(() => {
    if (!syncUrl || !readUrl.current) return;
    const q = new URLSearchParams({ product: product.slug, type: group.id, dn: size });
    if (table.strength) q.set("class", table.strength);
    window.history.replaceState(null, "", `${window.location.pathname}?${q}`);
  }, [syncUrl, product.slug, group.id, table.strength, size]);

  const col = (key: string) => table.columns.findIndex((c) => c.key === key);
  const d1i = col("d1");
  const d3i = col("d3");
  const d1 = d1i >= 0 ? leadingNumber(rows[0][d1i]) : null;
  const d3 = d3i >= 0 ? leadingNumber(rows[0][d3i]) : null;
  // One scale per product, so sizes compare truthfully as you switch.
  const scaleTo = useMemo(() => {
    const all = product.spec.tables.flatMap((t) => {
      const i = t.columns.findIndex((c) => c.key === "d3");
      const j = t.columns.findIndex((c) => c.key === "d1");
      return t.rows.map((r) => (i >= 0 ? leadingNumber(r[i]) : null) ?? (j >= 0 ? leadingNumber(r[j]) : null) ?? 0);
    });
    return Math.max(200, ...all) * 1.12;
  }, [product]);
  const differs = distinguishingColumns(table, rows);
  const title = tableTitle(table);
  const figures = KEY_FIGURES.map((k) => col(k)).filter((i) => i > 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
      <form className="grid gap-7" onSubmit={(e) => e.preventDefault()} aria-label="Choose a product and size">
        {items.length > 1 && (
          <ChipGroup
            legend="1 · Product"
            name={`${uid}-product`}
            value={product.slug}
            options={items.map((p) => ({ value: p.slug, label: p.name }))}
            onChange={(slug) => setWant({ ...want, slug })}
          />
        )}
        {groups.length > 1 && (
          <ChipGroup
            legend={`${items.length > 1 ? "2 · " : ""}Type`}
            name={`${uid}-type`}
            value={group.id}
            options={groups.map((g) => ({ value: g.id, label: g.label }))}
            onChange={(g) => update({ group: g })}
          />
        )}
        {strengths.length > 0 && (
          <ChipGroup
            legend="Strength class"
            name={`${uid}-class`}
            value={(table.strength ?? strengths[0]) as StrengthClass}
            options={strengths.map((s) => ({ value: s, label: `${classNames[s].short} class`, hint: classNames[s].long.toLowerCase() }))}
            onChange={(s) => update({ strength: s })}
          />
        )}
        <ChipGroup
          legend="Nominal size DN (mm)"
          name={`${uid}-dn`}
          value={size}
          mono
          options={sizes.map((s) => ({ value: s, label: s }))}
          onChange={(s) => update({ size: s })}
        />
      </form>

      <section
        aria-labelledby={`${uid}-result`}
        aria-live="polite"
        className="grid gap-5 rounded-card border border-line bg-surface p-[clamp(18px,3vw,28px)] shadow-card lg:sticky lg:top-[calc(var(--header-h)+16px)]"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="grid gap-1.5">
            <p className="font-mono text-xs tracking-[.12em] text-muted uppercase">{product.name}</p>
            <Heading id={`${uid}-result`} className="text-[clamp(26px,3vw,36px)]">
              DN <span className="font-mono text-maroon">{size}</span>
            </Heading>
            <p className="text-sm text-muted">{title}</p>
          </div>
          {d1 !== null && (
            <CrossSection
              d1={d1}
              d3={d3}
              scaleTo={scaleTo}
              title={`Cross-section to scale: inner diameter ${d1} mm${d3 ? `, outer diameter ${d3} mm` : ""}`}
              className="size-28 sm:size-36"
            />
          )}
        </div>

        {figures.length > 0 && (
          <dl className="grid grid-cols-2 overflow-hidden rounded-inner border border-line bg-surface sm:grid-cols-4">
            {figures.map((i) => {
              const values = [...new Set(rows.map((r) => cellText(r[i])))];
              const unit = columnUnit(table.columns[i]);
              return (
                <div key={i} className="grid content-start gap-1 p-3 shadow-[0_0_0_.5px_var(--line)]">
                  <dt className="text-[12.5px] leading-tight text-muted">
                    {columnName(table.columns[i])}
                    {unit && ` (${unit})`}
                  </dt>
                  <dd className="font-mono text-[15px] font-semibold [overflow-wrap:anywhere]">{values.join(" · ")}</dd>
                </div>
              );
            })}
          </dl>
        )}

        <div className="grid gap-3">
          {rows.map((row, ri) => (
            <details key={`${size}-${ri}`} open={rows.length === 1} className="group rounded-inner border border-line">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                <span>
                  {rows.length > 1 ? `Option ${ri + 1} of ${rows.length}` : "Full specification row"}
                  {differs.length > 0 && (
                    <span className="font-normal text-muted">
                      {" · "}
                      {differs.map((i) => `${columnName(table.columns[i])} ${cellText(row[i])}${columnUnit(table.columns[i]) ? ` ${columnUnit(table.columns[i])}` : ""}`).join(", ")}
                    </span>
                  )}
                </span>
                <svg viewBox="0 0 24 24" className="size-4 flex-none transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="grid gap-4 border-t border-line px-4 py-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-3">
                  {table.columns.map((c, ci) => (
                    <div key={ci} className="grid min-w-0 gap-0.5">
                      <dt className="text-[12.5px] leading-tight text-muted">
                        {columnName(c)}
                        {columnUnit(c) && ` (${columnUnit(c)})`}
                      </dt>
                      <dd className="font-mono [overflow-wrap:anywhere]">{cellText(row[ci])}</dd>
                    </div>
                  ))}
                </dl>
                <AddToQuote
                  className="justify-self-start"
                  item={{ product: `${product.name}, ${title}`, size: `DN ${size}`, strengthClass: table.strength ?? undefined }}
                  label={`Add to quote: DN ${size} ${title}`}
                />
              </div>
            </details>
          ))}
        </div>

        <p className="text-sm text-muted">
          Values as SWEILLEM publishes them.{" "}
          <Link className="link" href={`/products/${product.slug}#${table.id}`}>
            See the whole table
          </Link>
        </p>
      </section>
    </div>
  );
}
