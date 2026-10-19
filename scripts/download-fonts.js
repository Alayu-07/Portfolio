#!/usr/bin/env node
/**
 * One-time helper: downloads the latin-subset variable woff2 files from Google
 * Fonts into assets/fonts/ so the site can self-host them. Fonts are committed
 * to the repo, so you only need this if you want to refresh them.
 *
 * Usage: node scripts/download-fonts.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets", "fonts");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const FAMILIES = [
  { q: "Inter:wght@400..700", file: "inter-latin-var.woff2" },
  { q: "Space+Grotesk:wght@400..700", file: "space-grotesk-latin-var.woff2" },
  { q: "JetBrains+Mono:wght@400..600", file: "jetbrains-mono-latin-var.woff2" },
];

fs.mkdirSync(OUT, { recursive: true });

for (const fam of FAMILIES) {
  const url = `https://fonts.googleapis.com/css2?family=${fam.q}&display=swap`;
  const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  // Grab the latin subset block (last @font-face block with the latin unicode-range).
  const blocks = css.split("@font-face");
  const latin = blocks.filter((b) => /unicode-range:[^;]*U\+0000-00FF/.test(b)).pop();
  if (!latin) {
    console.error(`No latin subset found for ${fam.q}`);
    process.exitCode = 1;
    continue;
  }
  const m = latin.match(/url\((https:[^)]+\.woff2)\)/);
  if (!m) {
    console.error(`No woff2 URL found for ${fam.q}`);
    process.exitCode = 1;
    continue;
  }
  const buf = Buffer.from(
    await (await fetch(m[1], { headers: { "User-Agent": UA } })).arrayBuffer()
  );
  fs.writeFileSync(path.join(OUT, fam.file), buf);
  console.log(`${fam.file}: ${(buf.length / 1024).toFixed(1)} KB`);
}
