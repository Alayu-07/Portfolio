#!/usr/bin/env node
/**
 * Prerender: injects all content from js/data.js into index.html between the
 * <!--#slot--> markers. The HTML stays both the template AND the output, so
 * this is idempotent and safe to re-run.
 *
 *   npm run build      → index.html, robots.txt (+ sitemap.xml when siteUrl set)
 *
 * Core content ends up in plain HTML: works with JS disabled, crawlers see it,
 * and there is no flash of empty content. js/data.js stays the editing source.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PORTFOLIO as P } from "../js/data.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, content) => fs.writeFileSync(path.join(ROOT, p), content);

/* ─────────────────────────────── helpers ─────────────────────────────── */
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
const isUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u.trim());
const filled = (u) => (isUrl(u) ? u.trim() : "");
/* Relative asset path (e.g. "assets/img/projects/x.webp"); verified on disk,
   so a missing file falls back to the placeholder instead of a broken <img>. */
const asset = (u) => {
  if (typeof u !== "string") return "";
  const p = u.trim();
  if (!p || /^TODO/i.test(p) || /^https?:\/\//i.test(p)) return "";
  return fs.existsSync(path.join(ROOT, p)) ? p : "";
};

const S =
  'class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const ICONS = {
  github: `<svg ${S}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  linkedin: `<svg ${S}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>`,
  telegram: `<svg ${S}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`,
  mail: `<svg ${S}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>`,
  phone: `<svg ${S}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>`,
  download: `<svg ${S}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`,
  external: `<svg ${S}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>`,
  layout: `<svg ${S}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  layers: `<svg ${S}><path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></svg>`,
  sparkles: `<svg ${S}><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>`,
  shield: `<svg ${S}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  target: `<svg ${S}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>`,
  gauge: `<svg ${S}><path d="M12 14 16 9"/><path d="M4.9 19a9 9 0 1 1 14.2 0"/></svg>`,
  users: `<svg ${S}><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16.5 3.1a4 4 0 0 1 0 7.8"/></svg>`,
  pin: `<svg ${S}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
};
const icon = (name) => ICONS[name] || "";

/* ─────────────────────────── section renderers ───────────────────────── */
const shortName = P.name.split(" ").slice(0, 2).join(" ");

const cvUrl = filled(P.cv);
const cvHeader = cvUrl
  ? `<a class="btn btn--ghost btn--sm" href="${esc(cvUrl)}" download>${icon("download")}<span>CV</span></a>`
  : "";
const cvHero = cvUrl
  ? `<a class="btn btn--ghost" href="${esc(cvUrl)}" download>${icon("download")}<span>Download CV</span></a>`
  : "";
const drawerExtras = [
  cvUrl
    ? `<a class="btn btn--ghost" href="${esc(cvUrl)}" download>${icon("download")}<span>Download CV</span></a>`
    : "",
  socialList(true),
].join("");

function socialList(withMail) {
  const labels = { github: "GitHub", linkedin: "LinkedIn", telegram: "Telegram" };
  const parts = Object.entries(P.social || {})
    .filter(([, url]) => isUrl(url))
    .map(([net, url]) => {
      const label = labels[net] || net;
      return `<li><a href="${esc(url.trim())}" target="_blank" rel="noopener noreferrer" aria-label="${esc(
        label
      )} (opens in a new tab)">${icon(net)}</a></li>`;
    });
  if (withMail && P.email) {
    parts.push(
      `<li><a href="mailto:${esc(P.email)}" aria-label="Email ${esc(shortName)}">${icon("mail")}</a></li>`
    );
  }
  return parts.join("");
}

const proofHtml = (P.proof || [])
  .map((item) => {
    const numeric = typeof item.value === "number";
    const value = numeric
      ? `<span class="proof__value"><span data-count="${item.value}">${item.value}</span><span class="unit">${esc(
          item.suffix || ""
        )}</span></span>`
      : `<span class="proof__value">${esc(item.value)}${item.suffix ? `<span class="unit">${esc(item.suffix)}</span>` : ""}</span>`;
    return `<li>${value}<span class="proof__label">${esc(item.label)}</span></li>`;
  })
  .join("");

const aboutStory = (P.about.story || []).map((p) => `<p>${esc(p)}</p>`).join("");
const aboutStats = (P.about.stats || [])
  .map((s) => `<li><b>${esc(s.value)}</b><span>${esc(s.label)}</span></li>`)
  .join("");
const aboutFocus = (P.about.focus || []).map((f) => `<li>${esc(f)}</li>`).join("");
const aboutHighlights = (P.about.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("");

const careerPath = (P.careerPath || [])
  .map(
    (step) =>
      `<li class="path__item"><span class="path__year">${esc(step.year)}</span><span class="path__label">${esc(
        step.label
      )}</span></li>`
  )
  .join("");

function projectCard(p) {
  const live = filled(p.live);
  const repo = filled(p.repo);
  const image = asset(p.image);

  const cover = image
    ? `<img src="${esc(image)}" alt="" loading="lazy" decoding="async" width="960" height="600">`
    : `<div class="project__mock" aria-hidden="true"><span></span><span></span><span></span></div><span class="project__pending">Screenshot coming soon</span>`;

  const stack =
    (p.stack || []).length > 0
      ? `<ul class="tags tags--stack" aria-label="Technologies">${p.stack
          .map((t) => `<li>${esc(t)}</li>`)
          .join("")}</ul>`
      : "";

  const links = [];
  if (live)
    links.push(
      `<a class="btn btn--ghost btn--sm" href="${esc(live)}" target="_blank" rel="noopener noreferrer">${icon(
        "external"
      )}<span>Live Demo</span></a>`
    );
  if (repo)
    links.push(
      `<a class="btn btn--ghost btn--sm" href="${esc(repo)}" target="_blank" rel="noopener noreferrer">${icon(
        "github"
      )}<span>View on GitHub</span></a>`
    );
  const linksHtml = links.length
    ? links.join("")
    : `<span class="project__soon">Live link &amp; code — case study in progress</span>`;

  const learnings = p.learnings
    ? `<div><h4>What I learned</h4><p>${esc(p.learnings)}</p></div>`
    : "";

  return `<article class="project glow reveal" data-cat="${esc(p.category)}">
        <div class="project__cover">${cover}</div>
        <div class="project__body">
          <h3>${esc(p.title)}</h3>
          <p class="project__role">Role — ${esc(p.role || "Designer &amp; developer")}</p>
          <p class="project__desc">${esc(p.description)}</p>
          ${stack}
          <ul class="tags" aria-label="Topics">${(p.tags || [])
            .map((t) => `<li>${esc(t)}</li>`)
            .join("")}</ul>
          <div class="project__links">${linksHtml}</div>
          <details class="case">
            <summary>Read the case study</summary>
            <div class="case__content">
              <div><h4>Problem</h4><p>${esc(p.problem || p.description)}</p></div>
              <div><h4>What I built</h4><p>${esc(p.built || p.description)}</p></div>
              <div><h4>Key features</h4><ul>${(p.features || [])
                .map((f) => `<li>${esc(f)}</li>`)
                .join("")}</ul></div>
              ${learnings}
              <figure class="case__figure">${
                image
                  ? `<img src="${esc(image)}" alt="Screenshot of ${esc(p.title)}" loading="lazy" decoding="async" width="960" height="600">`
                  : "Screenshot slot — 16:10"
              }</figure>
            </div>
          </details>
        </div>
      </article>`;
}

const projectsHtml = (P.projects || []).map(projectCard).join("\n");

const skillsHtml = (P.skills || [])
  .map(
    (g) =>
      `<div class="skill reveal"><h3>${esc(g.group)}</h3><ul class="tags">${g.items
        .map((i) => `<li>${esc(i)}</li>`)
        .join("")}</ul></div>`
  )
  .join("\n");

const servicesHtml = (P.services || [])
  .map(
    (s) =>
      `<article class="card card--service glow reveal"><div class="card__icon">${icon(
        s.icon
      )}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`
  )
  .join("\n");

const howHtml = (P.howIWork || [])
  .map(
    (h) =>
      `<article class="principle reveal"><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></article>`
  )
  .join("\n");

function timeline(list, { openCurrent = false } = {}) {
  return (list || [])
    .map((item) => {
      const current = Boolean(item.current);
      const period = `${esc(item.period)}${
        current ? ' <span class="timeline__now">Current</span>' : ""
      }`;
      const body = [];
      if (item.summary) body.push(`<p>${esc(item.summary)}</p>`);
      if ((item.points || []).length) {
        body.push(`<ul>${item.points.map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>`);
      }
      const open = openCurrent && current ? " open" : "";
      return `<li class="timeline__item${current ? " timeline__item--current" : ""}">
          <details${open}>
            <summary>
              <span class="timeline__period">${period}</span>
              <p class="timeline__role">${esc(item.role)}</p>
              <p class="timeline__org">${esc(item.org)}</p>
            </summary>
            ${body.length ? `<div class="timeline__body">${body.join("")}</div>` : ""}
          </details>
        </li>`;
    })
    .join("\n");
}

const recommendationsHtml = (P.recommendations || []).length
  ? `<section class="section section--alt" id="recommendations" aria-labelledby="recTitle">
        <div class="wrap">
          <header class="section__head"><p class="kicker">Recommendations</p><h2 id="recTitle">What people say</h2></header>
          <div class="recs">${(P.recommendations || [])
            .map(
              (r) =>
                `<figure class="card rec reveal"><blockquote>“${esc(r.quote)}”</blockquote><figcaption><b>${esc(
                  r.name
                )}</b>${esc(r.role || "")}</figcaption></figure>`
            )
            .join("")}</div>
        </div>
      </section>`
  : "";

function channels() {
  const out = [];
  if (P.email) {
    const [local, domain] = String(P.email).split("@");
    out.push(`<li><button type="button" data-reveal="email" data-p1="${esc(local)}" data-p2="${esc(domain)}">
        ${icon("mail")}<span><span class="channel__label">Email</span><span class="channel__value">${esc(
          local
        )} (at) ${esc(domain.replace(/\./g, " (dot) "))}</span></span>
      </button></li>`);
  }
  for (const [net, url] of Object.entries(P.social || {})) {
    if (!isUrl(url)) continue;
    const labels = { linkedin: "LinkedIn", telegram: "Telegram", github: "GitHub" };
    const label = labels[net] || net;
    out.push(`<li><a href="${esc(url.trim())}" target="_blank" rel="noopener noreferrer">
        ${icon(net)}<span><span class="channel__label">${esc(label)}</span><span class="channel__value">${esc(
          url
            .trim()
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "")
        )}</span></span>
      </a></li>`);
  }
  if (P.phone && P.phoneDisplay) {
    const digits = String(P.phone).replace(/[^\d+]/g, "");
    const head = digits.slice(0, 4);
    const tail = digits.slice(4);
    out.push(`<li><button type="button" data-reveal="phone" data-p1="${esc(head)}" data-p2="${esc(
      tail
    )}" data-display="${esc(P.phoneDisplay)}">
        ${icon("phone")}<span><span class="channel__label">Phone · ${esc(
          P.timezone || ""
        )}</span><span class="channel__value">Show number</span></span>
      </button></li>`);
  }
  return out.join("\n");
}

const availabilityLine = `Based in ${esc(P.location)} (${esc(P.timezone)}) · ${esc(P.availability)}`;

/* ────────────────────────────────  head  ──────────────────────────────── */
const TITLE = `${P.name} — ${P.title}`;
const DESCRIPTION =
  `${P.name} — ${P.title}. ` +
  `Building AI-powered web applications that transform data into useful answers.`;
const siteUrl = (filled(P.siteUrl) || "").replace(/\/+$/, "");

const metaTags = [
  `<meta property="og:title" content="${esc(TITLE)}">`,
  `<meta property="og:description" content="${esc(DESCRIPTION)}">`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:site_name" content="${esc(P.name)}">`,
  `<meta property="og:locale" content="en_US">`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<meta name="twitter:title" content="${esc(TITLE)}">`,
  `<meta name="twitter:description" content="${esc(DESCRIPTION)}">`,
];
if (siteUrl) {
  metaTags.push(
    `<link rel="canonical" href="${siteUrl}/">`,
    `<meta property="og:url" content="${siteUrl}/">`,
    `<meta property="og:image" content="${siteUrl}/assets/img/og.jpg">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(`${P.name} — ${P.title}`)}">`,
    `<meta name="twitter:image" content="${siteUrl}/assets/img/og.jpg">`
  );
} else {
  metaTags.push(
    `<!-- TODO(js/data.js → siteUrl): set your production URL and run \`npm run build\`\n         to emit the canonical URL, absolute og:image and sitemap.xml. -->`
  );
}

const sameAs = Object.values(P.social || {})
  .filter(isUrl)
  .map((u) => u.trim());
const personSchema = {
  "@type": "Person",
  name: P.name,
  jobTitle: P.title,
  email: `mailto:${P.email}`,
  address: { "@type": "PostalAddress", addressLocality: P.location, addressCountry: "ET" },
  alumniOf: (P.education || [])
    .filter((e) => e.org && e.role && !/udacity/i.test(e.org))
    .map((e) => ({ "@type": "CollegeOrUniversity", name: e.org })),
  knowsAbout: [
    "Web development",
    "JavaScript",
    "AI-powered applications",
    "Quality management",
    "ISO 9001",
    "ISO 14001",
    "Production management",
    "Team leadership",
  ],
};
if (sameAs.length) personSchema.sameAs = sameAs;
if (siteUrl) personSchema.url = `${siteUrl}/`;
const graph = [personSchema];
if (siteUrl) {
  graph.push({
    "@type": "WebSite",
    name: `${P.name} — Portfolio`,
    url: `${siteUrl}/`,
    inLanguage: "en",
  });
}
const jsonLd = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@graph": graph,
})}<\/script>`;

/* ──────────────────────────── inline the CSS ──────────────────────────── */
let css = read("css/style.css");
css = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\n\s+/g, "\n")
  .replace(/\n{2,}/g, "\n")
  .trim();

/* ──────────────────────────── patch index.html ────────────────────────── */
/* index.template.html is the hand-edited source of the markup; index.html is
   generated output. The template is never written to, so a build can always be
   re-run from a clean state. */
const TEMPLATE = "index.template.html";
if (!fs.existsSync(path.join(ROOT, TEMPLATE))) {
  console.error(`✗ ${TEMPLATE} not found — it is the source for index.html.`);
  process.exit(1);
}
let html = read(TEMPLATE);

const slots = {
  meta: metaTags.join("\n    "),
  jsonld: jsonLd,
  initials: esc(P.initials),
  shortName: esc(shortName),
  name: esc(P.name),
  availability: esc(P.availability),
  availabilityLine: availabilityLine,
  headline: esc(P.headline),
  subhead: esc(P.subhead),
  cvLink: cvHeader,
  cvHero: cvHero,
  drawerExtras: drawerExtras,
  heroSocial: socialList(true),
  footerSocial: socialList(false),
  proof: proofHtml,
  aboutStory: aboutStory,
  aboutStats: aboutStats,
  aboutFocus: aboutFocus,
  aboutHighlights: aboutHighlights,
  careerPath: careerPath,
  projects: projectsHtml,
  skills: skillsHtml,
  services: servicesHtml,
  howIWork: howHtml,
  experience: timeline(P.experience, { openCurrent: true }),
  education: timeline(P.education),
  recommendations: recommendationsHtml,
  contactChannels: channels(),
  formEndpoint:
    P.contact && P.contact.formEndpoint
      ? `<input type="hidden" name="_subject" value="Portfolio enquiry from ${esc(P.name)}'s website">`
      : `<!-- TODO(js/data.js → contact.formEndpoint): add a Formspree/Web3Forms URL so the form sends for real. -->`,
};

// Paired markers are preserved so `npm run build` can be re-run any time.
// Replacement uses a function so `$` in content is never treated as a pattern.
const patch = (name, value) => {
  const re = new RegExp(`<!--#${name}-->[\\s\\S]*?<!--/#${name}-->`, "g");
  html = html.replace(re, () => `<!--#${name}-->${value}<!--/#${name}-->`);
};

patch("css", `<style>\n${css}\n</style>`);
for (const [name, value] of Object.entries(slots)) patch(name, value);

// The mailto fallback button must work without JavaScript too.
const mailtoHref = P.email ? `mailto:${esc(P.email)}` : "#contact";
html = html.replace(/id="mailtoFallback" href="[^"]*"/, `id="mailtoFallback" href="${mailtoHref}"`);

write("index.html", html);

/* ───────────────────────── robots.txt + sitemap.xml ───────────────────── */
const robots = siteUrl
  ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  : `User-agent: *\nAllow: /\n`;
write("robots.txt", robots);

if (siteUrl) {
  const urls = ["", "404.html"].map(
    (p) =>
      `  <url>\n    <loc>${siteUrl}/${p}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${p ? "0.2" : "1.0"}</priority>\n  </url>`
  );
  write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
      "\n"
    )}\n</urlset>\n`
  );
}

/* ──────────────────────────────── report ─────────────────────────────── */
const kb = (buf) => (Buffer.byteLength(buf) / 1024).toFixed(1);
console.log(`✓ index.html  ${kb(html)} KB`);
console.log(`✓ css inlined ${kb(css)} KB (critical + full, CSP-safe)`);
console.log(`✓ robots.txt  ${siteUrl ? "with sitemap reference" : "no sitemap (set siteUrl)"}`);
if (!siteUrl)
  console.log("⚠ TODO: set siteUrl in js/data.js → enables canonical, og:image, sitemap.xml");
if (!P.cv) console.log("⚠ TODO: set cv in js/data.js → enables Download CV buttons");
if (!P.contact?.formEndpoint)
  console.log("⚠ TODO: set contact.formEndpoint → enables real form delivery");
