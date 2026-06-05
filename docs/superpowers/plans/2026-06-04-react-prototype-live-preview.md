# React Prototype Live Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** screen 상세페이지에서, 정적 프리뷰를 기본으로 보여주되 `prototype_url`이 있으면 "▶ Live 프리뷰 보기" 토글로 배포된 React 프로토타입을 on-demand iframe으로 띄운다.

**Architecture:** `repo.js`에 순수 검증 헬퍼 `isValidPrototypeUrl`를 추가하고 `getScreen`이 `prototypeUrl`을 노출한다. `[screen].astro`의 프리뷰 박스(`.shead__thumb`, 이미 `position: relative`)에 초기 비로드 상태의 live `<iframe>`(절대배치 오버레이)과 토글 버튼·"새 탭 열기" 링크를 추가하고, 작은 클라이언트 스크립트가 첫 클릭 시 `iframe.src`를 설정해 정적↔live를 토글한다. 리스트 경로는 변경하지 않는다.

**Tech Stack:** Astro(정적 빌드), Node ESM. 테스트는 Node 내장 `node:test`(추가 설치 없음 — 이 레포는 `npm install` 금지). 컴포넌트는 `npx astro build`로 검증.

---

## File Structure

- `ohouse-design-site/src/lib/repo.js` (Modify) — `isValidPrototypeUrl` 추가; `getScreen` 반환에 `prototypeUrl` 추가.
- `ohouse-design-site/src/lib/repo.test.mjs` (Modify) — `isValidPrototypeUrl` 단위 테스트 추가.
- `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro` (Modify) — live iframe 오버레이 + 토글/열기 컨트롤 + CSS + 토글 스크립트.
- `ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md` (Modify) — `prototype_url` frontmatter로 example 연결.

모든 명령은 `ohouse-design-site/`를 작업 디렉토리로 가정한다. 이 레포의 현재 테스트는 13개(이전 기능에서 추가됨)이며, 본 계획으로 늘어난다.

---

### Task 1: `isValidPrototypeUrl` 순수 함수

https URL 문자열만 통과시키는 검증 헬퍼.

**Files:**
- Modify: `ohouse-design-site/src/lib/repo.js`
- Modify: `ohouse-design-site/src/lib/repo.test.mjs`

- [ ] **Step 1: 실패하는 테스트 작성**

`ohouse-design-site/src/lib/repo.test.mjs`의 상단 import에서 `./repo.js`로부터 가져오는 목록에 `isValidPrototypeUrl`을 추가한다. 현재 import 라인:

```js
import { isSelfContainedHtml, resolveScreenPreviewHtml } from './repo.js';
```

를 다음으로 교체:

```js
import { isSelfContainedHtml, resolveScreenPreviewHtml, isValidPrototypeUrl } from './repo.js';
```

그리고 파일 끝에 다음 테스트를 추가:

```js
test('isValidPrototypeUrl: https URL이면 true', () => {
  assert.equal(isValidPrototypeUrl('https://deeer-glitch.github.io/ohouse-design-pilot-sandbox/'), true);
});

test('isValidPrototypeUrl: http URL이면 false', () => {
  assert.equal(isValidPrototypeUrl('http://example.com/'), false);
});

test('isValidPrototypeUrl: 비문자열이면 false', () => {
  assert.equal(isValidPrototypeUrl(null), false);
  assert.equal(isValidPrototypeUrl(undefined), false);
  assert.equal(isValidPrototypeUrl(123), false);
});

test('isValidPrototypeUrl: 빈/공백 문자열이면 false', () => {
  assert.equal(isValidPrototypeUrl(''), false);
  assert.equal(isValidPrototypeUrl('   '), false);
});

test('isValidPrototypeUrl: URL 파싱 불가 문자열이면 false', () => {
  assert.equal(isValidPrototypeUrl('not a url'), false);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd ohouse-design-site && node --test src/lib/repo.test.mjs`
Expected: FAIL — `isValidPrototypeUrl` export 없음으로 import 에러.

- [ ] **Step 3: 최소 구현 추가**

`ohouse-design-site/src/lib/repo.js`에서 기존 `resolveScreenPreviewHtml` 함수 **바로 아래**에 추가:

```js
export function isValidPrototypeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd ohouse-design-site && node --test src/lib/repo.test.mjs`
Expected: PASS — 18 tests passed (기존 13 + 신규 5).

- [ ] **Step 5: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add ohouse-design-site/src/lib/repo.js ohouse-design-site/src/lib/repo.test.mjs
git commit -m "feat: add isValidPrototypeUrl helper"
```

---

### Task 2: `getScreen`이 `prototypeUrl` 노출

상세페이지 데이터(`getScreen`)에 `prototypeUrl`을 추가한다. 리스트 경로는 변경하지 않는다.

**Files:**
- Modify: `ohouse-design-site/src/lib/repo.js` (`getScreen`의 return 객체)

- [ ] **Step 1: `getScreen` 반환에 prototypeUrl 추가**

`ohouse-design-site/src/lib/repo.js`의 `export function getScreen(domainSlug, screenSlug)` 안 `return { ... }`에서 `previewHtml:` 항목 **바로 아래**에 `prototypeUrl`을 추가한다. 수정 후 return 블록:

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
    prototypeUrl: isValidPrototypeUrl(readme.prototype_url) ? readme.prototype_url : null,
    updated: lastModified(`domains/${domainSlug}/screens/${screenSlug}`),
  };
```

> `readme`는 `getScreen` 상단에서 `parseMd(...) || {}`로 만들어지며 frontmatter 키를 평탄하게 노출하므로 `readme.prototype_url`로 접근된다.

- [ ] **Step 2: 회귀 없음 + 필드 존재 확인**

아직 어떤 README에도 `prototype_url`이 없으므로 모든 screen의 `prototypeUrl`은 `null`이어야 한다.

Run:
```bash
cd ohouse-design-site && node -e "import('./src/lib/repo.js').then(m=>{const d=m.getScreen('house-tour','content-tab'); console.log('has key:', 'prototypeUrl' in d); console.log('value:', d.prototypeUrl);})"
```
Expected: `has key: true`, `value: null`. 에러 없음.

- [ ] **Step 3: 단위 테스트 회귀 확인**

Run: `cd ohouse-design-site && node --test src/lib/repo.test.mjs`
Expected: 18 tests pass.

- [ ] **Step 4: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: expose prototypeUrl from getScreen"
```

---

### Task 3: `[screen].astro` live 프리뷰 토글 UI

프리뷰 박스에 초기 비로드 live iframe(절대배치 오버레이)과 토글 버튼·"새 탭 열기" 링크를 추가하고, 클릭 시에만 `src`를 설정하는 스크립트를 더한다.

**Files:**
- Modify: `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro`

- [ ] **Step 1: 프리뷰 박스에 live iframe + 컨트롤 추가**

현재 프리뷰 aside는 다음과 같다(들여쓰기 포함):

```astro
      <aside class="screen-detail__preview">
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
      </aside>
```

이 전체를 다음으로 교체한다(정적 체인은 그대로, `.shead__thumb` 안 마지막에 live iframe을 추가하고, `.shead__thumb` 다음에 컨트롤 블록을 추가):

```astro
      <aside class="screen-detail__preview">
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
          {screen.prototypeUrl && (
            <iframe
              class="shead__live"
              data-live-frame
              data-src={screen.prototypeUrl}
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
              title={`${screen.label} live 프로토타입`}
              hidden
            />
          )}
        </div>
        {screen.prototypeUrl && (
          <div class="preview-live-controls">
            <button type="button" class="btn-secondary" data-live-toggle aria-pressed="false">
              ▶ Live 프리뷰 보기
            </button>
            <a class="btn-secondary btn-secondary--stroke" href={screen.prototypeUrl} target="_blank" rel="noopener">
              ↗ 새 탭에서 열기
            </a>
          </div>
        )}
      </aside>
```

- [ ] **Step 2: CSS 추가**

이 파일의 기존 `<style>` 블록에서 `.shead__frame` 규칙 근처에 다음 두 규칙을 추가한다:

```css
  .shead__live {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
    z-index: 2;
  }
  .shead__live[hidden] {
    display: none;
  }
  .preview-live-controls {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
```

- [ ] **Step 3: 토글 스크립트 추가**

이 파일의 마지막 `</style>` 블록 뒤(파일 끝)에 새 `<script>` 블록을 추가한다:

```astro
<script>
  document.querySelectorAll('[data-live-toggle]').forEach((btn) => {
    const aside = btn.closest('.screen-detail__preview');
    const frame = aside && aside.querySelector('[data-live-frame]');
    if (!frame) return;
    btn.addEventListener('click', () => {
      const isHidden = frame.hasAttribute('hidden');
      if (isHidden) {
        if (!frame.getAttribute('src')) {
          frame.setAttribute('src', frame.dataset.src);
        }
        frame.removeAttribute('hidden');
        btn.setAttribute('aria-pressed', 'true');
        btn.textContent = '■ 정적 프리뷰로 돌아가기';
      } else {
        frame.setAttribute('hidden', '');
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = '▶ Live 프리뷰 보기';
      }
    });
  });
</script>
```

> `data-src`만 두고 `src`는 첫 클릭 시 설정하므로, 토글 전에는 외부 로드가 일어나지 않는다. `hidden` 속성 + `.shead__live[hidden]{display:none}`으로 표시를 토글한다.

- [ ] **Step 4: 빌드 검증**

Run: `cd ohouse-design-site && npx astro build`
Expected: 빌드 성공(69 pages, 에러 없음). 아직 `prototypeUrl`이 모두 null이라 시각적 변화 없음 — 회귀(빌드/문법 오류) 없음만 확인.

> `npm run build` 대신 `npx astro build` 사용(이번 변경과 무관한 `validate:ods-previews`를 건너뜀). `npx`는 로컬 설치된 astro를 쓰며 `npm install`을 하지 않는다.

- [ ] **Step 5: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add "ohouse-design-site/src/pages/d/[domain]/s/[screen].astro"
git commit -m "feat: add live prototype preview toggle on screen detail"
```

---

### Task 4: 기존 프로토타입 URL 연결 + 최종 검증

`house-tour/content-tab` README에 `prototype_url`을 추가해 pilot-sandbox를 연결하고, 정적 기본 + live 토글이 실제로 동작하는지 검증한다.

**Files:**
- Modify: `ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md` (frontmatter)

- [ ] **Step 1: frontmatter에 prototype_url 추가**

`ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md`의 frontmatter에서, 기존 `prototype_html:` 라인 **바로 아래**에 다음을 추가한다:

```yaml
prototype_url: https://deeer-glitch.github.io/ohouse-design-pilot-sandbox/
```

추가 후 frontmatter 예:

```yaml
linked_yaml_components: [ContentsLandscapeCard, ContentsPortraitCard]
prototype_html: tracks/contents/_pilot-load-test/result/attempt-1.html
prototype_url: https://deeer-glitch.github.io/ohouse-design-pilot-sandbox/
last_verified: 2026-04-22
```

- [ ] **Step 2: 데이터 반영 확인**

Run:
```bash
cd ohouse-design-site && node -e "import('./src/lib/repo.js').then(m=>{const d=m.getScreen('house-tour','content-tab'); console.log('prototypeUrl:', d.prototypeUrl); console.log('static previewHtml present:', !!d.previewHtml);})"
```
Expected: `prototypeUrl: https://deeer-glitch.github.io/ohouse-design-pilot-sandbox/`, `static previewHtml present: true` (정적 카드가 기본으로 남아 있음).

- [ ] **Step 3: 전체 빌드 + 단위 테스트**

Run:
```bash
cd ohouse-design-site && node --test src/lib/repo.test.mjs && npx astro build
```
Expected: 18 tests PASS, astro build 성공.

- [ ] **Step 4: 빌드 산출물에 live 컨트롤이 들어갔는지 확인**

Run:
```bash
cd ohouse-design-site && (grep -l 'data-live-frame' dist/d/house-tour/s/content-tab/index.html >/dev/null && grep -l 'data-live-toggle' dist/d/house-tour/s/content-tab/index.html >/dev/null && echo "LIVE CONTROLS FOUND") || echo "NOT FOUND"
```
Expected: `LIVE CONTROLS FOUND`. (dist 경로가 base prefix로 다르면 `dist/` 전체에서 `data-live-frame`/`data-live-toggle`을 grep해 위치를 확인·보고.)

- [ ] **Step 5: 시각 확인 (선택, 사람 몫)**

`npx astro dev`로 `/d/house-tour/s/content-tab`을 열어: (1) 정적 카드가 기본으로 보이고, (2) "▶ Live 프리뷰 보기" 클릭 시 pilot-sandbox가 iframe으로 로드되며, (3) 다시 클릭하면 정적으로 돌아오고, (4) "↗ 새 탭에서 열기"가 URL을 연다. 긴 dev 서버 실행은 사람이 직접 확인한다(에이전트는 Step 4의 빌드 산출물 grep으로 충분).

- [ ] **Step 6: 커밋**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git add ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md
git commit -m "feat: link pilot-sandbox live prototype to content-tab screen"
```

---

## Notes

- **`npm install` 금지**: 사내 Nexus 타임아웃으로 기존 패키지가 손상될 수 있어 전체 `npm install`을 실행하지 않는다. 테스트는 Node 내장 `node:test`, 빌드 검증은 로컬 astro(`npx astro`).
- **검증 한계**: live iframe 동작은 빌드 산출물에 컨트롤이 들어갔는지(grep) + 사람의 dev 시각 확인으로 검증한다(크로스오리진 iframe은 자동 테스트가 어렵다).
- **외부 의존**: live 프리뷰는 `deeer-glitch` GitHub Pages 배포에 의존(수용됨). 배포가 내려가도 정적 프리뷰는 유지된다.
- **리스트 미변경**: 리스트 카드(`ReferenceCard.astro`)와 `getDomainScreens`/`getAllBrowseCards`는 건드리지 않는다(리스트는 정적 유지).
