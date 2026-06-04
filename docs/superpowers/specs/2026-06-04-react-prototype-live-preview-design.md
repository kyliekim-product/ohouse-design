# React Prototype Live Preview Design

## Purpose

일부 screen 프로토타입은 정적 HTML이 아니라 **Vite/React 앱**(예: `ohouse-design-context/tracks/contents/_pilot-sandbox`)으로 만들어져 있고, 이미 GitHub Pages로 배포되어 live URL로 접근 가능하다. 이 기능은 그렇게 **배포된 React 프로토타입을 screen 상세페이지에서 사용자가 원할 때 live로** 보여준다.

기존 정적 HTML 프리뷰 기능([2026-06-04-screen-html-preview-design.md](2026-06-04-screen-html-preview-design.md))은 그대로 두고, 그 위에 "배포된 앱을 가리키는 URL" 경로를 **상세페이지에 한정해 on-demand**로 추가한다.

## Background

### 현재 구조 (확인된 사실)

- 사이트 SSOT는 `ohouse-design-mcp/domains/<slug>/screens/<screen>/README.md`. 사이트는 **정적 Astro 빌드**(SSR 없음).
- screen 상세페이지(`ohouse-design-site/src/pages/d/[domain]/s/[screen].astro`)는 `getScreen(domainSlug, screenSlug)`(`repo.js`)의 데이터를 쓴다. 현재 프리뷰 aside는 `previewHtml`(정적 self-contained HTML, `<iframe srcdoc>`) → `thumb`(이미지) → placeholder 순으로 렌더한다.
- screens 리스트 카드(`ReferenceCard.astro`)는 `getAllBrowseCards`의 데이터를 쓰며 동일한 정적 우선순위를 따른다.

### 연결 대상 프로토타입

- `_pilot-sandbox`는 "콘텐츠 피드 전체 화면" React 프로토타입이다. Vite/React + 사내 `@bucketplace/*` 패키지 + emotion을 쓰며, `vite.config.ts`에 GitHub Pages base가 설정되어 있다.
- 배포 URL `https://deeer-glitch.github.io/ohouse-design-pilot-sandbox/`은 현재 live(HTTP 200, 마지막 배포 2026-04-27)이며, `X-Frame-Options`/CSP framing 제한 헤더가 없어 **iframe 임베드 가능**하다.

### 결정에 영향을 준 제약

- React 앱은 **JS 실행**이 필요하므로, 기존 정적 프리뷰의 `sandbox=""`(스크립트 차단)로는 렌더되지 않는다. live iframe은 `sandbox="allow-scripts allow-same-origin"`이 필요하다.
- 사이트 빌드에 프로토타입 빌드를 결합하면 사내 패키지 설치(Nexus) 결합·버전 충돌이 생긴다. 따라서 **사이트 빌드에는 프로토타입 빌드를 포함하지 않고**, 이미 배포된 URL을 가리키기만 한다.
- 프리뷰는 외부 배포(개인 GitHub 계정 `deeer-glitch`의 별도 저장소 GitHub Pages)에 의존한다. 이 의존은 수용하되, 아래 설계로 **정적 기본 + on-demand**로 만들어 실패가 치명적이지 않게 한다.

## Design

### 동작 (Behavior)

**리스트 카드(`ReferenceCard.astro`)** — 변경 없음. 기존대로 정적(previewHtml `srcdoc` → thumb → placeholder)만 렌더한다. live는 리스트에 띄우지 않는다. 따라서 리스트는 외부 배포에 의존하지 않고 성능 영향도 없다.

**screen 상세페이지(`[screen].astro`)** — 정적이 기본으로 먼저 표시된다(정적 우선). screen에 유효한 `prototypeUrl`이 있으면 프리뷰 영역에 두 개의 컨트롤이 추가된다.

1. **"▶ Live 프리뷰 보기" 버튼** — 클릭 전에는 live iframe을 만들지 않는다(네트워크 요청도 없다). 클릭하면 정적 프리뷰 영역 자리에 live iframe을 주입/표시한다(`iframe.src`를 클릭 시점에 설정). 다시 누르면 정적으로 되돌린다(토글).
2. **"↗ 새 탭에서 열기" 링크** — `prototypeUrl`을 새 탭으로 연다. 크로스오리진 iframe은 로드 실패를 신뢰성 있게 감지할 수 없으므로, 이 링크가 항상 동작하는 탈출구다.

배포가 깨져 있어도 정적 프리뷰는 그대로 보이며, live 영역만 비어 보인다.

### 데이터 (`repo.js`)

- screen README frontmatter에 신규 선택 필드 `prototype_url:`(https URL 문자열)을 추가한다.
- 순수 검증 헬퍼 `isValidPrototypeUrl(value)`를 export한다. 다음일 때만 `true`:
  - 값이 문자열이고,
  - `new URL(value)`로 파싱 가능하며,
  - 프로토콜이 `https:`이다.
  - 그 외(빈 값, 비문자열, `http:`, 파싱 실패)는 `false`.
- `getScreen(domainSlug, screenSlug)`의 반환 객체에 `prototypeUrl` 필드를 추가한다. `isValidPrototypeUrl(readme.prototype_url)`이 참이면 그 URL을, 아니면 `null`을 넣는다.
- **리스트 경로(`getDomainScreens`/`getAllBrowseCards`)는 변경하지 않는다.** 리스트는 live를 쓰지 않으므로 `prototypeUrl`을 노출할 필요가 없다.

### 렌더 (`[screen].astro`)

프리뷰 aside의 정적 우선순위(previewHtml → thumb → placeholder)는 그대로 둔다. 그 위에:

- `screen.prototypeUrl`이 있을 때만, 프리뷰 영역에 빈 `<iframe>` 컨테이너(초기엔 `src` 미설정 또는 `hidden`)와 "▶ Live 프리뷰 보기" 토글 버튼, "↗ 새 탭에서 열기" 링크를 렌더한다.
- live iframe 속성: `sandbox="allow-scripts allow-same-origin"`, `loading="lazy"`, `title`. 정적 컨테이너와 같은 박스(상세 프리뷰 박스)를 채운다.
- 작은 클라이언트 `<script>`가 토글을 처리한다: 첫 클릭 시 `iframe.src = prototypeUrl`을 설정하고 정적↔live 표시를 토글한다. `prototypeUrl`은 `data-*` 속성으로 버튼/컨테이너에 전달한다.

### 보안

- `sandbox="allow-scripts allow-same-origin"`은 React 실행과 앱 자체 오리진 기능(스토리지/자산 fetch)에 필요하다. 프레임은 **크로스오리진**이므로 우리 페이지 DOM/스토리지엔 접근할 수 없다(allow-same-origin은 프레임 자신의 오리진에 대해서만 작동). 신뢰하는 내부 프로토타입만 `prototype_url`로 참조한다는 전제다.
- `src`는 사용자가 명시적으로 토글을 누른 시점에만 설정되어, 클릭 전에는 외부 로드가 일어나지 않는다.
- `isValidPrototypeUrl`로 https만 허용한다.

### 연결 example

`domains/house-tour/screens/content-tab/README.md` frontmatter에 다음을 추가한다.

```yaml
prototype_url: https://deeer-glitch.github.io/ohouse-design-pilot-sandbox/
```

content-tab은 "콘텐츠 피드 화면"이라 "콘텐츠 피드 전체 화면" 프로토타입과 의미상 맞는다. 이 screen은 이미 정적 `prototype_html`(Contents Landscape Card)이 연결돼 있으므로, 상세에서 정적 카드가 기본으로 보이고 "Live 프리뷰" 버튼으로 React 피드 앱을 띄울 수 있다.

## Verification

- 단위 테스트(`node:test`): `isValidPrototypeUrl`
  - `https://...` → true
  - `http://...` → false
  - 비문자열(`null`, 숫자)·빈 문자열 → false
  - 파싱 불가 문자열(`"not a url"`) → false
- 데이터: `getScreen('house-tour','content-tab').prototypeUrl`이 example URL과 일치. `prototype_url` 없는 screen은 `null`.
- 빌드(`npx astro build`) 성공, 회귀 없음.
- 수동(dev): content-tab 상세에서 (1) 정적 프리뷰가 기본으로 보이고, (2) "▶ Live 프리뷰 보기" 클릭 시 pilot-sandbox가 iframe으로 로드되며, (3) 다시 클릭하면 정적으로 돌아오고, (4) "↗ 새 탭에서 열기"가 URL을 연다. `prototype_url` 없는 screen에는 버튼이 없다.

## Known Limitations

- **외부 배포 의존**: live 프리뷰는 `deeer-glitch` 개인 계정의 별도 저장소 GitHub Pages 배포에 의존한다. 배포가 내려가면 live만 안 뜨고 정적은 유지된다(graceful degradation). 회사 org로의 배포 이전은 이번 범위 밖.
- **로드 실패 미감지**: 크로스오리진 iframe은 로드 성공/실패 이벤트가 신뢰 불가 → "새 탭에서 열기"가 탈출구.
- **고정 프레임**: 콘텐츠 높이 자동맞춤 불가. 앱이 상세 프리뷰 박스 비율에 반응형으로 맞춰야 한다.
- **런타임 외부 자산**: 프로토타입 앱이 런타임에 부르는 이미지/폰트 등 외부 자산의 가용성에도 영향을 받는다.

## Out of Scope

- 리스트 카드에서의 live 렌더 및 지연마운트(IntersectionObserver) — 리스트는 정적 유지.
- 사이트 빌드 시 프로토타입 빌드/번들(Approach B), 단일 파일 srcdoc 인라인(Approach C).
- 프로토타입의 회사 org 배포 이전, 빌드 산출물 스냅샷 커밋.
- live iframe 높이 자동맞춤(postMessage 리사이즈 등).
