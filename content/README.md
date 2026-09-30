# Content

Everything the new site says, copied from sweillem.net and from SWEILLEM's own deck and report (Milestone 1). Pages are built from these files; there is no CMS.

| Path | What it is |
|---|---|
| `live-site/pages/*.md` | Every company page as published on 30 September 2026, word for word, with its source URL. Template and placeholder text is marked, not reused. |
| `live-site/products/*.md` | The ten product pages. Spec tables are copied cell for cell, units and oddities included. |
| `specs/*.json` | The same spec tables as typed data (generated; do not edit by hand). |
| `products.ts` | The ten products, their state (text tables, pictures of tables, or empty) and images. |
| `certificates.ts` | The Downloads table, with which files we hold and which links were broken. |
| `company.ts` | Company facts, locations and real projects, each with its source and whether SWEILLEM still needs to confirm it. |
| `types.ts` | Types for all of the above. |
| `assets-manifest.json` | Every photo, drawing and PDF: the ones already in `public/` and the ones still on sweillem.net. |

## Rules

- Publish only what SWEILLEM already states. Anything marked `needs-confirmation` or `do-not-publish` stays off the site until it is confirmed.
- Never correct a spec value in `specs/*.json`. Fix the capture in `live-site/products/*.md` with a note saying who confirmed it, then run `npm run content:build`.
- Never hotlink sweillem.net. Files listed as `pending-download` are fetched into `public/` with `npm run content:fetch-assets`.

## How the capture was done

- Text and tables were read from each live page and from the site's WordPress content feed (`/wp-json/wp/v2/pages/<id>`), which also exposed the Contact Us page that blocks automated requests.
- Every spec table was read twice by two different routes (the rendered page and the content feed) and the two reads were compared side by side; no differences were found.
- The capture container could not download files from sweillem.net (its network blocks the host), so photos and PDFs are listed in the manifest instead of committed. Run the "Fetch live-site assets" workflow or `npm run content:fetch-assets` to bring them in.
- Open questions for SWEILLEM are in `docs/content-gaps.md`.
