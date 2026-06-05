# Playwright 기반 디자인 QA 검증 지침 (ODS 카탈로그 기준)

> ⬆ **상위 필수 참조**: 이 프로토콜 실행 전·중에 `references/qa-common-rules.md` 의 **공통 규칙 CR-1~CR-9** 를 먼저 통과해야 한다(page-type 불문). 아래 R1~R9 회귀 체크는 그 공통 게이트의 하위 절차다.

> htmlviaTrueSource 의 **Step 4 QA 표준 절차**. 주관적 미적 평가가 아니라 **이미 정의된 ODS 토큰·컴포넌트·에셋 카탈로그**를 단일 기준(ground truth)으로 실제 구현 화면의 정합성을 측정한다. prod 스크린샷 대조(기존 §4)는 **보조**, ODS 카탈로그 대조가 **1순위**다.

## 역할
Playwright(MCP)로 프로토타입(self-contained HTML 또는 ODS React)의 디자인 정합성을 검증하는 QA 에이전트. 모든 FAIL 은 **expected(ODS 카탈로그 값) / actual(computed style) / element(selector) / viewport** 4요소를 근거로 남긴다.

## 전제 — 기준 카탈로그는 ods-prototype 패키지에서 로드
검증 전 아래를 MCP로 조회해 **카탈로그 객체**를 만든다. (값 추정 금지 — 반드시 조회)

| 축 | MCP 도구 | 비고 |
|---|---|---|
| colors | `ods-prototype.get_tokens` (category=color) | semantic 명 + hex |
| typography | `ods-prototype.get_tokens` (category=text/typography) | textStyle: fontSize/weight/lineHeight/letterSpacing |
| spacing/radius/shadow | `get_tokens` + `get_token_migration_hints` | ODS는 spacing/radius semantic이 적음 → 컴포넌트 내장값/raw 허용범위 기록 |
| components | `list_components` / `get_component` / `list_recipes` / `get_recipe` | badge/card/list/divider/button/chip/tab… 명세 |
| assets | `search_asset`(image·lottie) / `search_icon` | 에셋·아이콘 카탈로그 |

카탈로그는 다음 구조로 정리해 `./preview/{slug}/catalog.json` 에 저장:
```json
{ "colors":{}, "typography":{}, "spacing":{}, "radius":{}, "shadow":{}, "components":{}, "assets":{} }
```

## 제외 영역 (구현·QA 공통 — 비교 대상 아님)
다음 영역은 **프리뷰 구현 범위에서 제외**하며, QA 정합성 비교에서도 **검증 대상에서 제외**한다 (글로벌 CLAUDE.md §2 규칙):
- **웹 네비게이션 영역 (GNB)** — 글로벌 상단 내비(로고·검색·장바구니·햄버거·카테고리 GNB). 서비스 공통 chrome.
- **statusbar 컴포넌트 영역** — OS 시스템 상태바(시간·배터리·신호·노치·home indicator). preview harness/OS chrome.

→ 이 영역들은 prod 대조·token/component/asset 검증·시각 회귀 대상에서 모두 제외한다. 측정/스크린샷 시 해당 영역을 mask 하거나 selector 범위에서 배제한다.
→ 단, 콘텐츠 바로 위의 **페이지 전용 헤더/탭(타이틀 바·콘텐츠 필터 탭 등)** 은 feature이므로 검증 포함.

## 실행 절차

### Step 1. 카탈로그 로드
위 표대로 ods-prototype MCP 조회 → `catalog.json` 작성. 이후 모든 비교의 기준값.

### Step 2. 대상 접속 (viewport별)
```
browser_resize 375 × 812   # 모바일 (필수 재확인 — 리셋 방지)
browser_navigate {{TARGET_URL}}
# 풀스크롤로 lazy-load 트리거 후 측정
```
console error / network failure 수집(`browser_console_messages`, `browser_network_requests`).

### Step 3. 항목별 computed 검증
각 항목은 `browser_evaluate`로 computed style/boundingBox를 추출해 카탈로그와 대조.

**3.1 컬러 토큰** — text/bg/border/CTA/hover·active·disabled/alert·badge·chip/focus-ring 색을 샘플링. raw hex/rgb 가 `catalog.colors` semantic 에 매핑되는지, 미정의 색 직접 사용 여부 확인.

**3.2 Typography** — heading/body/label/button/caption 의 font-family/size/weight/line-height/letter-spacing 을 `catalog.typography` scale 과 비교. 임의 px·비표준 weight 검출. 모바일/데스크탑 반응형 분리 측정.
```
[FAIL] H1 font-size가 typography.heading.xl과 다릅니다. Expected:40px Actual:36px Element:h1 Viewport:375
```

**3.3 Spacing/Layout** — padding/margin/gap/섹션간격/카드내부여백/grid gap 을 `boundingBox()`로 요소간 거리 계산해 `catalog.spacing` 과 비교. **요소 overlap·viewport 밖 넘침·horizontal scroll** 발생 여부 확인.

**3.4 Radius/Shadow/Border** — border-radius/width/color, box-shadow, divider, card/modal elevation 을 컴포넌트별 computed 로 확인. 미정의 shadow/radius·과도한 중첩 shadow 표시.

**3.5 컴포넌트 정합성 (핵심)** — Button/Input/Select/Checkbox/Radio/Tabs/Modal/Tooltip/**Card/Badge/List/Divider**/Toast/Table/Navigation/Pagination/Footer.
각 컴포넌트: size·color variant / state(default·hover·focus·active·disabled·loading·selected·error) / icon 위치 / label 정렬 / height·min-width·padding·border / focus visibility / keyboard nav / ARIA role·name 을 `catalog.components` 명세와 비교.
> **치환 원칙**: badge·card·list·divider 등은 임의 구현 금지 → 반드시 ODS 컴포넌트로 매핑·치환. 매핑 불가 신규 패턴은 `shared-components/CATALOG.md` 후보로 등록(아래 §신규 컴포넌트).

**3.6 에셋 카탈로그** — `img[src]`·`picture`·`background-image`·inline `svg` 를 `catalog.assets` 와 매칭. 미등록 에셋/외부 URL/깨진 이미지(naturalWidth=0)/alt 누락/비율·retina 확인.
```
[FAIL] 미등록 에셋 사용. Actual:/images/temp-hero-v2.png Element:img[alt="hero"]
```
> **이모지/임의 글리프 금지** (SKILL.md §3.2.2) — 자산은 반드시 ODS asset/icon. 이모지 정규식 스캔 0건 필수.

**3.7 시각 회귀(선택)** — 기준 스크린샷이 있으면 `toHaveScreenshot()` 또는 prod-full 대조. 동적 데이터(날짜·유저명·광고·애니메이션) masking.

### Step 4. 상태(state) 검증
상태형 컴포넌트는 default/hover/focus/active/disabled/loading/open/selected/error/success 를 가능 범위에서 확인(클릭·hover 시뮬레이션).

### Step 5. 리포트 작성 → `./preview/{slug}/qa.md`

## 리포트 형식
```markdown
# Design QA Report
## Summary
- Target URL / Tested pages / Viewports / Total checks / Passed / Failed / Warnings
## Critical Issues
## Token Mismatches
| Severity | Category | Expected | Actual | Element | Viewport |
## Component Issues
| Severity | Component | State | Issue | Element | Viewport |
## Asset Issues
| Severity | Asset | Issue | Element |
## Responsive Issues
| Severity | Viewport | Issue | Element |
## Accessibility Issues
| Severity | Criterion | Issue | Element |
## Screenshots
| Page | Viewport | Screenshot |
## Recommendations  (Critical → High → Medium → Low)
## Console / Network  (error·실패 로그)
```

## Severity 기준
- **Critical**: 기능 사용 불가 / 버튼·입력 미표시·클릭불가 / 모바일 레이아웃 붕괴 / 텍스트 심각 잘림 / 접근성 핵심 실패
- **High**: 주요 컴포넌트가 DS와 상이 / 핵심 브랜드 컬러·폰트 불일치 / CTA 상태 스타일 오류 / 미등록 주요 에셋(이모지 포함)
- **Medium**: spacing·radius·shadow 일부 불일치 / 보조 컴포넌트 상태 누락
- **Low**: 미세 픽셀차 / 비핵심 아이콘·이미지 차 / 사소한 줄바꿈

## 회귀 방지 체크리스트 (실제 결함 기반 — 필수 자동 검사)
> 아래는 과거 QA가 **놓친** 결함들이다. 원인은 대부분 "computed 숫자만 보고 시각/상태/맥락을 안 본 것". 각 항목을 자동 검사로 강제한다.

### R1. Stateful 컴포넌트는 숫자 검증 + **상태별 시각 diff** 둘 다 (Tab/Chip/Button/Toggle)
- **누락 원인**: 탭의 font/height/color computed 값만 숫자로 통과시키고, 실제 렌더 모양·active 상태 전환을 시각 확인 안 함 → 숫자는 맞지만 UI가 깨져도 통과.
- **검사**: 각 stateful 컴포넌트를 **default + active/selected (+ hover)** 상태로 `browser_click` 후 **element 스크린샷**을 떠 prod 대비 시각 비교. 클릭 시 active 스타일이 실제로 적용·이동하는지 확인. ODS 컴포넌트(예: 필터탭=Chip)와 **구조 매핑**도 함께 확인.
```js
// 탭/칩: 각 항목 클릭→active class 이동 + 박스(h/radius/bg/색) 시각 일치 확인
```

### R2. 가로 캐러셀 좌측 inset 은 **scrollLeft=0 에서 시각 위치**로 검증 (offset 환산 금지)
- **누락 원인**: 첫 카드 위치를 `rect.left - row.left + row.scrollLeft`(=offsetLeft)로 측정 → scroll-snap이 padding 을 먹어 `scrollLeft=16`으로 자동 스냅돼도 환산값이 16이라 "정상" 오판. 실제 화면은 카드가 좌측에 붙음(visual 0).
- **검사**: 로드 직후 `scroll-row.scrollLeft===0` 확인 + 첫 카드 **시각 위치** `rect.left - row.left === 16`(scrollLeft 더하지 말 것). 둘 중 하나라도 어긋나면 FAIL.
- **원인 패턴**: `scroll-snap-type` + 자식 `scroll-snap-align:start` 는 컨테이너 `padding-left` 를 스냅이 먹는다 → 컨테이너에 **`scroll-padding-left:16px`** 필수.
```js
[...document.querySelectorAll('.scroll-row')].map(r=>({sl:r.scrollLeft, vis:Math.round(r.children[0].getBoundingClientRect().left-r.getBoundingClientRect().left)}))
// 기대: 모두 {sl:0, vis:16}
```

### R3. 카드/리스트/섹션 배경은 **명시적 fill + 컨테이너 대비** 확인 (투명 누락 탐지)
- **누락 원인**: 카드에 `background` 미지정(transparent)이라 흰 프레임 위 흰 카드로 보여 "배경 누락". border만 있고 fill 없음. QA가 배경색을 검사 안 함.
- **검사**: 모든 card/list/section 의 `backgroundColor !== 'rgba(0,0,0,0)'` (catalog 에 fill 정의된 경우) + **카드 bg ≠ 직계 컨테이너 bg**(elevation 대비). prod 가 회색 섹션+흰 카드면 동일 구조(섹션 fill + 카드 fill) 재현됐는지 확인.
```js
const card=document.querySelector('.block'); const sec=card.parentElement;
const cb=getComputedStyle(card).backgroundColor, sb=getComputedStyle(sec).backgroundColor;
// FAIL: cb==='rgba(0, 0, 0, 0)' || cb===sb (카드가 투명이거나 섹션과 동일 → 대비 없음)
```

### R4. (보강) 장식용 컨테이너 박스 환각 금지
- prod 에 없는 아이콘 배경 박스/그리드/래퍼를 임의 추가하지 않는다. 리딩 아이콘은 prod 노드의 box 유무를 확인(climbToBg 가 카드까지 올라가면 전용 박스 없음 = 이미지만 렌더).

### R5. 캐러셀 카드 **콘텐츠 완전성** — 전 카드 데이터 매핑 검증 (lazy-load 함정)
- **누락 원인**: 화면에 보이는 앞쪽 2~3장만 이미지 확인하고 통과 → 가로 캐러셀의 lazy 카드(오프스크린)는 이미지 누락(`img:""`)인 채 방치. 추출 시 섹션이 **세로로 안 보이는 상태**에서 가로 스크롤하면 IntersectionObserver가 발화 안 해 이미지 안 붙음.
- **추출 규칙**: 캐러셀 데이터는 **첫 호출 시점에 전체를 캡처**해 카드별 메타 노드에 매핑한다. ① 섹션을 `scrollIntoView({block:'center'})`로 **세로로 먼저 노출** → ② 컨테이너 `scrollLeft`를 끝까지 단계 스크롤(대기 100ms+) → ③ 전 카드의 img/meta/text 추출.
- **검사**: 각 캐러셀에서 `카드 수 === 데이터 수` AND **모든 카드가 자기 이미지/메타를 보유**(placeholder URL·빈 bg 0건). 일부만 이미지면 FAIL.
```js
[...document.querySelectorAll('.scroll-row')].map(r=>({cards:r.children.length, withImg:[...r.children].filter(c=>/url\(/.test((c.querySelector('[style*=background]')||{}).getAttribute?.('style')||'')||c.querySelector('img')).length}))
// 기대: 모든 row 에서 cards === withImg
```

### R6. **모든** 인터랙션 컨트롤 그룹을 개별 검증 (샘플링 금지)
- **누락 원인**: 탭/칩 그룹 중 하나(예: 직영시공 탭)만 클릭·동작 확인하고 "나머지도 같겠지" 가정 → 다른 그룹(시공사례 칩)이 핸들러 없이 stub(toast)이라 **클릭해도 active 토글·콘텐츠 호출이 안 됨**.
- **검사**: 페이지의 **각** 탭/칩/필터/토글 그룹을 개별로 `browser_click` → (a) active class 이동, (b) **콘텐츠 반응**(목록 필터링 또는 콘텐츠 교체)이 실제 일어나는지 확인. 한 그룹이라도 클릭 무반응/stub 이면 FAIL(의도된 범위외 stub 은 spec 에 명시된 경우만 허용).
- 콘텐츠가 탭별로 다르면 **byTab 데이터**를 첫 호출 시 모두 적재해 클릭 시 교체(서버 refetch 흉내).

### R7. Tab/Nav 컴포넌트는 **ODS Tab 매핑** 필수 (ad-hoc 스타일 금지)
- **누락 원인**: 상단 카테고리 nav 를 임의값(파란 텍스트·full-width 언더라인·15px)으로 구현하고 ODS `Tab`(Tab.List/Item) 스펙에 매핑 안 함.
- **검사(ODS Tab 기준)**: active 인디케이터 = **2px 언더라인(텍스트 폭, bottom:0)**, active 텍스트 = `foreground`(#141414) / idle = 약한 색, **가로 스크롤**, font 은 prod/Storybook 실측(이 페이지: 13px). active 를 brand 텍스트 색으로 칠하거나 셀 full-width 언더라인이면 FAIL. (인디케이터 색은 prod=ohouse brand #00A1FF / ODS 기본 #141414 중 타깃 기준에 맞춤.)

### R8. 배너/미디어 슬롯 — 이미지 종횡비 + 슬롯 배경 검증 (잘못된 bg/크롭 방지)
- **누락 원인**: 배너 캐러셀에 **세로(portrait) 이미지(254×480)** 가 섞여 들어가 가로 슬롯(343×96)에 `cover`로 크롭되며 의미 없는 회색 띠로 렌더. 또 슬롯에 **임의 하드코딩 배경색**(peach #F6E6D4·gray #F1F3F4)이 남아 이미지 뒤로 잘못 노출. 슬라이드 1만 보고 나머지 미검증.
- **검사**:
  1. 슬롯에 들어가는 **모든** 미디어의 `naturalWidth/naturalHeight` 종횡비가 슬롯 종횡비에 부합하는지(가로 배너에 portrait 금지). 캐러셀이면 **전 슬라이드** 개별 확인(slide 1만 X).
  2. 미디어 뒤 컨테이너 배경은 **임의 hex 금지** — `object-fit:cover`로 풀필하거나 prod 슬롯 bg(토큰)와 일치. 남은 peach/gray 등 비토큰 bg 가 보이면 FAIL.
```js
[...document.querySelectorAll('.hero-slide')].map(s=>({ar:(s.naturalWidth/s.naturalHeight).toFixed(2), fit:getComputedStyle(s).objectFit}))
// 가로 배너 슬롯 기대: ar≈3.3~3.6 (portrait 0.5x 같은 값이면 FAIL), fit:cover
```

### R9. Lottie 에셋은 **loop autoplay 플레이어**로 렌더 (정적 프레임 금지)
- `search_asset` 결과 **type:"lottie"** 인 에셋은 정적 이미지/단일 프레임이 아니라 **반복재생 플레이어**로 렌더한다.
- self-contained HTML: `<lottie-player>`(또는 dotlottie-player) CDN + `loop autoplay` 속성. React: `lottie-react`/`@dotlottie/react-player` 에 `loop autoplay`.
```html
<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
<lottie-player src="{lottieJsonUrl}" background="transparent" speed="1" loop autoplay style="width:..;height:.."></lottie-player>
```
- **검사**: lottie 에셋 사용처가 `loop`+`autoplay` 인지, 정적 PNG/첫 프레임으로 대체되지 않았는지 확인.

## 주의사항
- 주관적 표현(“예쁘지 않다”) 금지 — 토큰·명세·카탈로그 기준 + computed/boundingBox 근거.
- selector 또는 ARIA role/name 함께 기록. 동적영역은 회귀비교 제외.
- console error·network failure 별도 기록.
- viewport 리셋 방지: 모든 측정 evaluate 직전 `browser_resize 375 × 812` 재호출.
- **이모지/글리프 스캔은 UI·마크업(CSS content·아이콘 슬롯·라벨)만 대상.** 리뷰 본문 등 **사용자 생성 콘텐츠(DATA.text)의 이모지는 True Source 이므로 제외**(콘텐츠 문자열엔 스캔 적용 금지).
