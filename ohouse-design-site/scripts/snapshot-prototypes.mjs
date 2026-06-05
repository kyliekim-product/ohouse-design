import { existsSync } from 'node:fs';
import { extname } from 'node:path';

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.map': 'application/json',
};

export function contentTypeFor(filePath) {
  return MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
}

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);

export function resolveChromeBinary(candidates = CHROME_CANDIDATES, existsFn = existsSync) {
  return candidates.find((c) => existsFn(c)) || null;
}
