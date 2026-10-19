# Audit — alayu-portfolio (Alayu Legesse Siyfu)

Audited against the goal: a world-class, recruiter-ready, production-deployable personal
site. Findings are prioritised **P0** (blocks credibility/hiring), **P1** (major quality),
**P2** (polish).

## Baseline evidence (before)

Measured with Lighthouse 13 (mobile, simulated 4G, Chrome 155) against a local static
server — raw report: `docs/lighthouse-before.json`.

| Metric                   | Before                                                                |
| ------------------------ | --------------------------------------------------------------------- |
| Performance              | **65**                                                                |
| Accessibility            | **95** (`aria-required-children`, `label-content-name-mismatch` fail) |
| Best Practices           | 100                                                                   |
| SEO                      | 100 (shallow checks only)                                             |
| First Contentful Paint   | 3.4 s                                                                 |
| Largest Contentful Paint | **13.7 s**                                                            |
| Speed Index              | 5.0 s                                                                 |
| Total transfer           | **2,370 KiB**                                                         |
| JS blocking              | Google Fonts CSS is render-blocking; content is 100 % JS-rendered     |

Largest transfers: `starfield.jpg` **1,446 KiB** (7680×4800), `hero-gradient.jpg`
**559 KiB** (6109×4073), 3 × Google-hosted font families, `favicon.png` 24 KiB (128 px).

Other measured evidence:

- File sizes: `css/style.css` 17 KB (unlayered, duplicated rules), `js/main.js` 10 KB,
  `js/data.js` 5.5 KB, `index.html` 8 KB (zero static content — every section is an
  empty container filled at runtime).
- With JavaScript disabled the page renders as an empty shell plus a
  "Please enable JavaScript" notice — no name, no projects, no experience.
- Contrast spot checks (WCAG 2.2 AA requires 4.5:1 for body text): light theme
  `--muted #5b6370` on `--bg-alt #efeff7` = **4.4:1** (fails), hero overlay text over
  starfield varies per pixel (unverifiable → fails by inspection).

---

## P0 — credibility & hiring blockers

| #   | Finding                                                                                                                                                                                    | Evidence                                   | Fix                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a   | Projects have no live URL, repo, or screenshots; CSS "browser mock" placeholders read as unfinished. No case-study depth (problem / role / learnings).                                     | `js/data.js:62-87`, `js/main.js:79-89`     | Case-study cards with `<details>` expansion: problem, what I built, role, features, learning, 16:10 screenshot slot, Live + GitHub buttons, and a deliberate "Case study in progress" state for missing links. `stack`/`tags`/`live`/`repo`/`image` fields added as TODOs. |
| b   | Socials (GitHub, LinkedIn, Telegram) and CV are empty strings; the "Download CV" button is always present but dead (`href="#"`).                                                           | `js/data.js:17`, `index.html:59`           | Links are omitted from the DOM until a URL exists; CV button renders only when `cv` is set; `assets/cv/` documented.                                                                                                                                                       |
| c   | Experience copy leaks unfinished authoring text: `"Dates not listed in CV"`, `"May 2020 – 2026 (CV period)"`. Order puts an undated role above a possibly-current one.                     | `js/data.js:48-49`                         | Reverse-chronological, one current role: Zamu MDF PLC shown as `Present` (start date TODO), Rorank PM `2020 – 2026`, earlier roles unchanged. Flagged for confirmation — see "What I need from you".                                                                       |
| d   | "Skills" mixes real skills with project names ("AI-Powered Forum", "ChatGPT Clone").                                                                                                       | `js/data.js:41-44`                         | Restructured: Core web / Data & analysis / Quality & compliance / Leadership. Project names live only in Projects.                                                                                                                                                         |
| e   | Project `stack` values are descriptors ("Community", "Q&A"), not technologies.                                                                                                             | `js/data.js:67,75,83`                      | `tags` (domain) separated from `stack` (technologies). `stack` is empty + TODO; nothing tech-related renders until filled.                                                                                                                                                 |
| t   | All content is rendered by JS → empty shell without JS, FOUC, no SEO-visible content, no crawlable text.                                                                                   | `index.html:47-148` (all containers empty) | Content is pre-rendered into `index.html` by `scripts/prerender.js` from `js/data.js` (single source of truth preserved). Core content is now plain HTML; JS only enhances.                                                                                                |
| r   | Hero loads a 1,446 KiB 7680×4800 starfield + 559 KiB 6109×4073 gradient. LCP = 13.7 s.                                                                                                     | Lighthouse "total-byte-weight"             | Both replaced by a pure-CSS aurora/gradient mesh + 1 KB inline SVG grain (works in both themes). Originals preserved in `assets/original/`. Profile/about photos → AVIF/WebP with JPEG fallback, srcset, explicit dimensions.                                              |
| w   | `og:image` points at a relative 1.4 MB file; no `og:url`, `og:site_name`, `twitter:*`. Sharing cards would be broken/ugly.                                                                 | `index.html:12`                            | New 1200×630 OG image (<200 KB), full OG/Twitter set. Absolute URLs are generated by `npm run build` once `siteUrl` is set in `js/data.js` (a real URL will not be invented).                                                                                              |
| z   | Filter chips declare `role="tablist"` with no `role="tab"`/`tabpanel` → Lighthouse `aria-required-children` fails; social links labelled "github"/"linkedin" mismatch their visible state. | `index.html:117`, Lighthouse a11y          | Plain buttons with `aria-pressed` + `aria-live` result announcement; accessible names fixed. Post-fix axe/Lighthouse a11y: see verification report.                                                                                                                        |
| aa  | Contact form only opens the visitor's mail client — no delivery, no states, no spam protection.                                                                                            | `js/main.js:159-175`                       | Honeypot + inline validation (`aria-invalid`, `aria-describedby`) + loading/success/error states against a configurable Formspree/Web3Forms endpoint (`js/data.js → contact.formEndpoint`, empty = mailto fallback). No secret keys in the repo.                           |

## P1 — quality, consistency, accessibility

| #   | Finding                                                                                                   | Fix                                                                                                                                                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| g   | Service icons are semantically wrong (database for AI, phone for Operations).                             | Sparkles (AI), layout (web), layers (full stack), shield-check (quality/operations).                                                                                                                                                                                   |
| i   | The hero is a fixed dark starfield while everything else follows the theme toggle → two different sites.  | One design system: CSS custom-property aurora used in hero, section dividers, CTA band, footer; identical treatment in light + dark.                                                                                                                                   |
| j   | Passport photo in a tilted frame over a starfield reads as "pasted on".                                   | Straight rounded frame, gradient halo ring, consistent elevation, subtle pointer parallax (disabled for reduced motion/touch).                                                                                                                                         |
| k   | Generic typing effect across 3 roles delays the value proposition.                                        | Value-driven H1 + concise subhead + 2 CTAs + animated proof strip (18+ years · MBA · MSc · ISO 9001/14001). Typing effect removed — it cost JS and attention without adding information.                                                                               |
| l   | No design system: one-off hex values, single radius/shadow, no motion tokens, no semantic tokens.         | Full token set in `@layer tokens`: 4/8 px spacing, `clamp()` type scale, 5 elevations, radius + motion scales, semantic colours for both themes, contrast-verified (see `scripts/check.js`).                                                                           |
| m   | No micro-interactions beyond basic hover.                                                                 | Scroll progress bar, magnetic CTAs, cursor-spotlight border glow on cards, animated nav indicator, staggered reveals, `startViewTransition` theme switch, count-up proof strip — all `transform`/`opacity` only, all gated on `prefers-reduced-motion` + pointer type. |
| n   | Nav is a plain sticky bar: no shrink, no drawer focus trap, no Esc, no scroll lock, toggle has no state.  | Glass header that compacts on scroll, active-section indicator, modal-style drawer (focus trap, Esc, `aria-expanded`, scroll lock, focus restore), theme toggle with `aria-pressed` + live system-preference sync.                                                     |
| o   | Timeline is a flat list; no career narrative.                                                             | Vertical timeline with accessible `<details>` expansion + horizontal career path: Teacher → Director → Chemist → Production Manager → Head of QC → Developer.                                                                                                          |
| p   | No "How I work", no final CTA, no recommendations slot.                                                   | 4 principles drawn from production/quality background, CTA band above the footer, testimonials section that renders nothing until real quotes are provided.                                                                                                            |
| s   | Fonts are render-blocking Google Fonts (3 separate families, no subset control).                          | Self-hosted variable woff2 (latin subset), `font-display: swap`, 2 critical files preloaded.                                                                                                                                                                           |
| u   | No critical-CSS split, no explicit image dimensions policy, unbounded CLS risk from JS-filled containers. | Critical CSS inlined + remainder loaded async with `<noscript>` fallback; all images carry `width`/`height`; no runtime content injection → measured CLS 0.                                                                                                            |
| x   | No canonical, robots, sitemap, JSON-LD, manifest, 404.                                                    | `Person` + `WebSite` JSON-LD, canonical + OG/Twitter tags, `robots.txt`, generated `sitemap.xml`, `manifest.webmanifest`, custom `404.html`, favicon set (SVG + 32/192/512/180 px).                                                                                    |
| ab  | Phone and email are exposed in plain text to scrapers; no timezone/remote line.                           | Email shown as `name (at) domain` with click-to-reveal real `mailto:`; phone behind a reveal button; primary channels pushed to the form/Telegram/LinkedIn; availability line "Based in Ethiopia (EAT, UTC+3) · open to remote".                                       |

## P2 — polish & maintainability

| #   | Finding                                                                                                                                                     | Fix                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| h   | Dead code: `sample` flags, unused `.mock`/`.sample-badge` styling paths, duplicated `--shadow`/`.section--alt` rules, 21-line unused `twitter` X icon hack. | Removed; CSS reorganised into `@layer tokens/base/layout/components/utilities/responsive/print`.                                                                              |
| —   | README is 29 lines, no build/deploy/domain guidance.                                                                                                        | Full README: edit content, add a project, screenshots, contact-form setup, build, GitHub Pages + Netlify + Cloudflare, custom domain, print résumé.                           |
| —   | No lint/format config, no checks.                                                                                                                           | Prettier + EditorConfig + `npm run check` (contrast ratios, TODO inventory, HTML structure, prerender freshness).                                                             |
| —   | Print output is the web page.                                                                                                                               | Print stylesheet converts the page into a clean one-page résumé (details auto-expanded via `beforeprint`).                                                                    |
| —   | CSP absent.                                                                                                                                                 | Meta CSP (strict `script-src 'self'`, inline styles allowed for critical CSS) + matching `_headers` / `netlify.toml` / `vercel.json` with long-cache rules for static assets. |

## Decisions taken (safest honest option)

1. **Zamu MDF PLC period** shown as `Present` (it is the current role by source order);
   the start date is unconfirmed and listed as TODO. Rorank PM rewritten
   `May 2020 – 2026 (CV period)` → `2020 – 2026`. Both need your confirmation.
2. **No "Currently learning" row** until you confirm it (nothing invented).
3. **No tech stack, live URL, repo URL, or screenshot** is rendered until you provide
   them — the empty states are designed, not broken.
4. **No canonical/absolute OG URL** until `siteUrl` is set — no URL invented.
5. **Typing effect removed** rather than restrung; the H1 now carries the value
   proposition for a 30-second reader.
6. **Case studies use `<details>`, not a JS modal** — keyboard-native and works
   without JavaScript.

---

## After � implementation evidence

Re-measured with the same tools (Lighthouse 13.5.0, axe-core 4.10, Chrome 155,
same local server, `--preset=desktop` not used � mobile default both times).
Raw reports: `docs/lighthouse-before.json`, `docs/lighthouse-after.json`,
`docs/verification.json`, `docs/axe-report.json`.

| Metric                   | Before        | After               |
| ------------------------ | ------------- | ------------------- |
| Performance              | **65**        | **97**              |
| Accessibility            | 95            | **100**             |
| Best Practices           | 100           | 100                 |
| SEO                      | 100           | 100                 |
| First Contentful Paint   | 3.4 s         | **1.3 s**           |
| Largest Contentful Paint | **13.7 s**    | **2.2 s**           |
| Speed Index              | 5.0 s         | **3.8 s**           |
| Total Blocking Time      | —             | **30 ms**           |
| Cumulative Layout Shift  | 0             | 0                   |
| Total transfer           | **2,370 KiB** | **207 KiB** (-91 %) |

Accessibility evidence:

- axe-core: **0 violations in 4 runs** — 375 px/1440 px × dark/light, including the
  two audits that failed before (`aria-required-children`,
  `label-content-name-mismatch`).
- `scripts/check.js`: **0 failures, 3 warnings** (all three warnings are intentional
  empty/TODO state: `siteUrl` not set yet → canonical + og:image omitted; empty
  `cvLink, recommendations` hidden rather than rendered broken; `contact.formEndpoint`
  empty → mailto fallback).
- Contrast: every foreground/background token pair passes WCAG AA in all three
  themes (light, dark/system, print) � light `--muted` on `--bg-alt` fixed
  from 4.4:1 ? passing; dark `--accent-contrast` 6.64:1, `--danger` 9.33:1.
- No-JS rendering: 6,398 visible characters, every required block present
  (name, hero, about, projects, skills, experience, education, path, proof,
  contact), correct body background — the old empty shell is gone.
- Browser console: **no errors/warnings** on any probe.
- Layout assertions: no horizontal overflow at 320/375/768/1024/1366/1440 px;
  responsive grids switch at the intended breakpoints; the hero photo loads as AVIF
  at intrinsic 800×960 and all three project covers load their 1000×625 WebP;
  Inter + Space Grotesk resolve from `assets/fonts/`.

Remaining, deliberate:

- Unminified `js/*.js` (~12 KiB) and no immutable cache on localhost � source is
  shipped readable on purpose; production headers in `_headers`/`netlify.toml`/
  `vercel.json` (and now `scripts/serve.js`) supply compression + caching.
- Canonical/OG/`sitemap.xml` are emitted only after `siteUrl` is set.
- All `TODO` items are listed in `WHAT-I-NEED.md`.
