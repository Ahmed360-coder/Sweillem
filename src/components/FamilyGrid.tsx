import Link from "next/link";
import { families } from "@/lib/families";

export function FamilyGrid({ current }: { current?: string }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {families.map((f) => (
        <li key={f.slug}>
          <Link
            href={f.href}
            aria-current={f.slug === current ? "page" : undefined}
            className="group grid h-full min-h-[120px] content-between gap-6 rounded-[16px] border border-line bg-surface p-4 sm:p-5 text-ink no-underline transition-[border-color,transform,box-shadow] duration-300 ease-glaze hover:-translate-y-0.5 hover:border-ink hover:shadow-card aria-[current=page]:border-maroon"
          >
            <span className="hex block size-3 bg-maroon transition-transform duration-300 ease-set group-hover:rotate-90" aria-hidden="true" />
            <span className="grid gap-1">
              <span className="font-display text-base leading-tight [overflow-wrap:anywhere] sm:text-lg font-semibold">{f.name}</span>
              <small className="text-[13px] text-muted">{f.descriptor}</small>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
