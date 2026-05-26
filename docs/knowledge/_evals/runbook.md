---
tier: 2
when-to-read: "knowledge 변경 후 리뷰 루프를 실제로 돌릴 때"
size: "~800 tokens"
owner: 요한
---

# Knowledge Review Loop — Runbook

knowledge 폴더 변경의 의미를 **Before vs After 시뮬레이션**으로 검증하는 실제 절차.

> 정책: `../VERSIONING.md` · 시나리오: `./scenarios.json` · 결과 기록: `../CHANGELOG.md`

---

## 1. 언제 돌리나

- **minor·major 변경 PR을 열기 전.** patch는 생략 가능.
- 시나리오를 새로 추가했을 때, 그 시나리오 단독으로 한 번 돌려서 baseline을 기록.

---

## 2. 입력 준비

1. **proposed change**의 정확한 diff (어떤 파일·섹션·라인이 바뀌는지)
2. **affected scenarios** 식별 — `scenarios.json` 의 시나리오 중 영향 받는 것을 고른다. 보통:
   - `principles.md` 변경 → 거의 모든 시나리오
   - `visual-design.md` 변경 → empty-cart, payment-error, product-card-density
   - `ux-design.md` 변경 → empty-cart, payment-error, sticky-cta-placement, module-title-content-match
   - `ux-writing.md` 변경 → push-notification, iif-banner, payment-error, empty-cart
   - `design-insight.md` 변경 → 영향 인사이트와 매칭되는 시나리오
   - `principles.md`·`VERSIONING.md` 변경 → 시나리오 통과 검증보다는 사람 리뷰

---

## 3. 단계별 실행

### Step 1 — Before snapshot
현재 `VERSION` 기준으로 시나리오 prompt를 처리한 출력을 만든다. 출력 형식 3가지:

| expected_output_type | 어떻게 만드나 |
|---|---|
| `html_mockup_or_design_spec` | OHOUSE-DESIGN.md + 현재 knowledge 파일을 컨텍스트로 받아 HTML 모형 생성 |
| `copy_set` / `copy_table` | 현재 `ux-writing.md` 만 적용해 카피 N개 생성 |
| `design_decision` / `checklist` | 디자인 결정·체크리스트 문장 생성 |

방법 A — **수동**: 작업자가 시나리오를 보고 결정·카피·디자인 결과를 직접 작성한다.
방법 B — **LLM 자동**: Claude Code에 prompt + knowledge_inputs 파일을 같이 던지고 결과를 받는다.

### Step 2 — After snapshot
proposed change를 적용한 상태로 같은 방식으로 출력을 다시 만든다.

### Step 3 — Score
각 expectation에 대해 binary pass/fail.

```
| # | expectation                                          | before | after |
|---|------------------------------------------------------|--------|-------|
| 1 | 헤딩 카피가 단정·부정형이 아니다                       | ✗      | ✓     |
| 2 | 본문에 다음 행동 제안이 있다                          | ✗      | ✓     |
| 3 | Primary CTA가 화면 하단 sticky 위치에 있다            | ✓      | ✓     |
| ... |
```

기록 위치: PR 본문 또는 `CHANGELOG.md` 해당 버전 항목의 "Review loop" 블록.

### Step 4 — Verdict

`VERSIONING.md` §2.3 결정 룰 적용:

- 회귀 (before ✓ → after ✗) 있나? → 있으면 **부결** (또는 그 회귀를 의도한 major면 별도 정당화)
- 새로 통과한 expectation이 있나? → **개선 증거** 확보
- 단순 가독성 개선이면 → 사람 리뷰로 판단

---

## 4. 시나리오 추가 절차

새 영역(예: 다크 모드 카피 가이드)이 knowledge에 들어오면 시나리오도 늘려야 한다.

1. `scenarios.json` 에 새 항목 추가:
   - `id` (kebab-case, 유일)
   - `name` (한국어 짧은 이름)
   - `prompt` (1줄, 구체)
   - `knowledge_inputs` (적용될 파일·인사이트 번호)
   - `expected_output_type`
   - `expectations` (5~10개, binary 채점 가능)
2. 그 시나리오 단독으로 1회 Before-only 실행 → 현재 baseline 통과 expectation 수를 기록 (예: 3/7 pass).
3. 이후 변경에서 해당 시나리오 통과율이 떨어지면 회귀로 판정.

시나리오 추가 자체는 minor 변경.

---

## 5. 자주 놓치는 함정

- **Before 출력은 항상 published `VERSION` 기준.** 작업 중인 브랜치 기준 X.
- **expectations는 변경하지 않는다** — 채점 기준이 흔들리면 비교 의미 X. 기준을 바꿔야 한다면 그 자체가 minor 변경.
- **회귀 해석 주의** — "before도 fail / after도 fail" 은 회귀가 아니다. before ✓ → after ✗ 만 회귀.
- **LLM 자동 채점은 검증한 expectation만.** 모호한 expectation은 사람 채점이 안전.

---

## 6. 빠른 실행 예시 (수동)

PR: `payment-error` 화면 본문 카피 가이드를 `ux-writing.md`에 새로 추가했다.

1. 영향 시나리오: `payment-error`, `empty-cart` (메시지 유형 룰을 공유).
2. Before — 현재 v0.1.0 가이드만으로 결제 실패 카피 3개 생성. expectations 채점.
3. After — proposed 변경 적용 후 동일 시나리오로 카피 3개 생성. expectations 채점.
4. 표로 정리 → CHANGELOG.md 새 항목에 첨부.
5. 회귀 없음 + 새로 통과한 expectation 2개 → minor 승급 통과.

---

## 7. 향후 자동화 후보

- `scripts/run-evals.mjs` 같은 도구로 scenarios.json 순회·LLM 호출·표 생성 자동화.
- `writing-bot/evals/evals.json` 의 채점 파이프라인을 그대로 빌려 쓸 수 있다 (스키마 호환).
- GitLab CI에서 PR마다 자동 실행 → diff comment.

지금은 수동 운영부터.
