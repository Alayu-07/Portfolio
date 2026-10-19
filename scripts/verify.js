#!/usr/bin/env node
/**
 * Browser verification (requires the optional `puppeteer-core` + `axe-core` dev deps
 * and a local Chrome/Edge installation — set CHROME_PATH to override).
 *
 *   npm run verify
 *
 * Produces:
 *   docs/screenshots/*.png          — every breakpoint × both themes + no-JS
 *   docs/axe-report.json            — axe-core (WCAG 2.1/2.2 A + AA) results
 *   docs/verification.json          — machine-readable summary
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const SHOTS = path.join(DOCS, "screenshots");
fs.mkdirSync(SHOTS, { recursive: true });

const PORT = process.env.VERIFY_PORT || "8099";
const BASE = `http://localhost:${PORT}/`;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error("No Chrome/Edge binary found. Set CHROME_PATH and retry.");
  process.exit(1);
}

const WIDTHS = [320, 375, 768, 1024, 1366, 1440];
const HEIGHTS = { 320: 568, 375: 667, 768: 1024, 1024: 768, 1366: 768, 1440: 900 };
const THEMES = ["dark", "light"];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (e) {
      /* not up yet */
    }
    await wait(250);
  }
  throw new Error("dev server did not start");
}

const server = spawn(process.execPath, [path.join(ROOT, "scripts", "serve.js"), PORT], {
  cwd: ROOT,
  stdio: "ignore",
});

const summary = {
  chrome: CHROME,
  axe: {},
  screenshots: [],
  noJs: {},
  consoleErrors: [],
  layout: {},
  layoutFailures: [],
};

try {
  await waitForServer(BASE);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
  });

  const axeSource = fs.readFileSync(
    path.join(ROOT, "node_modules", "axe-core", "axe.min.js"),
    "utf8"
  );

  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage();
      page.on("console", (msg) => {
        if (msg.type() === "error") summary.consoleErrors.push(`${theme}/${width}: ${msg.text()}`);
      });
      page.on("pageerror", (err) =>
        summary.consoleErrors.push(`${theme}/${width}: ${err.message}`)
      );
      await page.evaluateOnNewDocument((t) => {
        try {
          localStorage.setItem("theme", t);
        } catch (e) {
          /* ignore */
        }
      }, theme);
      await page.setViewport({
        width,
        height: HEIGHTS[width] || Math.round(width * 0.72),
        deviceScaleFactor: 1,
      });
      await page.goto(BASE, { waitUntil: "networkidle0" });
      // Trigger reveal animations, then scroll back to the top.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      // Wait for every image (lazy ones included) to finish loading, then decode.
      // Project cover images are lazy; force them eager here so the layout
      // assertion below can prove they actually load (perf is measured by
      // Lighthouse separately, not by this probe).
      await page.evaluate(async () => {
        const covers = [...document.querySelectorAll(".project__cover img")];
        covers.forEach((i) => (i.loading = "eager"));
        const timeout = new Promise((r) => setTimeout(r, 4000));
        const loaded = Promise.all(
          [...document.images]
            .filter((i) => i.loading !== "lazy")
            .map((i) =>
              i.complete && i.naturalWidth > 0
                ? Promise.resolve()
                : new Promise((r) => {
                    i.addEventListener("load", r, { once: true });
                    i.addEventListener("error", r, { once: true });
                  })
            )
        );
        await Promise.race([loaded, timeout]);
      });
      await wait(700);
      // Any element still mid-transition would be captured half-faded; settle it
      // so the screenshot shows the final state. (The observer behaviour itself is
      // exercised by the scroll loop above.)
      await page.evaluate(() =>
        document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => el.classList.add("is-in"))
      );
      await wait(700);
      const file = path.join(SHOTS, `${width}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      summary.screenshots.push(path.relative(ROOT, file).replace(/\\/g, "/"));

      /* ── layout assertions (reproducible version of the manual review) ── */
      const layout = await page.evaluate(() => {
        const cols = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const g = getComputedStyle(el).gridTemplateColumns;
          return g === "none" ? 1 : g.split(" ").filter(Boolean).length;
        };
        const count = (sel) => document.querySelectorAll(sel).length;
        const img = (sel) => {
          const el = document.querySelector(sel);
          return el ? el.naturalWidth : 0;
        };
        const timelines = [...document.querySelectorAll("#experience .timeline")].map(
          (t) => t.children.length
        );
        return {
          overflowPx: document.documentElement.scrollWidth - window.innerWidth,
          columns: {
            hero: cols(".hero__grid"),
            split: cols(".split"),
            projects: cols(".projects"),
            skills: cols(".skills"),
            bento: cols(".bento"),
          },
          fonts: {
            inter: document.fonts.check("16px Inter"),
            spaceGrotesk: document.fonts.check("16px 'Space Grotesk'"),
          },
          photos: {
            hero: img(".hero__media img"),
            projectCovers: [...document.querySelectorAll(".project__cover img")].filter(
              (i) => i.naturalWidth > 0
            ).length,
          },
          counts: {
            sections: document.querySelectorAll("section[id]").length,
            projects: count("#work .projects > *"),
            skills: count("#skills .skills > *"),
            services: count("#services .cards > *"),
            principles: count("#approach .principles > *"),
            experience: timelines[0] || 0,
            education: timelines[1] || 0,
            path: count(".path__list > *"),
          },
          text: {
            h1: document.querySelector("h1")?.innerText?.replace(/\s+/g, " ").slice(0, 60) || "",
          },
        };
      });
      summary.layout[width] = layout;
      const fail = (why) => summary.layoutFailures.push(`${width}-${theme}: ${why}`);
      if (layout.overflowPx > 1) fail(`horizontal overflow ${layout.overflowPx}px`);
      if (!layout.fonts.inter || !layout.fonts.spaceGrotesk) fail("self-hosted font not loaded");
      if (layout.photos.hero === 0) fail("hero photo did not load");
      if (layout.photos.projectCovers !== layout.counts.projects)
        fail(`project screenshots ${layout.photos.projectCovers}/${layout.counts.projects} loaded`);
      for (const [k, v] of Object.entries(layout.counts)) {
        if (!v) fail(`section rendered 0 ${k}`);
      }
      if (!layout.text.h1) fail("h1 missing");

      if (width === 375 || width === 1440) {
        await page.evaluate(axeSource);
        const results = await page.evaluate(async () => {
          return await window.axe.run(document, {
            runOnly: {
              type: "tag",
              values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
            },
          });
        });
        summary.axe[`${width}-${theme}`] = {
          violations: results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.length,
            targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
          })),
          passes: results.passes.length,
          incomplete: results.incomplete.length,
        };
      }
      await page.close();
    }
  }

  /* ── no-JavaScript render check ─────────────────────────────────────── */
  const noJs = await browser.newPage();
  await noJs.setJavaScriptEnabled(false);
  await noJs.setViewport({ width: 1024, height: 900 });
  await noJs.goto(BASE, { waitUntil: "domcontentloaded" });
  await wait(300);
  const text = await noJs.evaluate(() => document.body.innerText);
  const expected = [
    "Alayu Legesse Siyfu",
    "Full-Stack Developer | AI Engineer",
    "Evangadi",
    "Zamu MDF PLC",
    "ISO 9001",
    "Skills",
    "Contact",
  ];
  summary.noJs = {
    visibleCharacters: text.length,
    missing: expected.filter((t) => !text.includes(t)),
    h1: await noJs.evaluate(() => document.querySelector("h1")?.innerText?.slice(0, 90) || ""),
    cssApplied: await noJs.evaluate(() => getComputedStyle(document.body).backgroundColor),
  };
  const noJsShot = path.join(SHOTS, "1024-nojs.png");
  await noJs.screenshot({ path: noJsShot, fullPage: true });
  summary.screenshots.push(path.relative(ROOT, noJsShot).replace(/\\/g, "/"));
  await browser.close();

  fs.writeFileSync(path.join(DOCS, "axe-report.json"), JSON.stringify(summary.axe, null, 2));
  fs.writeFileSync(path.join(DOCS, "verification.json"), JSON.stringify(summary, null, 2));

  console.log(`\nScreenshots (${summary.screenshots.length}) → docs/screenshots/`);
  for (const [key, value] of Object.entries(summary.axe)) {
    const v = value.violations.length;
    console.log(`  axe ${key}: ${v === 0 ? "✓ 0 violations" : `✗ ${v} violation(s)`}`);
    value.violations.forEach((x) =>
      console.log(`      ${x.id} (${x.impact}) ×${x.nodes} → ${x.targets.join(", ")}`)
    );
  }
  console.log(
    `  no-JS: ${summary.noJs.visibleCharacters} visible chars, missing: ${
      summary.noJs.missing.length ? summary.noJs.missing.join(", ") : "none"
    }, body background: ${summary.noJs.cssApplied}`
  );
  console.log(
    `  console errors: ${summary.consoleErrors.length ? summary.consoleErrors.join(" | ") : "none"}`
  );
  for (const [width, l] of Object.entries(summary.layout)) {
    const c = l.counts;
    console.log(
      `  layout ${width}px: overflow ${l.overflowPx}px · cols h${l.columns.hero}/s${l.columns.split}/p${l.columns.projects}/k${l.columns.skills}/b${l.columns.bento} · ` +
        `counts ${c.sections}/${c.projects}/${c.skills}/${c.services}/${c.principles}/${c.experience}/${c.education}/${c.path}` +
        ` · photos hero ${l.photos.hero} covers ${l.photos.projectCovers} · fonts ${l.fonts.inter && l.fonts.spaceGrotesk ? "ok" : "FAIL"}`
    );
  }
  console.log(
    `  layout failures: ${
      summary.layoutFailures.length ? summary.layoutFailures.join(" | ") : "none"
    }`
  );
  console.log("Report → docs/verification.json");
} finally {
  server.kill();
}
