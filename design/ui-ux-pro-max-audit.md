# UI UX Pro Max pass on the site and the prototype

Ahmed asked for the UI UX Pro Max skill on 1 Oct 2026. The skill is [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), v2.13.0. I used the rule set in its `ui-ux-pro-max` skill: 10 categories, checked in the skill's priority order. Its installer and search script did not run here: the session's safety check blocked running downloaded code, so the rules were read straight from the skill's files.

**What was checked:**

- **The site:** commit `a43dc33` (Milestone 3 merged), built and run locally. All 16 pages at 1360 px and 390 px, in light and dark mode, plus reduced motion. The live URL can't be reached from this environment, so the checks ran on the same code on `main`.
- **The redesign prototype (v7):** its 10 screens at the same two widths.

The repo's Playwright run already enforces axe WCAG 2.2 AA in light mode. The checks below cover what that run leaves out.

## Passed

- **Motion:** with reduced motion on, nothing animates on Home, Process, About or Joint performance.
- **Layout:** no horizontal scroll at 390 px. The header leaves room for anchors (scroll padding 92 px).
- **Headings:** one h1 per page, and no skipped heading levels.
- **Images:** all have sizes set, the ones below the fold load lazily, and all are WebP/AVIF through `next/image`.
- **Keyboard:** a skip link, and a visible focus ring on every stop.
- **Forms:** every field has a label.
- **Clean runs:** axe best-practice rules pass, and there are no console errors.

## To fix in the build (handed to Milestone 3)

| # | Skill rule | What happens now | Fix |
|---|---|---|---|
| 1 | Accessibility: `color-contrast` and `color-dark-mode` | **Dark mode fails contrast in 3 places.** The 11 px maroon labels on the About cards are at 4.2-4.4:1. The small unit next to the numbers on Joint performance (phone) is at 4.3:1. The repo's axe test only runs in light mode. | Use a lighter maroon tone for small text in dark mode. Run the axe page test with `colorScheme: "dark"` as well. |
| 2 | Touch: `touch-target-size` (44 px on phones) | Footer links are 28 px tall on phones, and the header logo is 40 px. The "Download PDF" and "View the certificate" links are 24-26 px tall. | Give links that stand on their own a 44 px minimum height on phones (for example `min-h-11` with flex centring, or padding). Keep the spacing the same. |
| 3 | Typography: no text under 12 px | Some text is 11-11.5 px: footer group headings, every source note (`SourceNote`, used on 7 pages), the region tags on project cards, and the heritage labels. | Raise the floor to 12 px for mono labels and 12.5-13 px for source notes (15 uses of `text-[11px]`/`text-[11.5px]`). |
| 4 | Layout: `readable-font-size` (16 px body on phones) | Body paragraphs on phones are 15 px, and the certificate notes are 13 px. | Body text at 16 px under 640 px. 15 px is fine on desktop. |
| 5 | Typography: `line-length` 65-75 characters | Source notes on About, Joint performance and Sustainability run about 190 characters per line on desktop. | Give `SourceNote` `max-width: 75ch`. |
| 6 | Navigation: `nav-state-active` | 7 of 16 pages highlight nothing in the main nav: Quality, Certificates, Joint performance, Sustainability, Euro Sweillem, Services and Quote list. | Map each page to a parent item (for example, the Quality group under About, Services under About) and mark that parent as current, or add a breadcrumb. |
| 7 | Style: `dark-mode-pairing` | The Process scroll journey stays light in dark mode. Its colours are hard-coded hex in `ScrollJourney.tsx` and `ProcessJourney.tsx`. | Low priority. Keep it light on purpose and say so in a comment, or move it onto tokens. |

## The prototype

The prototype shows the same patterns, and the build has already fixed most of them. On phones its chips and size buttons are 31-33 px tall, its labels are 11 px, and its inputs are 13-15 px, which makes iPhones zoom in. These carry into the build rules below. I did not change the prototype, because the site is now the reference for those details.

## Rules to keep (added to the Milestone 2 build rules in `taste-audit.md`)

- **Phones:** tap targets at least 44 px tall, form fields at least 16 px font (no iOS zoom), and body text at 16 px.
- **Small text:** nothing under 12 px, and source notes capped at 75 characters per line.
- **Dark mode:** every page passes axe in dark mode too, not only light.
- **Navigation:** every page lights up a navigation item.
