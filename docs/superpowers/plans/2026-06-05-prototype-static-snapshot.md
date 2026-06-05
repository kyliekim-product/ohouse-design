# 라이브 프로토타입 → 정적 썸네일 자동 스냅샷 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** content-tab 화면 상세의 정적 프리뷰를, 라이브 프로토타입을 사이트 빌드 시 헤드리스 Chrome으로 캡처한 `thumbnail.webp`로 자동 교체해 둘이 항상 일치하게 한다.

**Architecture:** 무의존 Node 스크립트가 `public/`을 정적 서빙하고 시스템 Chrome을 `--headless`로 띄워 Node22 글로벌 `WebSocket`으로 CDP를 직접 제어, 모바일 뷰포트 스크린샷을 webp로 저장한다. content-tab frontmatter의 단일카드 `prototype_html` 참조를 제거하면 기존 thumb 렌더 경로가 새 webp를 정적 프리뷰로 사용한다. 스크립트는 사이트 `build`에 `astro build` 직전 단계로 연결한다.

**Tech Stack:** Node 22 (ESM, 글로벌 `WebSocket`/`fetch`), 시스템 Google Chrome, Chrome DevTools Protocol(CDP), Astro.

---

## File Structure

- **Create** `ohouse-design-site/scripts/snapshot-prototypes.mjs` — 캡처 오케스트레이터. 순수 헬퍼(`contentTypeFor`, `resolveChromeBinary`) export + 정적 서버 + CDP 캡처 + `main()`(graceful). 책임: "빌드된 프로토타입 → webp 썸네일".
- **Create** `ohouse-design-site/scripts/snapshot-prototypes.test.mjs` — 순수 헬퍼 단위 테스트.
- **Create** `ohouse-design-mcp/domains/house-tour/screens/content-tab/thumbnail.webp` — 생성 산출물(스크립트가 write, 커밋).
- **Modify** `ohouse-design-site/package.json` — `snapshot:prototypes` 스크립트 + `build` 체인.
- **Modify** `ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md` — `prototype_html` 줄 제거 + 재빌드 순서 주석.

---

## Task 1: 순수 헬퍼 + 단위 테스트 (TDD)

**Files:**
- Create: `ohouse-design-site/scripts/snapshot-prototypes.mjs`
- Test: `ohouse-design-site/scripts/snapshot-prototypes.test.mjs`

- [ ] **Step 1: 실패하는 테스트 작성**

`ohouse-design-site/scripts/snapshot-prototypes.test.mjs`:
```js
import assert from 'node:assert/strict';
import { contentTypeFor, resolveChromeBinary } from './snapshot-prototypes.mjs';

// ① 확장자별 MIME
assert.equal(contentTypeFor('/x/index.html'), 'text/html');
assert.equal(contentTypeFor('/x/app.js'), 'text/javascript');   // ES module은 JS mime 필수
assert.equal(contentTypeFor('/x/a.mjs'), 'text/javascript');
assert.equal(contentTypeFor('/x/pic.webp'), 'image/webp');
assert.equal(contentTypeFor('/x/style.CSS'), 'text/css');        // 대소문자 무시
assert.equal(contentTypeFor('/x/unknown.xyz'), 'application/octet-stream');

// ② Chrome 바이너리 해석: 존재하는 첫 후보 반환, 없으면 null
assert.equal(resolveChromeBinary(['/a', '/b'], (p) => p === '/b'), '/b');
assert.equal(resolveChromeBinary(['/a', '/b'], () => false), null);

console.log('snapshot-prototypes unit tests passed');
```

- [ ] **Step 2: 실패 확인**

Run: `cd ohouse-design-site && node scripts/snapshot-prototypes.test.mjs`
Expected: FAIL — `Cannot find module './snapshot-prototypes.mjs'` (아직 미작성)

- [ ] **Step 3: 최소 구현 (헬퍼만)**

`ohouse-design-site/scripts/snapshot-prototypes.mjs`:
```js
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
```

- [ ] **Step 4: 통과 확인**

Run: `cd ohouse-design-site && node scripts/snapshot-prototypes.test.mjs`
Expected: PASS — `snapshot-prototypes unit tests passed`

- [ ] **Step 5: 커밋**

```bash
git add ohouse-design-site/scripts/snapshot-prototypes.mjs ohouse-design-site/scripts/snapshot-prototypes.test.mjs
git commit -m "feat: snapshot-prototypes pure helpers (mime, chrome resolver)"
```

---

## Task 2: 정적 서버 + CDP 캡처 + main (graceful)

**Files:**
- Modify: `ohouse-design-site/scripts/snapshot-prototypes.mjs` (append)

- [ ] **Step 1: 정적 서버 + CDP + 오케스트레이터 추가**

`snapshot-prototypes.mjs`의 import 블록을 아래로 교체(상단):
```js
import http from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir, mkdtemp, rm, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, extname } from 'node:path';
import { tmpdir } from 'node:os';
```

파일 끝에 아래 전체를 추가:
```js
const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, '..');        // ohouse-design-site
const PUBLIC_DIR = join(SITE_ROOT, 'public');
const REPO_ROOT = resolve(SITE_ROOT, '..');        // ohouse-design

// 캡처 대상. app은 public/ 기준 경로, out은 절대 경로.
const TARGETS = [
  {
    app: 'prototypes/contents-feed/index.html',
    out: join(REPO_ROOT, 'ohouse-design-mcp/domains/house-tour/screens/content-tab/thumbnail.webp'),
    viewport: { width: 390, height: 694, deviceScaleFactor: 2 }, // ≈ 9:16 (thumb 박스와 일치)
  },
];

// ── 무의존 정적 서버 (ES module/상대 asset이 http로 로드돼야 함; file:// 불가) ──
function startStaticServer(root) {
  return new Promise((res) => {
    const server = http.createServer(async (req, resp) => {
      try {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        let filePath = join(root, urlPath);
        if (filePath.endsWith('/') || filePath.endsWith('\\')) filePath = join(filePath, 'index.html');
        const data = await readFile(filePath);
        resp.writeHead(200, { 'content-type': contentTypeFor(filePath) });
        resp.end(data);
      } catch {
        resp.writeHead(404); resp.end('not found');
      }
    });
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
    const onMsg = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.id !== id) return;
      ws.removeEventListener('message', onMsg);
      data.error ? rej(new Error(`${method}: ${data.error.message}`)) : res(data.result);
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });
}

function waitForEvent(ws, method, sessionId, timeoutMs) {
  return new Promise((res, rej) => {
    const timer = setTimeout(() => { ws.removeEventListener('message', onMsg); rej(new Error(`timeout: ${method}`)); }, timeoutMs);
    const onMsg = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.method !== method) return;
      if (sessionId && data.sessionId !== sessionId) return;
      clearTimeout(timer); ws.removeEventListener('message', onMsg); res(data.params);
    };
    ws.addEventListener('message', onMsg);
  });
}

function openWs(url) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => res(ws), { once: true });
    ws.addEventListener('error', (e) => rej(new Error(`ws open failed: ${url}`)), { once: true });
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
  const port = await waitForPortFile(join(userDataDir, 'DevToolsActivePort'), 10000);
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  return { proc, userDataDir, browserWsUrl: version.webSocketDebuggerUrl };
}

async function captureTarget(browserWsUrl, origin, target) {
  const ws = await openWs(browserWsUrl);
  try {
    const { targetId } = await cdpSend(ws, 'Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdpSend(ws, 'Target.attachToTarget', { targetId, flatten: true });
    await cdpSend(ws, 'Page.enable', {}, sessionId);
    await cdpSend(ws, 'Emulation.setDeviceMetricsOverride', {
      width: target.viewport.width, height: target.viewport.height,
      deviceScaleFactor: target.viewport.deviceScaleFactor, mobile: true,
    }, sessionId);
    const loaded = waitForEvent(ws, 'Page.loadEventFired', sessionId, 30000);
    await cdpSend(ws, 'Page.navigate', { url: `${origin}/${target.app}` }, sessionId);
    await loaded;
    await new Promise((r) => setTimeout(r, 2500)); // settle: react render + fonts + CDN 이미지
    const { data } = await cdpSend(ws, 'Page.captureScreenshot', {
      format: 'webp', quality: 82,
      clip: { x: 0, y: 0, width: target.viewport.width, height: target.viewport.height, scale: target.viewport.deviceScaleFactor },
      captureBeyondViewport: true,
    }, sessionId);
    await cdpSend(ws, 'Target.closeTarget', { targetId }, sessionId).catch(() => {});
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

if (import.meta.url === `file://${process.argv[1]}`) main();
```

- [ ] **Step 2: 단위 테스트가 여전히 통과(헬퍼 export 안 깨짐) 확인**

Run: `cd ohouse-design-site && node scripts/snapshot-prototypes.test.mjs`
Expected: PASS — `snapshot-prototypes unit tests passed`

- [ ] **Step 3: graceful 경로 동작 확인 (Chrome 없음 시 throw 안 함)**

Run: `cd ohouse-design-site && node -e "import('./scripts/snapshot-prototypes.mjs').then(m=>{ console.log('null-case:', m.resolveChromeBinary(['/none'], ()=>false)); })"`
Expected: `null-case: null` (예외 없이 출력)

- [ ] **Step 4: 커밋**

```bash
git add ohouse-design-site/scripts/snapshot-prototypes.mjs
git commit -m "feat: headless-chrome CDP capture + graceful orchestrator"
```

---

## Task 3: 실제 캡처 실행 + 산출물 검증

전제: `prototypes/contents-feed` 빌드 산출물이 `ohouse-design-site/public/prototypes/contents-feed/`에 존재해야 함(이미 커밋됨). 없으면 먼저 `cd prototypes/contents-feed && node_modules/.bin/vite build`. CDN 이미지 로드를 위해 VPN(사내망) 연결 필요.

**Files:**
- Create(생성): `ohouse-design-mcp/domains/house-tour/screens/content-tab/thumbnail.webp`

- [ ] **Step 1: 스냅샷 실행**

Run: `cd ohouse-design-site && node scripts/snapshot-prototypes.mjs`
Expected: `[snapshot] prototypes/contents-feed/index.html → .../content-tab/thumbnail.webp (NNNNN bytes)` (NNNNN > 5000)

- [ ] **Step 2: webp 유효성 + 크기 검증**

Run:
```bash
F=ohouse-design-mcp/domains/house-tour/screens/content-tab/thumbnail.webp
node -e "const fs=require('fs');const b=fs.readFileSync('$F');console.log('size',b.length);console.log('RIFF',b.slice(0,4).toString());console.log('WEBP',b.slice(8,12).toString())"
file "$F"
```
Expected: `RIFF RIFF`, `WEBP WEBP`, size > 5000. `file`이 `Web/P image` 보고.

- [ ] **Step 3: 시각 확인 (사람/에이전트 검토)**

`thumbnail.webp`를 열어 라이브 상단 화면(토픽바·필터칩·"이번 주 인기" 캐러셀)이 보이는지 확인. 비어있거나(이미지 미로드) 비율이 어긋나면 `captureTarget`의 settle 대기(2500ms)·`clip.scale`을 조정 후 Step 1 재실행.

- [ ] **Step 4: 커밋**

```bash
git add ohouse-design-mcp/domains/house-tour/screens/content-tab/thumbnail.webp
git commit -m "feat: generate content-tab static thumbnail from live prototype"
```

---

## Task 4: 빌드 연동

**Files:**
- Modify: `ohouse-design-site/package.json`

- [ ] **Step 1: scripts 수정**

`ohouse-design-site/package.json`의 `scripts`에서 두 곳 변경:
- `build`: 기존 `"npm run validate:ods-previews && astro build"` →
  `"npm run validate:ods-previews && npm run snapshot:prototypes && astro build"`
- 새 항목 추가: `"snapshot:prototypes": "node scripts/snapshot-prototypes.mjs"`

결과(해당 줄):
```json
    "build": "npm run validate:ods-previews && npm run snapshot:prototypes && astro build",
    "snapshot:prototypes": "node scripts/snapshot-prototypes.mjs",
```

- [ ] **Step 2: 단독 실행 확인**

Run: `cd ohouse-design-site && npm run snapshot:prototypes`
Expected: `[snapshot] ... → ... (NNNNN bytes)` 출력, exit 0

- [ ] **Step 3: 커밋**

```bash
git add ohouse-design-site/package.json
git commit -m "build: regenerate prototype thumbnails before astro build"
```

---

## Task 5: frontmatter 전환 + 전체 검증

**Files:**
- Modify: `ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md`

- [ ] **Step 1: `prototype_html` 줄 제거 + 재빌드 순서 주석**

`ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md` frontmatter에서 아래 줄 삭제:
```
prototype_html: tracks/contents/_pilot-load-test/result/attempt-1.html
```
frontmatter `---` 닫힘 직후(본문 시작 전) 한 줄 주석 추가:
```html
<!-- 정적 프리뷰 thumbnail.webp 는 라이브(prototype_app)에서 자동 생성됨(scripts/snapshot-prototypes.mjs).
     프로토타입 소스 변경 시: prototypes/contents-feed 에서 vite build → 사이트 build 순으로 갱신. -->
```

- [ ] **Step 2: getScreen 동작 검증 (previewHtml null, thumb=webp)**

Run:
```bash
cd ohouse-design-site && node --input-type=module -e "
import { getScreen } from './src/lib/repo.js';
const s = getScreen('house-tour','content-tab');
console.log('previewHtml:', s.previewHtml);
console.log('thumb:', s.thumb);
console.log('prototypeUrl:', s.prototypeUrl);
"
```
Expected: `previewHtml: null`, `thumb:` 가 `...api/asset?path=...thumbnail.webp` 포함, `prototypeUrl: /prototypes/contents-feed/index.html`

- [ ] **Step 3: astro build green + dist 검증**

Run:
```bash
cd ohouse-design-site && npx astro build 2>&1 | tail -3
PG=dist/d/house-tour/s/content-tab/index.html
echo '--- single-card srcdoc 잔존? (없어야) ---'; grep -c "Contents Landscape Card" "$PG" || true
echo '--- thumbnail 참조? (있어야) ---'; grep -c "thumbnail.webp" "$PG" || true
echo '--- deeer 외부참조? (없어야) ---'; grep -c "deeer-glitch" "$PG" || true
```
Expected: build `Complete!`, `Contents Landscape Card` = 0, `thumbnail.webp` ≥ 1, `deeer-glitch` = 0

- [ ] **Step 4: 커밋**

```bash
git add ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md
git commit -m "feat: use auto-generated thumbnail as content-tab static preview"
```

---

## Self-Review (계획 작성자 체크 결과)

- **Spec 커버리지**: ①캡처 스크립트=Task1·2, 실제 생성=Task3 / ②frontmatter 전환=Task5 / ③빌드 연동=Task4 / graceful=Task2 Step3 / 검증기준=Task3·5. 누락 없음.
- **Placeholder**: 모든 코드 단계 실제 코드 포함, 명령·기대출력 명시. 없음.
- **타입/이름 일관성**: `contentTypeFor`/`resolveChromeBinary`/`startStaticServer`/`captureTarget`/`main` Task 전반 동일 사용. `TARGETS[].app/out/viewport` 일관.
- **알려진 튜닝 포인트**: 캡처 settle(2500ms)·`clip.scale`은 Task3 Step3에서 시각 확인 후 조정 가능(실현성 영향 없음).
