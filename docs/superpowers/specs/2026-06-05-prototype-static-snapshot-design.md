# 라이브 프로토타입 → 정적 썸네일 자동 스냅샷

- **작성일**: 2026-06-05
- **브랜치**: `site-optimization-design-tuning-v.1`
- **관련**: 2b self-host 후속 ([[prototype-selfhost-2b]]) — content-tab 화면 상세의 정적/라이브 프리뷰 불일치 해소

## 문제

screen 상세페이지에는 정적 프리뷰(기본, JS 없이 즉시)와 라이브 프리뷰(온디맨드 토글, 상호작용) 두 가지가 있다. content-tab의 경우:

- **정적 프리뷰** = `prototype_html: tracks/contents/_pilot-load-test/result/attempt-1.html` — 4/30 파일럿 산출물로, **단일 Contents Landscape Card(3:2) 한 개**짜리 self-contained HTML. 화면 목업이 아니라 컴포넌트 1개 잔재.
- **라이브 프리뷰** = `prototype_app: prototypes/contents-feed/index.html` — 토픽바·필터칩·인기 캐러셀 등 **풀 콘텐츠 탭 화면** 전체(React 빌드).

둘은 원래 같은 산출물이 아니었고, 단일카드 파일럿 HTML이 정적 프리뷰 자리에 끼워져 있어 시각적으로 크게 어긋난다.

## 목표 / 역할 정의

- **정적 프리뷰 = 빠른 썸네일**: 라이브와 *같은 화면*을 JS 없이 가볍게 즉시 대표.
- **라이브 프리뷰 = 상호작용**: 실제 조작용 온디맨드.
- **동기화**: 사이트 빌드 시 정적 썸네일을 라이브에서 **자동 재생성** → 항상 일치.

## 비목표 (YAGNI)

- 정적 HTML 스냅샷(DOM 직렬화) 방식 — React+emotion(런타임 스타일)+원격 CDN 이미지+`sandbox=""`(JS 차단) 때문에 취약하여 채택 안 함.
- 여러 스크롤 위치/멀티 뷰포트 캡처 — 상단 한 컷만.
- content-tab 외 다른 화면 일괄 적용 — 스크립트는 확장 가능하게 두되 이번엔 content-tab 1개만 설정.
- dev에서 매 실행 캡처 — 커밋된 썸네일 사용.

## 접근

**시스템 Chrome 헤드리스 스크린샷 (npm 의존성 0)**. playwright/puppeteer는 postinstall 브라우저 바이너리가 사내 Nexus에 막히므로([[npm-bucketplace-registry]]) 배제. 시스템 Chrome + Node22 글로벌 `WebSocket`으로 CDP 직접 제어.

## 컴포넌트

### ① 캡처 스크립트 — `ohouse-design-site/scripts/snapshot-prototypes.mjs`

기존 `scripts/*.mjs`(`ensure-context.mjs`, `validate-*.mjs`) 컨벤션을 따르는 무의존 ESM 스크립트.

**입력(설정)**: 스크립트 상단 배열.
```js
const TARGETS = [
  {
    app: 'prototypes/contents-feed/index.html', // public/ 기준 경로
    out: '../ohouse-design-mcp/domains/house-tour/screens/content-tab/thumbnail.webp',
    viewport: { width: 390, height: 694, deviceScaleFactor: 2 }, // ≈ 9:16, thumb 박스와 일치
  },
];
```

**동작**:
1. 무의존 Node `http`/`fs` 정적 서버를 `ohouse-design-site/public/`에 띄움(에페메럴 포트). ES module + 상대 asset이 http로 로드돼야 하므로 `file://` 불가.
2. 시스템 Chrome(`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`)을 `--headless=new --remote-debugging-port=0 --hide-scrollbars --no-first-run --user-data-dir=<temp>`로 기동. 포트는 `DevToolsActivePort` 파일에서 읽음.
3. Node22 글로벌 `WebSocket`으로 CDP 연결 → `Page.enable`/`Network.enable`, `Emulation.setDeviceMetricsOverride`(뷰포트), `Page.navigate` → `Page.loadEventFired` + network idle(진행 중 요청 0이 N ms 유지) + 짧은 settle 대기 → `Page.captureScreenshot({ format: 'webp', quality, clip: 상단 viewport 영역 })`.
4. base64 디코드 → `out` 경로에 기록.
5. 모든 타깃 처리 후 Chrome·서버·temp 정리.

**graceful degradation**: Chrome 바이너리 부재, 기동 실패, 캡처 타임아웃 시 → `console.warn`만 남기고 **process exit 0**. 기존 커밋된 `thumbnail.webp` 유지. CI/오프라인에서 빌드 안 깨짐.

**경계/계약**: 입력 = TARGETS 설정 + 빌드된 `public/prototypes/*` 산출물. 출력 = 각 `out` 경로의 webp 파일. 사이트 코드와의 결합은 산출 파일 경로뿐(import 없음).

### ② frontmatter 전환 — `ohouse-design-mcp/domains/house-tour/screens/content-tab/README.md`

- `prototype_html: tracks/contents/_pilot-load-test/result/attempt-1.html` **줄 제거**.
- 렌더 로직(`[screen].astro`)이 `previewHtml ? srcdoc-iframe : thumb ? img-button(+라이트박스) : placeholder` 순서이므로, `prototype_html` 제거 시 `repo.js getScreen`의 thumb 탐색(`['thumbnail.png','thumbnail.webp']`)이 새 `thumbnail.webp`를 잡아 정적 프리뷰가 됨.
- 라이브 토글은 `prototype_app`(독립)이라 영향 없음.
- 파일럿 산출물 `attempt-1.html`은 context repo에 **유지**(다른 용도) — 참조만 끊음.

### ③ 빌드 연동 — `ohouse-design-site/package.json`

- `"snapshot:prototypes": "node scripts/snapshot-prototypes.mjs"` 추가.
- `build`를 `validate:ods-previews` → `snapshot:prototypes` → `astro build` 순으로 변경(astro build의 `getScreen`이 새 썸네일을 읽도록 **반드시 이전**에 실행). `prebuild`(bootstrap:context)는 유지.
- dev(`predev`/`astro dev`)에는 추가 안 함 → 커밋된 썸네일 사용, dev 속도 영향 없음.

## 데이터 흐름

```
prototypes/contents-feed (소스)
  └─(vite build, 수동)→ ohouse-design-site/public/prototypes/contents-feed/  [커밋됨]
                              │
            site build: snapshot:prototypes
              (http 서버 + Chrome CDP 캡처)
                              ↓
        content-tab/thumbnail.webp  [커밋됨]
                              │
              astro build → getScreen.thumb → 정적 프리뷰(img+라이트박스)
```

- **갱신 책임**: 프로토타입 소스 변경 시 `prototypes/contents-feed`에서 `vite build`(public 갱신) 후 사이트 빌드해야 썸네일이 최신 반영. 이 순서를 content-tab README 또는 스크립트 헤더 주석에 한 줄 명시.

## 에러 처리

| 상황 | 처리 |
|---|---|
| Chrome 바이너리 없음 | warn + exit 0, 기존 썸네일 유지 |
| CDP 연결/네비게이션 실패 | warn + 해당 타깃 skip, 다음 타깃 계속 |
| 캡처 타임아웃(렌더/네트워크) | warn + 해당 타깃 skip |
| `public/prototypes/<app>` 부재 | warn(빌드 안내) + skip |
| `out` 디렉터리 없음 | 생성 시도, 실패 시 warn+skip |

## 테스트 / 검증

- 빌드 후 `dist/d/house-tour/s/content-tab/index.html`의 정적 프리뷰가 `thumbnail.webp`(라이브 상단 화면 동일)를 가리키고, `srcdoc`(단일카드) 참조 없음.
- `getScreen('house-tour','content-tab').thumb`가 webp asset 경로, `previewHtml === null`.
- `npx astro build` green(69 pages).
- Chrome 경로를 일시적으로 가려도(또는 모의) 빌드 green + 경고 출력 → graceful 확인.
- 산출 webp 파일이 모바일 세로 비율(≈9:16)로 토픽바+필터+첫 피드 행 포함.

## 참조

- 프리뷰 렌더: `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro` (`.shead__thumb` `aspect-ratio: 9/16`)
- 데이터: `ohouse-design-site/src/lib/repo.js` (`getScreen` thumb/previewHtml/prototypeUrl, `resolveScreenPreviewHtml`)
- 2b 맥락: [[prototype-selfhost-2b]], Nexus 제약: [[npm-bucketplace-registry]]
