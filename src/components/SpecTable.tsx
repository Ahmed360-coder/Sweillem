import type { SpecTable as Table } from "@content/types";
import { cellNote, cellText, columnHeading, columnName, columnUnit, displayRows, rowSize, tableTitle } from "@/lib/specs";
import { AddToQuote } from "./AddToQuote";

/** Rows a phone shows before the rest of a table folds away. */
const PHONE_ROWS = 3;

/**
 * One published spec table. Wide screens and print get the table; phones get
 * one card per row so nothing scrolls sideways. Rows that differ only in
 * length are shown as one row (displayRows).
 */
export function SpecTable({ table, productName, headingLevel = 3 }: { table: Table; productName: string; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const;
  const rows = displayRows(table);
  const title = tableTitle(table);
  const headingId = `${table.id}-title`;
  const quoteItem = (row: string[]) => ({
    product: `${productName}, ${title}`,
    size: `DN ${rowSize(table, row)}`,
    strengthClass: table.strength ?? undefined,
  });
  const quoteLabel = (row: string[], i: number) => `Add DN ${rowSize(table, row)} (row ${i + 1}) of ${title} to quote`;
  // A table only folds when it would hide at least two rows.
  const shown = rows.length > PHONE_ROWS + 1 ? PHONE_ROWS : rows.length;
  const folded = rows.length - shown;
  const card = (row: string[], ri: number) => (
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
              <dd className="font-mono [overflow-wrap:anywhere]" title={cellNote(row[ci + 1], c)}>
                {cellText(row[ci + 1], c)}
              </dd>
            </div>
          );
        })}
      </dl>
    </li>
  );

  return (
    <section id={table.id} aria-labelledby={headingId} className="spec-table grid scroll-mt-28 gap-4 break-inside-avoid-page">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <H id={headingId} className="text-xl sm:text-2xl">
          {title}
        </H>
        <p className="font-mono text-xs tracking-[.08em] text-muted uppercase">
          {rows.length} {rows.length === 1 ? "row" : "rows"}
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
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-sunk/60">
                {row.map((cell, ci) =>
                  ci === 0 ? (
                    <th key={ci} scope="row" className="sticky left-0 bg-surface px-3 py-2 font-mono font-semibold whitespace-nowrap text-maroon">
                      {cellText(cell)}
                    </th>
                  ) : (
                    <td key={ci} className="px-3 py-2 font-mono whitespace-nowrap" title={cellNote(cell, table.columns[ci])}>
                      {cellText(cell, table.columns[ci])}
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

      {/* Cards: phones. Long tables show the first few rows and fold the rest away,
          so a phone page stays a few screens long. */}
      <ul className="grid gap-3 md:hidden print:hidden">{rows.slice(0, shown).map(card)}</ul>
      {folded > 0 && (
        <details className="group grid gap-3 md:hidden print:hidden">
          <summary className="mx-auto flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-maroon [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show all {rows.length} rows</span>
            <span className="hidden group-open:inline">Show fewer rows</span>
            <svg viewBox="0 0 24 24" className="size-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <ul className="mt-3 grid gap-3">{rows.slice(shown).map((row, i) => card(row, i + shown))}</ul>
        </details>
      )}
    </section>
  );
}
