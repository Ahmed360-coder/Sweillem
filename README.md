# SWEILLEM

Rebuild of [sweillem.net](https://sweillem.net/), the site of SWEILLEM Vitrified Clay Pipes Co.

## Status

- **Milestone 1, content and asset capture**: all text, spec tables and asset lists are in [`content/`](content/README.md); open questions for SWEILLEM are in [`docs/content-gaps.md`](docs/content-gaps.md).
- **Milestone 2, foundation and design system**: Next.js site with the design tokens, header and mobile menu, footer, page layouts, the 3-second intro, a route for every page in the plan's site map, and automatic checks. Pages whose content comes later show a tidy "being rebuilt" note naming the milestone that fills them.
- Milestone 3 (company pages) is next.

## Stack

Next.js 16 (App Router, static pages) · TypeScript · Tailwind CSS 4 · Motion · Vercel. Supabase arrives with the quote and contact forms in Milestone 6.

## Run it

```sh
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

## Checks

```sh
npm run check          # content check, ESLint and TypeScript
npm run test:e2e       # Playwright: every page loads, passes axe (WCAG 2.2 AA), fits 360 px; menu and intro behaviour
```

`test:e2e` runs against a production build (`npm run build` first). In a container with its own Chromium, point Playwright at it with `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome`. CI (`.github/workflows/ci.yml`) runs all of the above on every pull request.

## Where things live

| Path | What it is |
|---|---|
| `src/app/` | Routes. `layout.tsx` holds the shell; `template.tsx` is the page transition (M01). |
| `src/app/globals.css` | Design tokens from the redesign (colour, type, motion, shape) mapped into Tailwind. Light and dark themes; `data-theme` on `<html>` forces one. |
| `src/app/intro.css`, `src/components/Intro.tsx` | The 3-second intro (M00), shown once per session when a visitor lands on `/`. |
| `src/components/` | Header, mobile menu, footer, page header, buttons and shared pieces. |
| `src/lib/site.ts` | Navigation, footer links and the route list used by the sitemap and tests. |
| `src/lib/pages.ts` | Copy for pages still being rebuilt; each milestone replaces its entries. |
| `src/lib/motion.ts` | Motion durations and easings, shared with the CSS tokens. |
| `src/lib/quote.ts` | Quote list store (on the visitor's device); the header shows its count. |
| `content/` | Everything the site says, from Milestone 1. |
| `tests/e2e/` | Playwright tests. |

## Content rules

Publish only what SWEILLEM already states; anything marked `needs-confirmation` stays off the site. See [`content/README.md`](content/README.md).
