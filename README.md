# SWEILLEM

Rebuild of [sweillem.net](https://sweillem.net/), the site of SWEILLEM Vitrified Clay Pipes Co.

## Status

Milestones 1 to 6 are live: content capture, the foundation and design system, company pages, products and the explorer, the projects map and downloads, and the quote list and forms.
Milestone 7 (QA, SEO and redirects) adds permanent redirects from every old sweillem.net address, a share picture per page, structured data, and checks for metadata, links and placeholder text; see [`docs/seo-and-redirects.md`](docs/seo-and-redirects.md). Milestone 8 is the launch on sweillem.net.

## Stack

Next.js 16 (App Router, static pages) · TypeScript · Tailwind CSS 4 · Motion · Vercel. Supabase stores quote and contact requests (see [`docs/forms.md`](docs/forms.md)).

## Run it

```sh
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

## Checks

```sh
npm run check          # content check, ESLint and TypeScript
npm run test:e2e       # Playwright: every page loads, passes axe (WCAG 2.2 AA), fits 360 px; menu, intro and forms;
                       # titles, descriptions, canonicals, share pictures, redirects and dead links
```

`test:e2e` runs against a production build (`npm run build` first). In a container with its own Chromium, point Playwright at it with `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome`. CI (`.github/workflows/ci.yml`) runs all of the above on every pull request.

## Deploy

The repo is linked to the Vercel project `sweillem`. Every push to a branch gets a preview URL (search engines are kept out with `noindex` and a closed `robots.txt`); merging to `main` deploys production at [sweillem.vercel.app](https://sweillem.vercel.app). `vercel.json` pins the framework to Next.js. The project was imported before `main` had the app, so Vercel had set it up as a plain static site and served the empty `public/` folder, which gave a 404 on every page.

## Where things live

| Path | What it is |
|---|---|
| `src/app/` | Routes. `layout.tsx` holds the shell; `template.tsx` is the page transition (M01). |
| `src/app/globals.css` | Design tokens from the redesign (colour, type, motion, shape) mapped into Tailwind. Light and dark themes, plus `--j-*` scene colours for the drawn journeys and `--drawing-filter` for line drawings on white. `.only-light` / `.only-dark` show something in one theme. |
| `src/lib/theme-script.ts`, `src/lib/theme.ts`, `src/components/ThemeSwitch.tsx` | Light and dark mode: a head script sets `<html data-theme>` from the visitor's choice (localStorage `sweillem.theme`) or the device setting before the first paint; the header button swaps modes and the side menu offers Auto, Light and Dark. |
| `src/app/intro.css`, `src/components/Intro.tsx` | The 3-second intro (M00), shown once per session when a visitor lands on `/`. |
| `src/components/` | Header, mobile menu, footer, page header, buttons and shared pieces. |
| `src/lib/site.ts` | Navigation, footer links and the route list used by the sitemap and tests. |
| `src/lib/redirects.ts` | Permanent redirects from the old WordPress addresses, read by `next.config.ts`. |
| `src/lib/og-image.tsx` | The share picture behind each route's `opengraph-image.tsx`. |
| `src/lib/motion.ts` | Motion durations and easings, shared with the CSS tokens. |
| `src/lib/quote.ts` | Quote list store (on the visitor's device); the header shows its count. |
| `content/` | Everything the site says, from Milestone 1. |
| `tests/e2e/` | Playwright tests. |

## Content rules

Publish only what SWEILLEM already states; anything marked `needs-confirmation` stays off the site. See [`content/README.md`](content/README.md).
