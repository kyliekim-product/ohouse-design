# ODS 상세 'Screens' 탭(사용 스크린 프리뷰) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ODS 컴포넌트 상세의 "이 컴포넌트를 사용하는 스크린"을 별도 평문 섹션에서 → OdsDocTabs 안의 **'Screens' 탭(Guide/Spec 다음)**으로 옮기고, **썸네일+화면명+도메인 프리뷰 카드 그리드**로 표시한다.

**Architecture:** `getOdsComponentScreens`가 각 스크린에 `thumb`(screenThumbUrl)·`domainLabel`을 추가한다. `OdsDocTabs`가 `screens` prop을 받아 Screens 탭을 추가하고, 그 패널은 prose 대신 카드 그리드를 렌더한다(기존 정적 렌더 + `data-doc-tab-*` 바인딩 JS 그대로 동작). `[slug].astro`는 standalone 섹션을 제거하고 `screens`를 넘기며 카드 CSS(:global)를 추가한다.

**Tech Stack:** Astro, React(정적 렌더), 기존 `bindOdsDocTabs` JS.

---

## File Structure
- **Modify** `ohouse-design-site/src/lib/repo.js` — `getOdsComponentScreens` 항목에 `thumb`·`domainLabel`.
- **Modify** `ohouse-design-site/src/components/OdsDocTabs.jsx` — `screens` prop + Screens 탭 카드 그리드.
- **Modify** `ohouse-design-site/src/pages/ods/components/[slug].astro` — `screens` 전달, standalone 섹션 제거, 카드 CSS(:global), 구 `.ods-used-in` CSS 제거.

---

## Task 1: `getOdsComponentScreens` — thumb·domainLabel 추가

**Files:** Modify `ohouse-design-site/src/lib/repo.js`.

- [ ] **Step 1: push 객체 확장**

`getOdsComponentScreens` 내부의 `out.push({...})` 블록을 아래로 교체(READ로 위치 확인):
```js
        out.push({
          domain: domain.slug,
          slug: screen.slug,
          label: screen.label,
          domainLabel: domain.label,
          thumb: screenThumbUrl(domain.slug, screen.slug),
          href: withBase(`d/${domain.slug}/s/${screen.slug}`),
        });
```
(`screenThumbUrl`·`domain.label`(=getAllDomains label) 모두 기존 심볼.)

- [ ] **Step 2: 검증**
```bash
cd ohouse-design-site && node --input-type=module -e "
import { getOdsComponentScreens } from './src/lib/repo.js';
console.log(JSON.stringify(getOdsComponentScreens('tab'), null, 0));
"
```
Expected: content-tab 항목에 `domainLabel`(예: '집구경'), `thumb`(content-tab은 `/thumbnails/house-tour/content-tab.webp`), `href` 포함.

- [ ] **Step 3: 커밋**
```bash
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: include thumb + domainLabel in getOdsComponentScreens entries"
```

---

## Task 2: OdsDocTabs — `screens` prop + Screens 탭 카드 그리드

**Files:** Modify `ohouse-design-site/src/components/OdsDocTabs.jsx`.

- [ ] **Step 1: 시그니처 + tabs 배열**

`export default function OdsDocTabs({ guideHtml, specHtml }) {` 를 아래로 교체:
```jsx
export default function OdsDocTabs({ guideHtml, specHtml, screens }) {
```
그리고 `tabs` 배열을 아래로 교체(Screens를 Guide/Spec 뒤에):
```jsx
  const tabs = [
    guideHtml ? { value: 'guide', label: 'Guide', html: normalizeDocHtml(guideHtml) } : null,
    specHtml ? { value: 'spec', label: 'Spec', html: normalizeDocHtml(specHtml) } : null,
    (screens && screens.length) ? { value: 'screens', label: 'Screens', screens } : null,
  ].filter(Boolean);
```

- [ ] **Step 2: 패널 렌더 분기**

패널 맵의 내용(현재 `<div className="prose" dangerouslySetInnerHTML={{ __html: tab.html }} />`)을 아래로 교체:
```jsx
                {tab.screens ? (
                  <div className="ods-screens-grid">
                    {tab.screens.map((s) => (
                      <a key={`${s.domain}/${s.slug}`} className="ods-screen-card" href={s.href}>
                        <span className="ods-screen-card__thumb">
                          {s.thumb ? (
                            <img src={s.thumb} alt={s.label} loading="lazy" />
                          ) : (
                            <span className="ods-screen-card__ph">{s.label}</span>
                          )}
                        </span>
                        <span className="ods-screen-card__meta">
                          <span className="ods-screen-card__label">{s.label}</span>
                          <span className="ods-screen-card__domain">{s.domainLabel}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="prose" dangerouslySetInnerHTML={{ __html: tab.html }} />
                )}
```
(Tab.List 트리거·TOC 맵은 그대로 — screens 탭도 자동 포함되고, screens 패널은 heading이 없어 TOC는 비어 hidden 처리됨.)

- [ ] **Step 3: 구문 확인(빌드는 Task 3에서)**

Run: `cd ohouse-design-site && node -e "require('fs').readFileSync('src/components/OdsDocTabs.jsx','utf8')" && echo ok` (파일 존재/읽기 확인). 실제 렌더 검증은 Task 3 빌드에서.

- [ ] **Step 4: 커밋**
```bash
git add ohouse-design-site/src/components/OdsDocTabs.jsx
git commit -m "feat: OdsDocTabs Screens tab renders using-screen preview cards"
```

---

## Task 3: [slug].astro — screens 전달 + standalone 제거 + CSS

**Files:** Modify `ohouse-design-site/src/pages/ods/components/[slug].astro`.

- [ ] **Step 1: OdsDocTabs에 screens 전달**

`<OdsDocTabs guideHtml={component.guideHtml} specHtml={component.specHtml} />` 를 아래로 교체:
```astro
            <OdsDocTabs guideHtml={component.guideHtml} specHtml={component.specHtml} screens={usedInScreens} />
```

- [ ] **Step 2: standalone 섹션 제거**

아래 블록(references 뒤에 추가됐던 것) 전체 삭제:
```astro
          {usedInScreens.length > 0 && (
            <section class="ods-used-in" aria-label="이 컴포넌트를 사용하는 스크린">
              <h2 class="ods-used-in__title">이 컴포넌트를 사용하는 스크린</h2>
              <ul class="ods-used-in__list">
                {usedInScreens.map((s) => (
                  <li><a class="ods-used-in__link" href={s.href}>{s.label}</a></li>
                ))}
              </ul>
            </section>
          )}
```
(`const usedInScreens = getOdsComponentScreens(component.slug);` 는 유지 — 이제 OdsDocTabs로 전달됨.)

- [ ] **Step 3: 구 CSS 제거 + 카드 CSS 추가**

`<style>` 블록에서 구 `.ods-used-in*` 규칙 6줄 삭제:
```css
  .ods-used-in { margin-top: 32px; }
  .ods-used-in__title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
  .ods-used-in__list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
  .ods-used-in__link { display: inline-flex; padding: 8px 14px; border: 1px solid var(--c-border); border-radius: 999px; font-size: 13px; font-weight: 600; text-decoration: none; color: var(--c-text); }
  .ods-used-in__link:hover { background: var(--c-bg-elev); }
  .ods-used-in__link:focus-visible { outline: 2px solid var(--c-text); outline-offset: 2px; }
```
그리고 같은 `<style>` 블록 끝(다른 `:global(.ods-theme ...)` 근처)에 카드 CSS 추가(React 출력이라 `:global` 필수):
```css
  :global(.ods-theme .ods-screens-grid) { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; padding: 16px 0; }
  :global(.ods-theme .ods-screen-card) { display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: inherit; }
  :global(.ods-theme .ods-screen-card__thumb) { aspect-ratio: 9 / 16; border-radius: 12px; overflow: hidden; background: var(--c-bg-elev); border: 1px solid var(--c-border); }
  :global(.ods-theme .ods-screen-card__thumb img) { width: 100%; height: 100%; object-fit: cover; display: block; }
  :global(.ods-theme .ods-screen-card__ph) { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 12px; color: var(--c-text-soft); text-align: center; padding: 8px; }
  :global(.ods-theme .ods-screen-card:hover .ods-screen-card__thumb) { border-color: var(--c-text); }
  :global(.ods-theme .ods-screen-card:focus-visible .ods-screen-card__thumb) { outline: 2px solid var(--c-text); outline-offset: 2px; }
  :global(.ods-theme .ods-screen-card__meta) { display: flex; flex-direction: column; gap: 2px; }
  :global(.ods-theme .ods-screen-card__label) { font-size: 13px; font-weight: 600; color: var(--c-text); }
  :global(.ods-theme .ods-screen-card__domain) { font-size: 12px; color: var(--c-text-soft); }
```

- [ ] **Step 4: 빌드 + e2e 검증**
```bash
cd ohouse-design-site && npx astro build 2>&1 | tail -3
TAB=dist/ods/components/tab/index.html
echo '-- Screens 탭 트리거 존재 --'; grep -c 'data-doc-tab-trigger="screens"' "$TAB"
echo '-- 카드 그리드 + content-tab 링크 --'; grep -c 'ods-screen-card' "$TAB"; grep -o 'href="/d/house-tour/s/content-tab"' "$TAB" | head -1
echo '-- 썸네일 src --'; grep -o 'src="/thumbnails/house-tour/content-tab.webp"' "$TAB" | head -1
echo '-- 구 standalone 섹션 제거(0) --'; grep -c 'ods-used-in' "$TAB" || true
echo '-- card 컴포넌트엔 Screens 탭 없음(0) --'; grep -c 'data-doc-tab-trigger="screens"' dist/ods/components/card/index.html || true
```
Expected: build `Complete!`; tab 페이지에 `data-doc-tab-trigger="screens"` 1, `ods-screen-card` ≥1, content-tab 링크·썸네일 src 존재, `ods-used-in` 0; card 페이지 screens 탭 0.

- [ ] **Step 5: 커밋**
```bash
git add "ohouse-design-site/src/pages/ods/components/[slug].astro"
git commit -m "feat: move using-screens into OdsDocTabs Screens tab as preview cards"
```

---

## Self-Review (작성자 체크)
- **커버리지**: thumb·domainLabel=Task1 / Screens 탭+카드=Task2 / 전달·제거·CSS·e2e=Task3. 빈 처리(screens 0 → 탭 없음)=Task2 filter. 미썸네일 플레이스홀더=Task2 카드 분기.
- **Placeholder**: 코드·명령 구체화. 없음.
- **일관성**: `screens` prop / `getOdsComponentScreens`의 `thumb·domainLabel·href` / `ods-screen-card*` 클래스 전 태스크 일관. Task3은 Task1(thumb)·Task2(prop)에 의존(순서 고정).
- **주의**: 카드 CSS는 `:global(.ods-theme …)` (React 출력이라 astro scoped 미적용).
