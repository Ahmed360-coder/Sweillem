import type { Metadata } from "next";
import { site } from "./site";

/** Open Graph fields every page shares. A page's openGraph replaces the layout's, so each page repeats them. */
export const baseOpenGraph = {
  type: "website",
  siteName: site.legalName,
  locale: "en",
} as const;

/**
 * Per-page metadata with a canonical URL. Titles use the layout's template.
 * The share picture comes from the route's opengraph-image.tsx.
 */
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
    openGraph: { ...baseOpenGraph, title: `${title} · ${site.name}`, description, url: path },
  };
}
