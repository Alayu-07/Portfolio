#!/usr/bin/env node
/**
 * Tiny static file server for local development and measurement.
 * Mirrors the production headers in _headers (cache policy) and gzips text
 * responses, so a local Lighthouse run behaves like the deployed site.
 * Usage: node scripts/serve.js [port]
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".pdf": "application/pdf",
};

const COMPRESSIBLE = new Set([
  "text/html",
  "text/css",
  "text/javascript",
  "text/plain",
  "text/xml",
  "application/json",
  "application/manifest+json",
  "application/xml",
  "image/svg+xml",
]);

function cacheControl(urlPath, ext) {
  if (ext === ".html" || urlPath === "/") return "public, max-age=0, must-revalidate";
  if (urlPath.startsWith("/assets/fonts/")) return "public, max-age=31536000, immutable";
  if (
    urlPath.startsWith("/assets/img/") ||
    urlPath.startsWith("/css/") ||
    urlPath.startsWith("/js/")
  ) {
    return "public, max-age=604800, stale-while-revalidate=86400";
  }
  return "public, max-age=3600";
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = path.normalize(path.join(ROOT, urlPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath)) {
    const notFound = path.join(ROOT, "404.html");
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { "Content-Type": MIME[".html"] });
      res.end(fs.readFileSync(notFound));
    } else {
      res.writeHead(404).end("Not found");
    }
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const headers = {
    "Content-Type": type,
    "Cache-Control": cacheControl(urlPath, ext),
    "X-Content-Type-Options": "nosniff",
  };

  let body = fs.readFileSync(filePath);
  const acceptsGzip = /\bgzip\b/.test(String(req.headers["accept-encoding"] || ""));
  if (acceptsGzip && COMPRESSIBLE.has(type.split(";")[0].trim())) {
    body = zlib.gzipSync(body, { level: 6 });
    headers["Content-Encoding"] = "gzip";
    headers["Vary"] = "Accept-Encoding";
  }

  res.writeHead(200, headers);
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});
