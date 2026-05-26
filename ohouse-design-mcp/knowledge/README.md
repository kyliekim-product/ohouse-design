---
tier: 2
when-to-read: "디자인 지식(원칙·비주얼·UX·인사이트·피드백) 어디 있는지 찾을 때"
size: "~400 tokens"
owner: 요한
---

# Knowledge — 디자인 지식 축

ODS(`ods-docs/`)·도메인(`domains/`)과 함께 이 repo의 **3축 중 하나**. 사람의 판단을 돕는 비-기계 지식.

> **현재 버전**: `0.9.0` ([VERSION](./VERSION)) · 이력: [CHANGELOG.md](./CHANGELOG.md) · 변경 정책: [VERSIONING.md](./VERSIONING.md)

## 🎯 Mission — 두 가지 목적

knowledge는 **두 모드를 동시에** 서비스한다.

1. 🔍 **Critique 모드** — 기존 디자인에 **좋은 피드백**을 주기 위해 → [`feedback-format.md`](./feedback-format.md)
2. 🛠️ **Design 모드** — 미지의 영역을 디자인할 때 **좋은 디자인 결정**을 내리기 위해 → [`decision-framework.md`](./decision-framework.md)

같은 인사이트·원칙을 두 방향으로 쓴다. Design 모드의 출력(Decision Spec)이 Critique 모드의 입력이 되며, 크리틱 결과는 다시 design-insight로 누적되어 다음 결정의 근거가 된다.

---

## 📂 구성

| 파일 | 용도 | Tier |
|---|---|---|
| `principles.md` | **오늘의집 원칙 10개 (3-소스 교차 검증: 슬랙 크리틱 + 51개 회사 + 학계)** + 메타 판단 기준 5개 + 크로스컴퍼니 Top 10 + Toss + 라이브러리 부록 | 1 |
| `visual-design.md` | 전사 비주얼 시스템 (브랜드·컬러·타이포·모션) + 크리틱 누적 + Visual 학계 근거 | 1 |
| `ux-design.md` | UX 설계 가이드 (플로우·정보구조·인터랙션·상태) + 크리틱 누적 + UX 학계·법칙 | 1 |
| `ux-writing.md` | UX Writing 가이드 (톤·메시지 5종·앱푸시·배너·기획전·layer PDP·날짜/숫자 표기·체크리스트) | 1 |
| `feedback-format.md` | **Critique 모드** — 디자인 크리틱 출력 가이드 (4블록·5질문·severity·by-screen·톤) | 1 |
| `decision-framework.md` | **Design 모드** — 미지 영역 디자인 결정 가이드 (4-Phase 워크플로우·Decision Spec 템플릿) | 1 |
| `design-insight.md` | 디자인 크리틱·실험 누적 인사이트 13+7개 + Bad/Good 짝 + 슬랙 링크 인덱스 | 2 |
| `VERSION` · `CHANGELOG.md` · `VERSIONING.md` | SemVer 기반 버전 관리 + 변경 이력 + 등급 정책 | 2 |
| `_evals/scenarios.json` · `_evals/runbook.md` | Before/After 리뷰 루프 시나리오 10개 + 실행 가이드 | 2 |
| `../.claude/skills/feedback/` (포인터) | 피드백 자동화 스킬 (Claude Code 메커니즘상 .claude 유지) | 1 |
| `../.claude/skills/writing-bot/` (포인터) | 라이팅봇 스킬 — `ux-writing.md` 규칙의 실행 가능 버전 | 1 |

---

## 🧭 각 자원 한 줄

### `principles.md` — 행동 지침 (3-소스 교차 검증, 인용 최대 2개)
**"어떻게 디자인할 것인가"**. 오늘의집 원칙 10개 — 각 원칙이 **세 갈래로** 지지됨:
1. 💬 **오늘의집 증거** — 슬랙 크리틱 PD 답변 인용 (현장 사례, 편향 가능)
2. 🌐 **산업 표준** — Apple/Toss/Nielsen 등 (크로스컴퍼니 합의)
3. 📚 **학계 근거** — Nielsen·Norman·Tufte·Gestalt·UX 법칙 등 (외부 권위)

**과잉 인용 금지** — 각 원칙은 1차 출처 1개 + 보조 최대 2개로 단단하게 받침. 권위는 quantity가 아닌 quality. + 메타 판단 기준 5개 + 우선순위 + Toss 핵심 매핑 + "어디서 무엇을 끌어쓰나" 매트릭스 + 외부 라이브러리 링크.

### `visual-design.md` — 비주얼 마스터
**"무엇을 쓸 것인가"**. 브랜드·컬러·타이포·스페이싱·모션·다크모드·플랫폼. + **크리틱 누적**(색·뱃지·구분선 실사용 원칙) + **학계 근거**(Gestalt·CRAP·Tufte·Maeda·Müller-Brockmann·Bringhurst·Itten/Albers·Vignelli·Hara).

### `ux-design.md` — UX 설계 가이드
**"어떻게 경험을 설계할 것인가"**. 한 화면 한 결정 (**Primary CTA는 하단 sticky로 항상 접근 가능**), 정보구조, 플로우 설계, 인터랙션, 상태 표현 5종(default/empty/loading/error/offline), 모션·접근성·마이크로카피. + **크리틱 누적**(1순위·디폴트·카피·일관성) + **학계 근거**(Nielsen 10·Shneiderman 8·Norman *DOET*·Krug·Cooper·Maeda·Fogg·Kahneman + UX 법칙 13종 + WCAG/Universal/Inclusive).

### `ux-writing.md` — 라이팅 가이드
**"어떤 단어로 말할 것인가"**. 톤(해요체 기본·"당신" 금지·"오늘의집" 직접 언급 금지·밈/과장 금지) + 메시지 유형 5종 + UI 요소별 + 앱푸시 + 배너 + 기획전 + layer PDP + 날짜·숫자·금액 표기 + 5축 체크리스트.

### `feedback-format.md` — 🔍 Critique 모드 가이드
**"어떻게 피드백을 줄 것인가"**. 5가지 시작 질문(문제·변수·디폴트·1순위[조건부]·일관성) + 4블록 출력 구조 + severity 라벨(🔴/🟡/🟢) + Bongho/Yohan/Luna mirror 톤 + by-screen 매트릭스(8개 화면) + 인용 의무 + 안티 패턴.

### `decision-framework.md` — 🛠️ Design 모드 가이드
**"어떻게 결정할 것인가"**. precedent 없는 미지 영역의 4-Phase 워크플로우(Define → Reference → Decide → Validate) + 같은 5 질문을 사전 설계 방향으로 재사용 + Decision Spec 1쪽 템플릿 7섹션 + Worked example + 안티 패턴.

### `design-insight.md` — 인사이트 누적
두 갈래 소스. ① **크리틱 누적 인사이트** — `#des_pd_design_critique` 채널 2024–2025년 PD 크리틱 답변(Yohan·Ray·Bongho·Luna)을 분류·일반화한 11개 인사이트, 스레드별 슬랙 링크 인덱스 포함. ② **화면 실험 인사이트** — `#product-share-discuss` 채널·도메인 `experiments/`에서 전사 적용 가치 있는 발견 7개 승격. A/B win 자체가 아니라 **why**와 일반화 가능한 패턴.

### `../.claude/skills/feedback/` · `../.claude/skills/writing-bot/` (포인터)
디자인 피드백·라이팅 자동화 스킬. 실제 파일은 `.claude/skills/`에 — 여기는 포인터만.

---

## 🔄 다른 축과의 관계

- **vs ODS** (`ods-docs/`): ODS는 "기계가 쓰는 명세" — 컴포넌트·토큰·패턴 spec. knowledge는 "사람이 쓰는 판단 기준".
- **vs Domains** (`domains/`): 화면별 `policies/`는 전사 `principles.md` 의 override·보강. 화면 `experiments/`에서 발견한 정성 인사이트가 누적되면 `design-insight.md`로 승격.
- **knowledge 내부 흐름**: `principles.md`(외부+내부 교차) → 실사용 가이드(`ux-design.md`·`visual-design.md`·`ux-writing.md`) → 두 모드 가이드(`feedback-format.md`·`decision-framework.md`) → 누적 학습(`design-insight.md`).

---

## 🔖 버전 관리 · 리뷰 루프

knowledge는 신뢰의 단위가 있어야 한다. 함부로 바뀌지 않고, 바뀌면 **"정말 좋아졌는가"** 를 증명한다.

- **SemVer** `major.minor.patch` (`VERSION` 파일이 단일 진실)
  - **patch** 0.0.x — 오타·문구·링크 정비. 리뷰 루프 생략 가능.
  - **minor** 0.x.0 — 새 섹션·인사이트·파일. 리뷰 루프 **필수** (회귀 없음 + 개선 증거).
  - **major** x.0.0 — 원칙 폐기·재정의·구조 개편. 리뷰 루프 + 영향 분석 + 2명+ 승인.
- **리뷰 루프** = `_evals/scenarios.json` 의 시나리오에 대해 **Before(현재 VERSION) vs After(proposed)** 출력을 비교. 각 expectation을 binary 채점. 회귀 없으면 minor 승급.
- 모든 minor·major 변경은 `CHANGELOG.md` 에 ① 변경 ② Why ③ 리뷰 루프 결과 ④ Impact 4블록으로 기록.

실행 방법: [VERSIONING.md](./VERSIONING.md) 정책 · [_evals/runbook.md](./_evals/runbook.md) 단계별 절차.
