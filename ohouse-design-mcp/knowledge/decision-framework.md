---
tier: 1
when-to-read: "새 화면·기능을 처음 설계할 때 / 정해진 패턴이 없는 영역에서 의사결정이 필요할 때"
size: "~2.2k tokens"
deps: [./principles.md, ./design-insight.md, ./principles.md, ./feedback-format.md]
owner: 요한
---

# Decision Framework — 미지 영역 디자인 결정 가이드

knowledge 폴더는 **두 모드**를 동시에 서비스한다.

- 🔍 **Critique 모드** — 디자인이 이미 있을 때 좋은 피드백을 주기 위해 → [`./feedback-format.md`](./feedback-format.md)
- 🛠️ **Design 모드** — 미지의 영역에서 좋은 디자인 결정을 내리기 위해 → **이 문서**

같은 인사이트·원칙을 **반대 방향**으로 적용한다. critique는 사후 검증, design은 사전 설계.

---

## 1. 언제 이 문서를 펴나

- 새 화면·기능을 **처음** 설계 (관련 도메인 정책·precedent 없음)
- ODS·도메인 어디에도 없는 패턴이 필요할 때
- 두 가지 안 중 선택해야 하는데 **원칙 두 개가 충돌**할 때
- 데이터·실험 결과가 없는 영역에서 **첫 디자인 결정**을 내릴 때

precedent가 있으면 그것부터 본다 (`design-insight.md` §2 **E7** — 검증된 UX 패턴은 인접 surface로 거의 그대로 이식). 이 문서는 precedent가 **없을 때**.

---

## 2. 4-Phase 워크플로우

### Phase 1 — **Define** (정의)

답해야 할 2가지 (+ 조건부 1가지):

| 질문 | 출력 | 근거 |
|---|---|---|
| **Q1 문제** — 이 디자인이 푸는 사용자 문제 한 문장 | "사용자 X가 Y할 때 Z를 못 한다" | design-insight #7 |
| **Q3 디폴트값** — 사용자가 아무 설정도 안 바꿀 때 보여줄 상태 | 구체 화면 한 줄 | design-insight #8 |
| **Q4 1순위** *(조건부)* — competing priorities가 있는 화면이면 1순위 명시 | 한 단어 또는 한 컴포넌트 (자명하면 skip) | design-insight #9 |

이 두 개(Q1·Q3)를 1줄씩 적은 뒤 진행. **둘 중 하나라도 답이 모호하면 이 단계로 돌아온다.** Q4는 화면에 2+ 우선순위가 동시 있을 때만 명시.

### Phase 2 — **Reference** (선례 끌어쓰기, 합성 우선순위)

발명 전에 80%의 결정이 여기서 끝나야 한다. **Composition Order**를 엄격히 따른다 — atomic design 사상.

```
ODS 컴포넌트 → domain 컴포넌트 → 인접 화면 패턴 → 외부 표준 → 발명
    (atom)      (organism)       (template)     (reference)   (last resort)
```

1. **🧱 ODS 컴포넌트 먼저** — [`../ods/content/components/`](../ods/content/components/)
   - 사용할 컴포넌트가 ODS에 이미 있나? **90%는 여기서 끝난다.**
   - BoxButton · Card · Chip · Input · ProductCard · ScrapButton · Section · Switch · Tab · Thumbnail 등 — 토큰·variant·spec 정의됨
   - ODS 컴포넌트 안 쓰면 일관성·다크모드·접근성 모두 깨짐

2. **🏗️ Domain 컴포넌트·정책 확인** — `../domains/<해당 화면>/components/` + `../domains/<해당 화면>/policies/`
   - **policies/**: 이 화면의 디자인 정책 (전사 원칙 override·보강). **최우선 권위**. 있으면 그대로 따른다
   - **components/**: ODS에 없는 화면 특수 변형이 이미 등록돼 있나?
   - 같은 화면 작업이라면 같은 트랙 컴포넌트·정책을 우선 차용
   - 인접 화면 (예: home → category-home) 정책·컴포넌트도 참고

3. **🗺️ By-screen 매트릭스** ([feedback-format.md §5](./feedback-format.md)) — 가까운 화면 카테고리 (PDP·Cart·Home·Search·Mypage·Checkout·Promotion·Notification)의 critical 인사이트 top 5 적용

4. **🔄 §2 E7 이식** — 인접 surface에서 win한 패턴이 있나? 있으면 **그대로 이식 우선**

5. **🌐 External Top 10** + **📚 학계** — 외부 표준(Toss `Value First` · Pinterest Gestalt · Fitts/Hick)이 답을 빌려줄 수 있는가

6. **🔨 발명 — 가장 마지막**
   - 위 5단계 모두 안 맞을 때만
   - 새 컴포넌트는 반드시 `domains/<화면>/components/`에 등록 (`meta.yaml` + `spec.md` + `guide.md`)
   - 5+ 화면에서 누적되면 **ODS 승격 후보**로 표기 (`@ods-promotion-candidate`)

> 합성 우선순위는 **신뢰의 단위**다. ODS를 먼저 쓰면 모두가 그 결과를 신뢰한다 — 일관성·다크모드·접근성·토큰 모두 자동.

### Phase 3 — **Decide** (결정·우선순위)

선택지가 둘 이상이고 원칙·인사이트가 충돌하면:

- **원칙 우선순위** (`principles.md`): 접근성 → 가독성 → 일관성 → 결정 피로 → 나머지
- **디폴트값에 가장 많은 시간** (design-insight #8): 입력·변경 옵션보다 디폴트 상태에 공력을 더
- **1순위 보호** (design-insight #9, 조건부): competing priorities가 있는 화면이면 새 요소가 1순위를 가리지 않는지 확인. 가리면 **Phase 1로 회귀**

이 단계에서 결정해야 할 최소 항목:

- Primary CTA 위치 (보통 하단 sticky — `ux-design.md` Primary CTA 섹션)
- 정보 강조 **1~2개** (design-insight #3)
- 색 사용 의도 (design-insight #1)
- 상태 표현 **5종** 모두 (default · empty · loading · error · offline — `ux-design.md`)

### Phase 4 — **Validate** (검증·일관성·실험 설계)

머지/QA 전에 점검:

- **Q3 변수 통제** (design-insight #6): A/B로 검증할 거면 변수가 하나로 격리됐는가
- **Q6 일관성** (design-insight #12): 같은 개념이 다른 화면에서 어떻게 불리는지 확인했는가
- **§2 E2 mid-funnel → output**: 인지/탐색 lift만으로 GMV·Buyer 도달 보장 X — multi-step iteration plan 별도 필요?
- **§2 E3 카니발리제이션**: 신규 인벤토리·모듈이 인접 surface 매출/콘텐츠 소비를 잠식하나? 가드레일에 포함?
- **카피 체크리스트** (`ux-writing.md` 5축): 모든 노출 카피가 통과?

---

## 3. Decision Spec 템플릿

새 화면 결정을 **1쪽**으로 적는 양식. 크리틱·리뷰 받기 전에 이 spec부터 정리.

```markdown
## [화면 이름] Design Decision Spec

### 1. 문제 (Q1)
사용자 ___ 가 ___ 할 때 ___ 를 못 한다.

### 2. 디폴트값 (Q3)
유저가 설정을 안 바꿀 때 보일 상태 = ___

### 3. 1순위 (Q4, 조건부)
*(competing priorities가 있는 화면일 때만 작성)*
이 화면 최우선 = ___

### 4. 선례 (Phase 2 — Composition Order)
- 🧱 사용한 ODS 컴포넌트: ___ (예: BoxButton·Card·Chip)
- 🏗️ 참고한 domain 컴포넌트: ___ (없으면 "없음")
- 🗺️ 가장 가까운 surface (by-screen): ___
- 🔄 §2 E7 이식 가능 패턴: ___
- 🌐 외부 표준 인용 (Top 10 / 학계): ___
- 🔨 신규 발명 컴포넌트: ___ (있으면 `domains/<화면>/components/`에 등록 여부)

### 5. 결정 (Phase 3)
- Primary CTA 위치: 하단 sticky / 본문 / 기타 + 이유
- 정보 강조 1~2개: ___
- 색 사용 의도: ___
- 상태 표현 5종 설계:
  - default: ___
  - empty: ___
  - loading: ___
  - error: ___
  - offline: ___

### 6. 가드레일 (Phase 4)
- 가리지 않을 1순위 요소 (조건부): ___
- 카니발 가능 surface: ___
- 다른 화면과의 일관성 (Q5): 같은 개념을 다른 화면에서 ___ 로 부른다 — 일치?

### 7. 카피 (ux-writing 5축 통과 후)
- 헤딩: ___
- 본문: ___
- Primary CTA 라벨: ___
- 빈/에러 메시지: ___
```

---

## 4. Critique vs Design — 같은 5 질문, 반대 방향

| 질문 | Critique 모드 (`feedback-format.md`) | Design 모드 (이 문서) |
|---|---|---|
| **Q1 문제-솔루션** | "솔루션이 문제를 푸나요?" 검증 | 문제 한 줄 정의가 출발점 |
| **Q2 변수 통제** | 실험 설계 부족 지적 | Phase 4에서 실험 설계 시 변수 통일 |
| **Q3 디폴트값** | "디폴트 공들였나" 검증 | 디폴트값 1순위 결정 |
| **Q4 1순위** (조건부) | "1순위 가리지 않나" 검증 | competing priorities 있을 때 정의 |
| **Q5 일관성** | "다른 화면과 통일됐나" 검증 | 다른 화면 표기 사전 확인 |

→ 5질문은 **공유 가설 세트**. 출발점만 다르다.

---

## 5. Worked Example — "AI 스타일링 결과 페이지" 설계

precedent 거의 없는 미지 영역. 4단계 적용 사례.

### Phase 1 Define
- **문제**: 사용자가 AI가 생성한 인테리어 이미지를 보고 마음에 드는 상품을 찾기 어렵다
- **1순위**: 생성된 인테리어 이미지
- **디폴트**: 첫 진입 시 생성된 이미지 1장 + 자동 인식 태그 3개

### Phase 2 Reference (Composition Order)
- 🧱 **ODS**: `Card` (이미지 컨테이너) + `Chip` (태그) + `BoxButton brand-solid large` (Primary CTA) + `Empty` (생성 안 한 상태)
- 🏗️ **Domain 컴포넌트**: `domains/content-detail/components/` 의 Hero(3:4) + Stats Row 차용 검토
- 🗺️ **인접 surface**: PDP (이미지 1순위) + Viewer 콘텐츠 상세 (사진+태그)
- 🔄 **§2 E7 이식**: PDP 하단 IIF 패턴 (탭 + 추천) 그대로 — 검증된 패턴
- 🌐 **외부 표준**: Pinterest Gestalt "Foundations · Usability" — 이미지 중심
- 🔨 **발명 없음** — 모든 요소가 ODS·domain·이식 패턴으로 커버됨

### Phase 3 Decide
- Primary CTA: **"이 룩 저장하기"** — 하단 sticky
- 정보 강조: 이미지(1순위) + 태그 칩(2순위). 가격·리뷰는 칩 클릭 후 노출
- 색 사용 의도: 절제 — 이미지가 figure, UI는 ground (`design-insight.md` #1·#9)
- 상태 표현 5종:
  - default: 이미지 + 태그
  - empty: 첫 진입 / 생성 안 한 상태 → 일러스트 + "스타일을 입력해 보세요" + CTA
  - loading: 생성 중 1.5초 스켈레톤 (Doherty Threshold 400ms 넘어가는 작업)
  - error: 생성 실패 → 사실 + 재시도 제안 ("다시 만들어볼게요" CTA)
  - offline: 캐시된 마지막 결과 + 배너

### Phase 4 Validate
- Q3 변수: 첫 실험은 "태그 클릭 → 상품 도달률" 변수 하나만 측정
- Q6 일관성: 태그 표기는 검색 SRP의 태그·기존 콘텐츠 태그와 통일
- §2 E2 mid→output: 태그 클릭(mid-funnel) lift만으로 GMV 보장 X → 후속 iteration "태그→상품→구매" multi-step plan 별도
- §2 E3 카니발: 기존 추천 모듈과 attention 잠식 가능 → 가드레일에 IIF 거래액 포함

### 결과
Decision Spec 1쪽으로 정리 → 크리틱 받기 (이 시점부터 `feedback-format.md` 모드).

---

## 6. 안티 패턴 — 디자인 단계에서 절대 하지 말 것

| 안티 패턴 | 왜 나쁜가 |
|---|---|
| ❌ Phase 1 건너뛰고 Phase 2부터 | 선례를 끌어쓰지만 문제·디폴트가 정의 안 된 채로 — 인접 패턴이 안 맞을 수 있음 |
| ❌ **ODS 컴포넌트 안 보고 발명** | composition order 위반 — 일관성·다크모드·접근성·토큰 모두 깨짐. 5+ 화면 누적 시 ODS 승격 못 함 |
| ❌ 새 패턴 발명 우선 | by-screen 매트릭스·E7 안 본 채로 — 일관성 깨고 ODS 승격 불가 |
| ❌ 디폴트값을 마지막에 | 가장 중요한 결정이 가장 적은 시간을 받음 (design-insight #8) |
| ❌ 상태 표현 5종 중 일부만 설계 | 빈 상태·에러가 빠지면 PR reject (principles #5) |
| ❌ 신규 컴포넌트 만들고 도메인 등록 안 함 | `domains/<화면>/components/`에 spec 안 남기면 다른 PD가 못 찾음 — 중복 발명 |
| ❌ 일관성 검사를 마지막에 | 이미 발산된 후 — 다른 화면과의 충돌이 늦게 발견됨 |
| ❌ Decision Spec 없이 바로 Figma 시작 | 결정 근거가 머릿속에만 — 크리틱·리뷰가 비효율 |

---

## 7. 두 모드 사이 흐름

```
[브리프 도착]
    ↓
[Design 모드 — 이 문서]
    ↓  Phase 1 Define → Phase 2 Reference → Phase 3 Decide → Phase 4 Validate
    ↓
[Decision Spec 1쪽 완성]
    ↓
[Figma 설계]
    ↓
[크리틱 요청 → Critique 모드 — feedback-format.md]
    ↓
[피드백 반영 → Figma 업데이트]
    ↓
[QA → 머지 → 실험 → 결과]
    ↓
[누적 학습 → design-insight.md §2 승급 후보]
```

Design 모드의 **출력**이 Critique 모드의 **입력**이 된다. 그래서 Decision Spec이 잘 적혀 있을수록 크리틱이 빠르고 정확해진다.

---

## 8. 관련

- `./feedback-format.md` — 같은 6 질문, critique 방향
- `./principles.md` — 원칙 10개 + 메타 판단 기준
- `./design-insight.md` — §1 크리틱 인사이트 12개 · §2 실험 인사이트 7개 (E7 이식 패턴 핵심)
- `./principles.md` — Top 10 + 51개 회사 라이브러리
- `./ux-design.md` · `./visual-design.md` · `./ux-writing.md` — 결정 디테일의 spec
- `./_evals/scenarios.json` `design-from-brief` — 이 문서의 효과 검증 시나리오
