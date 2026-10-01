import type { SpecTable as Table } from "@content/types";
import { cellText, columnHeading, columnName, columnUnit, rowSize, tableTitle } from "@/lib/specs";
import { AddToQuote } from "./AddToQuote";

/**
 * One published spec table. Wide screens and print get the table; phones get
 * one card per row so nothing scrolls sideways. Cell text is as published.
 */
export function SpecTable({ table, productName, headingLevel = 3 }: { table: Table; productName: string; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const;
  const title = tableTitle(table);
  const headingId = `${table.id}-title`;
  const quoteItem = (row: string[]) => ({
    product: `${productName}, ${title}`,
    size: `DN ${rowSize(table, row)}`,
    strengthClass: table.strength ?? undefined,
  });
  const quoteLabel = (row: string[], i: number) => `Add DN ${rowSize(table, row)} (row ${i + 1}) of ${title} to quote`;

  return (
    <section id={table.id} aria-labelledby={headingId} className="spec-table grid scroll-mt-28 gap-4 break-inside-avoid-page">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <H id={headingId} className="text-xl sm:text-2xl">
          {title}
        </H>
        <p className="font-mono text-xs tracking-[.08em] text-muted uppercase">
          {table.rows.length} {table.rows.length === 1 ? "row" : "rows"}
        </p>
      </div>

      {/* Table: tablets, desktops and print. */}
      <div className="spec-scroll relative hidden overflow-x-auto rounded-inner border border-line bg-surface md:block print:block" tabIndex={0} role="region" aria-label={`${title}, scrollable table`}>
        <table className="w-full border-collapse text-left text-sm tabular-nums">
          <thead>
            <tr className="bg-sunk align-bottom">
              {table.columns.map((c, i) => (
                <th
                  key={i}
                  scope="col"
                  title={c.label}
                  className={`px-3 py-2.5 text-[12.5px] leading-tight font-semibold ${i === 0 ? "sticky left-0 z-10 bg-sunk" : ""}`}
                >
                  {columnHeading(c)}
                </th>
              ))}
              <th scope="col" className="no-print px-3 py-2.5 text-[12.5px] font-semibold">
                <span className="sr-only">Add to quote</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {table.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-sunk/60">
                {row.map((cell, ci) =>
                  ci === 0 ? (
                    <th key={ci} scope="row" className="sticky left-0 bg-surface px-3 py-2 font-mono font-semibold whitespace-nowrap text-maroon">
                      {cellText(cell)}
                    </th>
                  ) : (
                    <td key={ci} className="px-3 py-2 font-mono whitespace-nowrap">
                      {cellText(cell)}
                    </td>
                  ),
                )}
                <td className="no-print px-2 py-1 text-right">
                  <AddToQuote compact item={quoteItem(row)} label={quoteLabel(row, ri)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards: phones. */}
      <ul className="grid gap-3 md:hidden print:hidden">
        {table.rows.map((row, ri) => (
          <li key={ri} className="rounded-inner border border-line bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-display text-lg font-semibold">
                <span className="text-muted">DN </span>
                <span className="font-mono text-maroon">{rowSize(table, row)}</span>
              </p>
              <AddToQuote compact item={quoteItem(row)} label={quoteLabel(row, ri)} />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {table.columns.slice(1).map((c, ci) => {
                const unit = columnUnit(c);
                return (
                  <div key={ci} className="grid min-w-0 gap-0.5">
                    <dt className="text-[12.5px] leading-tight text-muted">
                      {columnName(c)}
                      {unit && <span> ({unit})</span>}
                    </dt>
                    <dd className="font-mono [overflow-wrap:anywhere]">{cellText(row[ci + 1])}</dd>
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** True when any cell or heading carries the unexplained * / ** marks. */
export function hasFootnoteMarks(tables: Table[]): boolean {
  return tables.some((t) => t.columns.some((c) => c.label.includes("*")) || t.rows.some((r) => r.some((c) => c.includes("*"))));
}
