"use client";

import { useId, useState } from "react";
import type { SpecTable } from "@content/types";
import { cellText, columnName, columnUnit, leadingNumber, rowSize } from "@/lib/specs";
import { CrossSection } from "./CrossSection";

// N and H pipe rows for one size, side by side, drawn to the same scale.

const ROWS = ["strengthClass", "crushingStrength", "d1", "d3", "wallThickness", "d4", "d7", "bmr", "joint", "length"] as const;
const BARS = new Set(["crushingStrength", "wallThickness"]);

function valuesFor(table: SpecTable, size: string, key: string) {
  const i = table.columns.findIndex((c) => c.key === key);
  if (i < 0) return [];
  return [...new Set(table.rows.filter((r) => rowSize(table, r) === size).map((r) => cellText(r[i])))];
}

export function CompareClasses({ n, h }: { n: SpecTable; h: SpecTable }) {
  const uid = useId();
  const nSizes = new Set(n.rows.map((r) => rowSize(n, r)));
  const hSizes = new Set(h.rows.map((r) => rowSize(h, r)));
  const all = [...new Set([...nSizes, ...hSizes])].sort((a, b) => Number(a) - Number(b));
  const [size, setSize] = useState(all.includes("300") ? "300" : all[0]);
  const hasN = nSizes.has(size);
  const hasH = hSizes.has(size);

  const num = (t: SpecTable, key: string) => {
    const v = valuesFor(t, size, key)[0];
    return v ? leadingNumber(v) : null;
  };
  const d3s = [hasN ? num(n, "d3") : null, hasH ? num(h, "d3") : null].filter((x): x is number => x !== null);
  const scaleTo = Math.max(...d3s) * 1.18;

  return (
    <div className="grid gap-8">
      <fieldset>
        <legend className="mb-2.5 font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">Nominal size DN (mm)</legend>
        <div className="flex flex-wrap gap-2">
          {all.map((s) => (
            <label
              key={s}
              className="relative inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-4 font-mono text-sm font-semibold tabular-nums transition-colors select-none hover:border-ink has-checked:border-brand has-checked:bg-brand has-checked:text-on-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-maroon"
            >
              <input type="radio" name={`${uid}-dn`} value={s} checked={s === size} onChange={() => setSize(s)} className="sr-only" />
              {s}
              <span className="font-sans text-xs font-normal opacity-80">
                {nSizes.has(s) && hSizes.has(s) ? "N · H" : nSizes.has(s) ? "N only" : "H only"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <section aria-live="polite" aria-label={`DN ${size}, N and H class`} className="grid gap-6 md:grid-cols-2">
        {[
          { t: n, has: hasN, label: "N class", long: "Normal strength" },
          { t: h, has: hasH, label: "H class", long: "Extra strength" },
        ].map(({ t, has, label, long }) => (
          <div key={label} className="grid content-start gap-4 rounded-card border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-2xl">
                {label} <span className="text-base font-normal text-muted">{long.toLowerCase()}</span>
              </h2>
              <p className="font-mono text-sm text-muted">DN {size}</p>
            </div>
            {has ? (
              <>
                <CrossSection
                  d1={num(t, "d1") ?? 0}
                  d3={num(t, "d3")}
                  scaleTo={scaleTo}
                  title={`${label} DN ${size} cross-section to scale: inner ${num(t, "d1")} mm, outer ${num(t, "d3")} mm`}
                  className="mx-auto size-48"
                />
                <dl className="grid divide-y divide-line text-sm">
                  {ROWS.map((key) => {
                    const col = t.columns.find((c) => c.key === key);
                    if (!col) return null;
                    const vals = valuesFor(t, size, key);
                    const other = t === n ? h : n;
                    const mine = num(t, key);
                    const theirs = (t === n ? hasH : hasN) ? (() => { const v = valuesFor(other, size, key)[0]; return v ? leadingNumber(v) : null; })() : null;
                    const max = Math.max(mine ?? 0, theirs ?? 0);
                    const unit = columnUnit(col);
                    return (
                      <div key={key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-2">
                        <dt className="text-muted">
                          {columnName(col)}
                          {unit && ` (${unit})`}
                        </dt>
                        <dd className="text-right font-mono font-semibold">{vals.join(" · ")}</dd>
                        {BARS.has(key) && mine !== null && max > 0 && (
                          <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-sunk" aria-hidden="true">
                            <div className="h-full rounded-full bg-maroon transition-[width] duration-500 ease-glaze" style={{ width: `${(mine / max) * 100}%` }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </dl>
              </>
            ) : (
              <p className="rounded-inner border border-dashed border-line p-5 text-muted">
                DN {size} is not made in {label}.
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
