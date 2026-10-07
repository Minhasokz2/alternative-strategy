# AltSocial: social media management alternatives & comparisons

A complete, static review and comparison website for social media management tools.
It has alternatives guides for **Hootsuite, Sprout Social, Loomly, Sendible and Planable**.
Each guide ranks **ContentStudio as the #1 alternative**, followed by 10+ other tools with full write-ups.

## What's included (37 pages)

| Section | URL | What it has |
| --- | --- | --- |
| Home | `/` | Hero, top-rated list, alternatives guides, why ContentStudio, top-10 leaderboard, comparisons |
| Alternatives guides (5) | `/hootsuite-alternatives/`, `/sprout-social-alternatives/`, `/loomly-alternatives/`, `/sendible-alternatives/`, `/planable-alternatives/` | Tab bar to switch between the 5 guides, quick verdict, sortable comparison table, reasons to switch, 12–13 detailed tool cards (ContentStudio first), feature matrix, ContentStudio head-to-head, buyer's guide, methodology, FAQ |
| Head-to-head (5) | `/compare/contentstudio-vs-<tool>/` | Score comparison, feature matrix, where each tool wins, pricing, pros & cons, FAQ |
| Reviews (20 + index) | `/reviews/`, `/reviews/<tool>/` | Searchable, filterable index, plus a full review for each tool with a score breakdown |
| Compare tool | `/compare/?tools=a,b,c` | Pick up to 3 tools for a side-by-side comparison. The URL can be shared |
| Best tools | `/best-social-media-management-tools/` | All 20 tools ranked |
| Pricing | `/pricing/` | Sortable, filterable pricing table |
| About | `/about/` | Testing methodology and affiliate disclosure |

The site also has SEO meta tags, Open Graph tags, JSON-LD (Article, ItemList, FAQPage, Review, BreadcrumbList), `sitemap.xml`, `robots.txt` and a 404 page. It supports light and dark mode and works on mobile.

## Project structure

```
src/data/tools.mjs      # all 20 tools: pricing, features, pros/cons, ratings, feature matrix
src/data/subjects.mjs   # the 5 alternatives guides: ranking order, pain points, per-tool "why switch", FAQs
src/assets/             # styles.css, app.js (nav, theme, TOC, sorting, filters, compare tool), favicon
build.mjs               # page templates and generator (no dependencies)
docs/                   # generated site, ready to deploy
```

## Usage

```bash
npm run build     # regenerate docs/
npm run serve     # build, then preview at http://localhost:8080
```

To edit content, change `src/data/*.mjs` and rebuild. For example:
- Add a tool: add an entry to `TOOLS`, then put its id in a subject's `alternatives` list and add a matching `reasons` line.
- Change the top pick's call-to-action link (for example, an affiliate link): edit `SITE.ctaUrl` in `build.mjs`.
- Set the production domain for canonical URLs and the sitemap: `SITE_URL=https://yourdomain.com/ npm run build`.

## Deploy

**GitHub Pages:** Settings → Pages → Deploy from branch → select this branch and the `/docs` folder.
**Cloudflare Workers:** connect the repo, set build command `npm run build`, deploy command `npx wrangler deploy` (config is in `wrangler.jsonc`), and add a build variable `SITE_URL` set to your live URL (e.g. `https://alternative-strategy.<you>.workers.dev/`).

Any other static host works too (Netlify, Vercel, Cloudflare Pages). Set the publish directory to `docs`.

> Prices are vendors' publicly listed entry plans. Check them before publishing, because vendors change pricing often.
