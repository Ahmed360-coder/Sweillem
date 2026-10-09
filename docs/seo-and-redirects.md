# SEO and redirects (Milestone 7)

## Redirects from the old site

`src/lib/redirects.ts` lists every address the old WordPress site used (from the Milestone 1 capture in `content/live-site` and `content/assets-manifest.json`). `next.config.ts` serves them as permanent (301) redirects, so bookmarks, search results and links on other sites keep working once sweillem.net points here.

| Old address | New page |
|---|---|
| `/about-us/` | `/about` |
| `/contact-us/` | `/contact` |
| `/resources/` | `/downloads` |
| `/pipes/`, `/bends/`, `/junctions/` and the other 7 product pages | `/products/<same name>` |
| `/projects/riyadh/`, `/projects/cat/saudia-arabia/` | `/projects#haram-central-area-makkah` (the Saudi photos) |
| `/projects/haram-central-area/`, `/projects/cat/europe/` | `/projects#germany` (that entry holds the Germany photos, whatever its name says) |
| `/projects/mekkah-the-scheme-of-the-jellyfish/` (and `/mekkah-the-jellyfish/`) | `/projects#new-alamein-city` (the Egypt photos) |
| `/projects/cat/<anything else>/`, `/portfolio/…` | `/projects` |
| `/hello-world/`, `/category/…`, `/tag/…`, `/author/…`, `/feed/`, `/2024/…`, `/ar/…` | `/` |
| `/sitemap_index.xml`, `/wp-sitemap.xml` | `/sitemap.xml` |
| `/?page_id=8`, `/?p=8` and the other WordPress page ids | the matching page |
| `/wp-content/uploads/…` for the 74 files copied into this site (certificate PDFs, photos) | the copy under `/downloads/` or `/images/` |

`/services/`, `/quality/`, `/certificates/`, `/joint-performance/`, `/sustainability/` and `/projects/` keep their names. Every address ending in `/` loses the slash in the same single redirect (Next's own trailing-slash redirect is switched off in `next.config.ts` for that reason).

Files on the old site that this site does not carry (the six Quality pictures on taas-sweillem.com, internal spec-table pictures) are not redirected and return the 404 page.

## Metadata

- Every page has its own title and description (`pageMetadata()` in `src/lib/metadata.ts`), a canonical URL and Open Graph and Twitter card tags. The tests check that no two pages share a title or description and that descriptions stay within 160 characters.
- Share pictures: each route has an `opengraph-image.tsx` that draws a 1200 × 630 card (logo, page title, a real SWEILLEM photo) with `src/lib/og-image.tsx`. They are made at build time and saved as JPEG so WhatsApp shows them.
- The home page carries schema.org `Organization` and `WebSite` data (`src/lib/structured-data.ts`), using only facts on the site: the name, founding year and city, the Cairo office, email and mobile number.
- `sitemap.xml` lists every page; `robots.txt` points to it on production and closes previews.

## The site address (for Milestone 8)

Canonical URLs, `metadataBase`, Open Graph URLs and share pictures, the `robots.txt` Sitemap line, the `sitemap.xml` entries and the JSON-LD all come from one setting, `NEXT_PUBLIC_SITE_URL` (`src/lib/site.ts`), which defaults to `https://sweillem.net`. Preview deployments use their own branch address instead, so their share pictures load; they are noindex anyway.

Only the production domain may be indexed. `next.config.ts` sends `X-Robots-Tag: noindex, nofollow` on every response served from any other host (sweillem.vercel.app, previews, localhost), and previews also carry a `noindex` robots meta tag and a closed `robots.txt`.

Until sweillem.net points at Vercel, links shared from sweillem.vercel.app point their share picture at sweillem.net, which still serves the old site, so chat apps show no picture. If that matters before launch, set `NEXT_PUBLIC_SITE_URL=https://sweillem.vercel.app` for Production in Vercel, and remove it (or set it to `https://sweillem.net`) at launch.

## Checks

`tests/e2e/seo.spec.ts` covers metadata, share pictures, the sitemap, structured data, every redirect, and a crawl of every page for links, images and `#anchors` that lead nowhere, plus a scan for template or unfinished wording. Lighthouse is run by hand against a production build (`next build` with `VERCEL_ENV=production`, then `next start`).
