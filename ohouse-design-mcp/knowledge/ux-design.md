---
tier: 1
when-to-read: "UX 설계 — 플로우·정보구조·인터랙션·상태 표현 결정 시"
size: "~1k tokens"
deps: [./principles.md]
owner: 요한
---

# UX Design — 오늘의집 사용자 경험 가이드

> **`principles.md`가 "원칙"**, **`visual-design.md`가 "무엇을 쓸지"**, 이 문서가 **"사용자 경험을 어떻게 설계할 것인가"**.

LLM이 화면을 만들 때 인터랙션·플로우·정보구조 결정의 기준.

---

## 🎯 한 화면 = 한 결정

사용자가 한 화면에서 내려야 할 의사결정은 **1개**. 둘 이상이면 인지 부하.

- 주요 액션 1개 (Primary CTA), 보조 액션 2~3개까지 허용
- "X도 하고 Y도 하세요"가 보이면 → 화면 분리 또는 우선순위 결정

### Primary CTA는 하단 sticky로 항상 접근 가능

모바일에서 주요 액션은 **화면 하단 sticky bar**(BottomBar)에 고정. 본문 안에만 두지 않는다.

**왜**:
- 사용자가 스크롤 위치 어디에 있든 즉시 다음 단계를 선택할 수 있어야 결정 마찰이 줄어든다 (`principles.md` #2 결정 피로).
- 화면 모서리·하단은 **Fitts's Law**상 무한 타깃 — 가장 빠르게 도달 가능한 영역.
- 빈 상태·에러·결제 실패 같은 단발 화면일수록 "다음 행동" 선택이 정체되면 이탈로 직결됨 (`design-insight.md` #9 화면의 1순위·#11 카피의 행동 제안과 짝).

**Do**
- Primary CTA는 항상 sticky bottom (`BoxButton brand-solid large`, full width / 좌우 padding 16).
- 보조 액션(`결제 정보 변경` 같은 `TextButton`)은 sticky 바 안쪽 또는 CTA 바로 아래 텍스트 버튼으로.
- 키보드가 올라올 때는 sticky CTA가 키보드 위로 따라 올라옴 (`position: sticky` + `keyboard avoidance`).

**Don't**
- 본문 안에만 CTA를 두고 하단을 비우지 말 것 — 스크롤 길이만큼 결정이 늦어진다.
- CTA 위에 추가 정보 박스(추천·약관 등)를 끼워 결정 흐름을 깨지 말 것.
- "취소" 같은 dead-end 보조 버튼을 강조하지 말 것 — 다음 행동을 제안하는 라벨로 바꾼다 (`./ux-writing.md` 마이크로카피 → "결제 정보 변경").

---

## 🧭 정보 구조 (Information Architecture)

### 위계 표현 3원소
1. **크기** — 가장 강력. 중요할수록 크게.
2. **위치** — 상단·좌측 = 시선 진입점.
3. **여백** — 그룹 구분은 보더보다 여백.

색·굵기는 **보조 수단**. 위계를 색만으로 표현 금지.

### 스캔 패턴
- 모바일: F-pattern 아닌 **Z-pattern** + 카드 피드 (상→하 일직선)
- 카드 안: 이미지 → 핵심 텍스트 → 보조 → 액션 순

---

## 🔀 플로우 설계

### 진입/이탈 명시
모든 화면은 다음을 README에 기록:
- **진입**: 어디서 오는가 (다른 화면 + 진입 트리거)
- **이탈**: 어디로 가는가 (성공 경로 / 취소 경로 / 에러 경로)

### 깊이 제한
사용자가 **3 depth 이내**에서 핵심 액션 완료 가능해야 함. 4 depth 이상이면 단축 경로(딥링크·바로가기) 필수.

### Back 동작
- 모달·바텀시트: 외부 영역 탭 = 닫기 (네이티브 OS 룰 따름)
- 페이지: OS Back 버튼이 expected 동작 보장 (커스텀 Back 최소화)

---

## ✋ 인터랙션

### 터치 타깃
- 최소 **44×44pt** (Apple HIG · `principles.md` #7)
- 인접 타깃 간격 **8pt 이상**

### 즉시 피드백
- 탭/클릭 시 **150ms 안에 시각적 응답** (active state, ripple, scale)
- 비동기 액션 (서버 요청): 200ms+ 걸리면 로딩 인디케이터

### 햅틱·사운드
- 햅틱: 중요 액션 성공/실패만 (`UIImpactFeedbackStyle.light` 정도)
- 사운드: 기본 OFF (오늘의집 톤과 안 맞음)

---

## 🌀 상태 표현 5종 (모든 화면 필수)

| 상태 | 표시 | 메시지 톤 |
|---|---|---|
| **default** | 정상 | — |
| **empty** | 일러스트 + 한 줄 설명 + 다음 액션 CTA | 친근 ("아직 ~없어요. ~해보세요") |
| **loading** | 0.3s 미만 표시 안 함 / 0.3~2s 스켈레톤 / 2s+ 진행률 | — |
| **error** | 원인 + 해결 액션 | 비-탓 ("일시적 문제예요. 다시 시도") |
| **offline** | 캐시 + 알림 배너 | 안내 ("네트워크 연결을 확인하세요") |

모든 화면은 **5 상태 다 설계**. 빈 상태·에러 상태가 빠지면 PR reject.

---

## 🎬 모션·전환

### 페이지 전환
- 같은 컨텍스트 (탭 내 이동): **150ms** 짧게
- 다른 컨텍스트 (모달·풀스크린): **300ms** 이징 명확하게
- 뒤로 가기는 진입과 같은 duration의 reverse

### 데이터 변경
- 카드 추가·삭제: **stagger 30ms**, ease-out
- 숫자 변경: 카운팅 애니메이션 (200~400ms)
- 상태 토글 (Switch, Checkbox): **즉시 반영** + 짧은 transition

### 과한 모션 금지
- 1 세션에 큰 모션 (전체 화면 페이드, 큰 슬라이드) **3회 이하**
- 시각 자극 민감 사용자 대응: `prefers-reduced-motion` 존중

---

## ♿ 접근성 핵심 4가지

1. **포커스 링 절대 제거 금지** — 키보드 사용자
2. **명도 대비 WCAG AA** — 텍스트 4.5:1, 큰 텍스트·UI 3:1
3. **이미지 alt 텍스트 필수** — 한글
4. **시맨틱 HTML** — `<button>`, `<nav>`, `<main>` 등 의미 있는 태그

---

## 📝 마이크로카피 톤

- **동사 우선** — "확인", "저장" (명사형 "확인하기" 보다 짧고 강력)
- **2~6자** — 한국어 버튼 길이
- **존댓말 기본** — "삭제할까요?" (반말·명령조 금지)
- **빈 상태**: 친근 / **에러**: 비-탓 / **성공**: 담백

---

## 📎 크리틱 누적 — 경험 설계 실사용 원칙

`#des_pd_design_critique` 2024–2025년 크리틱에서 반복된 경험 설계 기준. 전체 근거·인용·슬랙 링크는 `./design-insight.md` §1 인사이트 7~12.

### 화면의 1순위를 지킨다 (design-insight #9)
과업 초기에 "이 화면의 1순위"을 한 줄로 정의한다. 추천 모듈·툴팁·섬네일을 더 넣어 지표를 올리려다 1순위를 가리면 안 된다. PDP의 1순위는 지금 보고 있는 상품, 브랜드홈의 1순위는 브랜드 상품. site-wide impact가 필요하면 1순위를 가리지 않는 위치·크기·타이밍을 찾는다.

### 디폴트값을 가장 공들여 정한다 (design-insight #8)
대다수 유저는 설정을 바꾸지 않는다. "유저가 아무것도 안 바꾼다면?"을 기준 시나리오로 삼는다. 입력·변경을 요구하기 전에 합리적 디폴트(예: 배송지 주소)를 먼저 채워 넣을 수 있는지 본다. 신규 기능은 "디폴트 상태"가 곧 경험이다.

### 탭·네비게이션은 상시 접근 (플로우)
대체제·추천처럼 "유저가 원하는 시점이 모호한" 기능은 특정 위치에 한 번 노출하기보다, **어느 구간에 있든 접근 가능한 탭/숏컷**으로 만들고 그 접근성을 높인다. 단, 상세 탑바에 검색을 넣는 식의 비표준 배치는 지양 — 일반적 사용성을 따른다.

### 모션은 인지부터 검증한다 (design-insight #10)
모션·영상의 효과는 "유저가 실제로 인지하느냐"에 달렸다. 인지가 의심되면 모션에 의존하지 않는다.
- 툴팁·자동 노출 타이밍: 너무 빠르면(0초) 못 보고, 너무 늦으면(1.5초+) 다음 행동(스크롤)과 충돌 → 그 사이에서 설계.
- 영상은 재생 속도·크기를 콘텐츠 캐칭 속도에 맞춘다. 크고 느린 영상은 무겁게 느껴진다.

### 빈 상태(엠티뷰)를 처음부터 설계한다
하이라이트·추천처럼 콘텐츠가 채워지는 영역은 **비어 있을 때의 화면(empty)** 을 같이 설계한다. 상태 표현 5종(위 §상태 표현)의 일부로 빠뜨리지 않는다.

### 마이크로카피: 사실 + 행동 제안 (design-insight #11)
안내·에러 문구는 구구절절 설명할수록 화를 키운다. **객관적 현 상태 + 다음 행동 제안**만 남긴다.
- "할 수 없어요" 같은 단정·부정형, "~일 수 있어요" 같은 불확실형은 피한다.
- 불가 안내는 "할 수 없음을 먼저, 그다음 사유" 순. 기존 안내 문구와 서술 방식을 통일한다.
- 텍스트는 이미지에 넣지 않는다 — 로컬라이즈 비용·실험 변수가 된다.

### 표기·톤을 화면 간 통일한다 (design-insight #12)
같은 개념이 화면마다 다른 단어로 나오면 유저는 다시 생각하게 된다. 새 문구·명칭을 만들기 전에 같은 개념이 다른 화면에서 어떻게 불리는지 확인하고 맞춘다. "전체보기 vs 더보기"처럼 비슷한 표현은 사용 기준을 명문화. 모듈 타이틀은 그 안의 콘텐츠 성격과 일치시킨다.

### 큰 글자 모드를 항상 확인한다 (접근성)
고령·저시력 유저가 OS 글자 크기를 키우면 탭·버튼 텍스트가 잘릴 수 있다. 텍스트가 들어가는 UI는 큰 글자 모드에서 이름이 잘리지 않는지 검수한다 (위 §접근성, `principles.md` #8 연장).

### 인터랙션·구조 변경은 프로토타입으로 공유
인터랙션 개선이나 화면 구조 변경은 정적 시안만으로 판단이 어렵다. 크리틱·리뷰에 **프로토타입(가능하면 화면 녹화)** 을 함께 올린다.

---

## 📚 학계 근거 — UX 휴리스틱·법칙·행동 모델

위 가이드의 외부 학술적 뿌리. 의사결정에서 "왜?"의 답이 필요할 때 인용.

### 1. 핵심 휴리스틱 (산업 표준)

**Nielsen 10 Usability Heuristics** (Jakob Nielsen, NN/g, 1994 · 개정 2020)
1. Visibility of system status — 시스템 상태 가시화 → `principles.md` #6 · 상태 표현 5종
2. Match between system and the real world — 현실 세계와의 일치
3. User control and freedom — 사용자 제어와 자유 (취소·되돌리기)
4. Consistency and standards — 일관성·표준 → `principles.md` #9
5. Error prevention — 에러 예방 → `principles.md` #5
6. Recognition rather than recall — 재인 > 회상
7. Flexibility and efficiency of use — 유연성·효율 (단축키·power user)
8. Aesthetic and minimalist design — 미적·미니멀
9. Help users recognize, diagnose, and recover from errors — 에러 회복 지원
10. Help and documentation — 도움말·문서

**Shneiderman's 8 Golden Rules** (Ben Shneiderman, UMD)
Strive for consistency · Cater to universal usability · Offer informative feedback · Design dialogs to yield closure · Prevent errors · Permit easy reversal · Support internal locus of control · Reduce short-term memory load

> 두 휴리스틱은 70~80% 겹친다. **임의 결정이 충돌하면 이 둘로 1차 검증.**

### 2. UX 법칙 (Laws of UX — 디자인 의사결정의 정량 기준)

| 법칙 | 정의 | 오늘의집 적용 |
|---|---|---|
| **Fitts's Law** (Paul Fitts, 1954) | 타깃 도달 시간 = f(거리, 크기). 작고 멀수록 어렵다. | 모바일 터치 타깃 44×44pt 최소 (`principles.md` #7) · 화면 모서리는 무한 타깃 (BottomNav) |
| **Hick-Hyman Law** (1952) | 선택지가 N개일 때 결정 시간 ≈ log₂(N). | `principles.md` #2 (결정 피로) · `design-insight.md` #3 (1~2개만 강조) |
| **Miller's Law** (George Miller, 1956) | 작업 기억 한계 7±2. 의미 단위 청킹으로 확장. | 메뉴·탭·필터 7개 이하 / 그 이상이면 그룹핑 |
| **Doherty Threshold** (IBM, 1982) | 시스템 응답 400ms 이하에서 사용자 몰입 유지. | `principles.md` #6 · `ux-design.md` 즉시 피드백 150ms |
| **Jakob's Law** (Jakob Nielsen) | 사용자는 다른 사이트에서 본 패턴을 기대한다. | `design-insight.md` #12 (표기·톤 통일) · 새 패턴 발명 지양 |
| **Tesler's Law of Conservation of Complexity** (Larry Tesler, Xerox PARC) | 복잡성은 사라지지 않고 시스템·사용자 사이에 재분배된다. | 디폴트값 (`design-insight.md` #8) — 복잡성을 시스템이 흡수 |
| **Postel's Law** (Jon Postel, RFC 793, 1981) | 입력엔 관대하고, 출력엔 엄격하라. | 검색·필터·입력 — 오타교정, 형식 자동 보정 (`product-share-discuss` 오타교정 실험 win) |
| **Peak-End Rule** (Kahneman & Fredrickson) | 경험의 평가는 절정과 끝에 의해 결정된다. | 결제 완료·온보딩 종료·구매확정 모먼트 강조 |
| **Goal-Gradient Effect** (Hull, 1932) | 목표에 가까워질수록 동기가 커진다. | 프로그레스 바·"3개 중 2개 완료" 표기 |
| **Serial Position Effect** (Hermann Ebbinghaus) | 목록의 처음·끝이 가장 잘 기억된다. | 카테고리·필터 정렬에서 핵심을 양 끝에 |
| **Zeigarnik Effect** (Bluma Zeigarnik, 1927) | 미완료 작업이 더 잘 기억된다. | "리뷰 작성 1/3 완료" 같은 미완 표기로 복귀 유도 |
| **Von Restorff / Isolation Effect** (1933) | 다른 요소들 사이에서 두드러진 항목이 기억된다. | CTA 1개만 강조 (`principles.md` #2) — 다 강조하면 두드러짐 사라짐 |
| **Aesthetic-Usability Effect** (Kurosu & Kashimura, 1995) | 미적인 인터페이스가 더 사용성 좋다고 *인식*된다. | 카드 보더·과한 그림자 절제로 콘텐츠가 살아나도록 (`principles.md` #1) |

> 출처: [lawsofux.com](https://lawsofux.com/) — Jon Yablonski 큐레이션. *Laws of UX* (O'Reilly, 2020) 책 단행본.

### 3. 멘탈 모델·인지·디자인 사상 (대표 저작)

**Don Norman — *The Design of Everyday Things*** (1988, 개정 2013)
- **Affordance** (행동 가능성) — 손잡이는 당기는 것이 보이고, 버튼은 누르는 것이 보여야 한다
- **Signifier** (신호) — affordance를 사용자에게 알리는 표식
- **Mapping** (매핑) — 컨트롤과 결과의 자연스러운 대응
- **Feedback / Constraint / Conceptual Model** — 사용자 머릿속 모델과 시스템 모델의 정렬

→ 모든 인터랙션의 출발점. "이 버튼이 눌리는 것처럼 보이나?"는 affordance 질문.

**Steve Krug — *Don't Make Me Think*** (2000, 개정 2014)
- **Scannability** — 사용자는 읽지 않고 스캔한다
- **Satisficing** — 최선이 아니라 충분히 만족스러운 선택을 한다
- **Self-evident** — 설명이 필요 없어야 한다

→ `principles.md` #3 (한글 가독성) · `design-insight.md` #11 (카피 사실+행동) 의 사상적 뿌리.

**Alan Cooper — *About Face*** / *The Inmates Are Running the Asylum*
- **Goal-directed design** — 과업이 아니라 목표 중심
- **Personas** — 가상의 사용자를 통한 의사결정

**Susan Weinschenk — *100 Things Every Designer Needs to Know About People*** (2011)
- 인지·기억·동기·사회적 행동 100개 단편. 빠른 레퍼런스.

**John Maeda — *The Laws of Simplicity*** (2006)
> Reduce · Organize · Time · Learn · Differences · Context · Emotion · Trust · Failure · The One

→ `principles.md` #1·#2 의 직접적 사상 원천. "The One" — 핵심은 단 하나.

### 4. 행동 모델

**Fogg Behavior Model** (B.J. Fogg, Stanford, 2009): `B = M × A × P`
- **Motivation × Ability × Prompt** — 행동이 일어나려면 셋이 동시에 필요
- 동기는 낮추기 어렵다 → **Ability(쉽게 만들기)** + **Prompt(트리거 타이밍)** 이 디자인이 개입할 지점

**Kahneman — System 1 / System 2** (*Thinking, Fast and Slow*, 2011)
- System 1: 빠르고 자동적·직관적 (쇼핑 탐색·스캔)
- System 2: 느리고 분석적·노력 필요 (가격 비교·옵션 선택)
- 커머스에서는 **System 1을 도와주고**, 중요한 결정은 **System 2를 위해 정보를 정돈**

### 5. 접근성·포용 (산업 표준)

**WCAG 2.x — POUR** (W3C)
- **Perceivable** — 인식 가능 (대비 4.5:1, alt 텍스트)
- **Operable** — 조작 가능 (키보드 접근, 터치 타깃)
- **Understandable** — 이해 가능 (예측 가능한 패턴)
- **Robust** — 견고 (보조 기술 호환)

**Inclusive Design** (Microsoft / IBM)
> Solve for one, extend to many. — 극단(저시력·고령·일시적 장애)을 풀면 모두가 이득.

**Universal Design** (Ronald Mace 외, NC State)
7원칙: Equitable use · Flexibility · Simple & intuitive · Perceptible info · Tolerance for error · Low physical effort · Size & space for approach.

→ `principles.md` #8 의 정식 근거. WCAG는 측정 가능한 최소 기준, Universal/Inclusive는 사상.

---

## 🔗 관련

- `./principles.md` — 행동 원칙 (이 문서의 상위)
- `./visual-design.md` — 비주얼 시스템 (Gestalt·CRAP·Tufte 학계 근거)
- `./design-insight.md` — 크리틱·실험 누적 인사이트
- `./principles.md` — 50+ 회사 디자인 시스템 압축 인덱스
- `../.claude/skills/feedback/ux.md` — UX 피드백 자동 스킬
