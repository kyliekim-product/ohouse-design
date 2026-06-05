# 스크린 실험/디벨롭 히스토리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스크린 상세페이지의 'Screen Info' 탭을 (프로토타입 제작 메타가 아닌) 담당자가 작성한 **실험/디벨롭 히스토리(`history.md` + 첨부 이미지)** 로 렌더하고, 없으면 탭을 숨기며, 빌드 시도 단계용 "단계별 라이브" 버튼을 제거한다.

**Architecture:** `getScreen`이 스크린 폴더의 `history.md`를 읽어 `historyHtml`로 렌더(상대 이미지 경로는 `/screen-history/<d>/<s>/`로 치환). 빌드 단계 `sync-screen-history.mjs`가 `history.md` 옆 이미지들을 `public/screen-history/<d>/<s>/`로 복사(static 서빙). `prototype-meta.md`는 더 이상 탭에 쓰지 않음(파일은 유지). 담당자용 포맷 가이드 문서 추가.

**Tech Stack:** Astro, Node 22(ESM, 무의존 스크립트), `marked`(이미 의존성).

---

## File Structure

- **Modify** `ohouse-design-site/src/lib/repo.js` — `getScreen`에 `historyHtml`(from `history.md`) 추가 + 이미지 src 치환 헬퍼 `rewriteHistoryImages`(export); `prototypeMetaHtml`/`metaDoc` 제거.
- **Create** `ohouse-design-site/src/lib/repo-history.test.mjs` — `rewriteHistoryImages` 단위 테스트.
- **Modify** `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro` — Screen Info 탭을 `historyHtml`로; 단계별 라이브 행/JS/CSS 제거.
- **Create** `ohouse-design-site/scripts/sync-screen-history.mjs` — `history.md` 옆 이미지 → `public/screen-history/<d>/<s>/` 복사.
- **Modify** `ohouse-design-site/package.json` — `sync:screen-history` 스크립트 + build 체인.
- **Create** `ohouse-design-mcp/screen-history-format.md` — 담당자 포맷 가이드(#2).

---

## Task 1: getScreen — `history.md` → `historyHtml` + 이미지 경로 치환

**Files:**
- Modify: `ohouse-design-site/src/lib/repo.js`
- Test: `ohouse-design-site/src/lib/repo-history.test.mjs`

- [ ] **Step 1: 실패 테스트 작성**

`ohouse-design-site/src/lib/repo-history.test.mjs`:
```js
import assert from 'node:assert/strict';
import { rewriteHistoryImages } from './repo.js';

// 상대경로 → /screen-history/<d>/<s>/<basename> 로 치환 (BASE 기본 '/')
const out = rewriteHistoryImages('<p><img src="./stage-1.png" alt="1차"></p>', 'house-tour', 'content-tab');
assert.ok(out.includes('src="/screen-history/house-tour/content-tab/stage-1.png"'), out);

// 하위 경로도 basename 기준
assert.ok(rewriteHistoryImages('<img src="imgs/a.webp">', 'd', 's').includes('src="/screen-history/d/s/a.webp"'));

// 외부/절대/data URL 은 그대로
assert.ok(rewriteHistoryImages('<img src="https://x/y.png">', 'd', 's').includes('src="https://x/y.png"'));
assert.ok(rewriteHistoryImages('<img src="/already/abs.png">', 'd', 's').includes('src="/already/abs.png"'));
assert.ok(rewriteHistoryImages('<img src="data:image/png;base64,AAAA">', 'd', 's').includes('src="data:image/png;base64,AAAA"'));

console.log('repo-history tests passed');
```

- [ ] **Step 2: 실패 확인**

Run: `cd ohouse-design-site && node src/lib/repo-history.test.mjs`
Expected: FAIL — `does not provide an export named 'rewriteHistoryImages'`.

- [ ] **Step 3: 헬퍼 추가 + getScreen 수정**

`src/lib/repo.js`에서 `withBase` 함수 정의 바로 뒤에 헬퍼 추가:
```js
// history.md 의 상대경로 이미지(<img src="./x.png">)를 public/screen-history 서빙 경로로 치환.
// 외부(http/protocol-relative)·절대(/)·data URL 은 그대로 둔다.
export function rewriteHistoryImages(html, domainSlug, screenSlug) {
  return String(html).replace(/(<img\b[^>]*?\bsrc=")([^"]+)(")/g, (m, pre, src, post) => {
    if (/^(https?:)?\/\//.test(src) || src.startsWith('/') || src.startsWith('data:')) return m;
    const basename = src.replace(/^\.\//, '').split('/').pop();
    return pre + withBase(`screen-history/${domainSlug}/${screenSlug}/${basename}`) + post;
  });
}
```

`getScreen`에서 `const metaDoc = parseMd(join(dir, 'prototype-meta.md'));` 줄을 아래로 교체:
```js
  const historyDoc = parseMd(join(dir, 'history.md'));
```

그리고 반환 객체의 `prototypeMetaHtml: metaDoc?.body ? marked.parse(metaDoc.body) : null,` 줄을 아래로 교체:
```js
    historyHtml: historyDoc?.body ? rewriteHistoryImages(marked.parse(historyDoc.body), domainSlug, screenSlug) : null,
```

- [ ] **Step 4: 통과 + getScreen 확인**

Run:
```bash
cd ohouse-design-site && node src/lib/repo-history.test.mjs
node --input-type=module -e "import {getScreen} from './src/lib/repo.js'; const s=getScreen('house-tour','content-tab'); console.log('historyHtml:', s.historyHtml); console.log('prototypeMetaHtml:', s.prototypeMetaHtml)"
```
Expected: `repo-history tests passed`; `historyHtml: null`; `prototypeMetaHtml: undefined` (content-tab엔 history.md 없음, 필드 제거됨).

- [ ] **Step 5: 커밋**
```bash
git add ohouse-design-site/src/lib/repo.js ohouse-design-site/src/lib/repo-history.test.mjs
git commit -m "feat: getScreen renders history.md (historyHtml) with image path rewrite"
```

---

## Task 2: 스크린 상세 UI — Screen Info=historyHtml, 단계별 라이브 제거

**Files:**
- Modify: `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro`

- [ ] **Step 1: prototypeMetaHtml → historyHtml 치환**

파일 내 `screen.prototypeMetaHtml` 4곳을 모두 `screen.historyHtml`로 교체:
- Screen Info 탭 링크 조건 `{screen.prototypeMetaHtml && (` (Screen Info `<a>`)
- ODS 탭 링크 class `${screen.prototypeMetaHtml ? '' : ' is-active'}`
- Screen Info 패널 조건 `{screen.prototypeMetaHtml && (`
- ODS 패널 `hidden={!!screen.prototypeMetaHtml}` (그리고 domain 패널이 동일 표현을 쓰면 그것도)
- `<div class="screen-spec__body" set:html={screen.prototypeMetaHtml} />` → `set:html={screen.historyHtml}`

(grep로 잔여 확인: `grep -n "prototypeMetaHtml" src/pages/d/[domain]/s/[screen].astro` → 0건이어야.)

- [ ] **Step 2: 단계별 라이브 행 마크업 제거**

Screen Info 패널에서 아래 블록 전체 삭제:
```astro
                    {screen.prototypeUrl && (
                      <div class="stage-live-row" aria-label="단계별 라이브">
                        {[['1', '1차'], ['2', '2차'], ['3a', '3a 초안'], ['3b', '3b 디벨롭']].map(([id, label]) => (
                          <button type="button" class="stage-live-link" data-stage-live={id}>{label}</button>
                        ))}
                      </div>
                    )}
```
(결과: Screen Info 패널은 `<div class="screen-spec__body" set:html={screen.historyHtml} />` 만 남음.)

- [ ] **Step 3: 단계별 라이브 JS 제거**

`initStageLiveLinks` 함수 정의 전체와 그 호출/등록 2줄을 삭제:
```js
    initStageLiveLinks();
    document.addEventListener('astro:page-load', initStageLiveLinks);
```
그리고 함수 본문 `function initStageLiveLinks() { ... }` 블록 전체 삭제.

또한 기존 `[data-live-toggle]` 핸들러 안에 추가됐던 stage 하이라이트 정리 2줄을 삭제(toggle open/close 분기 각각):
```js
        document.querySelectorAll('[data-stage-live]').forEach((b) => b.classList.remove('is-active'));
```
(open 분기·close 분기 두 군데. `[data-live-toggle]` 토글 자체의 나머지 동작은 유지.)

- [ ] **Step 4: 단계별 라이브 CSS 제거**

아래 CSS 규칙 4줄 삭제:
```css
  .stage-live-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 20px; }
  .stage-live-link {
    border: 1px solid var(--c-border); background: var(--c-bg-elev); color: var(--c-text-muted);
    border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer;
    transition: background .15s, color .15s, border-color .15s;
  }
  .stage-live-link:hover { background: var(--c-bg-elev-2); color: var(--c-text); }
  .stage-live-link.is-active { background: var(--c-text); color: var(--c-bg); border-color: var(--c-text); }
```

- [ ] **Step 5: 빌드 + 검증**

Run:
```bash
cd ohouse-design-site && npx astro build 2>&1 | tail -3
PG=dist/d/house-tour/s/content-tab/index.html
echo '--- stage-live 잔존(expect 0) ---'; grep -c "stage-live\|data-stage-live\|initStageLiveLinks" "$PG" || true
echo '--- content-tab Screen Info 탭 없음(expect 0) ---'; grep -c 'data-screen-info-tab="screen-info"' "$PG" || true
echo '--- ODS 탭은 존재 ---'; grep -c 'data-screen-info-tab="ods"' "$PG" || true
```
Expected: build `Complete!`; stage-live 0; content-tab의 screen-info 탭 0(history.md 없음); ods 탭 ≥1.

- [ ] **Step 6: 커밋**
```bash
git add "ohouse-design-site/src/pages/d/[domain]/s/[screen].astro"
git commit -m "feat: Screen Info tab renders history.md; remove per-stage live links"
```

---

## Task 3: sync-screen-history 스크립트 + 빌드 연동

**Files:**
- Create: `ohouse-design-site/scripts/sync-screen-history.mjs`
- Modify: `ohouse-design-site/package.json`

- [ ] **Step 1: 스크립트 작성**

`ohouse-design-site/scripts/sync-screen-history.mjs`:
```js
import { existsSync, readdirSync, statSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const SITE_ROOT = resolve(import.meta.dirname, '..');
const MCP_ROOT = resolve(SITE_ROOT, '../ohouse-design-mcp');
const OUT_ROOT = join(SITE_ROOT, 'public', 'screen-history');
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

function listDirs(p) {
  if (!existsSync(p)) return [];
  return readdirSync(p).filter((n) => statSync(join(p, n)).isDirectory());
}

function main() {
  const domainsRoot = join(MCP_ROOT, 'domains');
  if (!existsSync(domainsRoot)) { console.warn('[screen-history] domains 없음 — skip'); return; }
  let copied = 0;
  for (const domain of listDirs(domainsRoot)) {
    const screensRoot = join(domainsRoot, domain, 'screens');
    for (const screen of listDirs(screensRoot)) {
      const dir = join(screensRoot, screen);
      if (!existsSync(join(dir, 'history.md'))) continue;
      const imgs = readdirSync(dir).filter((f) => IMG_EXT.has(extname(f).toLowerCase()));
      if (imgs.length === 0) continue;
      const outDir = join(OUT_ROOT, domain, screen);
      mkdirSync(outDir, { recursive: true });
      for (const img of imgs) { copyFileSync(join(dir, img), join(outDir, img)); copied++; }
      console.log(`[screen-history] ${domain}/${screen}: ${imgs.length} image(s)`);
    }
  }
  console.log(`[screen-history] done (${copied} file(s))`);
}

try { main(); } catch (e) { console.warn(`[screen-history] 실패: ${e.message} — 빌드 계속`); }
```

- [ ] **Step 2: package.json 연동**

`scripts`에 추가: `"sync:screen-history": "node scripts/sync-screen-history.mjs"`.
`build`를 `"npm run validate:ods-previews && npm run snapshot:prototypes && npm run sync:screen-history && astro build"` 로 변경.

- [ ] **Step 3: 임시 픽스처로 end-to-end 검증 (커밋 안 함)**

```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
D=ohouse-design-mcp/domains/house-tour/screens/content-tab
printf '# 실험 히스토리\n\n## 1차\n\n![1차](./_hist_test.png)\n' > "$D/history.md"
cp ohouse-design-site/public/thumbnails/house-tour/content-tab.webp "$D/_hist_test.png" 2>/dev/null || printf 'x' > "$D/_hist_test.png"
cd ohouse-design-site && npm run sync:screen-history
ls public/screen-history/house-tour/content-tab/
node --input-type=module -e "import {getScreen} from './src/lib/repo.js'; const s=getScreen('house-tour','content-tab'); console.log('non-null:', !!s.historyHtml); console.log('rewritten:', /\/screen-history\/house-tour\/content-tab\/_hist_test.png/.test(s.historyHtml||''))"
npx astro build 2>&1 | tail -2
grep -c 'data-screen-info-tab="screen-info"' dist/d/house-tour/s/content-tab/index.html
```
Expected: 이미지 복사됨, `non-null: true`, `rewritten: true`, build `Complete!`, screen-info 탭 1.

**정리(픽스처 제거):**
```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
rm -f "$D/history.md" "$D/_hist_test.png"
rm -rf ohouse-design-site/public/screen-history/house-tour/content-tab
git status --short   # 추적 파일은 package.json + 새 스크립트만 남아야
```

- [ ] **Step 4: 커밋 (스크립트 + 연동만)**
```bash
git add ohouse-design-site/scripts/sync-screen-history.mjs ohouse-design-site/package.json
git commit -m "build: sync screen-history images into public before astro build"
```
(임시 history.md/이미지/public 산출물은 커밋에 포함되지 않아야 — `git show --stat HEAD`로 확인.)

---

## Task 4: 담당자 포맷 가이드 문서 (#2)

**Files:**
- Create: `ohouse-design-mcp/screen-history-format.md`

- [ ] **Step 1: 가이드 작성**

`ohouse-design-mcp/screen-history-format.md`:
```markdown
---
tier: 3
when-to-read: "스크린 상세페이지에 실험/디벨롭 히스토리(화면+설명)를 넣고 싶을 때"
audience: human
owner: Deeer
---

# 스크린 실험/디벨롭 히스토리 작성 가이드

스크린 상세페이지 우측 **'Screen Info'** 탭에 그 화면의 **실험/디벨롭 단계별 히스토리**(화면 + 설명)를 넣을 수 있다. 내용이 없으면 탭은 자동으로 표시되지 않는다.

## 1. 어디에 두나

해당 스크린 폴더에 `history.md` 1개를 만든다:

    ohouse-design-mcp/domains/<도메인>/screens/<스크린>/history.md

화면 이미지는 **같은 폴더**에 함께 둔다.

    .../screens/<스크린>/
      ├─ README.md
      ├─ history.md          ← 작성
      ├─ stage-1.png         ← 첨부 이미지
      └─ stage-2.png

## 2. 어떻게 쓰나

`history.md`는 자유 형식 마크다운이다. 단계는 `##`/`###` 제목으로 나누고, 각 단계 화면은 **같은 폴더 이미지**를 상대경로로 삽입한다.

    # 거실 추천 피드 실험 히스토리

    ## 1차 — 단일 카드 검증 (2026-04-23)
    가설: …
    ![1차 화면](./stage-1.png)

    ## 2차 — 피드 레이아웃 (2026-04-24)
    변경점: …
    ![2차 화면](./stage-2.png)

규칙:
- 이미지는 **상대경로**(`./파일.png` 또는 `파일.png`)로. 빌드가 `public/`로 복사하고 경로를 자동으로 맞춘다.
- 외부 이미지가 필요하면 전체 URL(`https://…`)도 가능.
- 표·목록·링크 등 일반 마크다운 문법 모두 사용 가능.

## 3. 어떻게 반영되나

- 사이트 빌드 시 `history.md` 옆 이미지가 `ohouse-design-site/public/screen-history/<도메인>/<스크린>/`로 복사되고, 'Screen Info' 탭에 렌더된다.
- 로컬 미리보기: 사이트 폴더에서 `npm run build`(또는 `npm run sync:screen-history` 후 `npm run dev`).
- `history.md`가 없으면 'Screen Info' 탭은 표시되지 않는다.

## 주의

- 이것은 화면의 **디자인 실험/디벨롭 히스토리**용이다. (프로토타입을 만든 도구·과정 기록인 `prototype-meta.md`와 다르며, 후자는 사이트에 노출되지 않는다.)
```

- [ ] **Step 2: 커밋**
```bash
git add ohouse-design-mcp/screen-history-format.md
git commit -m "docs: screen experiment/develop history format guide"
```

---

## Self-Review (작성자 체크)

- **Spec 커버리지**: ① getScreen historyHtml+치환 = Task1 / ② UI(historyHtml, 탭 숨김, 단계 라이브 제거) = Task2 / ③ sync 스크립트+빌드연동 = Task3 / ④ 가이드 = Task4. prototype-meta.md 파일 유지(읽기만 중단), 프로토타입 단계코드 휴면(미변경) — 충족.
- **Placeholder**: 코드·명령·기대출력 구체화, 없음.
- **타입/이름 일관성**: `historyHtml`/`rewriteHistoryImages`/`history.md`/`screen-history/<d>/<s>/` 전 태스크 일관. Task1이 `historyHtml` 정의 → Task2가 소비(순서 의존).
- **주의**: Task2는 Task1(historyHtml 필드)에 의존. Task3 임시 픽스처는 커밋 금지(정리 단계 포함).
