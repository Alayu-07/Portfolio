# Verification report — alayu-portfolio

Measured **19 October 2026** on the built site (`index.html`, output of `npm run build`),
served locally and probed in headless Chrome 155. Raw artefacts: `docs/lighthouse-before.json`,
`docs/lighthouse-after.json`, `docs/axe-report.json`, `docs/verification.json`,
`docs/check-output.txt`, `docs/screenshots/*.png`.

## Reproduce

```bash
npm install
npm run build     # index.template.html + js/data.js → index.html, robots.txt[, sitemap.xml]
npm run check     # static: contrast ratios, TODO inventory, HTML/a11y/SEO structure
npm run verify    # 13 screenshots + axe (4 runs) + no-JS + layout assertions
npx lighthouse http://localhost:8099/ --quiet --output=json --output-path=docs/lighthouse-after.json
```

`npm run verify` starts its own server on port **8099** (`VERIFY_PORT` overrides; the
default dev server port is 4173 and may already be in use on your machine).
Chrome/Edge is found automatically; override with `CHROME_PATH`.

## 1. Lighthouse (mobile, default settings, Chrome 155)

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
| Total transfer           | **2,370 KiB** | **207 KiB** (−91 %) |

Before, the failing accessibility audits were `aria-required-children` and
`label-content-name-mismatch`; both are gone. After the run, no action-blocking audit
scores below 1.0 — only the lab-metric audits themselves (LCP 2.2 s = 0.95,
FCP 1.3 s = 0.98) plus the informational `network-dependency-tree-insight`
(HTML → fonts/js/css dependency tree).

## 2. axe-core (WCAG 2.0/2.1/2.2 A + AA)

| Run            | Violations |
| -------------- | ---------- |
| 375 px, dark   | **0**      |
| 1440 px, dark  | **0**      |
| 375 px, light  | **0**      |
| 1440 px, light | **0**      |

The brand violet `--accent` (#7C3AED) is ~3.3:1 on navy, so it is used for fills/buttons
(white `--accent-contrast` = 5.70:1); all accent **text** uses `--accent-text`
(#A78BFA dark / #6D28D9 light), which is why the earlier light-theme
`color-contrast` failures are gone.

Full node-level detail: `docs/axe-report.json`.

## 3. Layout assertions (all 6 viewports × both themes)

`npm run verify` measures computed styles in the browser and fails if anything drifts:

```
layout 320px:  overflow 0px · cols h1/s1/p1/k1/b6  · counts 9/3/5/4/4/5/4/6 · photos hero 800 covers 3 · fonts ok
layout 375px:  overflow 0px · cols h1/s1/p1/k1/b6  · counts 9/3/5/4/4/5/4/6 · photos hero 800 covers 3 · fonts ok
layout 768px:  overflow 0px · cols h1/s1/p1/k2/b6  · counts 9/3/5/4/4/5/4/6 · photos hero 800 covers 3 · fonts ok
layout 1024px: overflow 0px · cols h2/s2/p2/k2/b12 · counts 9/3/5/4/4/5/4/6 · photos hero 800 covers 3 · fonts ok
layout 1366px: overflow 0px · cols h2/s2/p2/k4/b12 · counts 9/3/5/4/4/5/4/6 · photos hero 800 covers 3 · fonts ok
layout 1440px: overflow 0px · cols h2/s2/p2/k4/b12 · counts 9/3/5/4/4/5/4/6 · photos hero 800 covers 3 · fonts ok
layout failures: none
```

Column keys: hero grid / split / projects / skills / bento (6 = single column at mobile,
12 = full 12-column grid at ≥1024 px). Count keys: sections / projects / skills / services /
principles / experience / education / career path — identical at every breakpoint, so no
section is dropped or duplicated responsively. `photos hero 800` = intrinsic width of the one
remaining photograph (the hero portrait, 800×960); the About section is now **text-only**, so its
`about-354/708` derivatives were deleted. `covers 3` = all three project cards render a real
1280×800 live screenshot (the probe forces lazy covers eager, then asserts each one loaded).
`fonts ok` = self-hosted
Inter **and** Space Grotesk resolved from `assets/fonts/` (no Google Fonts request).

## 4. JavaScript disabled

```
no-JS: 6467 visible chars, missing: none, body background: rgb(245, 246, 251)
```

Name, headline, about, projects, skills, experience, education, career path and contact
details are all present as plain HTML, with the stylesheet applied. Screenshot:
`docs/screenshots/1024-nojs.png`.

## 5. Browser console

```
console errors: none
```

Across all 12 viewport × theme probes.

## 6. Static checks (`npm run check`)

```
✓ check complete — 0 failure(s), 3 warning(s)
```

- All theme/foreground/background contrast pairs pass WCAG AA (light, dark/system, print):
  `--accent-text` on `--bg/--bg-alt/--surface` and `--accent-contrast` on `--accent`.
- 3 warnings are intentional empty/TODO state, listed in `WHAT-I-NEED.md`:
  `siteUrl` not set (canonical + `og:image` are omitted, not faked),
  `cvLink/cvHero` empty (hidden, not rendered broken), and
  `contact.formEndpoint` empty (form falls back to the mailto draft).

## 7. Screenshots

13 full-page captures in `docs/screenshots/`: `320/375/768/1024/1366/1440-dark`,
`…-light`, and `1024-nojs`. Scroll-reveal states are settled before each capture so no
element is frozen mid-fade.

## What this does and does not prove

Proven by measurement: no accessibility violations in axe's A/AA rule set on mobile and
desktop in both themes; no console errors; complete content without JavaScript; no
horizontal overflow and expected grid behaviour at every breakpoint; AA contrast in all
themes; 91 % payload reduction and LCP 13.7 s → 2.2 s in Lighthouse's lab.

Not proven: subjective visual taste (screenshot review is a human step), real-device
performance, and behaviour on a production CDN. Lighthouse is a lab simulation — re-run it
against the deployed URL once `siteUrl` is set and the site is pushed.
