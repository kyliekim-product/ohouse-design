# Screen HTML Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** screen에 연결된 self-contained HTML 프로토타입이 있으면, 프리뷰 리스트 카드와 screen 상세페이지에 그 화면을 iframe으로 실제 렌더한다.

**Architecture:** repo.js에 순수 함수 `isSelfContainedHtml`와 경로 해석 헬퍼 `resolveScreenPreviewHtml`를 추가하고, `getDomainScreens`·`getScreen`이 이를 호출해 빌드 타임에 HTML 내용을 `previewHtml` 문자열로 노출한다. `getAllBrowseCards`가 카드 item에 `previewHtml`을 실어 보내고, `ReferenceCard.astro`(리스트)와 `[screen].astro`(상세)가 `previewHtml → thumb → placeholder` 우선순위로 `<iframe srcdoc>`를 렌더한다. 정적 빌드 제약 때문에 런타임 서빙 대신 srcdoc 인라인을 쓴다.

**Tech Stack:** Astro(정적 빌드), Node ESM, gray-matter. 테스트는 Node 내장 `node:test`/`node:assert`(추가 설치 없음 — 이 레포는 `npm install` 금지). 컴포넌트는 `npx astro build`로 검증.

---

## File Structure

- `ohouse-design-site/src/lib/repo.js` (Modify) — `isSelfContainedHtml`, `resolveScreenPreviewHtml` 추가; `getDomainScreens`·`getScreen`·`getAllBrowseCards`가 `previewHtml`을 노출/전달.
- `ohouse-design-site/src/lib/repo.test.mjs` (Create) — 순수 함수/헬퍼 단위 테스트 (`node --test`).
- `ohouse-design-site/src/components/ReferenceCard.astro` (Modify) — 리스트 카드 iframe 렌더.
- `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro` (Modify) — 상세 프리뷰 iframe 렌더.
- `ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md` (Modify) — `prototype_html` frontmatter로 기존 HTML 연결.

모든 명령은 `ohouse-design-site/`를 작업 디렉토리로 가정한다 (`cd ohouse-design-site`).

---

### Task 1: `isSelfContainedHtml` 순수 함수

self-contained HTML 판별. 외부 스크립트(`src=`)·module script·외부 스타일시트(`<link rel=stylesheet href>`)가 있으면 부적합.

**Files:**
- Create: `ohouse-design-site/src/lib/repo.test.mjs`
- Modify: `ohouse-design-site/src/lib/repo.js` (export 추가)

- [ ] **Step 1: 실패하는 테스트 작성**

Create `ohouse-design-site/src/lib/repo.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSelfContainedHtml } from './repo.js';

test('isSelfContainedHtml: inline style만 있으면 true', () => {
  const html = '<!doctype html><html><head><style>.a{color:red}</style></head><body><div class="a">x</div></body></html>';
  assert.equal(isSelfContainedHtml(html), true);
});

test('isSelfContainedHtml: 외부 script src면 false', () => {
  const html = '<html><body><script src="/src/main.tsx"></script></body></html>';
  assert.equal(isSelfContainedHtml(html), false);
});

test('isSelfContainedHtml: module script면 false', () => {
  const html = '<html><body><script type="module">import x from "y"</script></body></html>';
  assert.equal(isSelfContainedHtml(html), false);
});

test('isSelfContainedHtml: 외부 stylesheet link면 false', () => {
  const html = '<html><head><link rel="stylesheet" href="/a.css" /></head><body></body></html>';
  assert.equal(isSelfContainedHtml(html), false);
});

test('isSelfContainedHtml: 빈 문자열이면 false', () => {
  assert.equal(isSelfContainedHtml(''), false);
  assert.equal(isSelfContainedHtml(null), false);
});

test('isSelfContainedHtml: inline script(외부 참조 없음)는 true', () => {
  const html = '<html><body><script>console.log(1)</script></body></html>';
  assert.equal(isSelfContainedHtml(html), true);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd ohouse-design-site && node --test src/lib/repo.test.mjs`
Expected: FAIL — `isSelfContainedHtml`가 export되지 않아 import 에러(`The requested module './repo.js' does not provide an export named 'isSelfContainedHtml'`).

- [ ] **Step 3: 최소 구현 추가**

`ohouse-design-site/src/lib/repo.js`에서 `const POLICY_SECTION_GROUPS = [` 선언 **바로 위**에 추가:

```js
export function isSelfContainedHtml(html) {
  const text = String(html || '');
  if (!text.trim()) return false;
  // 외부 스크립트 참조 (예: <script src="/src/main.tsx">)
  if (/<script\b[^>]*\bsrc\s*=/i.test(text)) return false;
  // 번들러 진입점 (예: <script type="module">)
  if (/<script\b[^>]*\btype\s*=\s*["']module["']/i.test(text)) return false;
  // 외부 스타일시트 (예: <link rel="stylesheet" href="/a.css">)
  if (/<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*\bhref\s*=/i.test(text)) return false;
  return true;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd ohouse-design-site && node --test src/lib/repo.test.mjs`
Expected: PASS — 6 tests passed.

- [ ] **Step 5: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add ohouse-design-site/src/lib/repo.js ohouse-design-site/src/lib/repo.test.mjs
git commit -m "feat: add isSelfContainedHtml helper for screen preview"
```

---

### Task 2: `resolveScreenPreviewHtml` 경로 해석 헬퍼

frontmatter `prototype_html`(CONTEXT_ROOT 기준) 또는 로컬 `prototype.html`/`prototype.htm`(screenDir 기준)을 찾아 self-contained면 내용 문자열을, 아니면 `null`을 반환. frontmatter 참조가 로컬보다 우선.

**Files:**
- Modify: `ohouse-design-site/src/lib/repo.js` (export 추가)
- Modify: `ohouse-design-site/src/lib/repo.test.mjs` (테스트 추가)

- [ ] **Step 1: 실패하는 테스트 작성**

`ohouse-design-site/src/lib/repo.test.mjs` 상단 import를 다음으로 교체:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isSelfContainedHtml, resolveScreenPreviewHtml } from './repo.js';
```

파일 끝에 추가:

```js
const SELF_HTML = '<!doctype html><html><head><style>.a{color:red}</style></head><body>ok</body></html>';
const EXTERNAL_HTML = '<html><body><script type="module" src="/src/main.tsx"></script></body></html>';

test('resolveScreenPreviewHtml: 로컬 prototype.html이 self-contained면 내용 반환', () => {
  const dir = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    writeFileSync(join(dir, 'prototype.html'), SELF_HTML);
    const out = resolveScreenPreviewHtml({ screenDir: dir, frontmatter: {}, contextRoot: dir });
    assert.equal(out, SELF_HTML);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveScreenPreviewHtml: 로컬 prototype.html이 외부 참조면 null', () => {
  const dir = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    writeFileSync(join(dir, 'prototype.html'), EXTERNAL_HTML);
    const out = resolveScreenPreviewHtml({ screenDir: dir, frontmatter: {}, contextRoot: dir });
    assert.equal(out, null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveScreenPreviewHtml: frontmatter.prototype_html을 contextRoot 기준으로 읽음', () => {
  const ctx = mkdtempSync(join(tmpdir(), 'ctx-'));
  const screen = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    mkdirSync(join(ctx, 'tracks'), { recursive: true });
    writeFileSync(join(ctx, 'tracks', 'card.html'), SELF_HTML);
    const out = resolveScreenPreviewHtml({
      screenDir: screen,
      frontmatter: { prototype_html: 'tracks/card.html' },
      contextRoot: ctx,
    });
    assert.equal(out, SELF_HTML);
  } finally {
    rmSync(ctx, { recursive: true, force: true });
    rmSync(screen, { recursive: true, force: true });
  }
});

test('resolveScreenPreviewHtml: frontmatter 참조가 로컬보다 우선', () => {
  const ctx = mkdtempSync(join(tmpdir(), 'ctx-'));
  const screen = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    const ctxHtml = '<!doctype html><html><head><style>.ctx{}</style></head><body>ctx</body></html>';
    writeFileSync(join(ctx, 'card.html'), ctxHtml);
    writeFileSync(join(screen, 'prototype.html'), SELF_HTML);
    const out = resolveScreenPreviewHtml({
      screenDir: screen,
      frontmatter: { prototype_html: 'card.html' },
      contextRoot: ctx,
    });
    assert.equal(out, ctxHtml);
  } finally {
    rmSync(ctx, { recursive: true, force: true });
    rmSync(screen, { recursive: true, force: true });
  }
});

test('resolveScreenPreviewHtml: 후보 파일 없으면 null', () => {
  const dir = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    const out = resolveScreenPreviewHtml({ screenDir: dir, frontmatter: {}, contextRoot: dir });
    assert.equal(out, null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd ohouse-design-site && node --test src/lib/repo.test.mjs`
Expected: FAIL — `resolveScreenPreviewHtml` export 없음으로 import 에러.

- [ ] **Step 3: 최소 구현 추가**

`ohouse-design-site/src/lib/repo.js`에서 Task 1에 추가한 `isSelfContainedHtml` 함수 **바로 아래**에 추가:

```js
export function resolveScreenPreviewHtml({ screenDir, frontmatter, contextRoot }) {
  const candidates = [];
  const ref = frontmatter && frontmatter.prototype_html;
  if (ref) candidates.push(join(contextRoot, String(ref)));
  candidates.push(join(screenDir, 'prototype.html'));
  candidates.push(join(screenDir, 'prototype.htm'));

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    const html = safeRead(candidate);
    if (html && isSelfContainedHtml(html)) return html;
  }
  return null;
}
```

> `join`, `existsSync`, `safeRead`는 repo.js 상단에서 이미 import/정의되어 있다 (각각 `node:path`, `node:fs`, 로컬 헬퍼).

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd ohouse-design-site && node --test src/lib/repo.test.mjs`
Expected: PASS — 11 tests passed (Task 1의 6개 + 신규 5개).

- [ ] **Step 5: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add ohouse-design-site/src/lib/repo.js ohouse-design-site/src/lib/repo.test.mjs
git commit -m "feat: add resolveScreenPreviewHtml path resolver"
```

---

### Task 3: `getDomainScreens`·`getScreen`에 `previewHtml` 노출

리스트(`getDomainScreens`)와 상세(`getScreen`)가 모두 `resolveScreenPreviewHtml`을 호출해 screen 객체에 `previewHtml`을 추가.

**Files:**
- Modify: `ohouse-design-site/src/lib/repo.js:481-505` (`getDomainScreens`)
- Modify: `ohouse-design-site/src/lib/repo.js:759-785` (`getScreen`)

- [ ] **Step 1: `getDomainScreens`에 previewHtml 추가**

`getDomainScreens` 안의 `return { ... }` 객체에서 `prototype:` 라인 바로 아래에 `previewHtml`을 추가한다. 수정 후 `return` 블록은 다음과 같아야 한다:

```js
    return {
      slug: s,
      label: readme.title || s,
      summary: readme.summary || null,
      variant: readme.variant || s,
      status: readme.status || null,
      thumb: thumb ? withBase(`api/asset?path=${encodeURIComponent(thumb.replace(ROOT + '/', ''))}`) : null,
      prototype: prototypeHtml ? prototypeHtml.replace(ROOT + '/', '') : null,
      previewHtml: resolveScreenPreviewHtml({
        screenDir: join(screensDir, s),
        frontmatter: readme,
        contextRoot: CONTEXT_ROOT,
      }),
      markers,
      updated: lastModified(`domains/${slug}/screens/${s}`),
    };
```

- [ ] **Step 2: `getScreen`에 previewHtml 추가**

`getScreen` 안의 `return { ... }` 객체에서 `prototype:` 라인 바로 아래에 추가한다. 수정 후 `return` 블록:

```js
  return {
    domain: domainSlug,
    slug: screenSlug,
    label: readme.title || screenSlug,
    variant: readme.variant || screenSlug,
    status: readme.status || null,
    owner: readme.owner || null,
    body: readme.body || '',
    markers,
    thumb: thumb ? withBase(`api/asset?path=${encodeURIComponent(thumb.replace(ROOT + '/', ''))}`) : null,
    prototype: prototypePath ? prototypePath.replace(ROOT + '/', '') : null,
    previewHtml: resolveScreenPreviewHtml({
      screenDir: dir,
      frontmatter: readme,
      contextRoot: CONTEXT_ROOT,
    }),
    updated: lastModified(`domains/${domainSlug}/screens/${screenSlug}`),
  };
```

- [ ] **Step 3: 통합 동작 확인 (회귀 없음)**

아직 어떤 README에도 `prototype_html`이 없으므로 모든 screen의 `previewHtml`은 `null`이어야 하고, 함수는 정상 동작해야 한다.

Run:
```bash
cd ohouse-design-site && node -e "import('./src/lib/repo.js').then(m=>{const s=m.getDomainScreens('house-tour'); console.log('count', s.length); console.log('previewHtml all null:', s.every(x=>x.previewHtml===null)); const d=m.getScreen('house-tour','content-tab'); console.log('detail previewHtml', d.previewHtml);})"
```
Expected: `count`가 1 이상, `previewHtml all null: true`, `detail previewHtml null`. 에러 없음.

- [ ] **Step 4: 단위 테스트 회귀 확인**

Run: `cd ohouse-design-site && node --test src/lib/repo.test.mjs`
Expected: PASS — 11 tests 그대로 통과.

- [ ] **Step 5: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: expose previewHtml from getDomainScreens and getScreen"
```

---

### Task 4: `getAllBrowseCards`가 카드 item에 `previewHtml` 전달

**Files:**
- Modify: `ohouse-design-site/src/lib/repo.js:703-719` (`getAllBrowseCards`의 `cards.push`)

- [ ] **Step 1: 카드 객체에 previewHtml 추가**

`getAllBrowseCards` 안의 `cards.push({ ... })`에서 `thumb: screen.thumb,` 라인 바로 아래에 `previewHtml: screen.previewHtml,`를 추가한다. 수정 후:

```js
      cards.push({
        id: `${domain.slug}-${screen.slug}`,
        label: screen.label,
        summary: screen.summary || `${domain.label} · ${pattern.label}`,
        href: withBase(`d/${domain.slug}/s/${screen.slug}`),
        domain: domain.label,
        domainSlug: domain.slug,
        os: fallbackOs(index),
        source: screen.prototype ? 'prototype' : fallbackSource(index),
        status: browseCardStatus(screen, markers),
        pattern: pattern.label,
        element: element.label,
        flow: flow.label,
        thumb: screen.thumb,
        previewHtml: screen.previewHtml,
        markers,
        updated: screen.updated,
      });
```

- [ ] **Step 2: 동작 확인**

Run:
```bash
cd ohouse-design-site && node -e "import('./src/lib/repo.js').then(m=>{const c=m.getAllBrowseCards('screens'); console.log('cards', c.length); console.log('has previewHtml key:', 'previewHtml' in c[0]); console.log('all null now:', c.every(x=>x.previewHtml===null));})"
```
Expected: `cards`가 1 이상, `has previewHtml key: true`, `all null now: true`.

- [ ] **Step 3: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: pass previewHtml through browse cards"
```

---

### Task 5: `ReferenceCard.astro` 리스트 카드 iframe 렌더

`.ref-card__phone` 안에서 `previewHtml → thumb → placeholder` 우선순위로 렌더. iframe은 `sandbox=""`(스크립트 비허용, 정적 렌더만), `pointer-events: none`으로 카드 링크 클릭 보존.

**Files:**
- Modify: `ohouse-design-site/src/components/ReferenceCard.astro:33-41`

- [ ] **Step 1: `.ref-card__phone` 블록 교체**

현재 (lines 33-41):

```astro
    <div class="ref-card__phone">
      {item.thumb ? (
        <img class="ref-card__shot" src={item.thumb} alt={item.label} loading="lazy" />
      ) : (
        <div class="ref-card__placeholder" aria-hidden="true">
          <span>{item.domain?.slice(0, 1) || item.label.slice(0, 1)}</span>
        </div>
      )}
    </div>
```

다음으로 교체:

```astro
    <div class="ref-card__phone">
      {item.previewHtml ? (
        <iframe
          class="ref-card__frame"
          srcdoc={item.previewHtml}
          sandbox=""
          loading="lazy"
          tabindex="-1"
          aria-hidden="true"
          title={item.label}
        />
      ) : item.thumb ? (
        <img class="ref-card__shot" src={item.thumb} alt={item.label} loading="lazy" />
      ) : (
        <div class="ref-card__placeholder" aria-hidden="true">
          <span>{item.domain?.slice(0, 1) || item.label.slice(0, 1)}</span>
        </div>
      )}
    </div>
```

- [ ] **Step 2: iframe 스타일 추가**

파일 맨 끝(닫는 `</a>` 다음, 즉 현재 마지막 줄 아래)에 scoped `<style>` 블록을 추가한다:

```astro
<style>
  .ref-card__frame {
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
    pointer-events: none;
  }
</style>
```

- [ ] **Step 3: 빌드 검증**

Run: `cd ohouse-design-site && npx astro build`
Expected: 빌드 성공(에러 없음). 아직 `previewHtml`이 모두 null이라 시각적 변화는 없고, 회귀(빌드 깨짐)만 확인.

> `npm run build` 대신 `npx astro build`를 쓰는 이유: `npm run build`는 `validate:ods-previews`를 먼저 실행하는데, 이 검증은 이번 변경과 무관하므로 컴포넌트 회귀 확인에는 `astro build`만으로 충분하다. (`npx`는 로컬 설치된 astro를 쓰며 `npm install`을 하지 않는다.)

- [ ] **Step 4: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add ohouse-design-site/src/components/ReferenceCard.astro
git commit -m "feat: render screen preview HTML in reference card"
```

---

### Task 6: `[screen].astro` 상세 프리뷰 iframe 렌더

상세페이지 프리뷰 aside(`.shead__thumb`)에서 `previewHtml`이 있으면 iframe, 없으면 기존 thumb 라이트박스/placeholder.

**Files:**
- Modify: `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro:51-74`

- [ ] **Step 1: `.shead__thumb` 블록 교체**

현재 (lines 51-74):

```astro
        <div class="shead__thumb">
          {screen.thumb ? (
            <button
              type="button"
              class="shead__thumb-trigger"
              data-lightbox-src={screen.thumb}
              data-lightbox-caption={`${domain.label} · ${screen.label}`}
              aria-label={`${screen.label} 이미지 확대 보기`}
            >
              <img src={screen.thumb} alt={screen.label} />
              <span class="shead__zoom" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                확대
              </span>
            </button>
          ) : (
            <div class="shead__placeholder">
              <span>{screen.label}</span>
              <span class="shead__placeholder-hint">prototype.html / thumbnail 미준비</span>
            </div>
          )}
        </div>
```

다음으로 교체 (맨 앞에 `previewHtml` 분기 추가):

```astro
        <div class="shead__thumb">
          {screen.previewHtml ? (
            <iframe
              class="shead__frame"
              srcdoc={screen.previewHtml}
              sandbox=""
              loading="lazy"
              title={`${screen.label} 프로토타입 미리보기`}
            />
          ) : screen.thumb ? (
            <button
              type="button"
              class="shead__thumb-trigger"
              data-lightbox-src={screen.thumb}
              data-lightbox-caption={`${domain.label} · ${screen.label}`}
              aria-label={`${screen.label} 이미지 확대 보기`}
            >
              <img src={screen.thumb} alt={screen.label} />
              <span class="shead__zoom" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                확대
              </span>
            </button>
          ) : (
            <div class="shead__placeholder">
              <span>{screen.label}</span>
              <span class="shead__placeholder-hint">prototype.html / thumbnail 미준비</span>
            </div>
          )}
        </div>
```

- [ ] **Step 2: iframe 스타일 추가**

이 파일에 이미 존재하는 `<style>` 블록 내부에, `.shead__thumb` 관련 규칙 근처에 다음을 추가한다 (없으면 `<style>` 블록 맨 끝에 추가):

```css
  .shead__frame {
    width: 100%;
    height: 100%;
    min-height: 320px;
    border: 0;
    border-radius: var(--r-md);
    background: #fff;
  }
```

> 만약 이 파일에 `<style>` 블록이 없다면, 닫는 태그 직전에 `<style>.shead__frame { width:100%; height:100%; min-height:320px; border:0; border-radius: var(--r-md); background:#fff; }</style>`를 추가한다.

- [ ] **Step 3: 빌드 검증**

Run: `cd ohouse-design-site && npx astro build`
Expected: 빌드 성공. 시각적 변화 없음(아직 previewHtml null).

- [ ] **Step 4: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add "ohouse-design-site/src/pages/d/[domain]/s/[screen].astro"
git commit -m "feat: render screen preview HTML on screen detail"
```

---

### Task 7: 기존 HTML을 screen에 연결 + 최종 검증

`house-tour/content-tab` README에 `prototype_html`을 추가해 `attempt-1.html`을 연결하고, 리스트/상세에 실제로 렌더되는지 확인.

**Files:**
- Modify: `ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md` (frontmatter)

- [ ] **Step 1: frontmatter에 prototype_html 추가**

`ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md`의 frontmatter(맨 위 `---` 블록)에서 `linked_yaml_components:` 라인 바로 아래에 다음 한 줄을 추가한다:

```yaml
prototype_html: tracks/contents/_pilot-load-test/result/attempt-1.html
```

추가 후 frontmatter는 예:

```yaml
linked_yaml_components: [ContentsLandscapeCard, ContentsPortraitCard]
prototype_html: tracks/contents/_pilot-load-test/result/attempt-1.html
last_verified: 2026-04-22
```

- [ ] **Step 2: 연결이 데이터에 반영되는지 확인**

Run:
```bash
cd ohouse-design-site && node -e "import('./src/lib/repo.js').then(m=>{const s=m.getDomainScreens('house-tour').find(x=>x.slug==='content-tab'); console.log('list previewHtml present:', !!s.previewHtml); console.log('snippet:', (s.previewHtml||'').replace(/\n/g,' ').slice(0,60)); const d=m.getScreen('house-tour','content-tab'); console.log('detail previewHtml present:', !!d.previewHtml); const cards=m.getAllBrowseCards('screens'); const card=cards.find(c=>c.id==='house-tour-content-tab'); console.log('card previewHtml present:', !!(card && card.previewHtml));})"
```
Expected: `list previewHtml present: true`, `snippet:`이 `<!doctype html>...`로 시작, `detail previewHtml present: true`, `card previewHtml present: true`.

> previewHtml이 `true`로 나오지 않으면 CONTEXT_ROOT가 `ohouse-design-context`를 가리키는지 확인한다 (repo.js `resolveContextRoot`는 `tracks/`가 있는 형제 디렉토리를 찾는다). 필요 시 `OHOUSE_DESIGN_CONTEXT_ROOT` 환경변수로 절대경로 지정.

- [ ] **Step 3: 전체 빌드 + 단위 테스트**

Run:
```bash
cd ohouse-design-site && node --test src/lib/repo.test.mjs && npx astro build
```
Expected: 11 tests PASS, astro build 성공.

- [ ] **Step 4: 시각 확인 (dev 서버)**

Run: `cd ohouse-design-site && npx astro dev`
브라우저에서 확인:
- Patterns(screens) 리스트(`/screens`)에서 `집구경 탭` 카드 자리에 attempt-1 HTML(Contents Landscape Card)이 iframe으로 렌더됨.
- screen 상세(`/d/house-tour/s/content-tab`) 프리뷰 aside에 동일 HTML 렌더됨.
- 다른 screen 카드는 기존 placeholder 유지.
- 카드 클릭 시 iframe에 가로채이지 않고 screen 상세로 이동(`pointer-events: none` 확인).

확인 후 `Ctrl+C`로 dev 서버 종료.

- [ ] **Step 5: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md
git commit -m "feat: link contents landscape card HTML to content-tab screen"
```

---

## Notes

- **`npm install` 금지**: 이 레포는 사내 Nexus 타임아웃으로 기존 패키지가 손상될 수 있어 전체 `npm install`을 실행하지 않는다. 모든 테스트는 Node 내장 `node:test`(설치 불필요)로, 빌드 검증은 로컬 설치된 astro(`npx astro`)로 수행한다.
- **검증 한계**: Astro 컴포넌트는 단위 테스트 대신 빌드 + dev 서버 시각 확인으로 검증한다(별도 컴포넌트 테스트 러너 도입은 설치가 필요하므로 범위 밖).
- **성능**: 현재 self-contained HTML이 1건이라 리스트 다수 iframe 성능 문제는 없다. screen이 늘면 IntersectionObserver 기반 지연 마운트가 필요(스펙 Known Limitations 참조, 이번 범위 밖).
