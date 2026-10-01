"use client";

/** Opens the browser's print dialog; print styles turn the page into a spec sheet. */
export function PrintButton({ label = "Print spec sheet" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full border border-line bg-surface px-5 py-3 font-semibold whitespace-nowrap text-ink transition-transform duration-200 ease-glaze hover:border-ink active:translate-y-px"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[18px] flex-none">
        <path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M7 14h10v7H7z" />
      </svg>
      {label}
    </button>
  );
}
