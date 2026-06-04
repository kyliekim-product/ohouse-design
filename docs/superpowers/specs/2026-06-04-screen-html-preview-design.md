# Screen HTML Preview Design

## Purpose

도메인 상세페이지와 Patterns(screens) 리스트의 프리뷰 카드는 현재 `thumbnail.png`(스크린샷) 또는 텍스트 placeholder만 보여준다. screen에 연결된 **self-contained HTML 프로토타입이 존재하면, 그 화면이 카드 안에 실제로 렌더되도록** 한다.

목표는 "screen에 연결된 self-contained HTML이 있으면 프리뷰 리스트 카드(및 상세페이지)에 실제로 렌더된다" 한 가지다. 이번 범위는 **렌더링 배관 + 기존 HTML 1건 연결**이며, screen README 대량 작성은 포함하지 않는다.

## Background

### 현재 구조 (확인된 사실)

- 사이트 SSOT는 `ohouse-design-mcp/domains/<slug>/`이다 (context 레포가 아님). 각 도메인 아래 `screens/ policies/ components/ experiments/`.
- screen 1개 = 폴더 `screens/<screen>/`: `README.md`(frontmatter + 본문), 선택적 `thumbnail.png`, 선택적 `prototype.html`.
- 구현 위치:
  - `ohouse-design-site/src/lib/repo.js`: `getDomainScreens`, `getAllBrowseCards`
  - `ohouse-design-site/src/components/ReferenceCard.astro`: 리스트 프리뷰 카드
  - `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro`: screen 상세 (프리뷰 aside)
- 현재 도메인 전체에 `prototype.html`/`thumbnail.*`이 하나도 없어 모든 카드가 placeholder를 보여준다.
- `screen.prototype`(prototype.html 경로)는 현재 상세페이지의 "Prototype source ↗" GitHub 링크로만 쓰이고, 렌더링에는 쓰이지 않는다.

### 결정에 영향을 준 제약

- **Astro는 정적 빌드**(SSR 아님)다. `asset.astro`는 파일 서빙 엔드포인트가 아니라 정적 안내 페이지이며, repo.js가 만드는 `api/asset?path=...` URL을 실제 서빙하는 라우트가 없다. → 런타임 파일 서빙에 의존할 수 없으므로 **빌드 타임에 HTML을 읽어 iframe `srcdoc`로 인라인**한다.
- 연결할 HTML은 **context 레포**(`ohouse-design-context`)에 있다. 현재 self-contained로 iframe 렌더 가능한 파일은 `tracks/contents/_pilot-load-test/result/attempt-1.html`(inline `<style>` 단일 파일, Contents Landscape Card 3:2) 1건이다. `tracks/contents/_pilot-sandbox/index.html`은 Vite/React 앱(`/src/main.tsx` 의존)이라 빌드 없이는 렌더 불가하다.

## Design

### A. 데이터 브리지 — screen ↔ context HTML

screen README frontmatter에 참조 필드를 추가한다.

```yaml
prototype_html: tracks/contents/_pilot-load-test/result/attempt-1.html  # CONTEXT_ROOT 기준 상대경로
```

`getDomainScreens`(repo.js)가 각 screen에 대해:

1. README frontmatter의 `prototype_html`을 읽는다. 있으면 `CONTEXT_ROOT` 기준으로 절대경로 해석.
2. 없으면 기존 관례대로 screen 폴더 내 로컬 `prototype.html`/`prototype.htm`을 찾는다 (`ROOT` 기준).
3. 후보 파일이 존재하면 **self-contained 검사**를 통과할 때만 채택한다.
4. 채택된 파일 내용을 문자열로 읽어 `previewHtml`로 노출한다.

두 경로(context 참조 / 로컬 prototype.html)는 모두 동일한 `previewHtml` 문자열로 수렴한다. 기존 `prototype` 필드(GitHub 링크용 상대경로)는 그대로 유지한다.

**self-contained 검사** — 다음 중 하나라도 있으면 부적합으로 보고 `previewHtml`을 만들지 않는다 (placeholder/thumb fallback으로 자연 강등):

- `<script ... src="...">` (외부 스크립트 참조)
- `<script type="module">` 또는 `type="module"`을 가진 `<script src>` (번들러 진입점)
- `<link ... rel="stylesheet" ... href="...">` (외부 스타일시트 참조)

inline `<style>`, inline `<script>`(외부 참조 없는), data/absolute URL 이미지는 허용한다. `attempt-1.html`은 통과, `_pilot-sandbox/index.html`은 module script로 인해 제외된다.

### B. 렌더 — iframe srcdoc + 스크린샷 fallback

`ReferenceCard.astro`의 `.ref-card__phone` 렌더 우선순위:

1. `item.previewHtml`이 있으면 → `<iframe>` with `srcdoc={previewHtml}`, `sandbox`(스크립트 비허용 기본값으로 충분; 정적 마크업 렌더만), `loading="lazy"`, `tabindex="-1"`, `aria-hidden="true"`. CSS로 `pointer-events: none`(카드 링크 클릭 보존), 카드 프레임 비율에 맞춰 `transform: scale()` 또는 width/height 100%로 맞춘다.
2. 없고 `item.thumb`가 있으면 → 기존 `<img class="ref-card__shot">`.
3. 둘 다 없으면 → 기존 `.ref-card__placeholder`.

screen 상세페이지 `[screen].astro`의 프리뷰 aside(`.shead__thumb`)도 동일 우선순위를 적용한다. iframe은 상세에서는 더 큰 크기로, 상호작용 없이(또는 추후 상호작용 허용은 별도) 정적 렌더한다. 기존 `screen.thumb` 라이트박스 동작은 thumb fallback일 때만 유지한다.

### C. 데이터 전달 경로

`getDomainScreens`가 screen 객체에 `previewHtml`을 추가 → `getAllBrowseCards('screens')`가 카드 item에 `previewHtml`을 실어 보냄 → `ReferenceCard`가 소비. 상세페이지는 `getScreen`/`getDomainScreens` 결과의 `previewHtml`을 직접 사용.

### D. 기존 HTML 연결

`tracks/contents/_pilot-load-test/result/attempt-1.html`(Contents Landscape Card)을 가장 관련 있는 기존 screen에 `prototype_html`로 연결한다. 1차 대상은 `domains/house-tour/screens/content-tab/`(`linked_yaml_components`에 `ContentsLandscapeCard` 포함)이다. 이는 파이프라인을 실제 데이터로 검증하기 위한 대표 연결이며, 컴포넌트 카드 프리뷰가 screen 카드 자리에 렌더된다.

> 주의: attempt-1.html은 전체 화면 mock이 아니라 컴포넌트(카드) 프리뷰다. 따라서 이 연결은 "렌더 파이프라인 검증"이 목적이며, 더 적합한 full-screen HTML이 생기면 교체한다.

## Verification

- `npm run dev` / build 후 Patterns(screens) 리스트에서 `house-tour/content-tab` 카드에 attempt-1 HTML이 iframe으로 렌더된다.
- 해당 screen 상세페이지 프리뷰 aside에도 동일 HTML이 렌더된다.
- `prototype_html`이 없는 다른 screen 카드/상세는 기존 placeholder(또는 thumb)를 그대로 유지한다 (회귀 없음).
- 카드의 링크 클릭이 iframe에 가로채이지 않고 screen 상세로 정상 이동한다 (`pointer-events: none` 확인).
- `_pilot-sandbox/index.html`을 `prototype_html`로 지정해도 self-contained 검사에서 제외되어 placeholder로 강등된다.

## Known Limitations

- **리스트 다수 iframe 성능**: 각 iframe은 별도 문서라 self-contained HTML이 늘면 리스트가 무거워진다. 현재 1건이라 무관하나, 향후 IntersectionObserver 기반 지연 마운트(placeholder → 뷰포트 진입 시 iframe 주입)로 확장한다. 이번 범위 밖.
- **srcdoc 페이지 무게**: HTML을 페이지에 인라인하므로 큰 HTML은 빌드 산출물 크기를 키운다. attempt-1.html(~3KB) 수준에서는 무시 가능.
- **컴포넌트 vs 화면 불일치**: 현재 연결 가능한 HTML이 full-screen mock이 아닌 컴포넌트 프리뷰다 (위 D 주의 참조).
- **self-contained 검사는 휴리스틱**: 외부 참조를 정규식으로 감지한다. 인라인이지만 런타임 fetch를 하는 스크립트 등 엣지 케이스는 잡지 못한다. sandbox로 위험을 제한한다.

## Out of Scope

- Policies 탭 콘텐츠 채우기 (별도 작업).
- context screens 문서 → mcp 대량 distill (현재 갭이 거의 없음).
- 새 self-contained HTML/full-screen mock 저작.
- iframe 내 상호작용 허용(스크롤/클릭) 및 지연 마운트 최적화.
