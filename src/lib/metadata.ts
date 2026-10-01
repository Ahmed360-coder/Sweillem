import type { Metadata } from "next";
import { site } from "./site";

/** Per-page metadata with a canonical URL. Titles use the layout's template. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · ${site.name}`, description, url: path },
  };
}
