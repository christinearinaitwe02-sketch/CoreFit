/**
 * Production web server for CoreHer Fitness.
 *
 * Serves the output of `expo export --platform web` (dist/) as a
 * single-page application. All unmatched routes fall back to index.html
 * so Expo Router's client-side navigation works correctly.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST_DIR = path.resolve(__dirname, "..", "dist");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".otf":  "font/otf",
  ".map":  "application/json",
  ".webp": "image/webp",
  ".mp4":  "video/mp4",
  ".webm": "video/webm",
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const isImmutable = filePath.includes("_expo/static") || filePath.includes("_next/static");
  const cacheControl = ext === ".html"
    ? "no-cache, no-store, must-revalidate"
    : isImmutable
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600";

  const content = fs.readFileSync(filePath);
  res.writeHead(200, {
    "content-type": contentType,
    "cache-control": cacheControl,
  });
  res.end(content);
}

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url || "/", `http://${req.headers.host}`).pathname;

  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const candidate = path.join(DIST_DIR, safePath);

  if (!candidate.startsWith(DIST_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return serveFile(candidate, res);
  }

  const indexPath = path.join(DIST_DIR, "index.html");
  if (fs.existsSync(indexPath)) {
    return serveFile(indexPath, res);
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found — dist/ has not been built yet.");
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`CoreHer Fitness web app running on port ${port}`);
  console.log(`Serving from: ${DIST_DIR}`);
});
