---
tier: 1
when-to-read: "이 repo 가 왜 있고 끝 그림이 뭔지 처음 이해할 때"
size: "~1.5k tokens"
owner: 요한
audience: human-only
---

# 끝 그림 — 우리가 만들고 있는 것

> **12주 후 (2026-08), 이 repo 가 PD 일상에서 어떻게 동작하는지.**
> 한 페이지로 보는 vision. 자세한 plan은 [`_meta/plans/`](plans/), 결정 근거는 [`_meta/decisions/`](decisions/).

---

## ✨ 한 줄로

**Figma 화면을 Claude 에 던지면 30 초 안에 ODS 적합한 코드가 나오는 공유 자산.**

PD 18명이 자기 화면 단위로 작업하고, AI 가 1 차 리뷰하고, 표준이 자동 축적된다.

---

## 🎬 일상 시나리오 3 개 (W12 기준)

### Scenario 1 — 새 화면 디자인 (Stella)

```
1. Claude Code 에 "쇼핑 카테고리 홈 디자인 만들어줘"
2. /contribute 스킬 자동 발동
3. Claude 가 로드:
   ├── domains/category-home/policies/  ← 화면 정책
   ├── domains/home/screens/default/    ← 비슷한 기존 화면 참고
   └── ods-docs/content/components/     ← 필요 컴포넌트만 선별
4. ODS Hermes MCP 가 Figma 컴포넌트 자동 매핑
5. domains/category-home/screens/default/prototype.html 생성 (마커 포함)
6. 자동 PR → AI 1차 리뷰 → 동료 PD approve → 머지
```

**걸린 시간**: 30 분 (기존 4 시간) · **PD 가 보는 화면 수**: 3 개 → 0 개 (Claude 가 다 선별)

### Scenario 2 — ODS 컴포넌트 사용법 (Jenna)

> "Button variant=primary 어떻게 써?"

Claude 가 `ods-docs/content/components/button/spec.md` 만 로드 → 5 초 안에 정확한 코드 + anti-pattern 까지 답변. 다른 PD 가 작년에 빠진 함정도 자동 회피.

### Scenario 3 — 디자인 정책 충돌 (요한)

> "쇼핑은 콘텐츠보다 카드 간격 좁아도 돼?"

Claude 가 `domains/shopping/policies/spacing.md` (전사 override) ↔ `knowledge/principles.md` 비교 → 명확한 근거 제시. 결정되면 `_meta/decisions/2026-XX-shopping-spacing.md` ADR 로 응결.

---

## 📐 끝 그림 (구조)

```
bucketplace/product-design (W12)
├── 📋 사람용 진입점
│   ├── README.md ───────────── "이 repo 가 뭐고 왜 있는지" (3 분)
│   ├── CONTRIBUTING.md ──────── "어떻게 기여하는지" (5 분)
│   ├── OWNERS.md ────────────── 화면 18개 오너 모두 확정
│   └── _meta/VISION.md ──────── 끝 그림 (이 파일)
│
├── 🧠 지식 축 (knowledge/) ────── 원칙·비주얼·UX·실험 인사이트 누적
│
├── 🧩 ODS (ods-docs/) ────────── 50+ 컴포넌트 spec 완성 (Tyler)
│   └── + ods-hermes MCP ──────── Figma 자동 매핑 동작 중
│
├── 🗺️ 화면 18 개 (domains/) ───── 모두 1+ 변형 채워짐
│   └── 각 화면: screens / components / policies / experiments
│
├── 🤖 자동화 (.claude/ + .github/)
│   ├── /contribute · /feedback · /spec-component · /collect-screen 스킬
│   ├── CI: content-lint (frontmatter / 링크)
│   └── claude-review: PR 자동 1차 리뷰
│
└── 📚 governance (_meta/)
    ├── decisions/ ─────────────── ADR 누적 (큰 결정 추적)
    ├── plans/ ───────────────── 진행 중 계획
    └── discussions/ ─────────── 원본 탐색 로그
```

---

## 📊 측정 지표

| 지표 | W1 (지금) | W4 | W8 | W12 (끝) |
|---|---|---|---|---|
| 화면 도메인 active (1+ 산출물) | 0 | 6 | 12 | **18** |
| ODS 컴포넌트 spec.md | ~10 | 25 | 40 | **50+** |
| 활성 PD (월 PR ≥1) | 1 (요한) | 4 | 8 | **12+** |
| "30 초 와우 모먼트" 달성 | 0% | 30% | 60% | **80%** |
| Claude 1차 리뷰 정확도 | — | — | 75% | **90%** |
| 평균 LLM 세션 토큰 | ~8k | ~6k | ~5k | **~4k** |

---

## 🚫 안 하는 것 (out of scope)

- **Figma 자체 디자인 작업 대체** — 디자이너가 손으로 그리는 단계는 Figma 가 답
- **Production 코드 직접 생성** — 우리 산출물은 prototype/spec, 실제 구현은 개발팀
- **디자인 시스템 시각 디자인 변경** — Tyler · ODS 팀 영역
- **의사결정 자동화** — Claude 는 근거를 모아 보여줄 뿐, 결정은 사람이

---

## 🛣️ 마일스톤

- **W1~W2** (2026-05) — repo scaffold + 운영 자동화 (CI + AI 리뷰) ← **지금 여기**
- **W3~W4** (2026-05~06) — 화면 6 개 active, ODS 핵심 20 컴포넌트 spec
- **W5~W8** (2026-06~07) — 화면 18 개 모두 1 변형 이상, PD 8 명 PR 경험
- **W9~W12** (2026-07~08) — Hermes MCP 안정화, 끝 그림 달성, V2 계획 시작

---

## 🤔 자주 받는 질문

**Q. 왜 Markdown 만으로? Figma 가 있는데**
A. LLM 이 읽기 위해. Figma 디자인은 그대로 있고, 이건 LLM 이 *맥락*을 빠르게 잡기 위한 메타 레이어.

**Q. PD 가 git 을 왜 해야 하나**
A. 본인은 안 해도 됨. Claude Code / GitHub 웹 에디터가 git 을 대신 해줌. [`CONTRIBUTING.md`](../CONTRIBUTING.md) 참고.

**Q. 다른 디자인 시스템 회사들도 이렇게 하나**
A. 아직 없음. 이게 우리가 만드는 차별점. ([`_meta/decisions/`](decisions/) 에 근거 누적 중)

**Q. 끝 그림에서 더 멀어지면 어떻게 알아채나**
A. 위 지표를 격주로 측정 + `_meta/plans/` 에 status 갱신. 분기 1 회 vision 재검토.
