# 공통 디자인 QA 규칙 (QA 위계 **상위 — 필수 참조**)

> htmlviaTrueSource 로 만든 **모든** 프로토타입의 QA(Step 4)는 page-type(랜딩·SDUI·코드렌더 리스트…)을 불문하고 **이 문서의 공통 규칙(CR-1~CR-9)을 먼저 통과**해야 한다. 개별 `./preview/{slug}/qa.md` 는 공통 규칙을 **재작성하지 말고 이 문서를 인용**하고, page-specific 발견만 기록한다.
>
> 근거: 지금까지 생성된 3개 아웃풋(`dailyhouse-moving`·`ohou-experts`·`o2o-consultation-list/consultations`)의 QA·flow 문서에 **흩어져 있던** 디자인 QA 항을 끌어올려(hoist) 중복을 제거하고, 2개 이상 아웃풋에서 반복된 문항을 "공통 규칙"으로 승격한 것이다.

---

## 0. QA 참조 위계 (hierarchy)

```
SKILL.md §4  (Step 4 QA 오케스트레이션 — "QA는 필수 산출물")
└─ ★ qa-common-rules.md  ← (이 문서) page-type 불문 공통 규칙 게이트 [필수, 최상위]
   ├─ design-qa-prompt.md  ← catalog(ODS) 기반 측정 프로토콜 + 회귀 체크리스트 R1~R9
   └─ ./preview/{slug}/qa.md  ← 각 output page-specific 발견·조치 (공통 규칙 결과를 인용)
```

**규칙 적용 순서 (QA 플로우에서 강제):**
1. `design-qa-prompt.md` Step 1 — ODS catalog 로드 (`catalog.json`)
2. **이 문서 CR-1~CR-9 공통 게이트** (page-type 불문 먼저 통과)
3. `design-qa-prompt.md` R1~R9 회귀 체크
4. page-specific 측정 → `qa.md` 작성 (공통 규칙 위반은 page-specific 보다 **한 단계 높은 severity** 로 분류)

---

## 1. 공통 문항 매트릭스 (cross-output 출현 = 공통 규칙 승격 근거)

`●`=해당 아웃풋 QA에서 실제 발견/적용, `·`=미해당/미발견. **2개 이상 = 공통(C)**, 1개 = page-specific(P).

| # | 문항 | moving | experts | consult | 기존 커버 | 위계 |
|---|---|:--:|:--:|:--:|---|:--:|
| CR-1 | 콘텐츠/leaf **환각 금지**(카피·개수·질문·hero 창작) & 실콘텐츠 누락 0 | ● | ● | ● | (신규) | **C** |
| CR-2 | **조건부/데이터구동 섹션 게이팅** + sticky/CTA **prod 실재 확인** | · | ● | ● | (신규) | **C** |
| CR-3 | **래퍼체인 공통 chrome 포함**(탭/헤더/푸터 누락 방지) | ● | ● | ● | (신규) | **C** |
| CR-4 | **컴포넌트 diff = 타이포 넘어** box·footprint·정렬·콘텐츠형태 + source-layer + **migration 3분류** + **node-capture 1순위** | ● | ● | ● | (신규) | **C** |
| CR-5 | **누적 패딩/세로 리듬/page-height** 회귀 | ● | ● | · | (신규) | **C** |
| CR-6 | **max-count/overflow crop** & count trim(avatar n+5, 숏컷) | · | ● | ● | (신규) | **C** |
| CR-7 | **ODS 미보유 → token 커스텀 + 사유 기록**(임의 마크업 금지) | ● | ● | ● | SKILL §3.5 | **C** |
| CR-8 | **asset 갈음**: 이모지/임의 글리프 금지, prod/ODS 자산 | ● | ● | ● | SKILL §3.2.2 / DQA §3.6 | **C** |
| CR-9 | **viewport 375 재고정** + **undefined CSS var → 요소 사라짐** 검사 | ○ | ● | ○ | SKILL §4.4 / DQA 주의 | **C** |
| CR-10 | **ODS 컴포넌트 정합 — selected/idle 토큰을 pseudo-element(`::before`)까지 노드 캡처**(임의 근사 금지) | · | · | ● | (신규·community) | **C** |
| CR-11 | **아이콘+라벨 단위 색 일관성**(icon fill = label color, legacy 불일치는 ODS 로 통일) | · | · | ● | (신규·community) | **C** |
| R1 | stateful 컴포넌트 상태별 **시각 diff**(tab/chip/button) | · | ● | ● | DQA R1 | C |
| R5 | 캐러셀 **lazy-load 전체 캡처 후 측정**(콘텐츠 완전성) | ● | ● | · | DQA R5 | C |
| R8 | 배너/미디어 **종횡비·슬롯 bg** + 애니메이션 프레임 masking | ● | ● | · | DQA R8 | C |
| — | **heading 계층(H1/H3) 일치** | · | ● | · | (DQA 3.x) | P |

> `○`(CR-9) = 명시적 측정은 experts 에서만 했으나 viewport 리셋·undefined var 는 **모든 측정에 영향**하는 절차적 규칙이라 공통으로 승격.
> DQA = `design-qa-prompt.md`.

---

## 2. 공통 규칙 상세 (CR-1 ~ CR-9)

각 규칙: **원인(어느 아웃풋에서 무엇이 샜나) → 검사(자동) → 판정**. R1~R9 와 중복되는 항목은 재서술하지 않고 DQA 를 가리킨다.

### CR-1. 콘텐츠/leaf 환각 금지 + 실콘텐츠 누락 0
- **원인**: experts §0 hero("오늘의집이 직접 시공합니다 🔨")가 prod에 없는 **창작** / §2 숏컷 개수 5(실제 4) / consultations 할인배너 카피·FAQ 3개 질문 **창작** / experts §7 CTA·footer 운영시간·법적고지 등 **실콘텐츠 누락**.
- **검사**:
  1. 모든 leaf 카피·항목 수·링크·질문은 **출처(raw-content / 레포 leaf 컴포넌트 / 노드 캡처)에서 추출**. 출처 없으면 `placeholder` 로 표기, **임의 생성 0건**.
  2. 코드렌더 페이지는 leaf 컴포넌트(예: `ConsultationFAQItem`)를 **읽어** 문자열·개수·동작 확정.
  3. prod에 있는 실콘텐츠(footer 링크·CTA·운영시간 등)가 proto에 **모두** 있는지 역방향 체크(누락 0).
- **판정**: 창작 카피/개수, 또는 실콘텐츠 누락 발견 시 **High**.

### CR-2. 조건부/데이터구동 섹션 게이팅 + sticky/CTA prod 실재 확인
- **원인**: consultations 할인배너를 **상시 노출**로 오인(실제 `{showBanner && …}`, showBanner=eligibility, 카피=API) / experts 하단 sticky 카톡 CTA가 **prod엔 없는데** proto가 추가.
- **검사**:
  1. `{cond && <X/>}` 류는 **상시 아님** → `conditional` + 게이팅 소스(flag/eligibility/API) 기록, **기본 비노출**. status(populated/loading/empty/error)에 넣지 말 것.
  2. sticky/fixed CTA·배너는 **prod에 실재하는지 먼저 확인** 후에만 재현(없으면 추가 금지). 페이지 콘텐츠 기준 fixed/sticky 요소 수가 prod와 일치하는지 검사.
- **판정**: 조건부 요소 상시 노출 또는 prod에 없는 sticky 추가 시 **High**.

### CR-3. 래퍼체인 공통 chrome 포함 (탭/헤더/푸터 누락 방지)
- **원인**: consultations 가 route named 컴포넌트(`ConsultationList`)만 보고 래퍼 `MyLayout`(=신청내역/받은문서/채팅 **탭**)을 누락 / experts footer 링크 다수 누락.
- **검사**: route 컴포넌트의 반환 JSX 에서 **`<*Layout>`·provider 래퍼를 app 레벨까지 재귀**로 따라가 공통 chrome(탭·헤더·네비·푸터)을 섹션 인벤토리에 포함. **페이지 = 래퍼 chrome + 본문**.
- **제외**: 단, **GNB·statusbar/OS chrome 는 의도적 제외**(CR 비교 대상 아님 — DQA "제외 영역"·CLAUDE.md §2). 타깃 렌더 컨텍스트(웹 vs 인앱 webview)를 먼저 고정해 어떤 chrome 을 포함할지 결정.
- **판정**: feature 공통 chrome(탭 등) 누락 시 **High**, footer/보조 chrome 누락 시 **Medium**.

### CR-4. 컴포넌트 diff — 타이포 넘어 + source-layer + migration 3분류 + node-capture 1순위
> **이 페이지 워크플로우의 핵심 QA 방법.** 집계 치수·타이포만 보면 "비슷하지만 다른" 프로토타입이 통과한다.
- **원인**: experts 카드 5종이 집계 치수만 맞고 UI 스펙(2-stack·badge 2종·blue star·정사각 이미지)이 상이 / §7을 가로막대로 오인(실제 **세로 podium**) / consultations 라벨 15px(실제 18)·아바타 placeholder(실제 사진)·leading 아이콘 tile(실제 tile 없음)·dot center(실제 top).
- **검사 (2레이어 + 3분류)**:
  - **레이어 1 (source)**: 각 컴포넌트 import 출처(ODS `@bucketplace/design-system` / 레거시 BDS `/bds` / `@bucketplace/o2o-react`)를 표기. prod가 BDS·o2o-react 면 ODS 프로토타입 = **migration 타깃**(1:1 아님).
  - **레이어 2 (computed)**: 타이포뿐 아니라 **box(border/radius/padding/height)·footprint(아이콘 타일 px)·자식 정렬(dot/overlay 위치 dy)·콘텐츠 형태(placeholder vs 실제 이미지)·max-count** 까지 추출·대조. styled ancestor(button/label/li)까지 climb, idle 상태는 `:not(.active)` 로 타겟.
  - **구조는 썸네일로 단정 금지** — 의심 섹션은 region 스크린샷으로 layout 확정(podium 사례).
  - **ground truth 우선순위**: ① **북마클릿 노드 캡처**(computed + un-minified React props: variant/size/checked/partners…) > ② Playwright computed > ③ 스크린샷. 캡처만이 gap·max-count·누락 링크를 잡는다.
  - **ODS 함정**: 아이콘 size 는 prod **아이콘폰트 nominal(18)** 을 SVG 에 그대로 복사 금지(보통 16이 시각 일치). 아이콘 `weight` 필수.
- **delta 3분류 → 조치**: ① **fidelity 갭**(같은 의도 다른 값) = **수정** / ② **migration 의도차**(legacy 색 `#2F3438`↔ODS `#141414`, BDS→ODS, Modal→BottomSheet) = **문서화** / ③ **자산 갈음**(도메인 일러스트→ODS 아이콘) = **문서화**.
- **판정**: fidelity 갭 = severity(차이 크기 기준), migration/자산 = info(문서화).

### CR-5. 누적 패딩 / 세로 리듬 / page-height 회귀
- **원인**: moving 페이지 높이 +270px(섹션 padding 누적 오버 + 비교표 행 분리) / experts 세로 리듬 압축 -577px(섹션 spacing 타이트 + 카드 높이 -25px).
- **검사**: 섹션별 시작 y(`boundingBox`)와 총 `pageHeight` 를 prod와 대조. 누적 drift(앞 섹션부터 점증)면 섹션 상하 padding 또는 카드 height 보정. **단, prod 동적 콘텐츠(지역 개인화·리뷰 수) 변동폭 내** 차이는 info.
- **판정**: 구조적 누락(섹션·요소) 기인이면 High/Missing, spacing 누적이면 Medium, 동적 변동폭 내면 info.

### CR-6. max-count / overflow crop & count trim
- **원인**: consultations 아바타 최대 6→**실제 4 + 4번째 ellipsis 오버레이**(`:nth-of-type(n+5){display:none}`) / experts 숏컷 5→**실제 4**.
- **검사**: 반복 요소(아바타·칩·숏컷·캐러셀 카드)의 **최대 노출 수**와 초과분 처리(hidden / "+N" / ellipsis 오버레이)를 prod(노드 캡처)와 일치. 데이터 수 ≠ 노출 수일 때 crop 규칙 명시.
- **판정**: max-count/overflow 처리 상이 시 **Medium**(시각 인지되면 High).

### CR-7. ODS 미보유 → token 기반 커스텀 + 사유 기록 (임의 마크업 금지)
- **원인**: moving 비교테이블·그린 슈퍼섹션 / experts filter-tab(light) / consultations dropdown·inactive chip(ODS Chip outlined=border0 → prod 1px `#E0E0E0` 미재현).
- **검사**: badge·card·list·divider·chip·tab·button 은 **무조건 ODS 컴포넌트 매핑**(SKILL §3.5). ODS가 못 내는 스타일(light-border dropdown/chip 등)만 **ODS semantic token 으로 커스텀** 후 `spec.md`/`qa.md` 에 사유 기록. 공통화 가치 있는 신규 패턴은 `shared-components/CATALOG.md` 후보 등록.
- **판정**: ODS 보유 컴포넌트를 임의 마크업한 경우 **High**, token 커스텀 + 사유기록은 통과.

### CR-8. asset 갈음 — 이모지/임의 글리프 금지
- DQA §3.6 + SKILL §3.2.2 그대로. **🏠👷👑★ 등 이모지·임의 손그림 SVG 로 자산 대체 금지.** prod 실자산(ohousecdn img / inline svg outerHTML) → `search_icon`/`search_asset` → 중립 placeholder 순. 정규식 스캔으로 UI/마크업 이모지 0건(사용자 생성 콘텐츠 텍스트는 제외). Lottie 는 `loop autoplay`(R9).
- **원인 사례**: experts 서비스 일러스트, consultations leading 아이콘·파트너 아바타, moving 책임보장 심볼 SVG.

### CR-9. viewport 375 재고정 + undefined CSS var 검사 (절차)
- SKILL §1b 경고 + §4.4 그대로. **모든 측정 evaluate 직전 `browser_resize 375 × 812` 재호출**(브라우저 재시작 시 desktop 520px 로 오염 → layout 값 오판; experts §7 podium 을 desktop 세로로 오측한 사례). **사용된 모든 `var(--x)` 가 `:root` 에 정의됐는지 검사**(미정의 시 요소가 transparent 로 사라짐 — experts §7 회색막대 `--backgroundWeak` 누락 버그).

### CR-10. ODS 컴포넌트 정합 — selected/idle 토큰을 **pseudo-element 까지** 노드 캡처로 확정 (임의 근사 금지)
- **원인**: community 칩을 ODS Chip "근사" 로 만듦 → `1px #E0E0E0 border + fs15 + idle #8C8C8C`. 실제 prod ODS Chip 은 **active border 가 `::before { border:1px solid #141414 }`**(가상요소·foreground 색), **fs14**, idle 도 `#141414`(차이는 fw 600↔400 뿐). self 의 `border:0` 만 보고 "border 없음/연한 회색" 으로 오판 → "ODS 아닌" 칩이 됨.
- **검사**:
  1. chip·tab·badge·toggle·button 등 **ODS 컴포넌트는 self 뿐 아니라 `getComputedStyle(el,'::before')`·`::after` 의 border/bg/outline/box-shadow 까지 측정**(ODS 는 selected ring 을 pseudo 로 렌더). active·idle **양 상태를 각각** 캡처해 대조.
  2. 색·치수는 **노드값으로 확정**(임의 근사 `#E0E0E0`·`fs15` 금지). ODS 컴포넌트면 catalog(`get_component`/recipe) 의 variant 토큰과도 교차확인.
- **판정**: ODS 컴포넌트를 임의 토큰으로 근사(틀린 border 색·font-size·idle 색) = **High**.

### CR-11. 아이콘 + 라벨 단위 색 일관성
- **원인**: community 댓글 **아이콘 `#2F3438`(legacy) ≠ 수 라벨 `#8C8C8C`** → 한 의미 단위인데 두 색(사용자 지적).
- **검사**: 아이콘+텍스트가 **한 의미 단위**(댓글 N·조회 N·좋아요 N·평점 등)면 **아이콘 fill 과 라벨 color 가 동일**해야 한다. prod 가 legacy 로 불일치(아이콘 BDS `#2F3438` vs 라벨 ODS `#8C8C8C`)면 **ODS 방향(둘 다 `foregroundWeak`)으로 통일** + migration delta 기록. icon `fill`/`color` 와 인접 라벨 `color` 를 추출해 비교.
- **판정**: 한 단위 내 icon 색 ≠ label 색 = **Med**(시각 인지 시 High).

---

## 3. 개별 output qa.md 가 인용해야 하는 형식

각 `./preview/{slug}/qa.md` 상단에 다음 한 줄을 둔다:

```markdown
> 공통 QA 규칙: `~/.claude/skills/htmlviaTrueSource/references/qa-common-rules.md` (CR-1~CR-9) 를 먼저 통과. 본 문서는 page-specific 발견만 기록.
```

그리고 리포트의 severity 표에 공통 규칙 위반은 `CR-#` 태그를 달아 추적한다(예: `🔴 [CR-1] §0 hero 창작 콘텐츠`).
