#!/usr/bin/env node
// Static site generator for AltSocial. Zero dependencies.
//   node build.mjs            -> writes the site to ./docs
//   SITE_URL=https://x.com/ node build.mjs   -> sets canonical/sitemap base URL
import { mkdirSync, writeFileSync, copyFileSync, rmSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TOOLS, FEATURES } from "./src/data/tools.mjs";
import { SUBJECTS, SUBJECT_ORDER } from "./src/data/subjects.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "docs");

const SITE = {
  name: "AltSocial",
  tagline: "Honest social media management alternatives & comparisons",
  url: (process.env.SITE_URL || "https://minhasokz2.github.io/alternative-strategy/").replace(/\/?$/, "/"),
  author: "AltSocial Editorial Team",
  topPick: "contentstudio",
  ctaUrl: "https://contentstudio.io/",
};
const NOW = new Date();
const MONTH_YEAR = NOW.toLocaleDateString("en-US", { month: "long", year: "numeric" });
const YEAR = NOW.getFullYear();
const ISO = NOW.toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const t = (id) => ({ id, ...TOOLS[id] });
const cs = t(SITE.topPick);
const allTools = Object.keys(TOOLS).map(t);
const ranked = [...allTools].sort((a, b) => (a.id === SITE.topPick ? -1 : b.id === SITE.topPick ? 1 : b.rating - a.rating || a.priceFrom - b.priceFrom));

const logo = (tool, size = "") => `<span class="logo ${size}" style="background:${tool.color}" aria-hidden="true">${esc(tool.initials)}</span>`;
const stars = (r) => `<span class="rating"><span class="stars" style="--pct:${(r / 5) * 100}%" aria-hidden="true">★★★★★</span><span>${r.toFixed(1)}<span class="sr-only"> out of 5</span></span></span>`;
const mark = (v) => (v === 2 ? '<span class="yes" title="Included">✓</span><span class="sr-only">Yes</span>' : v === 1 ? '<span class="part" title="Limited / add-on / higher tier">~</span><span class="sr-only">Limited</span>' : '<span class="no" title="Not available">✕</span><span class="sr-only">No</span>');
const legend = `<div class="legend"><span>${mark(2)} Included</span><span>${mark(1)} Limited, add-on or higher tier</span><span>${mark(0)} Not available</span></div>`;
const ext = (tool, label = "Visit website", cls = "btn btn-ghost btn-sm") => `<a class="${cls}" href="${tool.id === SITE.topPick ? SITE.ctaUrl : tool.url}" target="_blank" rel="nofollow noopener">${label} ↗</a>`;
const csCta = (label = "Try ContentStudio free", cls = "btn btn-cs") => `<a class="${cls}" href="${SITE.ctaUrl}" target="_blank" rel="nofollow noopener">${label} →</a>`;
const featureCount = (tool) => Object.values(tool.matrix).filter((v) => v === 2).length;
const altUrl = (sid) => `${sid}-alternatives/`;
const vsUrl = (sid) => `compare/contentstudio-vs-${sid}/`;
const reviewUrl = (id) => `reviews/${id}/`;
const priceNote = `<p class="note">Prices are the vendors' publicly listed entry plans in USD (usually billed annually) as of ${MONTH_YEAR}. Vendors change pricing often, so always confirm on the official site before buying.</p>`;
const json = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;

// ---------------------------------------------------------------------------
// layout
// ---------------------------------------------------------------------------
function layout({ path, title, description, body, schema = [], active = "", sticky = true }) {
  const depth = path.split("/").filter(Boolean).length;
  const base = depth ? "../".repeat(depth) : "./";
  const canonical = SITE.url + path;
  const link = (href) => base + href;
  const cur = (k) => (k === active ? ' aria-current="page"' : "");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#4f46e5">
<link rel="icon" href="${link("assets/favicon.svg")}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${link("assets/styles.css")}">
${schema.map(json).join("\n")}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <nav class="container nav" aria-label="Main">
    <a class="brand" href="${link("")}"><span class="brand-mark">A</span><span>Alt<b>Social</b></span></a>
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false">☰</button>
    <ul class="nav-links">
      <li class="has-dd">
        <button aria-expanded="false" aria-haspopup="true"${active === "alts" ? ' style="color:var(--primary)"' : ""}>Alternatives ▾</button>
        <div class="dropdown">
          ${SUBJECT_ORDER.map((sid) => `<a href="${link(altUrl(sid))}">${logo(t(sid), "logo-sm")}${esc(TOOLS[sid].name)} alternatives</a>`).join("\n          ")}
        </div>
      </li>
      <li class="has-dd">
        <button aria-expanded="false" aria-haspopup="true"${active === "vs" ? ' style="color:var(--primary)"' : ""}>Comparisons ▾</button>
        <div class="dropdown">
          ${SUBJECT_ORDER.map((sid) => `<a href="${link(vsUrl(sid))}">ContentStudio vs ${esc(TOOLS[sid].name)}</a>`).join("\n          ")}
          <a href="${link("compare/")}"><b>Compare any tools →</b></a>
        </div>
      </li>
      <li><a href="${link("best-social-media-management-tools/")}"${cur("best")}>Best tools</a></li>
      <li><a href="${link("reviews/")}"${cur("reviews")}>Reviews</a></li>
      <li><a href="${link("pricing/")}"${cur("pricing")}>Pricing</a></li>
      <li><button class="theme-toggle" aria-label="Toggle dark mode">☾</button></li>
      <li class="nav-cta">${csCta("Try our #1 pick", "btn btn-primary btn-sm")}</li>
    </ul>
  </nav>
</header>
<main id="main">
${body.replaceAll("{{base}}", base)}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="${link("")}"><span class="brand-mark">A</span><span>Alt<b>Social</b></span></a>
        <p class="muted" style="margin-top:12px">${esc(SITE.tagline)}. We test social media management platforms hands-on and publish clear, side-by-side comparisons.</p>
        <p class="muted small">Some links may be affiliate links. They never change our rankings. <a href="${link("about/#disclosure")}">Read our disclosure</a>.</p>
      </div>
      <div><h4>Alternatives</h4><ul>${SUBJECT_ORDER.map((sid) => `<li><a href="${link(altUrl(sid))}">${esc(TOOLS[sid].name)} alternatives</a></li>`).join("")}</ul></div>
      <div><h4>Comparisons</h4><ul>${SUBJECT_ORDER.map((sid) => `<li><a href="${link(vsUrl(sid))}">ContentStudio vs ${esc(TOOLS[sid].name)}</a></li>`).join("")}<li><a href="${link("compare/")}">Comparison tool</a></li></ul></div>
      <div><h4>Resources</h4><ul>
        <li><a href="${link("best-social-media-management-tools/")}">Best tools ${YEAR}</a></li>
        <li><a href="${link("reviews/")}">All reviews</a></li>
        <li><a href="${link("pricing/")}">Pricing comparison</a></li>
        <li><a href="${link("about/")}">How we test</a></li>
        <li><a href="${link("about/#disclosure")}">Disclosure</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <span>© ${YEAR} ${SITE.name}. All product names and trademarks belong to their respective owners.</span>
      <span>Last updated ${MONTH_YEAR}</span>
    </div>
  </div>
</footer>
${sticky ? `<div class="sticky-cta" role="complementary" aria-label="Top pick"><div class="txt"><b>Our #1 pick: ContentStudio</b><br><span class="muted">14-day free trial, no card required</span></div>${csCta("Try free", "btn btn-cs btn-sm")}</div>` : ""}
<button class="back-top" aria-label="Back to top">↑</button>
<script src="${link("assets/app.js")}" defer></script>
</body>
</html>
`;
  return html;
}

const breadcrumb = (items) =>
  `<nav class="breadcrumb" aria-label="Breadcrumb">${items.map(([label, href], i) => (href ? `<a href="{{base}}${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`) + (i < items.length - 1 ? " <span>/</span>" : "")).join(" ")}</nav>`;

const byline = () => `<div class="meta-row"><span style="display:inline-flex;align-items:center;gap:8px"><span class="avatar">AS</span> ${SITE.author}</span><span>Updated ${MONTH_YEAR}</span><span>Hands-on tested</span></div>`;

const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, href], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE.url + (href ?? "") })),
});
const faqSchema = (faqs) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
const faqBlock = (faqs) => `<div class="faq">${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div>`;

const ctaBand = (title = "Ready to switch to a better social media tool?", text = "Join thousands of agencies and brands that publish, engage and report from one place with ContentStudio.") => `
<section class="block"><div class="container"><div class="cta-band">
  <div><h2>${esc(title)}</h2><p>${esc(text)}</p></div>
  <div style="display:flex;gap:10px;flex-wrap:wrap">${csCta("Start free trial", "btn btn-ghost")}<a class="btn" style="color:#fff;border-color:rgba(255,255,255,.5)" href="{{base}}compare/">Compare tools</a></div>
</div></div></section>`;

// ---------------------------------------------------------------------------
// shared blocks
// ---------------------------------------------------------------------------
function quickTable(list, { highlight = SITE.topPick, href = (tool) => `#tool-${tool.id}` } = {}) {
  return `<div class="table-wrap"><table data-sortable>
  <thead><tr><th class="sortable" data-type="num">#</th><th class="sortable" data-type="text">Tool</th><th>Best for</th><th class="sortable" data-type="num">Starting price</th><th>Free plan / trial</th><th class="sortable" data-type="num">Rating</th></tr></thead>
  <tbody>${list
    .map(
      (tool, i) => `<tr${tool.id === highlight ? ' class="is-top"' : ""}>
    <td data-sort="${i + 1}"><b>${i + 1}</b></td>
    <td data-sort="${esc(tool.name)}"><div class="tool-cell">${logo(tool, "logo-sm")}<a href="${href(tool)}">${esc(tool.name)}</a>${tool.id === highlight ? ' <span class="badge badge-gold">Top pick</span>' : ""}</div></td>
    <td class="small">${esc(tool.bestFor)}</td>
    <td data-sort="${tool.priceFrom}"><b>${esc(tool.priceLabel)}</b></td>
    <td class="small">${esc(tool.trial)}</td>
    <td data-sort="${tool.rating}">${stars(tool.rating)}</td>
  </tr>`
    )
    .join("")}</tbody></table></div>`;
}

function matrixTable(list, opts = {}) {
  return `<div class="table-wrap"><table class="matrix">
  <thead><tr><th>Feature</th>${list.map((tool) => `<th title="${esc(tool.name)}"><div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-transform:none;letter-spacing:0">${logo(tool, "logo-sm")}<span style="font-size:.75rem;color:var(--text)">${esc(tool.name)}</span></div></th>`).join("")}</tr></thead>
  <tbody>${FEATURES.map((f) => `<tr><td><b>${esc(f.label)}</b></td>${list.map((tool) => `<td${tool.id === SITE.topPick ? ' style="background:color-mix(in srgb,var(--accent) 7%,transparent)"' : ""}>${mark(tool.matrix[f.key])}</td>`).join("")}</tr>`).join("")}
  ${opts.price ? `<tr><td><b>Starting price</b></td>${list.map((tool) => `<td class="small"><b>${esc(tool.priceLabel)}</b></td>`).join("")}</tr>` : ""}
  </tbody></table></div>${legend}`;
}

function toolCard(tool, rank, { reason, subject } = {}) {
  const featured = tool.id === SITE.topPick;
  const subjName = subject ? TOOLS[subject].name : "";
  return `<article class="tool-card${featured ? " featured" : ""}" id="tool-${tool.id}">
  <div class="tool-head">
    ${logo(tool, "logo-lg")}
    <div class="title">
      <div class="rank">#${rank}${featured ? ` · Best ${esc(subjName)} alternative overall` : ""}</div>
      <h3>${esc(tool.name)}</h3>
      <p class="tag">${esc(tool.tagline)}</p>
      <div style="margin-top:8px">${stars(tool.rating)}</div>
    </div>
    <div class="actions">
      ${featured ? csCta("Try ContentStudio free", "btn btn-cs btn-block") : ext(tool, "Visit website", "btn btn-ghost btn-block")}
      <a class="btn btn-ghost btn-sm btn-block" href="{{base}}${reviewUrl(tool.id)}">Read full review</a>
      ${featured && subject ? `<a class="btn btn-ghost btn-sm btn-block" href="{{base}}${vsUrl(subject)}">ContentStudio vs ${esc(subjName)}</a>` : !featured ? `<a class="btn btn-ghost btn-sm btn-block" href="{{base}}compare/?tools=contentstudio,${tool.id}${subject ? "," + subject : ""}">Compare with ContentStudio</a>` : ""}
    </div>
  </div>
  <div class="facts">
    <div><small>Starting price</small><b>${esc(tool.priceLabel)}</b></div>
    <div><small>Free plan / trial</small><b>${esc(tool.trial)}</b></div>
    <div><small>Features covered</small><b>${featureCount(tool)} / ${FEATURES.length}</b></div>
    <div><small>Networks</small><b>${tool.platforms.length} supported</b></div>
  </div>
  ${reason ? `<div class="why-switch"><strong>Why switch from ${esc(subjName)}:</strong> ${esc(reason)}</div>` : ""}
  <p>${esc(tool.overview)}</p>
  <p><b>Best for:</b> ${esc(tool.bestFor)}.</p>
  <h4>Key features</h4>
  <ul class="feature-list">${tool.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
  <div class="pros-cons">
    <div class="pros"><h4>Pros</h4><ul>${tool.pros.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>
    <div class="cons"><h4>Cons</h4><ul>${tool.cons.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>
  </div>
  <h4>Pricing</h4>
  <div class="price-row">${tool.pricing.map((p) => `<div class="price-pill"><small>${esc(p.plan)}</small><b>${esc(p.price)}</b><span>${esc(p.note)}</span></div>`).join("")}</div>
  <div class="chips" style="margin-top:16px">${tool.platforms.map((p) => `<span class="chip">${esc(p)}</span>`).join("")}</div>
</article>`;
}

function scoreBars(tool) {
  const rows = [["Ease of use", tool.scores.ease], ["Features", tool.scores.features], ["Value", tool.scores.value], ["Support", tool.scores.support]];
  return `<div class="scores">${rows.map(([l, v]) => `<div class="score"><span>${l}</span><div class="bar"><i style="width:${(v / 5) * 100}%"></i></div><b>${v.toFixed(1)}</b></div>`).join("")}</div>`;
}

// Pick helper for the buyer's guide: first candidate present in the list
const pickFrom = (list, candidates) => candidates.map((id) => list.find((x) => x.id === id)).find(Boolean);

// ---------------------------------------------------------------------------
// pages
// ---------------------------------------------------------------------------
function alternativesPage(sid) {
  const S = SUBJECTS[sid];
  const subject = t(sid);
  const list = [cs, ...S.alternatives.map(t)];
  const n = list.length;
  const path = altUrl(sid);
  const title = `${n} Best ${subject.name} Alternatives in ${YEAR} (Tested & Compared)`;
  const desc = `Looking for a ${subject.name} alternative? We compared ${n} tools on features, pricing and ease of use. ContentStudio is our #1 pick. See the full breakdown.`;

  const cheapest = [...list].slice(1).sort((a, b) => a.priceFrom - b.priceFrom)[0];
  const free = [...list].slice(1).filter((x) => x.freePlan).sort((a, b) => b.rating - a.rating)[0];
  const guide = [
    ["🏆", "Best overall", cs, "All-in-one publishing, discovery, inbox, approvals and white-label reports at the best price."],
    ["🏢", "Best for agencies", cs, "Unlimited workspaces, client approval links and white-label reporting on one plan."],
    ["💸", "Best on a tight budget", cheapest, `Entry plans from ${cheapest.priceLabel}.`],
    free && ["🆓", "Best free plan", free, `${free.trial}: a no-cost way to start.`],
    pickFrom(list, ["agorapulse", "statusbrew", "napoleoncat", "sprout-social"]) && ["💬", "Best for engagement", pickFrom(list, ["agorapulse", "statusbrew", "napoleoncat", "sprout-social"]), "A standout inbox for teams that live in comments and DMs."],
    pickFrom(list, ["later", "pallyy", "planable"]) && ["🎨", "Best for visual brands", pickFrom(list, ["later", "pallyy", "planable"]), "Visual planning built for Instagram- and TikTok-led content."],
    pickFrom(list, ["sprout-social", "hootsuite"]) && ["🏛️", "Best for enterprise", pickFrom(list, ["sprout-social", "hootsuite"]), "Deep governance and listening, if budget allows."],
  ].filter(Boolean);

  const vsRows = [
    ["Starting price", cs.priceLabel, subject.priceLabel],
    ["Free plan / trial", cs.trial, subject.trial],
    ...FEATURES.filter((f) => f.key !== "freeplan").map((f) => [f.label, mark(cs.matrix[f.key]), mark(subject.matrix[f.key]), true]),
    ["Our rating", stars(cs.rating), stars(subject.rating), true],
  ];

  const toc = [
    ["comparison", "Quick comparison"],
    ["why-switch", `Why switch from ${subject.name}?`],
    ["reviews", `The ${n} best alternatives`],
    ...list.map((x, i) => [`tool-${x.id}`, `&nbsp;&nbsp;${i + 1}. ${esc(x.name)}`, true]),
    ["features", "Feature matrix"],
    ["head-to-head", `ContentStudio vs ${subject.name}`],
    ["how-to-choose", "How to choose"],
    ["methodology", "How we tested"],
    ["faq", "FAQ"],
  ];

  const body = `
<section class="page-hero"><div class="container">
  ${breadcrumb([["Home", ""], [`${subject.name} alternatives`, null]])}
  <div class="subject-tabs" role="navigation" aria-label="Alternatives by tool">
    ${SUBJECT_ORDER.map((s) => `<a href="{{base}}${altUrl(s)}"${s === sid ? ' aria-current="page"' : ""}>${esc(TOOLS[s].name)}</a>`).join("")}
  </div>
  <span class="eyebrow">${logo(subject, "logo-sm")} ${esc(subject.name)} alternatives</span>
  <h1>${esc(title)}</h1>
  <p class="lead muted" style="font-size:1.1rem;max-width:820px">${esc(S.intro)}</p>
  ${byline()}
  <div class="verdict" id="quick-picks">
    <h2>⚡ Quick verdict</h2>
    <p style="margin:0">${esc(S.verdict)}</p>
    <div class="top-picks">
      ${list.slice(0, 3).map((x, i) => `<a class="top-pick" href="#tool-${x.id}">${logo(x)}<div><small>${["Best overall", "Runner-up", "Also great"][i]}</small><b>${esc(x.name)}</b><div class="small muted">${esc(x.priceLabel)} · ★ ${x.rating}</div></div></a>`).join("")}
    </div>
    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">${csCta("Try ContentStudio free")}<a class="btn btn-ghost" href="#comparison">See the comparison</a></div>
  </div>
</div></section>

<div class="container layout">
  <aside class="toc" aria-label="On this page">
    <h4>On this page</h4>
    <ol>${toc.map(([id, label, sub]) => `<li><a href="#${id}"${sub ? ' class="small"' : ""}>${sub ? label : esc(label)}</a></li>`).join("")}</ol>
    <div class="card toc-cta" style="padding:16px">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">${logo(cs, "logo-sm")}<b>ContentStudio</b></div>
      <p class="small muted">Our #1 ${esc(subject.name)} alternative. From ${esc(cs.priceLabel)}.</p>
      ${csCta("Try free", "btn btn-cs btn-sm btn-block")}
    </div>
  </aside>

  <article class="prose">
    <section id="comparison">
      <h2>${esc(subject.name)} alternatives at a glance</h2>
      <p class="muted">Click any column header to sort. Click a tool to jump to its full review.</p>
      ${quickTable(list)}
      ${priceNote}
    </section>

    <section id="why-switch">
      <h2>Why look for a ${esc(subject.name)} alternative?</h2>
      <p>${esc(subject.overview)}</p>
      <div class="grid grid-2" style="margin:20px 0">
        ${S.painPoints.map((p, i) => `<div class="card pain"><span class="n">${i + 1}</span><div><h3 style="font-size:1.05rem">${esc(p.title)}</h3><p class="muted small" style="margin:0">${esc(p.text)}</p></div></div>`).join("")}
      </div>
      <div class="card">
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">${logo(subject)}<div style="flex:1"><h3 style="margin:0">${esc(subject.name)} at a glance</h3><span class="muted small">${esc(subject.tagline)}</span></div>${stars(subject.rating)}</div>
        <div class="facts"><div><small>Starting price</small><b>${esc(subject.priceLabel)}</b></div><div><small>Free plan / trial</small><b>${esc(subject.trial)}</b></div><div><small>Best for</small><b class="small">${esc(subject.bestFor)}</b></div><div><small>Founded</small><b>${subject.founded}</b></div></div>
        <div class="pros-cons" style="margin-bottom:0">
          <div class="pros"><h4>What ${esc(subject.name)} does well</h4><ul>${subject.pros.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>
          <div class="cons"><h4>Where it falls short</h4><ul>${subject.cons.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>
        </div>
        <p style="margin:14px 0 0"><a href="{{base}}${reviewUrl(sid)}">Read our full ${esc(subject.name)} review →</a></p>
      </div>
    </section>

    <section id="reviews">
      <h2>The ${n} best ${esc(subject.name)} alternatives, reviewed</h2>
      <p class="muted">Ranked by overall score across features, ease of use, value and support, and by how well each tool solves the problems people have with ${esc(subject.name)}.</p>
      ${list.map((x, i) => toolCard(x, i + 1, { reason: S.reasons[x.id], subject: sid })).join("\n")}
    </section>

    <section id="features">
      <h2>Feature comparison matrix</h2>
      <p class="muted">How every ${esc(subject.name)} alternative stacks up, feature by feature, with ${esc(subject.name)} itself in the last column for reference.</p>
      ${matrixTable([...list, subject], { price: true })}
    </section>

    <section id="head-to-head">
      <h2>ContentStudio vs ${esc(subject.name)}: head-to-head</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Category</th><th><span style="display:inline-flex;gap:8px;align-items:center;text-transform:none;color:var(--text)">${logo(cs, "logo-sm")} ContentStudio</span></th><th><span style="display:inline-flex;gap:8px;align-items:center;text-transform:none;color:var(--text)">${logo(subject, "logo-sm")} ${esc(subject.name)}</span></th></tr></thead>
        <tbody>${vsRows.map(([l, a, b, raw]) => `<tr><td><b>${esc(l)}</b></td><td>${raw ? a : esc(a)}</td><td>${raw ? b : esc(b)}</td></tr>`).join("")}</tbody>
      </table></div>
      <p style="margin-top:16px"><a class="btn btn-ghost" href="{{base}}${vsUrl(sid)}">Read the full ContentStudio vs ${esc(subject.name)} comparison →</a></p>
    </section>

    <section id="how-to-choose">
      <h2>How to choose the right ${esc(subject.name)} alternative</h2>
      <p>Start with the job you need done, not the feature list. Here are our picks by use case:</p>
      <div class="grid grid-2">
        ${guide.map(([icon, label, x, why]) => `<a class="card subject-card" href="#tool-${x.id}"><div class="top"><span style="font-size:1.6rem">${icon}</span><div><small class="muted" style="font-weight:700;text-transform:uppercase;letter-spacing:.05em;font-size:.72rem">${label}</small><h3 style="margin:0">${esc(x.name)}</h3></div></div><p class="muted small" style="margin:0">${esc(why)}</p></a>`).join("")}
      </div>
      <h3 style="margin-top:28px">Questions to ask before you switch</h3>
      <ul>
        <li><b>Who will use it?</b> Count seats now and in 12 months. Per-seat pricing (like ${esc(subject.name === "Sprout Social" ? "Sprout Social" : "Sprout Social or Agorapulse")}) changes the math quickly.</li>
        <li><b>How many brands or clients?</b> Agencies should look for unlimited or cheap workspaces and white-label reporting.</li>
        <li><b>Where does your time go?</b> If it is finding and writing content, prioritise content discovery and AI. If it is replying, prioritise the inbox.</li>
        <li><b>Who approves content?</b> Make sure external clients can approve without needing a paid seat.</li>
        <li><b>Which networks matter?</b> Check support for Threads, Bluesky, TikTok and Google Business Profile if you use them.</li>
      </ul>
    </section>

    <section id="methodology">
      <h2>How we tested</h2>
      <p>Each tool was used on real accounts for at least two weeks. We scheduled the same campaign across Facebook, Instagram, LinkedIn, X and TikTok, ran approvals with an external reviewer, handled inbox replies and produced a client-ready report. Scores weight <b>features (35%)</b>, <b>ease of use (25%)</b>, <b>value for money (25%)</b> and <b>support (15%)</b>. <a href="{{base}}about/">Read our full methodology →</a></p>
    </section>

    <section id="faq">
      <h2>${esc(subject.name)} alternatives: FAQ</h2>
      ${faqBlock(S.faqs)}
    </section>

    <section>
      <h2>More alternatives guides</h2>
      <div class="grid grid-2">
        ${SUBJECT_ORDER.filter((s) => s !== sid).map((s) => `<a class="card subject-card" href="{{base}}${altUrl(s)}"><div class="top">${logo(t(s))}<div><h3 style="margin:0">${esc(TOOLS[s].name)} alternatives</h3><span class="muted small">${SUBJECTS[s].alternatives.length + 1} tools compared</span></div></div><span class="arrow">Read guide →</span></a>`).join("")}
      </div>
    </section>
  </article>
</div>
${ctaBand(`Ready to leave ${subject.name}?`, `ContentStudio gives you everything you use ${subject.name} for, plus content discovery and AI, for less. Start your 14-day free trial.`)}`;

  const schema = [
    breadcrumbSchema([["Home", ""], [`${subject.name} alternatives`, path]]),
    { "@context": "https://schema.org", "@type": "Article", headline: title, description: desc, dateModified: ISO, author: { "@type": "Organization", name: SITE.author }, publisher: { "@type": "Organization", name: SITE.name } },
    { "@context": "https://schema.org", "@type": "ItemList", name: title, itemListElement: list.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, url: SITE.url + reviewUrl(x.id) })) },
    faqSchema(S.faqs),
  ];
  return { path, html: layout({ path, title, description: desc, body, schema, active: "alts" }) };
}

function vsPage(sid) {
  const S = SUBJECTS[sid];
  const x = t(sid);
  const path = vsUrl(sid);
  const title = `ContentStudio vs ${x.name} (${YEAR}): Features, Pricing & Verdict`;
  const desc = `ContentStudio vs ${x.name}: an honest side-by-side comparison of features, pricing, ease of use and support, with a clear verdict.`;
  const csWins = FEATURES.filter((f) => cs.matrix[f.key] > x.matrix[f.key]);
  const xWins = FEATURES.filter((f) => x.matrix[f.key] > cs.matrix[f.key]);
  const scoreRows = [["Overall", cs.rating, x.rating], ["Ease of use", cs.scores.ease, x.scores.ease], ["Features", cs.scores.features, x.scores.features], ["Value for money", cs.scores.value, x.scores.value], ["Support", cs.scores.support, x.scores.support]];
  const faqs = [
    { q: `Is ContentStudio better than ${x.name}?`, a: `For most teams, yes. ContentStudio covers ${csWins.length ? csWins.map((f) => f.label.toLowerCase()).join(", ") + " better than " + x.name + ", and " : ""}matches it on core publishing, and starts at ${cs.priceLabel} vs ${x.priceLabel}.` },
    { q: `Is ContentStudio cheaper than ${x.name}?`, a: `ContentStudio starts at ${cs.priceLabel}, while ${x.name} starts at ${x.priceLabel}. ContentStudio's Agency Unlimited plan also includes unlimited workspaces.` },
    { q: `Can I move from ${x.name} to ContentStudio?`, a: `Yes. Connect your social profiles in ContentStudio, export any scheduled posts from ${x.name} to CSV and bulk import them. Most teams switch in an afternoon.` },
    { q: `When should I stay with ${x.name}?`, a: xWins.length ? `If ${xWins.map((f) => f.label.toLowerCase()).join(" and ")} ${xWins.length > 1 ? "are" : "is"} central to your workflow, ${x.name} may still suit you.` : `If your team is deeply trained on ${x.name} and price is not a concern, switching may not be urgent, but you would likely save money with ContentStudio.` },
  ];
  const body = `
<section class="page-hero"><div class="container">
  ${breadcrumb([["Home", ""], ["Compare", "compare/"], [`ContentStudio vs ${x.name}`, null]])}
  <h1 class="center">ContentStudio vs ${esc(x.name)}</h1>
  <p class="center muted" style="max-width:720px;margin:0 auto">${esc(desc)}</p>
  <div class="vs-hero">
    <div class="vs-side">${logo(cs, "logo-lg")}<b>ContentStudio</b><div>${stars(cs.rating)}</div><div class="small muted">From ${esc(cs.priceLabel)}</div></div>
    <span class="vs">VS</span>
    <div class="vs-side">${logo(x, "logo-lg")}<b>${esc(x.name)}</b><div>${stars(x.rating)}</div><div class="small muted">From ${esc(x.priceLabel)}</div></div>
  </div>
  <div class="verdict" style="max-width:860px;margin:0 auto">
    <h2>🏆 Verdict: ContentStudio wins for most teams</h2>
    <p>${esc(S.verdict)}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">${csCta("Try ContentStudio free")}<a class="btn btn-ghost" href="{{base}}${altUrl(sid)}">See all ${esc(x.name)} alternatives</a></div>
  </div>
</div></section>

<div class="container" style="padding:40px 16px 20px">
  <section class="block" style="padding-top:0">
    <h2>Scores compared</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Category</th><th>ContentStudio</th><th>${esc(x.name)}</th><th>Winner</th></tr></thead>
      <tbody>${scoreRows.map(([l, a, b]) => `<tr><td><b>${l}</b></td><td>${a.toFixed(1)} / 5</td><td>${b.toFixed(1)} / 5</td><td class="winner">${a > b ? "ContentStudio" : b > a ? esc(x.name) : "Tie"}</td></tr>`).join("")}</tbody>
    </table></div>
  </section>

  <section class="block" style="padding-top:0">
    <h2>Feature-by-feature comparison</h2>
    ${matrixTable([cs, x])}
  </section>

  <section class="block" style="padding-top:0">
    <div class="grid grid-2">
      <div class="card"><h3>Where ContentStudio wins</h3><ul>${(csWins.length ? csWins.map((f) => `<li><b>${esc(f.label)}</b>: ${cs.matrix[f.key] === 2 ? "fully included" : "available"}${x.matrix[f.key] === 0 ? `, not offered by ${esc(x.name)}` : `, limited in ${esc(x.name)}`}</li>`) : []).join("")}<li><b>Price</b>: from ${esc(cs.priceLabel)} vs ${esc(x.priceLabel)}</li><li><b>Content discovery + AI</b> in the same composer you schedule from</li></ul></div>
      <div class="card"><h3>Where ${esc(x.name)} wins</h3><ul>${xWins.map((f) => `<li><b>${esc(f.label)}</b>: ${x.matrix[f.key] === 2 ? "fully included" : "available"}</li>`).join("")}${x.pros.slice(0, 3).map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>
    </div>
  </section>

  <section class="block" style="padding-top:0">
    <h2>Pricing compared</h2>
    <div class="grid grid-2">
      ${[cs, x].map((tool) => `<div class="card"><div style="display:flex;gap:10px;align-items:center;margin-bottom:14px">${logo(tool, "logo-sm")}<h3 style="margin:0">${esc(tool.name)}</h3></div><div class="price-row">${tool.pricing.map((p) => `<div class="price-pill"><small>${esc(p.plan)}</small><b>${esc(p.price)}</b><span>${esc(p.note)}</span></div>`).join("")}</div><p class="small muted" style="margin:12px 0 0">${esc(tool.trial)}</p></div>`).join("")}
    </div>
    ${priceNote}
  </section>

  <section class="block" style="padding-top:0">
    <h2>Pros and cons</h2>
    <div class="grid grid-2">
      ${[cs, x].map((tool) => `<div><h3>${esc(tool.name)}</h3><div class="pros-cons" style="grid-template-columns:1fr"><div class="pros"><h4>Pros</h4><ul>${tool.pros.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div><div class="cons"><h4>Cons</h4><ul>${tool.cons.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></div></div>`).join("")}
    </div>
  </section>

  <section class="block" style="padding-top:0">
    <h2>FAQ</h2>
    ${faqBlock(faqs)}
  </section>
</div>
${ctaBand(`Switch from ${x.name} to ContentStudio`, "Bring your profiles and scheduled posts over in minutes and see the difference in your first week.")}`;
  const schema = [breadcrumbSchema([["Home", ""], ["Compare", "compare/"], [`ContentStudio vs ${x.name}`, path]]), faqSchema(faqs)];
  return { path, html: layout({ path, title, description: desc, body, schema, active: "vs" }) };
}

function reviewPage(id) {
  const tool = t(id);
  const path = reviewUrl(id);
  const isCs = id === SITE.topPick;
  const title = `${tool.name} Review ${YEAR}: Features, Pricing, Pros & Cons`;
  const desc = `Our hands-on ${tool.name} review: ${tool.tagline.toLowerCase()}. Rated ${tool.rating}/5. See features, pricing, pros, cons and the best alternatives.`;
  const similar = ranked.filter((x) => x.id !== id && x.id !== SITE.topPick).sort((a, b) => Math.abs(a.priceFrom - tool.priceFrom) - Math.abs(b.priceFrom - tool.priceFrom)).slice(0, isCs ? 6 : 5);
  const alts = isCs ? similar : [cs, ...similar];
  const body = `
<section class="page-hero"><div class="container">
  ${breadcrumb([["Home", ""], ["Reviews", "reviews/"], [tool.name, null]])}
  <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
    ${logo(tool, "logo-lg")}
    <div style="flex:1;min-width:240px">
      ${isCs ? '<span class="badge badge-gold">★ Editor\'s choice</span>' : ""}
      <h1 style="margin:6px 0">${esc(tool.name)} Review</h1>
      <p class="muted" style="margin:0">${esc(tool.tagline)}</p>
      <div style="margin-top:8px">${stars(tool.rating)}</div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">${isCs ? csCta("Try ContentStudio free") : ext(tool, "Visit " + tool.name, "btn btn-ghost")}${!isCs ? `<a class="btn btn-primary" href="{{base}}compare/?tools=contentstudio,${id}">Compare with ContentStudio</a>` : ""}</div>
  </div>
  ${byline()}
</div></section>

<div class="container layout layout-side">
  <article class="prose">
    <section id="overview"><h2>Overview</h2><p>${esc(tool.overview)}</p><p><b>Best for:</b> ${esc(tool.bestFor)}.</p></section>
    <section id="features"><h2>Key features</h2><ul class="feature-list">${tool.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></section>
    <section id="pros-cons"><h2>Pros and cons</h2><div class="pros-cons"><div class="pros"><h4>Pros</h4><ul>${tool.pros.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div><div class="cons"><h4>Cons</h4><ul>${tool.cons.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></div></section>
    <section id="pricing"><h2>${esc(tool.name)} pricing</h2>
      <div class="table-wrap"><table><thead><tr><th>Plan</th><th>Price</th><th>What you get</th></tr></thead><tbody>${tool.pricing.map((p) => `<tr><td><b>${esc(p.plan)}</b></td><td>${esc(p.price)}</td><td class="small">${esc(p.note)}</td></tr>`).join("")}</tbody></table></div>
      ${priceNote}
    </section>
    <section id="checklist"><h2>Feature checklist</h2>${matrixTable(isCs ? [tool] : [tool, cs])}</section>
    <section id="verdict"><h2>Verdict</h2>
      <div class="verdict" style="margin-top:0">
        <p style="margin:0">${isCs
          ? "ContentStudio is the most complete social media management platform we tested at its price. It combines publishing, content discovery, AI, a unified inbox, approvals and white-label analytics, which is why it is our #1 alternative to Hootsuite, Sprout Social, Loomly, Sendible and Planable."
          : `${esc(tool.name)} is a solid choice for ${esc(tool.bestFor.charAt(0).toLowerCase() + tool.bestFor.slice(1))}. If you need ${["curation", "inbox", "reports", "approvals"].filter((k) => tool.matrix[k] < 2).map((k) => FEATURES.find((f) => f.key === k).label.toLowerCase()).join(", ") || "more value for money"}, ContentStudio covers that in one plan from ${esc(cs.priceLabel)}.`}</p>
      </div>
      ${SUBJECTS[id] ? `<p><a class="btn btn-ghost" href="{{base}}${altUrl(id)}">See the best ${esc(tool.name)} alternatives →</a> <a class="btn btn-ghost" href="{{base}}${vsUrl(id)}">ContentStudio vs ${esc(tool.name)} →</a></p>` : ""}
    </section>
    <section id="alternatives"><h2>${esc(tool.name)} alternatives</h2>
      <div class="grid grid-2">${alts.map((a) => `<a class="card subject-card" href="{{base}}${reviewUrl(a.id)}"><div class="top">${logo(a)}<div><h3 style="margin:0">${esc(a.name)}</h3>${stars(a.rating)}</div></div><p class="muted small" style="margin:0">${esc(a.tagline)}. From ${esc(a.priceLabel)}.</p></a>`).join("")}</div>
    </section>
  </article>
  <aside>
    <div class="card" style="position:sticky;top:90px">
      <h3>At a glance</h3>
      <div class="facts" style="grid-template-columns:1fr 1fr;margin-top:8px">
        <div><small>From</small><b>${esc(tool.priceLabel)}</b></div>
        <div><small>Rating</small><b>${tool.rating} / 5</b></div>
        <div><small>Founded</small><b>${tool.founded}</b></div>
        <div><small>HQ</small><b class="small">${esc(tool.hq)}</b></div>
      </div>
      <p class="small"><b>Free plan / trial:</b> ${esc(tool.trial)}</p>
      ${scoreBars(tool)}
      <h4 style="margin-top:18px">Supported networks</h4>
      <div class="chips">${tool.platforms.map((p) => `<span class="chip">${esc(p)}</span>`).join("")}</div>
      <div style="margin-top:18px;display:grid;gap:8px">${isCs ? csCta("Start free trial", "btn btn-cs btn-block") : `${ext(tool, "Visit website", "btn btn-ghost btn-block")}${csCta("Try ContentStudio instead", "btn btn-cs btn-block")}`}</div>
    </div>
  </aside>
</div>`;
  const schema = [
    breadcrumbSchema([["Home", ""], ["Reviews", "reviews/"], [tool.name, path]]),
    {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: { "@type": "SoftwareApplication", name: tool.name, applicationCategory: "BusinessApplication", operatingSystem: "Web, iOS, Android", offers: { "@type": "Offer", price: String(tool.priceFrom), priceCurrency: "USD" } },
      reviewRating: { "@type": "Rating", ratingValue: tool.rating, bestRating: 5 },
      author: { "@type": "Organization", name: SITE.author },
      datePublished: ISO,
    },
  ];
  return { path, html: layout({ path, title, description: desc, body, schema, active: "reviews" }) };
}

function homePage() {
  const path = "";
  const title = `${SITE.name}: Best Social Media Management Tool Alternatives & Comparisons (${YEAR})`;
  const desc = "Unbiased, hands-on comparisons of social media management tools. Find the best alternatives to Hootsuite, Sprout Social, Loomly, Sendible and Planable.";
  const top = ranked.slice(0, 10);
  const tiles = [
    ["🔎", "Content discovery", "Find trending articles, videos and topics in your niche, then schedule them in a couple of clicks."],
    ["✨", "AI writer & images", "Generate captions, hashtags and visuals right inside the composer."],
    ["📅", "Visual planner", "Plan every network on one calendar with drag-and-drop rescheduling."],
    ["💬", "Unified inbox", "Reply to comments and DMs from every network, with team assignment."],
    ["✅", "Client approvals", "Multi-step approvals and shareable links clients can approve without logging in."],
    ["📊", "White-label reports", "Automated, branded PDF reports for every client and workspace."],
  ];
  const body = `
<section class="hero"><div class="container hero-grid">
  <div>
    <span class="eyebrow">● Updated ${MONTH_YEAR}</span>
    <h1>Find a better social media management tool, without the guesswork.</h1>
    <p class="lead">We test the leading platforms hands-on and compare them side by side, so you can switch from Hootsuite, Sprout Social, Loomly, Sendible or Planable with confidence.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#alternatives">Browse alternatives</a>
      <a class="btn btn-ghost" href="{{base}}compare/">Compare tools side by side</a>
    </div>
    <div class="trust-row"><span><b>${allTools.length}</b> tools reviewed</span><span><b>${FEATURES.length}</b> features compared</span><span><b>${SUBJECT_ORDER.length}</b> in-depth alternatives guides</span></div>
  </div>
  <div class="mock" aria-label="Top rated tools">
    <div class="small muted" style="padding:0 12px 8px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Top rated this month</div>
    ${ranked.slice(0, 5).map((x, i) => `<a class="mock-row${i === 0 ? " first" : ""}" href="{{base}}${reviewUrl(x.id)}" style="color:var(--text);text-decoration:none"><b style="width:18px;color:var(--muted)">${i + 1}</b>${logo(x, "logo-sm")}<div class="grow"><b>${esc(x.name)}</b><span class="small muted">From ${esc(x.priceLabel)}</span></div>${i === 0 ? '<span class="badge badge-gold">#1 pick</span>' : `<span class="small" style="font-weight:700">★ ${x.rating}</span>`}</a>`).join("")}
  </div>
</div></section>

<section class="block" id="alternatives" style="padding-top:24px"><div class="container">
  <div class="section-head"><span class="eyebrow">Alternatives guides</span><h2>Which tool are you replacing?</h2><p class="muted">Each guide compares 12+ alternatives with full reviews, a feature matrix, pricing and a buyer's guide.</p></div>
  <div class="grid grid-3">
    ${SUBJECT_ORDER.map((sid) => { const x = t(sid); const S = SUBJECTS[sid]; return `<a class="card subject-card" href="{{base}}${altUrl(sid)}"><div class="top">${logo(x)}<div><h3 style="margin:0">${esc(x.name)} alternatives</h3><span class="small muted">${S.alternatives.length + 1} tools compared · from ${esc(x.priceLabel)} today</span></div></div><p class="muted small" style="margin:0">${esc(S.painPoints[0].title)}? ${esc(S.painPoints[1].title)}? See what to use instead.</p><span class="small"><b>Top pick:</b> ContentStudio</span><span class="arrow">Read the guide →</span></a>`; }).join("")}
    <a class="card subject-card" href="{{base}}compare/" style="background:linear-gradient(135deg,var(--primary-soft),var(--surface))"><div class="top"><span class="logo" style="background:var(--primary)">⇄</span><div><h3 style="margin:0">Compare any tools</h3><span class="small muted">Pick up to 3, side by side</span></div></div><p class="muted small" style="margin:0">Build your own comparison across ${FEATURES.length} features, pricing and supported networks.</p><span class="arrow">Open comparison tool →</span></a>
  </div>
</div></section>

<section class="block" style="background:var(--surface);border-block:1px solid var(--border)"><div class="container">
  <div class="section-head center center"><span class="eyebrow">Our #1 pick</span><h2>Why ContentStudio tops every list</h2><p class="muted">Most tools stop at scheduling. ContentStudio covers the whole workflow, from finding content to proving results, at a price that works for freelancers and agencies alike.</p></div>
  <div class="grid grid-3">${tiles.map(([i, h, p]) => `<div class="card feature-tile"><div class="icon">${i}</div><h3>${h}</h3><p class="muted small" style="margin:0">${p}</p></div>`).join("")}</div>
  <div class="center" style="margin-top:28px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${csCta("Try ContentStudio free")}<a class="btn btn-ghost" href="{{base}}${reviewUrl("contentstudio")}">Read our review</a></div>
</div></section>

<section class="block"><div class="container">
  <div class="section-head"><span class="eyebrow">Leaderboard</span><h2>Top 10 social media management tools</h2><p class="muted">Sort by price or rating. <a href="{{base}}best-social-media-management-tools/">See the full ranking →</a></p></div>
  ${quickTable(top, { href: (x) => `{{base}}${reviewUrl(x.id)}` })}
</div></section>

<section class="block" style="padding-top:0"><div class="container">
  <div class="section-head"><span class="eyebrow">Head-to-head</span><h2>Popular comparisons</h2></div>
  <div class="grid grid-3">${SUBJECT_ORDER.map((sid) => { const x = t(sid); return `<a class="card subject-card" href="{{base}}${vsUrl(sid)}"><div class="top">${logo(cs, "logo-sm")}<b class="muted">vs</b>${logo(x, "logo-sm")}</div><h3 style="margin:0">ContentStudio vs ${esc(x.name)}</h3><p class="small muted" style="margin:0">${esc(cs.priceLabel)} vs ${esc(x.priceLabel)} · ${featureCount(cs)} vs ${featureCount(x)} features</p><span class="arrow">Compare →</span></a>`; }).join("")}</div>
</div></section>

<section class="block" style="padding-top:0"><div class="container">
  <div class="grid grid-4">
    <div class="card stat"><b>${allTools.length}</b><span class="muted small">Platforms tested hands-on</span></div>
    <div class="card stat"><b>2+ wks</b><span class="muted small">Minimum testing per tool</span></div>
    <div class="card stat"><b>${FEATURES.length}</b><span class="muted small">Features scored per tool</span></div>
    <div class="card stat"><b>${PLATFORM_COUNT}</b><span class="muted small">Social networks covered</span></div>
  </div>
  <p class="center muted small" style="margin-top:16px">Read <a href="{{base}}about/">how we test and score tools</a>.</p>
</div></section>
${ctaBand()}`;
  const schema = [
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url, description: desc },
    { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url },
  ];
  return { path, html: layout({ path, title, description: desc, body, schema, active: "home" }) };
}
const PLATFORM_COUNT = new Set(allTools.flatMap((x) => x.platforms)).size;

function bestToolsPage() {
  const path = "best-social-media-management-tools/";
  const title = `${ranked.length} Best Social Media Management Tools in ${YEAR} (Ranked)`;
  const desc = `We ranked ${ranked.length} social media management tools on features, pricing, ease of use and support. See which one fits your team.`;
  const body = `
<section class="page-hero"><div class="container">
  ${breadcrumb([["Home", ""], ["Best tools", null]])}
  <h1>${esc(title)}</h1>
  <p class="muted" style="max-width:780px;font-size:1.1rem">Every platform we have reviewed, ranked by overall score. ContentStudio leads thanks to the widest feature coverage at an entry price most teams can afford.</p>
  ${byline()}
</div></section>
<div class="container" style="padding:36px 16px">
  <section id="comparison" style="margin-bottom:40px"><h2>Ranking at a glance</h2>${quickTable(ranked)}${priceNote}</section>
  <section id="reviews"><h2>Detailed reviews</h2>${ranked.map((x, i) => toolCard(x, i + 1)).join("")}</section>
  <section id="features"><h2>Full feature matrix</h2>${matrixTable(ranked, { price: true })}</section>
</div>
${ctaBand()}`;
  const schema = [{ "@context": "https://schema.org", "@type": "ItemList", name: title, itemListElement: ranked.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, url: SITE.url + reviewUrl(x.id) })) }];
  return { path, html: layout({ path, title, description: desc, body, schema, active: "best" }) };
}

function reviewsIndex() {
  const path = "reviews/";
  const title = `Social Media Management Tool Reviews (${YEAR})`;
  const desc = `In-depth reviews of ${allTools.length} social media management tools, with ratings, pricing, pros and cons.`;
  const filters = [["freeplan", "Free plan"], ["curation", "Content discovery"], ["ai", "AI assistant"], ["inbox", "Social inbox"], ["approvals", "Approvals"], ["reports", "White-label reports"], ["listening", "Listening"]];
  const body = `
<section class="page-hero"><div class="container">
  ${breadcrumb([["Home", ""], ["Reviews", null]])}
  <h1>Tool reviews</h1>
  <p class="muted" style="max-width:720px">Hands-on reviews of every platform we test. Filter by the features you need.</p>
</div></section>
<div class="container" style="padding:32px 16px" data-filter-scope>
  <div class="toolbar">
    <input class="input search" type="search" placeholder="Search tools, e.g. agency, Instagram, inbox…" aria-label="Search tools">
  </div>
  <div class="toolbar" role="group" aria-label="Filter by feature">${filters.map(([k, l]) => `<button class="filter-chip" data-tag="${k}" aria-pressed="false">${l}</button>`).join("")}</div>
  <div class="grid grid-3">
    ${ranked.map((x) => `<a class="card review-card subject-card" data-item data-tags="${Object.entries(x.matrix).filter(([, v]) => v === 2).map(([k]) => k).join(" ")}" data-search="${esc((x.name + " " + x.tagline + " " + x.bestFor + " " + x.platforms.join(" ")).toLowerCase())}" href="{{base}}${reviewUrl(x.id)}">
      <div class="top">${logo(x)}<div><h3>${esc(x.name)}</h3>${stars(x.rating)}</div>${x.id === SITE.topPick ? '<span class="badge badge-gold" style="margin-left:auto">#1</span>' : ""}</div>
      <p class="muted small" style="margin:0">${esc(x.tagline)}</p>
      <div class="foot"><span class="small"><b>${esc(x.priceLabel)}</b></span><span class="small" style="color:var(--primary);font-weight:600">Read review →</span></div>
    </a>`).join("")}
  </div>
  <div class="empty" hidden>No tools match those filters. Try removing one.</div>
</div>`;
  return { path, html: layout({ path, title, description: desc, body, active: "reviews" }) };
}

function pricingPage() {
  const path = "pricing/";
  const title = `Social Media Management Tools Pricing Compared (${YEAR})`;
  const desc = `Compare starting prices, free plans and trials for ${allTools.length} social media management tools in one sortable table.`;
  const body = `
<section class="page-hero"><div class="container">
  ${breadcrumb([["Home", ""], ["Pricing", null]])}
  <h1>Pricing comparison</h1>
  <p class="muted" style="max-width:720px">Every tool's entry price, free plan and trial in one sortable table. Click a header to sort.</p>
</div></section>
<div class="container" style="padding:32px 16px" data-filter-scope>
  <div class="toolbar"><input class="input search" type="search" placeholder="Search tools…" aria-label="Search tools">
    <button class="filter-chip" data-tag="free" aria-pressed="false">Free plan</button>
    <button class="filter-chip" data-tag="under30" aria-pressed="false">Under $30/mo</button>
    <button class="filter-chip" data-tag="agency" aria-pressed="false">White-label reports</button>
  </div>
  <div class="table-wrap"><table data-sortable>
    <thead><tr><th class="sortable" data-type="text">Tool</th><th class="sortable" data-type="num">Starting price</th><th>Free plan / trial</th><th>Plans</th><th class="sortable" data-type="num">Value score</th><th class="sortable" data-type="num">Rating</th><th></th></tr></thead>
    <tbody>${ranked.map((x) => `<tr data-item data-search="${esc(x.name.toLowerCase())}" data-tags="${[x.freePlan && "free", x.priceFrom < 30 && "under30", x.matrix.reports === 2 && "agency"].filter(Boolean).join(" ")}"${x.id === SITE.topPick ? ' class="is-top"' : ""}>
      <td data-sort="${esc(x.name)}"><div class="tool-cell">${logo(x, "logo-sm")}<a href="{{base}}${reviewUrl(x.id)}">${esc(x.name)}</a></div></td>
      <td data-sort="${x.priceFrom}"><b>${esc(x.priceLabel)}</b></td>
      <td class="small">${esc(x.trial)}</td>
      <td class="small">${x.pricing.map((p) => `${esc(p.plan)}: <b>${esc(p.price)}</b>`).join("<br>")}</td>
      <td data-sort="${x.scores.value}">${x.scores.value.toFixed(1)}</td>
      <td data-sort="${x.rating}">${stars(x.rating)}</td>
      <td>${x.id === SITE.topPick ? csCta("Try free", "btn btn-cs btn-sm") : ext(x, "Site")}</td>
    </tr>`).join("")}</tbody>
  </table></div>
  <div class="empty" hidden>No tools match those filters.</div>
  ${priceNote}
</div>
${ctaBand("Best value: ContentStudio", "Unlimited workspaces, white-label reports, inbox, approvals and content discovery on one plan.")}`;
  return { path, html: layout({ path, title, description: desc, body, active: "pricing" }) };
}

function comparePage() {
  const path = "compare/";
  const title = "Compare Social Media Management Tools Side by Side";
  const desc = "Pick up to three social media management tools and compare features, pricing, free plans and supported networks side by side.";
  const options = (sel) => `<option value="">— None —</option>` + ranked.map((x) => `<option value="${x.id}"${x.id === sel ? " selected" : ""}>${esc(x.name)}</option>`).join("");
  const data = { base: "{{base}}", features: FEATURES, tools: Object.fromEntries(allTools.map(({ id, name, color, initials, rating, priceLabel, trial, bestFor, matrix, platforms }) => [id, { name, color, initials, rating, priceLabel, trial, bestFor, matrix, platforms }])) };
  const body = `
<section class="page-hero"><div class="container">
  ${breadcrumb([["Home", ""], ["Compare", null]])}
  <h1>Compare tools side by side</h1>
  <p class="muted" style="max-width:720px">Choose two or three platforms. The table updates instantly and the URL is shareable.</p>
</div></section>
<div class="container" style="padding:32px 16px" id="compare-app">
  <div class="compare-pickers">
    <div><label for="c1">Tool 1</label><select id="c1" class="input">${options("contentstudio")}</select></div>
    <div><label for="c2">Tool 2</label><select id="c2" class="input">${options("hootsuite")}</select></div>
    <div><label for="c3">Tool 3</label><select id="c3" class="input">${options("sprout-social")}</select></div>
  </div>
  <div id="compare-output" aria-live="polite"><noscript>${matrixTable([cs, t("hootsuite"), t("sprout-social")])}</noscript></div>
  ${legend}
  <h2 style="margin-top:48px">Ready-made comparisons</h2>
  <div class="grid grid-3">${SUBJECT_ORDER.map((sid) => `<a class="card subject-card" href="{{base}}${vsUrl(sid)}"><div class="top">${logo(cs, "logo-sm")}<b class="muted">vs</b>${logo(t(sid), "logo-sm")}</div><h3 style="margin:0">ContentStudio vs ${esc(TOOLS[sid].name)}</h3><span class="arrow">Read →</span></a>`).join("")}</div>
</div>
<script type="application/json" id="tools-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
  return { path, html: layout({ path, title, description: desc, body, active: "vs" }) };
}

function aboutPage() {
  const path = "about/";
  const title = `How We Test Social Media Tools | ${SITE.name}`;
  const desc = "Our testing methodology, scoring weights and editorial disclosure.";
  const body = `
<section class="page-hero"><div class="container">
  ${breadcrumb([["Home", ""], ["About & methodology", null]])}
  <h1>How we test</h1>
  <p class="muted" style="max-width:720px">${SITE.name} exists to make switching social media tools less painful. Here is exactly how we evaluate and rank them.</p>
</div></section>
<div class="container prose" style="padding:36px 16px;max-width:860px">
  <section><h2>Our testing process</h2>
    <ol>
      <li><b>Real accounts, real campaigns.</b> Every tool is connected to live Facebook, Instagram, LinkedIn, X and TikTok accounts for at least two weeks.</li>
      <li><b>The same workflow, every time.</b> We plan a campaign, find and write content, schedule it in bulk, run it through internal and external approval, handle inbox replies and produce a client-ready report.</li>
      <li><b>Pricing checked at the source.</b> We record publicly listed plans and note what each tier really includes.</li>
      <li><b>Support tested.</b> We contact support with the same three questions and grade speed and quality.</li>
    </ol>
  </section>
  <section><h2>Scoring</h2>
    <div class="table-wrap"><table><thead><tr><th>Criterion</th><th>Weight</th><th>What we look at</th></tr></thead><tbody>
      <tr><td><b>Features</b></td><td>35%</td><td>Coverage of the ${FEATURES.length} features in our matrix, depth and reliability</td></tr>
      <tr><td><b>Ease of use</b></td><td>25%</td><td>Onboarding, UI clarity, time to first scheduled post</td></tr>
      <tr><td><b>Value</b></td><td>25%</td><td>What a 3-person team managing 5 brands pays per year</td></tr>
      <tr><td><b>Support</b></td><td>15%</td><td>Response time, quality, documentation</td></tr>
    </tbody></table></div>
  </section>
  <section id="disclosure"><h2>Editorial independence & disclosure</h2>
    <p>Some outbound links on ${SITE.name} may be affiliate links, which means we may earn a commission if you buy, at no extra cost to you. Commissions never decide rankings: tools are scored using the criteria above, and we list every tool's cons, including our top pick's.</p>
    <p>Product names, logos and trademarks belong to their owners. Tool icons on this site are generic initials, not official logos. Prices and features change frequently, so always verify on the vendor's website.</p>
  </section>
</div>`;
  return { path, html: layout({ path, title, description: desc, body, sticky: false }) };
}

function notFound() {
  const path = "404.html";
  const body = `<section class="hero"><div class="container center"><h1>Page not found</h1><p class="muted">The page you were looking for has moved or doesn't exist.</p><div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="${SITE.url}">Go home</a><a class="btn btn-ghost" href="${SITE.url}compare/">Compare tools</a></div></div></section>`;
  // 404 is served from arbitrary paths, so asset links must be absolute.
  const html = layout({ path: "", title: `Page not found | ${SITE.name}`, description: "Page not found", body, sticky: false }).replaceAll('href="./', `href="${SITE.url}`).replaceAll('src="./', `src="${SITE.url}`);
  return { path, html };
}

// ---------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------
const pages = [homePage(), bestToolsPage(), reviewsIndex(), pricingPage(), comparePage(), aboutPage(), notFound(), ...SUBJECT_ORDER.map(alternativesPage), ...SUBJECT_ORDER.map(vsPage), ...Object.keys(TOOLS).map(reviewPage)];

rmSync(OUT, { recursive: true, force: true });
for (const p of pages) {
  const file = p.path.endsWith(".html") ? join(OUT, p.path) : join(OUT, p.path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, p.html);
}
mkdirSync(join(OUT, "assets"), { recursive: true });
for (const f of readdirSync(join(ROOT, "src/assets"))) copyFileSync(join(ROOT, "src/assets", f), join(OUT, "assets", f));
writeFileSync(join(OUT, ".nojekyll"), "");
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}sitemap.xml\n`);
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .filter((p) => !p.path.endsWith(".html"))
    .map((p) => `  <url><loc>${SITE.url}${p.path}</loc><lastmod>${ISO}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`
);
console.log(`Built ${pages.length} pages into ${OUT}`);
