# 스크린 ↔ ODS 컴포넌트 링크 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스크린 상세 ODS Components 탭 항목을 Design System 컴포넌트 상세(`/ods/components/<slug>`)로 링크하고(정방향), ODS 상세에 "이 컴포넌트를 사용하는 스크린"을 표시한다(역방향). 매칭은 이름 정규화.

**Architecture:** 순수 매처 `resolveOdsSlug(name, catalog)`가 `linked_yaml_components` 이름을 ODS 카탈로그(`getOdsComponents()`)의 slug/title과 정규화 비교한다. `getScreenComponentUsage`가 ODS 항목에 `href`를 붙이고(정방향), `getOdsComponentScreens(slug)`가 전 스크린을 역인덱스한다(역방향). content-tab 데이터를 실제 ODS명으로 보정해 시연 가능하게 한다.

**Tech Stack:** Astro, Node 22(ESM), `@bucketplace/ods-site-content`(카탈로그, 읽기).

---

## File Structure
- **Modify** `ohouse-design-site/src/lib/repo.js` — `resolveOdsSlug`(export), `getScreenComponentUsage` ODS 항목 `odsSlug`/`href`, `getOdsComponentScreens`(export); `getOdsComponents` import.
- **Create** `ohouse-design-site/src/lib/repo-ods-link.test.mjs` — `resolveOdsSlug` 단위 테스트.
- **Modify** `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro` — ODS 카드 링크화 + 링크 CSS.
- **Modify** `ohouse-design-site/src/pages/ods/components/[slug].astro` — "사용 스크린" 섹션 + CSS.
- **Modify** `ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md` — `linked_yaml_components` 보정.

---

## Task 1: `resolveOdsSlug` 매처 + 단위 테스트

**Files:** Modify `ohouse-design-site/src/lib/repo.js`; Create `ohouse-design-site/src/lib/repo-ods-link.test.mjs`.

- [ ] **Step 1: 실패 테스트**

`ohouse-design-site/src/lib/repo-ods-link.test.mjs`:
```js
import assert from 'node:assert/strict';
import { resolveOdsSlug } from './repo.js';

const catalog = [
  { slug: 'tab', title: 'Tab' },
  { slug: 'chip', title: 'Chip' },
  { slug: 'thumbnail', title: 'Thumbnail' },
  { slug: 'scrap-button', title: 'Scrap Button' },
  { slug: 'product-card', title: 'Product Card' },
];

assert.equal(resolveOdsSlug('Tab', catalog), 'tab');
assert.equal(resolveOdsSlug('chip', catalog), 'chip');
assert.equal(resolveOdsSlug('Thumbnail', catalog), 'thumbnail');
assert.equal(resolveOdsSlug('ScrapButton', catalog), 'scrap-button');   // PascalCase → kebab slug
assert.equal(resolveOdsSlug('Scrap Button', catalog), 'scrap-button');  // title, 공백 무시
assert.equal(resolveOdsSlug('ProductCard', catalog), 'product-card');
assert.equal(resolveOdsSlug('ContentsLandscapeCard', catalog), null);   // 미매칭
assert.equal(resolveOdsSlug('', catalog), null);

console.log('repo-ods-link tests passed');
```

- [ ] **Step 2: 실패 확인**

Run: `cd ohouse-design-site && node src/lib/repo-ods-link.test.mjs`
Expected: FAIL — `does not provide an export named 'resolveOdsSlug'`.

- [ ] **Step 3: 구현**

`src/lib/repo.js` 상단 import에 추가(다른 import 근처):
```js
import { getOdsComponents } from './ods-content.js';
```
그리고 `withBase` 정의 뒤(또는 `screenThumbUrl` 근처)에 추가:
```js
// linked_yaml_components 이름을 ODS 카탈로그(slug/title)와 정규화 비교해 ODS slug 로 해석. 미매칭 null.
export function resolveOdsSlug(name, catalog) {
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = norm(name);
  if (!target) return null;
  for (const c of catalog) {
    if (norm(c.slug) === target || norm(c.title) === target) return c.slug;
  }
  return null;
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd ohouse-design-site && node src/lib/repo-ods-link.test.mjs`
Expected: PASS — `repo-ods-link tests passed`.

- [ ] **Step 5: 커밋**
```bash
git add ohouse-design-site/src/lib/repo.js ohouse-design-site/src/lib/repo-ods-link.test.mjs
git commit -m "feat: resolveOdsSlug — normalize-match linked component name to ODS slug"
```

---

## Task 2: content-tab 데이터 보정

**Files:** Modify `ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md`.

- [ ] **Step 1: frontmatter 교체**

`linked_yaml_components: [ContentsLandscapeCard, ContentsPortraitCard]` 줄을 아래로 교체:
```yaml
linked_yaml_components: [Tab, Chip, Thumbnail, ScrapButton, Dialog]
```
(content-tab 프로토타입이 실제 사용하고 ODS 카탈로그 20개에 매칭되는 컴포넌트.)

- [ ] **Step 2: 검증 (이름 보존 + 카탈로그 매칭)**

Run:
```bash
cd ohouse-design-site && node --input-type=module -e "
import { getOdsComponents } from './src/lib/ods-content.js';
import { resolveOdsSlug } from './src/lib/repo.js';
const cat = getOdsComponents();
for (const n of ['Tab','Chip','Thumbnail','ScrapButton','Dialog']) console.log(n, '->', resolveOdsSlug(n, cat));
"
```
Expected: 각각 `tab`, `chip`, `thumbnail`, `scrap-button`, `dialog` (모두 비-null). 만약 어떤 이름이 null이면 카탈로그에 없는 것이므로 그 항목은 `linked_yaml_components`에서 제외하고 다시 검증.

- [ ] **Step 3: 커밋**
```bash
git add ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md
git commit -m "data: point content-tab linked_yaml_components at real ODS components"
```

---

## Task 3: `getScreenComponentUsage` — ODS 항목에 href 부여

**Files:** Modify `ohouse-design-site/src/lib/repo.js`.

- [ ] **Step 1: ODS 매핑 보강**

`getScreenComponentUsage`의 ODS 매핑 블록:
```js
  const ods = (readme.linked_yaml_components || []).map((name) => ({
    slug: name,
    label: name,
    type: 'ods',
    source: 'linked_yaml_components',
  }));
```
을 아래로 교체:
```js
  const odsCatalog = getOdsComponents();
  const ods = (readme.linked_yaml_components || []).map((name) => {
    const odsSlug = resolveOdsSlug(name, odsCatalog);
    return {
      slug: name,
      label: name,
      type: 'ods',
      source: 'linked_yaml_components',
      odsSlug,
      href: odsSlug ? withBase(`ods/components/${odsSlug}`) : null,
    };
  });
```

- [ ] **Step 2: 검증**

Run:
```bash
cd ohouse-design-site && node --input-type=module -e "
import { getScreenComponentUsage } from './src/lib/repo.js';
const u = getScreenComponentUsage('house-tour','content-tab');
console.log(u.ods.map(o => o.label + ' -> ' + o.href));
"
```
Expected: 각 항목이 `Tab -> /ods/components/tab` 처럼 비-null href. (Task 2 완료 가정.)

- [ ] **Step 3: 커밋**
```bash
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: attach ODS detail href to screen ODS component usage"
```

---

## Task 4: 정방향 링크 렌더 — `[screen].astro` ODS 카드

**Files:** Modify `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro`.

- [ ] **Step 1: ODS 카드 링크화**

ODS 패널의 카드 렌더(아래 블록):
```astro
                      {componentUsage.ods.map((component) => (
                        <div class="screen-component-card">
                          <div class="screen-component-card__head">
                            <span>{component.label}</span>
                            <span class="badge badge--accent">ODS</span>
                          </div>
                          <p>linked_yaml_components</p>
                        </div>
                      ))}
```
을 아래로 교체(매칭 시 링크, 미매칭 시 평문):
```astro
                      {componentUsage.ods.map((component) => (
                        component.href ? (
                          <a class="screen-component-card screen-component-card--link" href={component.href}>
                            <div class="screen-component-card__head">
                              <span>{component.label}</span>
                              <span class="badge badge--accent">ODS ↗</span>
                            </div>
                            <p>Design System 컴포넌트 보기</p>
                          </a>
                        ) : (
                          <div class="screen-component-card">
                            <div class="screen-component-card__head">
                              <span>{component.label}</span>
                              <span class="badge badge--accent">ODS</span>
                            </div>
                            <p>linked_yaml_components</p>
                          </div>
                        )
                      ))}
```

- [ ] **Step 2: 링크 카드 CSS**

`<style>` 블록 끝부분에 추가:
```css
  a.screen-component-card--link { text-decoration: none; color: inherit; display: block; transition: background .15s, border-color .15s; }
  a.screen-component-card--link:hover { background: var(--c-bg-elev-2); border-color: var(--c-text); }
```

- [ ] **Step 3: 빌드 + 검증**

Run:
```bash
cd ohouse-design-site && npx astro build 2>&1 | tail -3
PG=dist/d/house-tour/s/content-tab/index.html
echo '-- ODS detail links present --'; grep -o 'href="/ods/components/[a-z-]*"' "$PG" | sort -u
```
Expected: build `Complete!`; `/ods/components/tab`, `/ods/components/chip`, `/ods/components/thumbnail`, `/ods/components/scrap-button`, `/ods/components/dialog` 노출.

- [ ] **Step 4: 커밋**
```bash
git add "ohouse-design-site/src/pages/d/[domain]/s/[screen].astro"
git commit -m "feat: link screen ODS component cards to Design System pages"
```

---

## Task 5: 역방향 인덱스 — `getOdsComponentScreens`

**Files:** Modify `ohouse-design-site/src/lib/repo.js`.

- [ ] **Step 1: 함수 추가**

`getScreenComponentUsage` 뒤에 추가:
```js
// 주어진 ODS slug 를 linked_yaml_components 로 사용하는 모든 스크린 목록(역인덱스).
export function getOdsComponentScreens(odsSlug) {
  const catalog = getOdsComponents();
  const out = [];
  for (const domain of getAllDomains()) {
    for (const screen of getDomainScreens(domain.slug)) {
      const readme = parseMd(join(ROOT, 'domains', domain.slug, 'screens', screen.slug, 'README.md'));
      const names = readme?.linked_yaml_components || [];
      if (names.some((n) => resolveOdsSlug(n, catalog) === odsSlug)) {
        out.push({
          domain: domain.slug,
          slug: screen.slug,
          label: screen.label,
          href: withBase(`d/${domain.slug}/s/${screen.slug}`),
        });
      }
    }
  }
  return out;
}
```
(`getAllDomains`, `getDomainScreens`, `parseMd`, `ROOT`, `withBase` 모두 repo.js 내 기존 심볼.)

- [ ] **Step 2: 검증**

Run:
```bash
cd ohouse-design-site && node --input-type=module -e "
import { getOdsComponentScreens } from './src/lib/repo.js';
console.log('tab:', getOdsComponentScreens('tab').map(s => s.domain + '/' + s.slug));
console.log('card(none expected):', getOdsComponentScreens('card').map(s => s.slug));
"
```
Expected: `tab: [ 'house-tour/content-tab' ]`; `card`는 `[]`(content-tab은 card 미사용). (Task 2 가정.)

- [ ] **Step 3: 커밋**
```bash
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: getOdsComponentScreens reverse index (screens using an ODS component)"
```

---

## Task 6: 역방향 렌더 — ODS 상세 "사용 스크린" 섹션 + e2e

**Files:** Modify `ohouse-design-site/src/pages/ods/components/[slug].astro`.

- [ ] **Step 1: import + 데이터**

`[slug].astro` frontmatter의 import에 `getOdsComponentScreens` 추가:
```js
import { getOdsComponentScreens } from '../../../lib/repo.js';
```
`const navigation = getOdsNavigation();` 아래에 추가:
```js
const usedInScreens = getOdsComponentScreens(component.slug);
```

- [ ] **Step 2: 섹션 마크업**

references 섹션(`{component.references.length > 0 && ( ... )}`) **바로 뒤**에 추가:
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

- [ ] **Step 3: CSS**

`[slug].astro`의 `<style>` 블록 끝에 추가(스코프 스타일):
```css
  .ods-used-in { margin-top: 32px; }
  .ods-used-in__title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
  .ods-used-in__list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
  .ods-used-in__link { display: inline-flex; padding: 8px 14px; border: 1px solid var(--c-border); border-radius: 999px; font-size: 13px; font-weight: 600; text-decoration: none; color: var(--c-text); }
  .ods-used-in__link:hover { background: var(--c-bg-elev); }
```
(`[slug].astro`에 `<style>` 블록이 없으면 `</Layout>` 다음에 `<style>…</style>` 추가.)

- [ ] **Step 4: 빌드 + e2e 검증**

Run:
```bash
cd ohouse-design-site && npx astro build 2>&1 | tail -3
echo '-- tab 상세에 content-tab 역링크 --'; grep -o 'href="/d/house-tour/s/content-tab"' dist/ods/components/tab/index.html | head -1
echo '-- 정방향 여전히 OK --'; grep -c 'href="/ods/components/tab"' dist/d/house-tour/s/content-tab/index.html
echo '-- card 상세엔 content-tab 없음(역링크 0) --'; grep -c 'href="/d/house-tour/s/content-tab"' dist/ods/components/card/index.html || true
```
Expected: build `Complete!`; tab 상세에 `/d/house-tour/s/content-tab` 링크 1; content-tab에 `/ods/components/tab` 링크 ≥1; card 상세엔 content-tab 역링크 0.

- [ ] **Step 5: 커밋**
```bash
git add "ohouse-design-site/src/pages/ods/components/[slug].astro"
git commit -m "feat: ODS component page lists screens that use it"
```

---

## Self-Review (작성자 체크)

- **Spec 커버리지**: ①매처=Task1 / ②정방향 데이터=Task3 / ③정방향 렌더=Task4 / ④역방향 인덱스=Task5 / ⑤역방향 렌더=Task6 / ⑥데이터 보정=Task2. 미매칭 평문/제외 = Task4(삼항)·Task5(some 필터). 모두 충족.
- **Placeholder**: 코드·명령·기대출력 구체화. 없음.
- **타입/이름 일관성**: `resolveOdsSlug(name, catalog)`/`odsSlug`/`href`/`getOdsComponentScreens` 전 태스크 일관. Task3·5는 Task1(resolveOdsSlug)에, Task4는 Task3에, Task6는 Task5+Task2에 의존(순서 고정).
- **주의**: Task2(데이터)는 Task3·5의 비-null 검증을 가능케 하므로 먼저 수행.
