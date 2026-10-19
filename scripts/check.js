#!/usr/bin/env node
/**
 * Static checks — no browser needed.
 *   · WCAG contrast for the semantic token pairs (light + dark)
 *   · TODO inventory from js/data.js
 *   · HTML/SEO/a11y sanity on the built index.html
 *
 *   npm run check
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PORTFOLIO as P } from "../js/data.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

let failures = 0;
let warnings = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`  ✗ ${msg}`);
};
const warn = (msg) => {
  warnings += 1;
  console.log(`  ! ${msg}`);
};
const ok = (msg) => console.log(`  ✓ ${msg}`);

/* ───────────────────────────── contrast ──────────────────────────────── */
const css = read("css/style.css");

function block(startToken, endToken) {
  const start = css.indexOf(startToken);
  if (start === -1) return "";
  if (typeof endToken === "number") return css.slice(start, endToken);
  const end = endToken ? css.indexOf(endToken, start + startToken.length) : css.length;
  return css.slice(start, end === -1 ? css.length : end);
}

function vars(text) {
  const out = {};
  for (const m of text.matchAll(/--([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const darkMediaStart = css.indexOf("@media (prefers-color-scheme: dark)");
const printStart = css.indexOf("@layer print");
const themes = {
  light: vars(block(":root {", ':root[data-theme="dark"]')),
  dark: vars(block(':root[data-theme="dark"]', darkMediaStart)),
  "dark (system)": vars(css.slice(darkMediaStart, printStart === -1 ? undefined : printStart)),
};

const hex = (v) => {
  if (!v) return null;
  const m = v.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

const lum = ([r, g, b]) => {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const PAIRS = [
  ["text", "bg", 4.5],
  ["text", "bg-alt", 4.5],
  ["text", "surface", 4.5],
  ["text-muted", "bg", 4.5],
  ["text-muted", "bg-alt", 4.5],
  ["text-muted", "surface", 4.5],
  ["text-muted", "surface-2", 4.5],
  ["accent-text", "bg", 4.5],
  ["accent-text", "bg-alt", 4.5],
  ["accent-text", "surface", 4.5],
  ["accent-contrast", "accent", 4.5],
  ["success", "surface", 4.5],
  ["danger", "surface", 4.5],
  ["focus", "bg", 3.0],
];

console.log("\nContrast (WCAG 2.2 AA)");
for (const [themeName, tokens] of Object.entries(themes)) {
  if (!Object.keys(tokens).length) {
    warn(`${themeName}: could not parse tokens`);
    continue;
  }
  console.log(` ${themeName}:`);
  for (const [fg, bg, min] of PAIRS) {
    const fgHex = hex(tokens[fg]);
    const bgHex = hex(tokens[bg]);
    if (!fgHex || !bgHex) {
      warn(`--${fg} on --${bg}: not a plain hex (skipped)`);
      continue;
    }
    const r = ratio(fgHex, bgHex);
    const line = `--${fg} on --${bg} = ${r.toFixed(2)}:1 (min ${min})`;
    if (r + 0.005 < min) fail(`${themeName}: ${line}`);
    else ok(`${themeName}: ${line}`);
  }
}

/* ─────────────────────────── TODO inventory ─────────────────────────── */
const dataSrc = read("js/data.js");
const todoLines = dataSrc
  .split("\n")
  .map((line, i) => [i + 1, line])
  .filter(([, line]) => /TODO/.test(line));

console.log(`\nTODO inventory (js/data.js) — ${todoLines.length} items`);
todoLines.forEach(([n, line]) => console.log(`  · L${n}: ${line.trim().slice(0, 110)}`));

/* ─────────────────────────────── HTML ───────────────────────────────── */
const html = read("index.html");
console.log("\nBuilt HTML");

const checks = [
  [/<html[^>]+lang="en"/, 'html[lang="en"] present'],
  [/<title>([^<]{20,90})<\/title>/, "title present and reasonable length"],
  [/<meta\s+name="description"\s+content="[^"]{50,200}"/s, "meta description present"],
  [/<link rel="canonical"/, "canonical URL (needs siteUrl)"],
  [/<meta property="og:image"/, "absolute og:image (needs siteUrl)"],
  [/application\/ld\+json/, "JSON-LD structured data"],
  [/<link rel="manifest"/, "web manifest linked"],
  [/<meta name="theme-color"/, "theme-color set"],
];
for (const [re, label] of checks) {
  if (re.test(html)) ok(label);
  else if (/siteUrl/.test(label)) warn(`${label} — set siteUrl in js/data.js`);
  else fail(label);
}

const h1s = (html.match(/<h1[\s>]/g) || []).length;
if (h1s === 1) ok("exactly one <h1>");
else fail(`${h1s} <h1> elements found (expected 1)`);

const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const missingAlt = imgs.filter((t) => !/\balt=/.test(t));
const missingDims = imgs.filter((t) => !/\bwidth=/.test(t) || !/\bheight=/.test(t));
const missingLazy = imgs.filter(
  (t) => !/fetchpriority="high"/.test(t) && !/loading="lazy"/.test(t)
);
if (!missingAlt.length) ok(`${imgs.length} images all have alt text`);
else fail(`${missingAlt.length} images missing alt`);
if (!missingDims.length) ok("all images have explicit width/height (no CLS)");
else fail(`${missingDims.length} images missing width/height`);
if (!missingLazy.length) ok("below-the-fold images lazy-loaded");
else warn(`${missingLazy.length} images neither lazy nor high priority`);

const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map((m) => m[0]);
const noType = buttons.filter((t) => !/\btype=/.test(t));
if (!noType.length) ok(`${buttons.length} buttons have an explicit type`);
else fail(`${noType.length} buttons without type attribute`);

const inlineHandlers = [...html.matchAll(/\son(click|load|error|mouseover|submit)=/g)];
if (!inlineHandlers.length) ok("no inline event handlers (CSP-safe)");
else fail(`${inlineHandlers.length} inline event handlers found`);

const blankTargets = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((m) => m[0]);
const unsafe = blankTargets.filter((t) => !/rel="[^"]*noopener/.test(t));
if (!unsafe.length) ok(`all ${blankTargets.length} target="_blank" links use rel="noopener"`);
else fail(`${unsafe.length} target="_blank" links missing rel="noopener"`);

if (!/href="#"/.test(html)) ok('no dead href="#" links');
else fail('dead href="#" link present');
if (!/\bsample\b/i.test(html)) ok("no leftover 'sample' scaffolding");
else fail("leftover 'sample' scaffolding in output");

const requiredContent = [
  P.name,
  P.headline,
  P.about.story[0].slice(0, 30),
  P.experience[0].role,
  P.projects[0].title,
  P.skills[0].items[0],
].map((t) =>
  String(t).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  )
);
const missingContent = requiredContent.filter((t) => !html.includes(t));
if (!missingContent.length) ok("all core content pre-rendered into index.html");
else fail(`content missing from HTML: ${missingContent.join(", ")}`);

const leftover = [...html.matchAll(/<!--#([\w]+)-->\s*<!--\/#\1-->/g)].map((m) => m[1]);
if (!leftover.length) ok("no empty content slots");
else warn(`empty slots (expected while data is incomplete): ${leftover.join(", ")}`);

/* ────────────────────────────── summary ────────────────────────────── */
console.log(
  `\n${failures ? "✗" : "✓"} check complete — ${failures} failure(s), ${warnings} warning(s)`
);
if (failures) process.exitCode = 1;
