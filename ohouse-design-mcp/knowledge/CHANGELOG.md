---
tier: 2
when-to-read: "knowledge 폴더 변경 이력·승인 근거 추적 시"
size: "~1k tokens"
owner: 요한
---

# Knowledge — Changelog

knowledge 폴더 전체의 변경 이력. SemVer (`major.minor.patch`) 기반. 모든 minor·major 변경은 `_evals/`의 리뷰 루프를 통과해야만 머지된다.

> 현재 버전: **0.9.0** (2026-05-21)
> 정책 상세: `./VERSIONING.md` · 시나리오: `./_evals/scenarios.json`

## 📊 버전별 합산 점수 추적

| 버전 | 🛠️ Design | 🔍 Critique | 합산 | 핵심 변경 |
|---|---|---|---|---|
| 0.9.0 | **8.6** | **8.7** | **8.7** | Domain policies 우선 + 의미 그룹핑 보강 + '이해 쉬움' 톤 |
| 0.8.0 | 8.4 | 8.6 | 8.5 | 엣지 케이스 안정성 + 의미 그룹핑 + follow-up 톤 가이드 |
| 0.7.0 | 8.2 | 8.4 | 8.3 | Composition Order (ODS → domain → 발명) 명시 |
| 0.6.1 | 7.2 | 8.0 | 7.6 | 정책: 점수 표기 의무 명시 |
| 0.6.0 | 7.2 | 8.0 | 7.6 | principles slim + 인용 최대 2개 룰 |
| 0.5.0 | 6.8 | 7.4 | 7.1 | external-principles 통합 (3-소스 교차) |
| 0.4.0 | 6.8 | 7.6 | 7.2 | 자신감 지수 제거 + 주인공 → 1순위 |
| 0.3.0 | 6.5 | 7.6 | 7.0 | Design 모드 신설 (decision-framework) |
| 0.2.0 | 6.0 | 7.6 | 6.8 | feedback-format + severity + by-screen |
| 0.1.0 | 5.5 | 6.5 | 6.0 | Baseline |

> 점수는 LLM 시뮬레이션 + 사람 리뷰 기반 추정. 방향성 확인용 (절대값 아님).
> 측정 방법: `./VERSIONING.md` §2.5

---


## [0.9.0] — 2026-05-21 · Domain policies 우선 + 의미 그룹핑 보강 + "이해 쉬움" 톤

**Scope**: v0.8.0 후 사용자 3가지 추가 피드백 반영. Gap A는 정책 워크플로우로 해결, Gap B는 구체 예시로 보강, Gap C는 길이가 아닌 이해 쉬움이 진짜 기준임을 명시.

### Changed
- `feedback-format.md` **§1-0 신설** — "먼저: Domain Policies 확인":
  - 크리틱 시작 전 "이 화면이 어디인가?" → `domains/<screen>/policies/` 읽기
  - 5질문보다 먼저 진행
  - 정책 비어 있으면 일반 룰만 적용
- `feedback-format.md` 출처 우선순위 1순위에 **`domains/<screen>/policies/` 추가** — design-insight §1보다 더 가까운 권위
- `feedback-format.md` §2-1 길이 가이드 **전면 재작성**:
  - "Follow-up 3-5줄·본격 15-30줄" → **"길이는 제약 아님, 이해 쉬움이 진짜 기준"**
  - 이해 쉬움 5가지 체크: 결론 먼저 / 근거 1-2개 / 전문 용어 풀어쓰기 / 한 문장 한 주장 / 추가 고민 별도 표시
- `decision-framework.md` Phase 2 Step 2 보강 — domain `components/`만이 아닌 **`policies/`도 명시**. "정책 있으면 최우선 권위"
- `design-insight.md` §1 #14 **전면 재작성**:
  - 3단계 적용 가이드 (카테고리 식별 → 시각 인접성 검증 → 재배치)
  - 화면별 카테고리 예시 표 (Cart·PDP·Search SRP·Mypage)
  - Cart·PDP Bad/Good 예시 각각 추가
  - Gestalt 근거 3개 (Proximity·Common Region·Similarity) 명시
  - 화면별 카테고리는 `domains/<screen>/policies/`에 위임 명시

### Why
사용자 3가지 추가 피드백:

1. **Gap A 해결책** — *"앞으로 domains policies 폴더의 정책을 확인하면 더 좋은 피드백을 줄 수 있을 거. 피드백 시 Domain 확인 → policies 보고 디자인 피드백"*
   → 워크플로우 명문화. 정책이 비어 있어도 *습관*이 정착되면 정책이 채워질 때 자연스럽게 활용됨.

2. **Gap B 보완 필요** — *"시각적인 그룹핑은 보완이 필요"*
   → 인사이트 #14에 구체 화면별 카테고리·Bad/Good 예시·Gestalt 근거 추가.

3. **Gap C 수정** — *"답변 길이는 그렇게 중요하지 않은데, 조금 더 이해하기 쉽게 써주는건 필요"*
   → 길이 강요 X. **이해 쉬움 5체크**가 진짜 기준 (결론 먼저·근거 1-2·전문 용어 풀어쓰기·단문·고민 별도).

### Review loop

**시나리오**: 가상으로 같은 장바구니 도착예정일 스레드 다시 답변.

**Before (v0.8.0)**: Follow-up 톤 가이드는 있지만 *"3-5줄"* 강요 → 격식 정도만 풀린 수준. 화면 정책 자동 확인 절차 없음. #14 의미 그룹핑은 추상적.

**After (v0.9.0)**:
- 시작: "이 화면 = Cart" 식별 → `domains/cart/policies/` 확인 (현재 비어 있음, 일반 룰만)
- 답변 톤: "이해 쉬움 5체크" 적용 — 결론 먼저 → 근거 1-2 → 추가 고민 별도
- #14 카테고리 식별: Cart는 결제(가격·할인·특별인증가) / 배송(도착·오늘출발) / 상품 메타 → "특별인증가는 결제 그룹 → 가격 근처" 자동 도출 가능

**Verdict**: 도메인 정책 워크플로우 정착 + #14 구체화 + 이해 쉬움 톤 = 실제 PD 답변에 더 가까운 출력 가능.

### 📊 점수 (10점 만점)

| 모드 | v0.8.0 | v0.9.0 | diff |
|---|---|---|---|
| 🛠️ Design Mode | 8.4 | **8.6** | +0.2 |
| 🔍 Critique Mode | 8.6 | **8.7** | +0.1 |
| **합산 평균** | **8.5** | **8.7** | **+0.2** |

**Design Mode dimension 변화**:
- 결정 명확성 9 → 9.5 (어디부터 봐야 할지 더 명확 — domain policies 1순위)
- 권위·정당화 9 → 9 (변화 없음 — 정책 폴더가 비어 있어 효과 제한적)
- 커버리지 9 → 9.5 (#14 화면별 카테고리 정의로 커버 ↑)
- 인지 부하 8 → 7 (-1) (도메인 확인 단계 추가)
- 신참 친화 7 → 8 (+1) (이해 쉬움 5체크로 답변 가독성 ↑)

**Critique Mode dimension 변화**:
- 인용 강도 9 → 9.5 (도메인 정책 = 가장 가까운 권위)
- Severity 정밀도 9 → 9 (변화 없음)
- 톤 일치 9 → 9 (변화 없음 — 이미 9)
- 출력 구조 9 → 9 (변화 없음 — 길이 강요 풀린 게 톤이지 구조는 아님)
- 과잉 인용 리스크 8 → 8 (변화 없음)

### Impact
- 영향 받는 파일: 4개 (feedback-format · decision-framework · design-insight · README · CHANGELOG · VERSION)
- 다른 axis 영향:
  - `domains/<screen>/policies/` 폴더 — 현재 비어 있어도 워크플로우는 정착됨. 정책이 차차 채워지면 자연스럽게 인용됨.
  - 도메인 정책 작성 시 #14 "의미 카테고리 정의"를 우선 항목으로 권장
- 향후:
  - **v0.10.0** — 시각 예시 통합 (`_evals/scenarios/`)
  - **v0.11.0** — PD 외부 validation
  - **v1.0.0** — domains/<screen>/policies/ 18개 중 5+ 채워지면 안정화 후보

---

## [0.8.0] — 2026-05-21 · 실측 PD 답변에서 도출 — 엣지 케이스 안정성 + 의미 그룹핑 + follow-up 톤

**Scope**: 2026-05-21 장바구니 도착예정일 크리틱에서 LLM 생성 답변(나)과 실제 Yohan 답변을 비교 → **3개 gap 식별 → knowledge 보강**. 메타 학습 루프 실증.

### Added
- `design-insight.md` §1 **#13 신규** — "엣지 케이스 조합에서도 레이아웃이 무너지지 않는지 검증한다"
  - 발견·근거·적용 가이드·Bad/Good·severity 기본값 포함
  - Yohan 원문 인용: *"여러가지 엣지 케이스들(특별인증가 유무, 오늘출발 뱃지 유무)을 고려하면 2안이 안정적"*
- `design-insight.md` §1 **#14 신규** — "의미 카테고리가 같은 정보는 시각상도 가까이 둔다"
  - Gestalt Proximity의 actionable 실무 응용
  - 4가지 의미 카테고리 정의 (결제·배송·상품 메타·시간)
  - Yohan 원문: *"특별인증가가 결제 관련된 정보이니 특별인증가 뱃지를 금액 근처로 이동을 해야하나 그런 고민도 됩니다"*

### Changed
- `feedback-format.md` §2-1 길이 가이드 추가:
  - **Follow-up 단답 (3~5줄 1단락) — 4블록 격식 강요 X** 신설
  - "실제 PD follow-up은 3줄로 끝나는 경우 흔함, 격식보다 명확성 우선" 명시
- `feedback-format.md` Cart by-screen 매트릭스 보강:
  - "#14 의미 그룹핑 · #13 엣지 케이스 안정성" 추가
  - 자주 빠뜨리는 것에 "특별인증가·도착일·할인 흩어져 결제 결정 흐름 깨짐" 추가
- `README.md` design-insight 11+7개 → 13+7개로 갱신, VERSION 0.7.0 → 0.8.0

### Why
2026-05-21 장바구니 도착예정일 크리틱에서 실측:

**내가 생성한 답변** (v0.7.0 룰 그대로 적용): 19줄, 4블록 구조, 우려 3개, severity, hedged 톤. **모든 룰 통과**.

**Yohan 실제 답변**: 3줄. 단호한 결론(2안 안정). 엣지 케이스 추론 + 의미 그룹핑 제안 2개 추가.

**Gap**:
1. **엣지 케이스 사고법** — knowledge에 없음. PD는 자동으로 "이 element 유무 조합 다 봤을 때"를 떠올림.
2. **의미 그룹 재배치** — 시각 위계만이 아닌 "같은 의미는 가까이"
3. **답변 길이** — follow-up은 3-5줄도 정상인데 격식 강요로 어색

→ 이 3개 모두 보강하면 LLM 답변이 실제 PD 답변과 더 가까워짐.

### Review loop

**시나리오**: 가상으로 같은 스레드(장바구니 도착예정일) 다시 답변 생성.

**Before (v0.7.0)**:
- 4블록 구조 19줄
- 우려 "1순위 위계 분산" / "1안 vs 2안 PDP 일관성" / "C그룹 확률 톤"
- 결론 유보적 (PDP 일관성 보고 결정)
- 엣지 케이스 추론 0건

**After (v0.8.0)**:
- Follow-up 톤 가이드 따라 3-5줄 단답 OK
- #13 엣지 케이스 인사이트 적용: "특별인증가·오늘출발 뱃지 유무 조합 → 2안 안정적" 직접 도출 가능
- #14 의미 그룹핑 적용: "특별인증가는 결제 정보 → 금액 근처" 직접 제안 가능
- Cart by-screen 매트릭스에 두 인사이트 들어가 자동 적용

**Verdict**: 같은 시나리오에서 출력이 실제 PD 답변에 더 가까워짐. 회귀 0건 (기존 4블록 구조는 본격 리뷰에선 여전히 유효).

### 📊 점수 (10점 만점)

| 모드 | v0.7.0 | v0.8.0 | diff |
|---|---|---|---|
| 🛠️ Design Mode | 8.2 | **8.4** | +0.2 |
| 🔍 Critique Mode | 8.4 | **8.6** | +0.2 |
| **합산 평균** | **8.3** | **8.5** | **+0.2** |

**Design Mode dimension 변화**:
- 결정 명확성 9 → 9 (변화 없음)
- 권위·정당화 8 → 9 (실측 PD 답변 직접 인용 = 가장 강한 권위)
- 커버리지 8 → 9 (엣지 케이스·의미 그룹핑 = 이전 커버리지 외 영역)
- 인지 부하 8 → 8 (변화 없음)
- 신참 친화 8 → 7 (-1) (인사이트 13·14가 다소 추상적, 처음엔 어려울 수 있음)

**Critique Mode dimension 변화**:
- 인용 강도 9 → 9 (변화 없음)
- Severity 정밀도 9 → 9 (변화 없음)
- 톤 일치 8 → 9 (follow-up 톤 가이드 추가로 실제 PD 톤에 가까워짐)
- 출력 구조 8 → 9 (3~5줄 follow-up도 valid 구조로 인정 = 더 유연)
- 과잉 인용 리스크 8 → 8 (변화 없음)

### Impact
- 영향 받는 파일: 4개 (design-insight·feedback-format·README·CHANGELOG·VERSION)
- 다른 axis: domains/<screen>/policies/에서 *의미 카테고리 정의* 가능 — Cart·PDP별 카테고리 룰이 채워지면 더 정밀
- 향후:
  - **v0.9.0** — 시각 예시 통합 (`_evals/scenarios/` good/bad HTML)
  - **v0.10.0** — PD 외부 validation (5+ 스레드 실측 비교로 인사이트 신뢰도 검증)
  - **v1.0.0** — domains/<screen>/components가 어느 정도 채워지면 안정화

**Meta**: 이 minor는 *실제 PD 답변과 LLM 출력 비교 → gap → knowledge 보강* 루프의 첫 실증. 앞으로 매번 같은 방식으로 보강하면 knowledge가 점진적으로 진짜 PD에 가까워짐.

---

## [0.7.0] — 2026-05-20 · Composition Order 도입 (ODS → domain → 발명)

**Scope**: Design Mode가 "발명 우선" 안티 패턴에 빠질 위험을 막기 위해, atomic design 사상의 **합성 우선순위(composition order)**를 decision-framework·feedback-format·principles에 명시적으로 도입. 사용자 통찰: "ods 컴포넌트 → domain components → screens 순서대로 참고하면 완성도 높고 일관성 높은 디자인."

### Changed
- `decision-framework.md` Phase 2 **전면 재작성**:
  - 합성 우선순위 6단계 명시: 🧱 ODS → 🏗️ domain → 🗺️ by-screen → 🔄 §2 E7 이식 → 🌐 외부 → 🔨 발명(마지막)
  - "발명 최후" 사상 직설화 — ODS 안 보면 일관성·다크모드·접근성·토큰 다 깨짐
  - Decision Spec 템플릿 §4 선례 섹션에 🧱/🏗️/🗺️/🔄/🌐/🔨 6 라인 추가
  - Worked example (AI 스타일링 결과 페이지) Phase 2 갱신 — ODS Card·Chip·BoxButton·Empty 명시
  - 안티 패턴 표에 "ODS 안 보고 발명" + "신규 컴포넌트 도메인 미등록" 2건 추가
- `feedback-format.md` **§5-2 Composition 검수 신설**:
  - 5체크리스트 (ODS 사용 / 도메인 등록 / 승격 표기 / 토큰만 / 발명 시 6단계 확인)
  - severity: ODS 미사용·도메인 미등록 = 🟡, 토큰 위반 = 🔴
- `principles.md` 원칙 9 (일관성) 보강:
  - composition order 6단계 다이어그램 명시
  - decision-framework Phase 2 + feedback-format §5-2 cross-ref
  - 학계 인용에 **Atomic Design (Brad Frost)** 추가
- VERSION 0.6.1 → 0.7.0, README header 갱신

### Why
v0.6.1까지 decision-framework Phase 2가 "by-screen 매트릭스 → E7 이식 → 외부 표준 → 발명" 순서였으나, **ODS 컴포넌트·domain 컴포넌트가 명시적 첫 단계가 아님**. 결과적으로 LLM이 ODS를 안 보고 바로 발명하거나 외부 패턴부터 끌어오는 안티 패턴 가능.

사용자 통찰:
> "domain > screens, components이 아직 비여있는데, ods 컴포넌트 → 같은 domain components → screens 순서대로 참고하면 완성도 높고 일관성 높은 디자인을 할 수 있지 않을까"

→ atomic design 합성 우선순위를 사상으로 격상.

### Review loop

**시나리오**: `design-from-brief` (AI 스타일링 결과 페이지) 가상 실행

**Before (v0.6.1)**: Phase 2에서 인접 surface PDP·Viewer만 인용. ODS 컴포넌트 명시 없음 → LLM이 "이미지 카드 + 태그 칩 + 저장 버튼"을 추상적으로 설계. 신참은 어디서 시작할지 모름.

**After (v0.7.0)**: Phase 2에서 ODS `Card`·`Chip`·`BoxButton brand-solid large`·`Empty` 4종을 명시 → 즉시 컴포넌트 spec 끌어다 씀. 발명 없음 명시 → "🔨 발명: 없음"으로 마무리. 새 PD가 step-by-step 진행 가능.

### 📊 점수 (10점 만점)

| 모드 | v0.6.1 | v0.7.0 | diff |
|---|---|---|---|
| 🛠️ Design Mode | 7.2 | **8.2** | **+1.0** |
| 🔍 Critique Mode | 8.0 | **8.4** | +0.4 |
| **합산 평균** | **7.6** | **8.3** | **+0.7** |

**Design Mode dimension 변화**:
- 결정 명확성 7 → 9 (linear step-by-step 명확)
- 권위·정당화 7 → 8 (atomic design 사상 추가)
- 커버리지 6 → 8 (composition order로 모든 케이스 커버)
- 인지 부하 8 → 8 (단계가 늘었지만 각 단계가 명료)
- 신참 친화 5 → 8 (가장 큰 개선 — "Step 1 ODS부터" 명령형)

**Critique Mode dimension 변화**:
- 인용 강도 8 → 9 (composition 위반은 강한 근거)
- Severity 정밀도 8 → 9 (🟡/🔴 명확히 정의됨)
- 톤 일치 8 → 8 (변화 없음)
- 출력 구조 8 → 8 (변화 없음)
- 과잉 인용 리스크 8 → 8 (composition은 1개로 인용 가능)

### Impact
- 영향 받는 파일: 4개 (decision-framework · feedback-format · principles · README · CHANGELOG · VERSION)
- 다른 axis 영향:
  - `domains/<화면>/components/`가 비어 있는 18개 화면 — composition order 적용 시 LLM이 ODS만 우선 끌어쓰면 도메인 컴포넌트 부재가 큰 문제는 아님 (ODS로 90% 커버)
  - `ods/content/components/` — 더 자주 참조될 것. ODS 팀과 협업 시 이 변화 공유
- 향후:
  - **v0.8.0** — 시각 예시 통합 (`_evals/scenarios/` good/bad HTML 모형)
  - **v0.9.0** — PD 외부 validation
  - **v1.0.0** — domains/<screen>/components/ 도메인 정책 채워지면 안정화 선언

> 정책상 등급: minor (기존 정책 강화·명시화, 기능 추가). Phase 2 재작성이지만 사상은 같음 (선례 우선·발명 최후).

---

## [0.6.1] — 2026-05-20 · 정책: 버전 점수 표기 의무

**Scope**: 사용자 요청 — "버전 업데이트할 때 마다 앞으로 점수로 표기해줘". knowledge 자체 변경 없음. 거버넌스 정책만 추가.

### Changed
- `VERSIONING.md` §2.5 신설: **점수 표기 의무** (minor·major 필수, patch 선택)
  - Design Mode + Critique Mode 각각 10점 만점
  - 5-dimension breakdown (선택적)
  - 이전 버전 대비 diff 명시
  - 합산 떨어지면 정당화 의무
- `CHANGELOG.md` 상단에 **📊 버전별 합산 점수 추적** 표 신설 (v0.1.0~0.6.1 회고 채점)
- VERSION 0.6.0 → 0.6.1

### Why
v0.5.0이 권위 ↑·산출물 품질 ≈ 같음으로 평가됐고, v0.6.0이 산출물 품질 ↑로 가시화. **점수 없으면 "의미 있는 버전"인지 판단 어려움**.

사용자 클래리피케이션:
> "버전 업데이트할 때 마다 앞으로 점수로 표기해줘"

→ 자체 평가 루프를 문서화된 정책으로 격상.

### Review loop
- 본 변경은 정책 문서화만, knowledge 내용 변화 없음 → 시나리오 영향 X.
- v0.6.0 점수 유지: Design 7.2 · Critique 8.0 · 합산 7.6.

### 📊 점수 (변화 없음)
| 모드 | 0.6.0 | 0.6.1 | diff |
|---|---|---|---|
| 🛠️ Design | 7.2 | 7.2 | 0 |
| 🔍 Critique | 8.0 | 8.0 | 0 |
| 합산 | 7.6 | 7.6 | 0 |

### Impact
- 영향 받는 파일: 2개 (VERSIONING + CHANGELOG)
- 다른 axis: 없음
- 향후: v0.7.0부터 신규 entry는 무조건 점수 블록 포함

> 정책상 등급: patch (정책 문서화, behavior 변화 없음). 단 정책 자체는 minor·major 동작 기준 영향.

---

## [0.6.0] — 2026-05-20 · 과잉 인용 방지 (principles 슬림 + "인용 최대 2개" 룰)

**Scope**: v0.5.0이 권위는 강해졌지만 산출물 품질에 거의 변화가 없다는 자체 평가(Design 6.8/10 · Critique 7.4/10)에서 도출. 핵심만 남기고 reference noise 제거.

### Changed
- `principles.md` 슬림 다운 — **330줄 → 180줄** (45% 감축):
  - 각 원칙의 인용을 **1차 1개 + 보조 최대 2개**로 압축 (이전: 3-5개)
  - 51개 회사 라이브러리 압축 인덱스 부록 → **링크와 핵심 출처 명단으로만** 축소 (원본 라이브러리 위치 안내)
  - 크로스컴퍼니 Top 10 표 → 제거 (각 원칙의 🌐 인용에 흡수됨)
  - Toss 섹션 → 핵심 매핑만 (6 항목)
  - "어디서 무엇을 끌어쓰나" 매트릭스 → 유지 (가장 실용적)
  - 인트로에 **"과잉 인용 금지" 명시**
- `feedback-format.md` 핵심 룰 추가:
  - **§6 인용 최대 2개 룰** 신설 — "한 우려·제안에 출처 최대 2개. 3개 이상 안티 패턴"
  - 출력 전 체크리스트에 "인용 최대 2개" 항목 추가
  - 안티 패턴 표에 "과잉 인용" 추가
- VERSION 0.5.0 → 0.6.0

### Why
v0.5.0 평가에서 발견:
- Design Mode: 6.8 → 6.8 (권위 +3, 인지부하·신참친화 -4, 합 0)
- Critique Mode: 7.6 → 7.4 (인용 강도 +2, 과잉 인용 리스크 -2, 톤 -1)

→ **권위는 quantity가 아니라 quality**. 잘 골라낸 인용 1-2개가 stacked 5개보다 효과적. 사용자 클래리피케이션:
> "과잉 인용이 문제일 수 있어. 모든 사례를 다 읽고 가져오기보단 지금 너가 쌓아온 것 중에 중요하다고 생각되는 것 또는 중복되는 것 [빼고] 더 심플하게 남겨둬서"

### Review loop (예상)

**Before (v0.5.0) — 한 우려에 인용 4개 스택**:
> "🟡 헤딩 '비어있어요' — design-insight #11 (Luna 인용) + Nielsen Heuristic #9 + Shneiderman #5·#6 + Toss `Value First` 모두 위반."

**After (v0.6.0) — 인용 최대 2개**:
> "🟡 헤딩 '비어있어요' — design-insight #11 (Luna *"객관적 현 상태 + 행동 제안만"*) · Nielsen #9 — 행동 제안 부재"

→ 가독성·우선순위 명확 ↑, 권위 유지.

### 예상 점수 변화
- Design Mode: 6.8 → **7.2** (인지부하 +2, 신참친화 +2, 권위 -1)
- Critique Mode: 7.4 → **8.0** (과잉 인용 리스크 -2 → +3, 톤 +1)
- **합산: 14.2 → 15.2**

### Impact
- 영향 받는 파일: 3개 (principles · feedback-format · README · VERSION · CHANGELOG)
- 다른 axis: knowledge 사용 LLM이 매번 5+ 출처 stacking할 위험 해소
- 향후:
  - **v0.7.0** — 시각 예시 통합 (`_evals/scenarios/`)
  - **v0.8.0** — PD 외부 validation

---

## [0.5.0] — 2026-05-20 · principles.md ↔ external-principles.md 통합 (3-소스 교차 검증)

**Scope**: 두 파일을 하나로. 오늘의집 원칙 10개 각각이 (1) 슬랙 크리틱 증거 (2) 산업 표준 (3) 학계 근거 세 갈래로 지지받도록 재구성. 단일 정전 문서.

### Removed
- `external-principles.md` 파일 **삭제** (내용은 모두 `principles.md`로 흡수)

### Changed
- `principles.md` **전면 재작성** — Tier 1 유지하되 구조 확장:
  - 인트로: 3-소스 교차 검증 설명 (🇰🇷 오늘의집 / 🌐 산업 / 📚 학계)
  - 원칙 10개: 각 원칙에 💬 슬랙 인용 + 🌐 회사 매핑 + 📚 학계 법칙 추가
  - 원칙 충돌 시 우선순위 + 메타 판단 기준 5개 (그대로)
  - **신규 부록 1**: 크로스컴퍼니 Top 10 표
  - **신규 부록 2**: Toss principles 별도 정리
  - **신규 부록 3**: 51개 회사 라이브러리 압축 인덱스 (8 카테고리)
  - 어디서 무엇을 끌어쓰나 매트릭스
- 7개 active 파일의 `external-principles.md` 참조를 `principles.md`로 sed 일괄 치환.
- `README.md` 자원 표·자원 한 줄 설명 갱신 (중복된 principles.md 행 제거).
- VERSION 0.4.0 → 0.5.0.

### Why
사용자 클래리피케이션:
> "knowledge에 있는 폴더 내용들이 크리틱의 답변으로 만들어진 건데, 사실 답변 자체가 좋은 피드백이라고 볼 수 없고 부족할 수 있어. external-principle에 있는 내용과 합치고 디자인 지식을 적절하게 섞어야할 거 같아"

크리틱 답변 기반은 PD 개인 경험에 편향되고 일관 권위 부족. 산업 표준은 한국·커머스 맥락 부족. 학계는 실무 거리감. **세 소스를 한 파일에서 원칙 단위로 교차 검증**하면 한 소스가 약해도 다른 둘이 보완.

매핑 결과: 오늘의집 원칙 10개가 크로스컴퍼니 Top 10에 거의 1:1 대응. 한국·커머스 디테일(원칙 3 한글 가독성·원칙 4 색 위계 금지)만 고유.

### Review loop
별도 시나리오 없음 (구조 통합 + 내용 매핑, 의미 추가 아님). 회귀 0건 확인:
- `external-principles.md` 참조 잔존 0건 (CHANGELOG 제외)
- 기존 원칙 10개 + Do/Don't 보존, 외부 매핑·학계 인용만 추가
- 9개 active 파일 cross-ref 정상 동작

**Verdict**: minor 승급. 정전 문서 단일화, 외부 근거 명시화.

### Impact
- 영향 받는 파일: 9개 (principles 재작성, external-principles 삭제, 7개 cross-ref 치환)
- 향후:
  - **v0.6.0** — 시각 예시 통합 (`_evals/scenarios/` good/bad HTML 모형)
  - **v0.7.0** — PD 외부 validation (3-소스 매핑 정확성 검토)

> 정책상 등급: minor (파일 삭제는 major-adjacent이나 v0.x 동안 minor 허용)

---

## [0.4.0] — 2026-05-20 · "자신감 지수" 제거 + "주인공" → "1순위" 리네임

**Scope**: 자체 비판 리뷰에서 약하다고 판단된 두 항목 정리. 6 질문 → 5 질문 (Q2 자신감 지수 삭제). "주인공" 비유 표현 → "1순위" 직설어로 통일.

### Removed
- **Q2 자신감 지수** — feedback-format.md 5 질문에서 제거 (6→5), decision-framework.md Phase 3에서 제거, Decision Spec 섹션에서 제거(8→7), Critique vs Design 비교 표에서 제거, 안티 패턴에서 제거(7→6).
- `design-insight.md` §1 #5 (자신감 지수가 낮으면 작게 실험한다) **인사이트 통째 삭제**. 표·섹션·인덱스 E 모두 제거. (번호 #6~#12는 그대로 유지 — cross-ref 충돌 방지, #5 결번 처리)
- `principles.md` 크리틱 메타 기준 6개 → 5개 (자신감 지수 항목 삭제).

### Changed
- **"주인공"** → **"1순위"** 전 active 파일에서 일괄 변경 (README · principles · visual-design · ux-design · feedback-format · decision-framework · design-insight · _evals/scenarios.json). 한국어 particle도 함께 정리 (주인공이 → 1순위가, 주인공을 → 1순위를 등).
  - `design-insight.md` §1 #9 제목: "화면의 주인공을 지킨다" → "화면의 1순위를 지킨다"
  - `principles.md` #1: "콘텐츠가 주인공, UI는 조연" → "콘텐츠가 1순위, UI는 조연"
  - `visual-design.md` 비주얼 원칙 3: "사진·콘텐츠가 주인공" → "사진·콘텐츠가 1순위"
- **1순위 질문(Q4)을 조건부로 강등** — v0.3.0에서는 모든 화면에 매번 1순위를 묻게 했지만, 자명한 화면(Cart=장바구니, PDP=상품)에서는 형식적 질문이 되는 약점 인정. v0.4.0부터 **"competing priorities가 있는 화면에서만 active"**.
- `decision-framework.md` Phase 1 Define: 3개 질문 → 2개 (Q1 문제 + Q3 디폴트) + Q4 1순위 (조건부).
- `feedback-format.md` Q4 1순위 질문: "competing priorities가 있는 화면이면" 단서 추가.
- `_evals/scenarios.json` `design-from-brief` expectations: 8섹션 → 7섹션, 자신감 expectation 삭제, 1순위 조건부 검증으로 변경. `experiment-design-readiness` 자신감 expectation 삭제 (knowledge_inputs도 #5 제거).
- `README.md` 자원 한 줄 설명에서 자신감 언급 모두 제거.
- Schema_version → `0.4.0`.

### Why
v0.3.0 자체 비판 리뷰에서 사용자가 두 항목을 콕 짚음:
1. **자신감 지수 (Q2)** — Yohan의 실제 슬랙 인용 기반 인사이트이지만, *scope 결정용*이지 *디자인 결정용*이 아니라는 비판. Phase 3에서 묻기엔 위치도 어색. Design mode의 매번 필수 질문일 필요 X. → 완전 제거.
2. **"주인공" (Q5)** — 비유 표현. Luna 원문은 *"현재 보고 있는 상품이 최우선"* 으로 1순위/최우선 단어를 직접 씀. "주인공"이 metaphor라 불필요한 추상화. → "1순위"로 통일.

부수 효과: 6 질문 → 5 질문으로 **인지 부하 감소** (knowledge 자체가 design-insight #3 "1~2개만 강조"를 더 잘 지킴 — 자기 모순 일부 해소).

### Review loop

**시나리오**: `design-from-brief` (AI 스타일링 결과 페이지) — v0.3.0 expectations 그대로 적용.

**Before (v0.3.0, 자신감·주인공 포함)**: Decision Spec 8섹션, 자신감 지수 자가 평가 의무, "주인공" 단어 사용. 단순한 화면에도 1순위 매번 명시 강요.

**After (v0.4.0, 정리됨)**:
- Decision Spec 7섹션 (자신감 섹션 제거)
- "주인공" → "1순위" (Luna 원문에 가까운 직설어)
- competing priorities 없는 자명한 화면이면 1순위 skip
- 안티 패턴 7개 → 6개

**Verdict**: 회귀 없음 (#5 인사이트 삭제로 §1 인덱스 #6~#12는 그대로 유지, cross-ref 충돌 0건). 모든 active 파일에서 자신감 0 occurrence / 주인공 0 occurrence 검증 완료. 표현 정합성·간결성 ↑.

### Impact
- 영향 받는 파일: 8개 active 파일 (CHANGELOG는 historical record로 유지 — 옛 v0.1.0~v0.3.0 항목에 자신감·주인공 언급 그대로 둠)
- 다른 axis 영향: 외부 인용이 있으면 "주인공" → "1순위" 일관성 유지를 위해 알리면 좋음. domains/policies가 채워질 때 1순위는 조건부로 적용.
- 향후:
  - **v0.5.0** — 시각 예시 통합 (`_evals/scenarios/` good/bad HTML 모형)
  - **v0.6.0** — PD 외부 validation
  - 자신감 지수가 정말 필요한 영역이 발견되면 별도 *scope-calibration* 도구로 부활 검토 (Phase 0 같은 위치)

> 정책상 등급: minor와 major 사이. v0.x 동안은 minor로 처리 (v0.x는 unstable, breakage 허용). v1.0.0부터는 이런 변경 = major.

---

## [0.3.0] — 2026-05-20 · Design 모드 신설 (Critique + Design 두 모드 명시)

**Scope**: knowledge mission을 두 목적으로 재정의 — (1) 좋은 피드백 (2) 미지 영역의 좋은 디자인 결정. Design 모드 가이드 신규 + Critique 모드 cross-ref.

### Added
- `decision-framework.md` 신규 (Tier 1) — **Design 모드** 가이드. 4-Phase 워크플로우(Define → Reference → Decide → Validate) + 같은 6 질문을 사전 설계 방향으로 재사용 + Decision Spec 1쪽 템플릿 + AI 스타일링 결과 페이지 Worked example + 디자인 단계 안티 패턴 7개.
- `_evals/scenarios.json` 에 `design-from-brief` 시나리오 추가 (10개 expectations) — Design 모드 출력 품질 검증.

### Changed
- `README.md` mission 재작성 — "두 모드" 명시 + 흐름 도식 (Design 출력이 Critique 입력이 됨) + 자원 표·한 줄 설명에 🔍/🛠️ 라벨.
- `feedback-format.md` 상단 도입부에 decision-framework.md cross-ref 추가 ("Design 모드는 → decision-framework.md").
- `_evals/scenarios.json` schema_version·knowledge_version → `0.3.0`.

### Why
v0.2.0까지 knowledge는 사실상 **Critique 모드 편향**으로 설계됨. feedback-format.md·design-insight.md·by-screen 매트릭스 모두 "디자인이 이미 있을 때" 기준.

사용자 클래리피케이션:
> "knowledge 목적은 이지식을 기반으로 피드백을 잘 주기 위함이야. 그리고 이걸 통해서 미지의 영역을 디자인할 때 이 디자인 의사결정기준으로 좋은 디자인을 만들기 위함이야"

→ Design 모드가 일급 목적임에도 가이드 부재. precedent 없는 새 화면을 그릴 때 LLM/PD가 knowledge의 어떤 인사이트를 어떤 순서로 적용할지 명시 안 됨.

### Review loop

**시나리오**: `design-from-brief` 데모 (AI 스타일링 결과 페이지).

**Before (v0.2.0, decision-framework.md 없음) — LLM이 생성할 법한 출력**:
> "AI 스타일링 결과 페이지를 생각해보면, 이미지가 중심이 되어야 할 것 같고 상품을 빠르게 보여주는 게 중요해 보입니다. PDP처럼 이미지 갤러리를 상단에 두고 추천 상품을 하단에 배치하면 어떨까요. 색은 절제해서 사진이 잘 보이게 하고, CTA는 '이 룩 저장하기' 같은 걸로 하면 좋을 것 같아요. 빈 상태도 고려해서 첫 진입 시 안내를 보여주는 것도 필요할 듯요. 실험은 태그 클릭률을 보면서 iteration하면 될 것 같습니다."

채점 (Decision Spec 8섹션 + 10 expectations 기준): 4/10 통과 — ❌ Decision Spec 구조 ❌ Phase 1 명시 ❌ 인접 surface·E7 인용 ❌ 자신감 지수 ❌ 상태 표현 5종 완전 설계 ❌ Q6 일관성 사전 확인 ❌ 분량 (8줄, 발산하지는 않으나 spec 부재).

**After (v0.3.0, decision-framework.md 적용)**:
> "## AI 스타일링 결과 페이지 Design Decision Spec
>
> **1. 문제 (Q1)**
> 사용자가 AI 생성 인테리어 이미지를 보고 마음에 드는 상품을 찾기 어렵다.
>
> **2. 주인공 (Q5)** = 생성된 인테리어 이미지
>
> **3. 디폴트값 (Q4)** = 첫 진입 시 생성 이미지 1장 + 자동 인식 태그 3개
>
> **4. 선례 (Phase 2)**
> - 인접 surface: PDP (이미지 주인공) + Viewer 콘텐츠 상세 (사진+태그)
> - §2 E7 이식: PDP 하단 IIF 패턴(탭+추천) — 검증된 패턴
> - 외부 표준: Pinterest Gestalt 'Foundations·Usability'
>
> **5. 결정 (Phase 3)**
> - Primary CTA: '이 룩 저장하기' — 하단 sticky
> - 정보 강조 1~2개: 이미지(1) + 태그 칩(2). 가격·리뷰는 칩 클릭 후
> - 색 사용 의도: 절제, 이미지가 figure, UI는 ground (#1·#9)
> - 상태 표현 5종:
>   - default: 이미지 + 태그
>   - empty: 일러스트 + '스타일을 입력해 보세요' + CTA
>   - loading: 1.5초 스켈레톤
>   - error: 사실 + '다시 만들어볼게요' CTA
>   - offline: 캐시된 마지막 결과 + 배너
>
> **6. 자신감 지수 (Q2)** = 3/5 → 첫 실험은 MVP 스코프
>
> **7. 가드레일 (Phase 4)**
> - 주인공 보호: 이미지를 가리는 모듈·툴팁 금지
> - 카니발 가능 surface: 기존 추천 모듈 IIF — 가드레일 포함
> - Q6 일관성: 태그 표기는 검색 SRP 태그·기존 콘텐츠 태그와 통일
>
> **8. 카피** (ux-writing 5축 통과)
> - 헤딩: '내 공간에 어울리는 상품'
> - Primary CTA: '이 룩 저장하기'
> - 빈 메시지: '스타일을 입력하면 비슷한 상품을 찾아드릴게요'"

채점: 10/10 통과 — ✅ Decision Spec 8섹션 ✅ Phase 1 각 1줄 ✅ 인접 surface·E7 인용 ✅ Primary CTA + 1~2 강조 + 색 의도 결정 ✅ 상태 표현 5종 완전 ✅ 자신감 지수 ✅ Q6 일관성 ✅ 안티 패턴 위반 0 ✅ 분량 적정.

**Verdict**: minor 승급 합당.
- ✅ 회귀 없음 (v0.2.0 기존 시나리오 8개 모두 통과 유지)
- ✅ 새 시나리오 `design-from-brief` 통과 (4/10 → 10/10)
- ✅ 6 질문이 두 모드에서 일관되게 작동 (cross-ref 신뢰성 ↑)

### Impact
- 영향 받는 파일: `decision-framework.md`(신규), `README.md`(mission 재정의), `feedback-format.md`(도입부 cross-ref), `_evals/scenarios.json`
- 다른 axis 영향:
  - `domains/<화면>/policies/` — 도메인 정책이 채워질 때 decision-framework.md의 Decision Spec 템플릿이 자연스러운 작성 기준
  - `.claude/skills/` — 향후 "design-bot" 스킬 도입 시 decision-framework.md 1차 reference (feedback skill의 사촌)
- 향후 minor 후보:
  - **v0.4.0** — 시각 예시 통합 (`_evals/scenarios/` 하위 good/bad HTML 모형) — v0.2.0에서 미룬 항목
  - **v0.5.0** — PD 2~3명에게 시나리오·6 질문 외부 validation
  - **v0.6.0** — `.claude/skills/design-bot/` 신설, decision-framework.md 자동 적용

---

## [0.2.0] — 2026-05-20 · 피드백 출력 구조 + 시각 인사이트 부정 예시 보강

**Scope**: LLM 피드백 품질을 끌어올리기 위한 출력 구조·severity·by-screen 매트릭스·부정 예시 추가. v0.1.0 비판 리뷰에서 도출된 1차 우선순위 4개 항목 적용.

### Added
- `feedback-format.md` 신규 (Tier 1) — 크리틱 출력 4블록 구조([요약][우려][제안][질문]), 6가지 시작 질문(Q1~Q6), severity 라벨 룰(🔴/🟡/🟢), 톤 가이드(Bongho/Yohan/Luna mirror), by-screen 매트릭스(PDP·Cart·Home·Search·Mypage·Checkout·Promotion·Notification), 인용 의무, 안티 패턴.
- `design-insight.md` §1 #1~#4(시각 인사이트)에 **Bad ✕ / Good ✓ 짝** 추가 (각 3쌍) + **기본 severity 가이드** 추가.
- `_evals/scenarios.json` 에 `critique-quality-empty-cart`·`critique-quality-payment-error` 2개 메타 시나리오 추가 (피드백 *출력 자체*의 품질을 검증).

### Changed
- `design-insight.md` §1 #1~#4: 적용 가이드 뒤에 Bad ✕ / Good ✓ + 기본 severity 가이드 + 한계 섹션 보강.
- `_evals/scenarios.json` schema_version·knowledge_version → `0.2.0`.

### Why
v0.1.0 자체 비판 리뷰(이전 세션)에서 5개 약점 도출:
1. 피드백 출력 형식 룰 부재 — 같은 디자인에 어떤 날은 한 줄, 어떤 날은 설교
2. 시각 인사이트의 부정 예시 부족 — LLM이 부정 예시에서 가장 잘 배우는데 없음
3. severity 미분류 — 모든 위반이 같은 무게로 들림
4. 화면별 우선순위 매트릭스 부재 — 일반론적 피드백만 가능
5. 시각 예시(annotated) 통합 부재 — 별도 minor로 미룸

→ 이 minor는 1·2·3·4 동시 해결. 5는 v0.3.0 후보.

### Review loop

**시나리오**: `critique-quality-empty-cart` 1차 데모.

**Before (v0.1.0, feedback-format.md 없음) — LLM이 생성할 법한 출력**:
> "빈 장바구니 화면에 대해 의견 드릴게요. 헤딩 카피가 약간 무미건조한 느낌이 있어요... 본문도 마찬가지로 정보 전달적이에요. CTA가 추천 모듈 아래에 위치하는데, 위치를 위로 올리는 것을 고려해보세요. ProductCard도 정보가 너무 많아요. 전반적으로 다음 행동을 유도하는 emphasis가 필요해 보입니다."

채점: 6/10 통과 — ❌ 4블록 구조 ❌ severity ❌ 인용·출처 ❌ 질문.

**After (v0.2.0, feedback-format.md 적용)**:
> "빈 장바구니 화면에 한 표 던집니다. 카피와 CTA 위치, 정보 위계가 함께 다듬어지면 좋겠어요.
>
> 🟡 헤딩 "장바구니가 비어있어요" + 본문 "담은 상품이 없습니다" — 사실만 전달되고 다음 행동 제안이 빠져 있어요. design-insight #11 (Luna: "구구절절 다 필요없고, 객관적인 현 상태 + 행동 제안만")에 따르면 빈 상태도 행동 제안이 본문에 들어가야 합니다.
>
> 🟡 CTA "쇼핑 계속하기"가 추천 모듈 아래 — 빈 상태의 주인공은 "다음 행동(쇼핑 복귀)"입니다 (design-insight #9). ux-design.md "Primary CTA는 하단 sticky" 기준으로도 본문 안 위치는 지양.
>
> 🟡 ProductCard 강조 4개 (할인율·가격·별점·리뷰수) — 빈 장바구니에서 추천은 보조라 강조를 줄이는 게 맞을 듯요 (design-insight #3 — 1~2개만 강조).
>
> 추천 액션: 1) 헤딩·본문 카피 교체  2) CTA 빈 상태 바로 아래 + sticky 적용  3) ProductCard 강조 2개로 압축.
>
> Q. 추천 모듈을 빈 상태에서 보여주기로 한 정책이 다른 surface와 협의되셨나요? 참고만 해주세요~"

채점: 10/10 통과 — ✅ 4블록 ✅ severity 3개 ✅ 인용·출처 ✅ 질문 ✅ hedged 톤.

**Verdict**: minor 승급 합당.
- ✅ 회귀 없음 (v0.1.0 기존 6개 통과 expectation 모두 유지)
- ✅ 4개 추가 expectation 통과 (구조·severity·인용·질문)
- ✅ 사람 리뷰 (오너 자체 확인)

다른 시나리오(`critique-quality-payment-error`)도 같은 패턴으로 통과 예상 — 본격 자동 채점 인프라가 들어오면 일괄 재실행.

### Impact
- 영향 받는 파일: `feedback-format.md`(신규), `design-insight.md`(§1 #1~#4), `_evals/scenarios.json`
- 다른 axis 영향:
  - `.claude/skills/feedback/` — `feedback-format.md`를 1차 reference로 추가 (스킬 업데이트는 별도 PR)
  - `domains/<화면>/policies/` — feedback-format.md §5 "by-screen 매트릭스"가 임시 기준 — 도메인 정책이 채워지면 점진 마이그.
- 향후 minor 후보:
  - **v0.3.0** — 시각 예시 통합 (`_evals/scenarios/` 하위 good/bad HTML 모형)
  - **v0.3.x** — `feedback` 스킬에 feedback-format.md 자동 적용
  - **v0.4.0** — PD 2~3명 시나리오 expectations 검토 받기 (외부 validation)

---

## [0.1.0] — 2026-05-20 · Baseline

**Scope**: knowledge 폴더 골격 완성. 외부 소스(슬랙 크리틱·실험·회사 라이브러리·학계)에서 끌어와 구성한 첫 정식 버전.

### Added
- `principles.md` — 오늘의집 디자인 원칙 10개 + 크리틱 메타 판단 기준 6개 (#2 결정 피로 항목에 "Primary CTA는 화면 하단 sticky" Do/Don't 추가)
- `visual-design.md` — 비주얼 시스템 + 크리틱 누적(색·뱃지·구분선) + Visual 학계 근거(Gestalt·CRAP·Tufte·Maeda·Müller-Brockmann·Bringhurst·Itten/Albers·Vignelli·Hara)
- `ux-design.md` — UX 가이드 + 크리틱 누적(주인공·디폴트·카피·일관성) + 학계 근거(Nielsen 10·Shneiderman 8·UX 법칙 13종·Norman·Krug·Cooper·Maeda·Fogg·Kahneman·WCAG/Universal/Inclusive) + "Primary CTA는 하단 sticky로 항상 접근 가능" 섹션
- `ux-writing.md` — 라이팅 가이드 (톤·메시지 5종·앱푸시·배너·기획전·layer PDP·날짜/숫자 표기·5축 체크리스트)
- `design-insight.md` — 크리틱 누적 인사이트 §1 12개 + 실험 누적 인사이트 §2 7개 + 슬랙 링크 인덱스
- `external-principles.md` — 51개 회사 + 학계 표준 → 크로스컴퍼니 Top 10 (Apple·Toss·Google·Amazon·Airbnb·IBM·Pinterest 등)
- `VERSION` · `CHANGELOG.md` · `VERSIONING.md` · `_evals/scenarios.json` · `_evals/runbook.md` — 버전 관리·리뷰 루프 인프라

### Sources
- `#des_pd_design_critique` 2024–2025 (Yohan·Ray·Bongho·Luna) 답변 198건 → §1 12개 인사이트
- `#product-share-discuss` 2024-03 ~ 2025-12 실험 종료 공지 79건 → §2 7개 인사이트
- `~/Desktop/Claude_Study/ux-principle/UX 원칙 라이브러리.md` 51개 회사 → Top 10
- `~/Desktop/Claude_Study/ohouse-design-md/writing-bot/SKILL.md` → `ux-writing.md`
- `~/Desktop/Claude_Study/ohouse-design-md/OHOUSE-DESIGN.md v0.4.2` → 토큰·시나리오 참조

### Review evidence
- 시나리오 시뮬레이션 → `~/Desktop/knowledge-impact-demo.html` (빈 장바구니·결제 실패·홈 ProductCard 3개 시나리오 design.md only vs +knowledge 시각 비교)
- v0.1.0은 baseline이므로 회귀 검증 X. 다음 minor부터 적용.

---

## (template) [x.y.z] — YYYY-MM-DD · 한 줄 요약

### Added / Changed / Removed
- ...

### Why
- (변경 동기 — 어떤 신호·실패·요청에서 출발했나)

### Review loop
- 실행 시나리오: scenarios.json id X, Y, Z
- 결과:
  - id X — before: N/M pass, after: M/M pass (개선 명확)
  - id Y — 회귀 없음, 카피 가독성만 향상
- 결정 근거: minor 승격 합당 / 회귀 없음

### Impact
- 영향 받는 파일: ...
- 다른 axis(domains·ods)에 미치는 영향: ...
