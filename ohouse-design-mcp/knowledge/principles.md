---
tier: 1
when-to-read: "디자인 판단이 필요할 때 / 원칙 충돌 시"
size: "~1.5k tokens"
deps: [./visual-design.md, ./design-insight.md, ./ux-design.md]
owner: 요한
---

# 오늘의집 디자인 원칙

> **행동 지침**. `./visual-design.md`가 "무엇을 쓸지"라면 이 문서는 **"어떻게 쓸지"**.

각 원칙은 **1차 출처 1개 + 보조 최대 2개**로 단단하게 받친다. **과잉 인용 금지** — 더 많이 인용한다고 더 권위 있어지는 게 아니다.

| 마커 | 의미 |
|---|---|
| 💬 | 오늘의집 슬랙 PD 답변 |
| 🌐 | 산업 표준 (Apple/Toss/Nielsen 등) |
| 📚 | 학계 법칙·고전 |

---

## 1️⃣ 콘텐츠가 1순위, UI는 조연

사진·상품·리뷰가 먼저 눈에 들어와야 한다. UI 요소(버튼·테두리·그림자)는 콘텐츠를 받쳐주는 수준으로.

**Do**: 카드 border 최소화, 여백으로 구분
**Don't**: 과한 그림자, 두꺼운 테두리, 원색 배경으로 콘텐츠 시선 분산

- 💬 Luna *"PDP는 현재 보고 있는 상품이 최우선... 추천 섬네일이 상품 섬네일을 가림 = PDP 1순위 저해"*
- 📚 **Gestalt Figure-Ground** — 콘텐츠는 figure, UI는 ground

---

## 2️⃣ 결정 피로를 줄인다

선택지는 적게, 다음 액션은 명확하게.

**Do**: 1 화면 = 1 주요 액션, CTA는 프라이머리 1개, **모바일 Primary CTA는 화면 하단 sticky** (상세: `ux-design.md`)
**Don't**: 동일 우선순위의 버튼 2개 이상 병치, CTA를 본문 안에만 두기

- 💬 design-insight §1 #3 — Luna *"1,2개 확실히 픽스 + 그 외는 건조하게"*
- 📚 **Hick-Hyman Law** — 결정 시간 ≈ log₂(선택지 수) · **Fitts's Law** — 화면 하단 sticky = 무한 타깃

---

## 3️⃣ 한글 가독성 우선

단어 단위 줄바꿈, 말줄임 처리, 본문 행간 1.5 이상.

**Do**: `word-break: keep-all`, `line-height: 1.5~1.7`, 자간 `-0.3px`
**Don't**: 영문 기준 타이포 스케일 그대로 적용

- 📚 **Bringhurst** *The Elements of Typographic Style* — 활자의 미세 단위 정전

---

## 4️⃣ 정보의 위계를 색으로 말하지 말 것

색은 브랜드/상태(긍정·경고·에러)에만 사용. 중요도는 **크기·위치·여백**으로.

**Do**: 중요한 것은 크게, 위로, 여백 크게
**Don't**: "중요하니까 빨간색"

- 💬 Luna *"색깔로 구분하는건 변별력 없을 것 같은데... 룰과도 맞지 않는 부분"*
- 📚 **Albers** *Interaction of Color* — "색은 절대값이 아닌 상대값" → 배경색은 인접 텍스트 contrast를 떨어뜨림

---

## 5️⃣ 에러/빈 상태를 퍼스트 시민으로

성공 케이스만 디자인하고 실패 케이스를 "보이면 땜빵"하지 않는다.

**Do**: 빈 상태 일러스트 + 다음 액션 제시
**Don't**: "데이터가 없습니다" 한 줄, "결제할 수 없습니다" 같은 단정·부정형

- 💬 design-insight §1 #11 — Luna *"구구절절 다 필요없고, 객관적 현 상태 + 행동 제안만"*
- 📚 **Nielsen Heuristic #9** — Help users recognize, diagnose, and recover from errors

---

## 6️⃣ 로딩은 의도적으로 보여준다

0.3초 미만은 로딩 UI 없이, 0.3~2초는 스켈레톤, 2초 초과는 진행률.

**Do**: 스켈레톤은 실제 레이아웃과 일치
**Don't**: 모든 상황에 스피너

- 📚 **Doherty Threshold** (IBM 1982) — 응답 400ms 이하에서 사용자 몰입 유지

---

## 7️⃣ 터치 타깃은 충분히

모바일 최소 44×44pt. 인접 버튼 간격 8pt 이상.

- 🌐 **Apple HIG** 44pt (산업 표준)
- 📚 **Fitts's Law** — 타깃 도달 시간 = f(거리, 크기)

---

## 8️⃣ 접근성은 옵션이 아니다

- 텍스트 대비 WCAG AA 이상 (4.5:1)
- 포커스 링 절대 제거 금지
- alt 텍스트 필수, 한글
- 의미 있는 HTML 태그
- **모바일 큰 글자 모드에서 텍스트 잘림 검수**

- 💬 Yohan *"50대 유저 폰 글자가 커지면, 탭 텍스트는 어떻게? 이름이 최대한 짤리지 않았으면"*
- 📚 **WCAG 2.x POUR** — Perceivable · Operable · Understandable · Robust

---

## 9️⃣ 일관성 > 개성 (Composition Order 준수)

도메인 고유성보다 전사 일관성이 우선. **Composition Order**를 엄격히 따른다 — 발명은 마지막.

```
🧱 ODS 컴포넌트 → 🏗️ domain 컴포넌트 → 🗺️ 인접 패턴 이식 → 🌐 외부 표준 → 🔨 발명
```

신규 발명 시 반드시 `domains/<화면>/components/`에 등록(`meta.yaml`+`spec.md`+`guide.md`). 5+ 화면에서 누적되면 `ods/content/`로 승격.

상세: `decision-framework.md` Phase 2 / `feedback-format.md` §5-2 Composition 검수.

- 💬 design-insight §1 #2 — Yohan *"뱃지는 하나의 형태로만 사용하는게 제품의 복잡도를 낮춤"*
- 📚 **Jakob's Law** — 사용자는 다른 사이트에서 본 패턴을 기대한다 · **Atomic Design** (Brad Frost) — atoms → molecules → organisms → templates → pages

---

## 🔟 증거로 말한다

"느낌"보다 "데이터". A/B 결과, 사용자 피드백, 퍼널 수치로 디자인 근거 기록.

→ `domains/<도메인>/experiments/`에 축적, `design-insight.md` §2로 승격.

- 💬 design-insight §2 — `#product-share-discuss` 79건 실험 종료 공지에서 추출된 7개 인사이트
- 🌐 **Uber Base** `Data-informed` · **Pinterest** `Experiment-driven`

---

## ⚖️ 원칙 충돌 시 우선순위

1. **접근성** (원칙 8)
2. **가독성** (원칙 3)
3. **일관성** (원칙 9)
4. **결정 피로** (원칙 2)
5. 나머지

한 원칙을 깨야 한다면 `experiments/`에 근거 기록.

---

## 📎 크리틱에서 반복된 메타 판단 기준 (2024–2025)

10개 원칙이 "무엇을"이라면 아래는 PD들이 **반복적으로 적용한 사고 습관**. 근거·슬랙 링크는 `./design-insight.md`.

- **문제 → 솔루션 적합성을 먼저 본다** (design-insight #7)
- **실험은 변수를 하나로 통제한다** (#6)
- **디폴트값이 곧 경험이다** (#8)
- **복잡도를 늘리지 않는다** — 새 뱃지·컴포넌트·문구를 만들기 전에 기존 것으로 흡수 가능한지 본다 (원칙 9·#2)
- **크리틱은 잘못을 짚기보다 더 나은 방안을 제안한다** — 급한 일정이면 ETA를 미리 알린다

---

## 🇰🇷 Toss — 결이 가장 가까운 동료

| Toss Principle | 오늘의집 매핑 |
|---|---|
| Simplicity | 원칙 1 |
| One Thing per One Page | 원칙 2 |
| Value First, Cost Later | design-insight #11 |
| Easy to Answer | ux-writing.md (질문은 답하기 쉽게) |
| No Ads Patterns | 원칙 9 (정직·일관) |
| Minimum Input | design-insight #8 (디폴트값) |

---

## 🧭 어디서 무엇을 끌어쓰나 (빠른 매트릭스)

| 판단 상황 | 1차 인용 |
|---|---|
| 한국·커머스 맥락 | 위 원칙 + design-insight §1 슬랙 인용 |
| 카피·문구 | `ux-writing.md` + Toss `Value First` |
| 시각 위계·미세 조정 | `visual-design.md` (Gestalt · CRAP · Tufte) |
| UX 법칙·인지 | `ux-design.md` (Nielsen · Fitts · Hick · Miller) |
| 접근성 | WCAG POUR + 원칙 8 |
| 실험 설계 | design-insight §2 + Uber `Data-informed` |

---

## 🌐 외부 라이브러리 (참고)

51개 회사 디자인 시스템 원본 라이브러리는 `~/Desktop/Claude_Study/ux-principle/UX 원칙 라이브러리.md`. 자세한 회사별 목록은 거기서.

대표 핵심 출처:
- **Apple HIG** · **Google Material 3** · **Microsoft Fluent 2** · **IBM Carbon** · **Adobe Spectrum**
- **Toss** (한국·결 가까움) · **Pinterest Gestalt** · **Shopify Polaris** (커머스)
- **Nielsen 10 Heuristics** · **Shneiderman 8 Golden Rules** · **Jakob Nielsen / Jakob's Law**
- **WCAG (POUR)** · **Universal Design** · **Inclusive Design** (MS/IBM)
- **Norman** *The Design of Everyday Things* · **Krug** *Don't Make Me Think* · **Maeda** *Laws of Simplicity*
- **Tufte** *Visual Display* · **Bringhurst** *Typographic Style* · **CRAP** (Robin Williams)
- **Fitts's Law (1954)** · **Hick-Hyman Law (1952)** · **Miller's Law (1956)** · **Doherty Threshold (1982)**

---

## 🔗 관련

- `./design-insight.md` — 크리틱·실험 누적 인사이트 (§1 11개 · §2 7개) — 위 💬 인용의 원천
- `./ux-design.md` — UX 설계 가이드 + 학계 근거 디테일
- `./visual-design.md` — 비주얼 시스템 + Visual 학계 근거 디테일
- `./ux-writing.md` — 라이팅 가이드
- `./feedback-format.md` — 🔍 Critique 모드 가이드 (인용 최대 2개 룰)
- `./decision-framework.md` — 🛠️ Design 모드 가이드
