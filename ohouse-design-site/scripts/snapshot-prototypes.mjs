import http from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir, mkdtemp, rm, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, extname } from 'node:path';
import { tmpdir } from 'node:os';

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
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean);

export function resolveChromeBinary(candidates = CHROME_CANDIDATES, existsFn = existsSync) {
  return candidates.find((c) => existsFn(c)) || null;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, '..');        // ohouse-design-site
const PUBLIC_DIR = join(SITE_ROOT, 'public');

// 캡처 대상. app은 public/ 기준 경로, out은 절대 경로.
// out은 site public/thumbnails/<domain>/<screen>.webp — static 빌드에서 URL 로 직접 서빙되는 위치
// (getScreen.screenThumbUrl 이 같은 규칙으로 참조). SSOT(ohouse-design-mcp) 안에 두면 서빙 안 됨.
const TARGETS = [
  {
    app: 'prototypes/contents-feed/index.html',
    out: join(SITE_ROOT, 'public/thumbnails/house-tour/content-tab.webp'),
    // 프리뷰 컬럼(.screen-detail__preview = 360px, 9:16 박스)·라이브 iframe 과 동일 뷰포트로 캡처해야
    // 정적·라이브가 같은 폭으로 렌더된다. (ScreenShell 폰이 min(375px,100vw)라 폭이 다르면 어긋남)
    viewport: { width: 360, height: 640, deviceScaleFactor: 2 }, // 360×640 = 9:16, 프리뷰 박스와 일치
  },
];

// ── 무의존 정적 서버 (ES module/상대 asset이 http로 로드돼야 함; file:// 불가) ──
function startStaticServer(root) {
  return new Promise((res, rej) => {
    const server = http.createServer(async (req, resp) => {
      try {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        let filePath = join(root, urlPath);
        if (filePath.endsWith('/') || filePath.endsWith('\\')) filePath = join(filePath, 'index.html');
        if (!resolve(filePath).startsWith(resolve(root))) { resp.writeHead(403, { 'connection': 'close' }); resp.end('forbidden'); return; }
        const data = await readFile(filePath);
        resp.writeHead(200, { 'content-type': contentTypeFor(filePath), 'connection': 'close' });
        resp.end(data);
      } catch {
        resp.writeHead(404, { 'connection': 'close' }); resp.end('not found');
      }
    });
    server.once('error', rej);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      res({ origin: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

// ── CDP 헬퍼 ──
let _cdpId = 0;
function cdpSend(ws, method, params = {}, sessionId) {
  return new Promise((res, rej) => {
    const id = ++_cdpId;
    const cleanup = () => {
      ws.removeEventListener('message', onMsg);
      ws.removeEventListener('close', onClose);
    };
    const onMsg = (ev) => {
      let data;
      try { data = JSON.parse(ev.data); } catch { return; }
      if (data.id !== id) return;
      cleanup();
      data.error ? rej(new Error(`${method}: ${data.error.message}`)) : res(data.result);
    };
    const onClose = () => { cleanup(); rej(new Error(`ws closed waiting for ${method}`)); };
    ws.addEventListener('message', onMsg);
    ws.addEventListener('close', onClose);
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });
}

function waitForEvent(ws, method, sessionId, timeoutMs) {
  return new Promise((res, rej) => {
    const cleanup = () => {
      clearTimeout(timer);
      ws.removeEventListener('message', onMsg);
      ws.removeEventListener('close', onClose);
    };
    const timer = setTimeout(() => { cleanup(); rej(new Error(`timeout: ${method}`)); }, timeoutMs);
    const onMsg = (ev) => {
      let data;
      try { data = JSON.parse(ev.data); } catch { return; }
      if (data.method !== method) return;
      if (sessionId && data.sessionId !== sessionId) return;
      cleanup(); res(data.params);
    };
    const onClose = () => { cleanup(); rej(new Error(`ws closed waiting for event ${method}`)); };
    ws.addEventListener('message', onMsg);
    ws.addEventListener('close', onClose);
  });
}

function openWs(url) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => res(ws), { once: true });
    ws.addEventListener('error', () => rej(new Error(`ws open failed: ${url}`)), { once: true });
  });
}

async function waitForPortFile(portFile, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await access(portFile);
      const txt = await readFile(portFile, 'utf8');
      const port = parseInt(txt.split('\n')[0], 10);
      if (port > 0) return port;
    } catch { /* not ready */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('DevToolsActivePort not ready');
}

async function launchChrome(chromePath) {
  const userDataDir = await mkdtemp(join(tmpdir(), 'proto-shot-'));
  const proc = spawn(chromePath, [
    '--headless=new', '--remote-debugging-port=0', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check', '--disable-gpu',
    `--user-data-dir=${userDataDir}`, 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'ignore'] });
  try {
    const port = await waitForPortFile(join(userDataDir, 'DevToolsActivePort'), 10000);
    const version = await (await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(5000) })).json();
    return { proc, userDataDir, browserWsUrl: version.webSocketDebuggerUrl };
  } catch (e) {
    proc.kill();
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
    throw e;
  }
}

// 네트워크 idle 대기: in-flight 요청이 idleMs 동안 0 으로 유지되면 resolve.
// (고정 sleep 대신 CDN 이미지/폰트/JS 가 실제로 다 받아질 때까지 기다려 빈 카드 방지)
// timeoutMs 하드캡으로 절대 hang 안 함. 이벤트가 끊겨도(소켓 종료) maxTimer 가 풀어줌.
function waitForNetworkIdle(ws, sessionId, { idleMs = 600, timeoutMs = 15000 } = {}) {
  return new Promise((resolve) => {
    let inflight = 0;
    let idleTimer = null;
    const disarm = () => { if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; } };
    const finish = () => { disarm(); clearTimeout(maxTimer); ws.removeEventListener('message', onMsg); resolve(); };
    const onMsg = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.sessionId !== sessionId) return;
      if (m.method === 'Network.requestWillBeSent') { inflight++; disarm(); }
      else if (m.method === 'Network.loadingFinished' || m.method === 'Network.loadingFailed') {
        inflight = Math.max(0, inflight - 1);
        if (inflight === 0) { disarm(); idleTimer = setTimeout(finish, idleMs); }
      }
    };
    const maxTimer = setTimeout(finish, timeoutMs);
    ws.addEventListener('message', onMsg);
  });
}

async function captureTarget(browserWsUrl, origin, target) {
  const ws = await openWs(browserWsUrl);
  try {
    const { targetId } = await cdpSend(ws, 'Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdpSend(ws, 'Target.attachToTarget', { targetId, flatten: true });
    await cdpSend(ws, 'Page.enable', {}, sessionId);
    await cdpSend(ws, 'Network.enable', {}, sessionId);
    await cdpSend(ws, 'Emulation.setDeviceMetricsOverride', {
      width: target.viewport.width, height: target.viewport.height,
      deviceScaleFactor: target.viewport.deviceScaleFactor, mobile: true,
    }, sessionId);
    const loaded = waitForEvent(ws, 'Page.loadEventFired', sessionId, 30000);
    const idle = waitForNetworkIdle(ws, sessionId, { idleMs: 600, timeoutMs: 15000 });
    await cdpSend(ws, 'Page.navigate', { url: `${origin}/${target.app}` }, sessionId);
    await loaded;
    await idle; // CDN 이미지·폰트·JS 가 다 받아질 때까지 (빈 카드 방지)
    await new Promise((r) => setTimeout(r, 400)); // 디코드/페인트 settle
    const { data } = await cdpSend(ws, 'Page.captureScreenshot', {
      format: 'webp', quality: 82,
      clip: { x: 0, y: 0, width: target.viewport.width, height: target.viewport.height, scale: target.viewport.deviceScaleFactor },
      captureBeyondViewport: true,
    }, sessionId);
    await cdpSend(ws, 'Target.closeTarget', { targetId }).catch(() => {});
    return Buffer.from(data, 'base64');
  } finally {
    ws.close();
  }
}

export async function main() {
  const chromePath = resolveChromeBinary();
  if (!chromePath) { console.warn('[snapshot] Chrome 미발견 — 기존 thumbnail 유지'); return; }
  const server = await startStaticServer(PUBLIC_DIR);
  let chrome;
  try {
    chrome = await launchChrome(chromePath);
    for (const target of TARGETS) {
      if (!existsSync(join(PUBLIC_DIR, target.app))) {
        console.warn(`[snapshot] 빌드 산출물 없음: ${target.app} — 먼저 prototype vite build 필요, 건너뜀`);
        continue;
      }
      try {
        const buf = await captureTarget(chrome.browserWsUrl, server.origin, target);
        await mkdir(dirname(target.out), { recursive: true });
        await writeFile(target.out, buf);
        console.log(`[snapshot] ${target.app} → ${target.out} (${buf.length} bytes)`);
      } catch (e) {
        console.warn(`[snapshot] 캡처 실패 ${target.app}: ${e.message} — 기존 유지`);
      }
    }
  } catch (e) {
    console.warn(`[snapshot] Chrome 기동 실패: ${e.message} — 기존 thumbnail 유지`);
  } finally {
    if (chrome?.proc) chrome.proc.kill();
    if (chrome?.userDataDir) await rm(chrome.userDataDir, { recursive: true, force: true }).catch(() => {});
    await server.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.warn(`[snapshot] 예기치 못한 오류: ${e.message} — 기존 thumbnail 유지`); });
}
