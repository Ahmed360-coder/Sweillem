import Image from "next/image";
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
            className="group grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-card border border-line bg-surface text-ink no-underline transition-transform duration-300 ease-glaze hover:-translate-y-0.5 hover:border-ink active:translate-y-px aria-[current=page]:border-maroon"
          >
            <span className="relative block aspect-[3/2] overflow-hidden border-b border-line bg-surface">
              <Image
                src={f.picture.src}
                alt=""
                fill
                unoptimized={f.picture.src.endsWith(".svg")}
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="drawing bg-white object-contain transition-transform duration-500 ease-glaze group-hover:scale-[1.04]"
              />
            </span>
            <span className="flex items-start gap-2.5 p-4 sm:p-5">
              <span
                className="hex mt-1.5 block size-2.5 shrink-0 bg-maroon transition-transform duration-300 ease-set group-hover:rotate-90"
                aria-hidden="true"
              />
              <span className="grid gap-1">
                <span className="font-display text-base leading-tight [overflow-wrap:anywhere] sm:text-lg font-semibold">{f.name}</span>
                <small className="text-[13px] text-muted">{f.descriptor}</small>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
