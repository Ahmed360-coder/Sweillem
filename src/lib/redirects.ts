// Permanent redirects from the old WordPress site (sweillem.net) to the new pages.
// Old paths come from the Milestone 1 capture in content/live-site and
// content/assets-manifest.json. Read by next.config.ts, so keep this file free
// of "@/" imports.
import manifest from "../../content/assets-manifest.json" with { type: "json" };

interface Redirect {
  source: string;
  destination: string;
  permanent: true;
  has?: { type: "query"; key: string; value?: string }[];
}

/** Old page path (no trailing slash) → new path. */
export const pageRedirects: Record<string, string> = {
  "/about-us": "/about",
  "/contact-us": "/contact",
  "/resources": "/downloads",
  // Product pages lived at the site root.
  "/pipes": "/products/pipes",
  "/bends": "/products/bends",
  "/junctions": "/products/junctions",
  "/jointing-systems": "/products/jointing-systems",
  "/short-pieces": "/products/short-pieces",
  "/input-clutch-end-plugs": "/products/input-clutch-end-plugs",
  "/perforated-pipe": "/products/perforated-pipe",
  "/u-trap": "/products/u-trap",
  "/enlarger-reducer": "/products/enlarger-reducer",
  "/half-channels": "/products/half-channels",
  // Portfolio entries. Their titles and slugs disagree; each goes to the story
  // that holds its photos (see content/live-site/pages/projects.md).
  "/projects/haram-central-area": "/projects#germany",
  "/projects/mekkah-the-scheme-of-the-jellyfish": "/projects#new-alamein-city",
  "/projects/mekkah-the-jellyfish": "/projects#new-alamein-city",
  "/projects/riyadh": "/projects#haram-central-area-makkah",
  "/projects/cat/europe": "/projects#germany",
  "/projects/cat/saudia-arabia": "/projects#haram-central-area-makkah",
  "/projects/cat/united-emiretes": "/projects",
  // WordPress leftovers: the sample post, its archives and feeds.
  "/hello-world": "/",
  "/feed": "/",
  "/comments/feed": "/",
  "/sitemap_index.xml": "/sitemap.xml",
  "/wp-sitemap.xml": "/sitemap.xml",
};

/** Archive paths with any tail (category, tag, author, date and portfolio pages). */
const wildcardRedirects: Record<string, string> = {
  "/category/:path*": "/",
  "/tag/:path*": "/",
  "/author/:path*": "/",
  "/2024/:path*": "/",
  "/projects/cat/:path*": "/projects",
  "/projects/tag/:path*": "/projects",
  "/portfolio/:path*": "/projects",
  "/feed/:path*": "/",
  "/ar/:path*": "/",
};

/** WordPress ?page_id= and ?p= links (ids from the WordPress REST feed). */
const pageIds: Record<string, string> = {
  "883": "/",
  "8": "/about",
  "11": "/services",
  "17": "/contact",
  "1800": "/quality",
  "1802": "/projects",
  "1870": "/certificates",
  "1849": "/joint-performance",
  "1904": "/sustainability",
  "1833": "/downloads",
  "1782": "/products/pipes",
  "1784": "/products/short-pieces",
  "1818": "/products/junctions",
  "1820": "/products/bends",
  "302": "/projects#germany",
  "299": "/projects#new-alamein-city",
  "296": "/projects#haram-central-area-makkah",
};

/**
 * Uploaded files (certificate PDFs, photos) that were copied into public/.
 * Other sites link straight to the certificate PDFs, so those links keep working.
 */
export function uploadRedirects(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of manifest.liveSite as { url: string; path?: string; status: string; publish: string }[]) {
    if (a.status !== "downloaded" || a.publish !== "yes" || !a.path?.startsWith("public/")) continue;
    const { pathname } = new URL(a.url);
    // Next matches the encoded path; Arabic file names arrive percent-encoded.
    out[pathname] = a.path.slice("public".length);
  }
  return out;
}

const permanent = (source: string, destination: string): Redirect => ({ source, destination, permanent: true });

export function legacyRedirects(): Redirect[] {
  return [
    // "{/}?" also matches the trailing slash WordPress put on every page.
    ...Object.entries(pageRedirects).map(([from, to]) => permanent(`${from}{/}?`, to)),
    ...Object.entries(wildcardRedirects).map(([from, to]) => permanent(from, to)),
    ...Object.entries(uploadRedirects()).map(([from, to]) => permanent(from, to)),
    ...Object.entries(pageIds).flatMap(([id, to]) =>
      ["page_id", "p"].map((key) => ({ ...permanent("/", to), has: [{ type: "query" as const, key, value: id }] })),
    ),
    // Any other address with a trailing slash: drop the slash (Next's own rule is switched off in next.config.ts).
    permanent("/:path+/", "/:path+"),
  ];
}
