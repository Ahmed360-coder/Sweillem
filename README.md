# SWEILLEM

Rebuild of [sweillem.net](https://sweillem.net/), the site of SWEILLEM Vitrified Clay Pipes Co.

## Status

- **Milestone 1, content and asset capture**: all text, spec tables and asset lists are in [`content/`](content/README.md); open questions for SWEILLEM are in [`docs/content-gaps.md`](docs/content-gaps.md).
- Milestone 2 (Next.js foundation and design system) is next.

## Working with the content

```sh
npm install
npm run content:check          # validate spec tables, captures, asset manifest and types
npm run content:build          # regenerate content/specs/*.json from the markdown captures
npm run content:fetch-assets   # download photos and PDFs listed as pending from sweillem.net
```
