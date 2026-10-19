#!/usr/bin/env node
/**
 * Image pipeline (requires the optional `sharp` dev dependency):
 *   - preserves every supplied original in assets/original/
 *   - generates AVIF + WebP + JPEG fallbacks with srcset widths
 *   - generates the favicon set and the 1200×630 Open Graph image
 *
 *   npm run images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "assets", "img");
const ORIG = path.join(ROOT, "assets", "original");
fs.mkdirSync(ORIG, { recursive: true });

const kb = (buf) => `${(buf.length / 1024).toFixed(1)} KB`;

async function emit(src, base, widths, maxHeight) {
  for (const width of widths) {
    const pipeline = sharp(src).resize({ width, withoutEnlargement: true });
    const meta = await pipeline.metadata();
    const h = Math.round((meta.height / meta.width) * width);

    const jpg = await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(path.join(IMG, `${base}-${width}.jpg`), jpg);

    const webp = await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 74 })
      .toBuffer();
    fs.writeFileSync(path.join(IMG, `${base}-${width}.webp`), webp);

    const avif = await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 55, effort: 6 })
      .toBuffer();
    fs.writeFileSync(path.join(IMG, `${base}-${width}.avif`), avif);

    console.log(
      `  ${base}-${width}: jpg ${kb(jpg)} · webp ${kb(webp)} · avif ${kb(avif)} (${width}×${h})`
    );
  }
  if (maxHeight) void maxHeight;
}

/* 1 ── preserve originals (first run only) */
const originals = ["profile.jpg", "starfield.jpg", "hero-gradient.jpg", "favicon.png"];
for (const name of originals) {
  const src = path.join(IMG, name);
  const dest = path.join(ORIG, name);
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ preserved original ${name}`);
  }
}

/* 2 ── profile responsive set (the About portrait was removed from the site) */
console.log("\nPhotos:");
await emit(path.join(IMG, "profile.jpg"), "profile", [400, 800]);

/* 3 ── favicon set from a hand-authored SVG */
console.log("\nFavicons:");
const svg = fs.readFileSync(path.join(IMG, "favicon.svg"), "utf8");
const svgBuf = Buffer.from(svg);
for (const [file, size] of [
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  const png = await sharp(svgBuf, { density: 300 }).resize(size, size).png().toBuffer();
  fs.writeFileSync(path.join(IMG, file), png);
  console.log(`  ${file} ${size}×${size} ${kb(png)}`);
}

/* 4 ── Open Graph image (1200×630, well under 200 KB) */
console.log("\nOpen Graph:");
const profileCircle = await sharp(path.join(IMG, "profile.jpg"))
  .resize(360, 360, { fit: "cover", position: "attention" })
  .composite([
    {
      input: Buffer.from(
        `<svg width="360" height="360"><defs><mask id="m"><rect width="360" height="360" rx="180" fill="#fff"/></mask></defs><rect width="360" height="360" rx="180" fill="#000" mask="url(#m)"/></svg>`
      ),
      blend: "dest-in",
    },
  ])
  .png()
  .toBuffer();

const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B1020"/>
      <stop offset="0.55" stop-color="#151E32"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
    <radialGradient id="a1" cx="0.15" cy="0.1" r="0.7">
      <stop offset="0" stop-color="#7C3AED" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#7C3AED" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="a2" cx="0.9" cy="0.85" r="0.65">
      <stop offset="0" stop-color="#06B6D4" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#06B6D4" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7C3AED"/>
      <stop offset="1" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#a1)"/>
  <rect width="1200" height="630" fill="url(#a2)"/>
  <circle cx="960" cy="315" r="205" fill="none" stroke="url(#ring)" stroke-width="10" opacity="0.9"/>
  <text x="90" y="230" font-family="Segoe UI, Arial, sans-serif" font-size="66" font-weight="700" fill="#F8FAFC">Alayu Legesse Siyfu</text>
  <text x="90" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="38" fill="#A78BFA">Full-Stack Developer | AI Engineer</text>
  <text x="90" y="360" font-family="Consolas, monospace" font-size="30" fill="#06B6D4">Building AI-powered web applications</text>
  <text x="90" y="430" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#A7B0C0">Debre Berhan, Ethiopia · Open to remote work</text>
</svg>`;

const og = await sharp(Buffer.from(ogSvg))
  .composite([{ input: profileCircle, left: 770, top: 145 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toBuffer();
fs.writeFileSync(path.join(IMG, "og.jpg"), og);
console.log(`  og.jpg 1200×630 ${kb(og)}`);
if (og.length > 200 * 1024) console.warn("  ⚠ og.jpg exceeds the 200 KB target");
