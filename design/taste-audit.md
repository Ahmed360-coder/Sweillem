# Taste pass on the redesign prototype

Ahmed asked for the taste skill (`npx skills add Leonxlnx/taste-skill`) to be run over the prototype (30 Sep 2026). I used two of its skills: `design-taste-frontend` and `redesign-existing-projects`. This note records what changed, what was deliberately left alone, and the rules the Next.js build should keep.

**Design read:** this is a brand-preserving redesign of an industrial manufacturer's site. The readers are engineers, contractors and procurement teams, so the language is trust-first and technical. The logo, maroon, slate and the S-mark hexagon stay. Dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 7 (Ahmed asked for lots of motion), VISUAL_DENSITY 4.

## Changed in the prototype

| Rule from the skill | Fix |
|---|---|
| At most one eyebrow label per three sections | Home keeps only the hero eyebrow. The families, film, projects and tools sections now open with the headline alone. |
| Hero headline in 2-3 lines, subtext under about 20 words | The hero headline is smaller and gets a wider column. The subtext is one sentence; the class ranges are already in the stats and the explorer. |
| Hero section stays uncluttered | The film card no longer repeats its title over the picture. The section heading carries it. |
| No pills laid over photos | Project cards show the region as a small label under the photo instead of a tag on the image. |
| No row of three equal cards | The home projects row is now a featured layout: one large card beside two stacked cards. It becomes one column on phones. |
| Navigation fits on one line on desktop | Nav labels never wrap, in English and Arabic. The quote label hides below 1240 px, and the menu button takes over below 980 px instead of letting the header overflow. |
| Tactile feedback on press | Every button, chip, card and tool tile moves down by 1 px when pressed. |
| Skip link and focus target | Added a "Skip to content" link, and the main area can take focus. |
| No flat, textureless surfaces | Added a faint paper grain. It is one fixed layer, not on the scrolling area, and is softer in the kiln theme. |
| No en or em dashes in visible text | Ranges and empty table cells use a plain hyphen. This covers the film captions and the motion table too. |
| Favicon | Added the maroon S mark as the page icon. |
| Body text measure | Ledes and section text are capped at 62 characters, with `text-wrap: pretty`. |

## Not applied, on purpose

- **Invented "organic" numbers, names and placeholder photos (picsum, stock).** The project rule is to publish only what SWEILLEM states and to use their own photos, so these do not apply.
- **Swapping fonts to Geist or Satoshi.** Jost and IBM Plex are already a deliberate pairing, and IBM Plex Sans Arabic covers Arabic. The skill discourages Inter, which the prototype does not use.
- **Palette changes.** The maroon comes from the logo. The skill's own redesign protocol says to keep brand colours.
- **Removing the numbered process steps and film chapters.** They are real sequence content, not decorative section numbers.
- **Changing the logo, the navigation labels or the routes.** The skill says these never change without approval.

## Rules for the Milestone 2 build

- **Scrolling:** no `scroll` event listeners. The prototype uses them for the process scrollytelling, the heritage track and the parallax. In the build, use Motion `useScroll`, IntersectionObserver, or CSS `animation-timeline: view()`.
- **What animates:** only `transform` and `opacity`. Every item in `motion-spec.md` keeps its reduced-motion fallback.
- **Heavy code:** load three.js only on the 3D viewer route, and the film player only when it comes into view.
- **Type:** keep the one-line navigation, the eyebrow limit, sentence-case headings, and no en or em dashes in copy, including the CMS content.
- **Shape and shadows:** use one radius scale (cards 22, inner 14, inputs 10, controls full pill), and shadows tinted to the page colour, never pure black.
- **Layout:** hero headline in three lines at most at 1280 px, and no row of three equal cards.
- **Phones and access (from the UI UX Pro Max pass, see `ui-ux-pro-max-audit.md`):**
  - Tap targets at least 44 px tall, form fields at 16 px or larger, and body text at 16 px.
  - No text under 12 px.
  - Every page passes axe in dark mode.
  - Every page marks a navigation item as current.
